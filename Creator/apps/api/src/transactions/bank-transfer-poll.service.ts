import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMatchingService } from './payment-matching.service';

@Injectable()
export class BankTransferPollService {
    private readonly logger = new Logger(BankTransferPollService.name);
    private imap: Imap;

    constructor(
        private prisma: PrismaService,
        private paymentMatching: PaymentMatchingService,
    ) {
        this.initializeImap();
    }

    private initializeImap() {
        this.imap = new Imap({
            user: process.env.GMAIL_USER,
            password: process.env.GMAIL_APP_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
        });
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async pollBankEmails() {
        this.logger.log('Polling bank transfer emails...');

        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => {
                this.imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                        this.logger.error('Failed to open inbox', err);
                        return reject(err);
                    }

                    // 住信SBIネット銀行からの未読メールを検索
                    this.imap.search(
                        [
                            'UNSEEN',
                            ['FROM', 'netbk@netbk.co.jp'], // 住信SBI
                            ['SUBJECT', '振込入金'],
                        ],
                        (err, results) => {
                            if (err) {
                                this.logger.error('Search failed', err);
                                return reject(err);
                            }

                            if (results.length === 0) {
                                this.logger.log('No new emails found');
                                this.imap.end();
                                return resolve(null);
                            }

                            this.logger.log(`Found ${results.length} new emails`);

                            const fetch = this.imap.fetch(results, { bodies: '' });

                            fetch.on('message', (msg, seqno) => {
                                msg.on('body', async (stream, info) => {
                                    const parsed = await simpleParser(stream);
                                    await this.processEmail(parsed, seqno);
                                });

                                msg.once('attributes', (attrs) => {
                                    const uid = attrs.uid;
                                    // 既読にマーク
                                    this.imap.addFlags(uid, ['\\Seen'], (err) => {
                                        if (err) this.logger.error('Failed to mark as read', err);
                                    });
                                });
                            });

                            fetch.once('end', () => {
                                this.logger.log('Email processing complete');
                                this.imap.end();
                                resolve(null);
                            });
                        },
                    );
                });
            });

            this.imap.once('error', (err) => {
                this.logger.error('IMAP error', err);
                reject(err);
            });

            this.imap.connect();
        });
    }

    private async processEmail(email: any, uid: number) {
        try {
            // 重複チェック
            const existing = await this.prisma.processedEmail.findUnique({
                where: { emailUid: uid.toString() },
            });

            if (existing) {
                this.logger.log(`Email ${uid} already processed`);
                return;
            }

            // メール本文を解析
            const emailBody = email.text || email.html || '';
            const transferData = this.parseTransferEmail(emailBody);

            if (transferData) {
                this.logger.log('Transfer data extracted:', transferData);

                // 入金マッチング処理
                await this.paymentMatching.matchAndProcess(transferData, {
                    emailUid: uid.toString(),
                    subject: email.subject,
                    from: email.from.text,
                    receivedAt: email.date,
                });
            } else {
                this.logger.warn('Failed to parse transfer data from email');

                // 処理済みとしてマーク（解析失敗のケース）
                await this.prisma.processedEmail.create({
                    data: {
                        emailUid: uid.toString(),
                        subject: email.subject,
                        from: email.from.text,
                        receivedAt: email.date,
                    },
                });
            }
        } catch (error) {
            this.logger.error('Error processing email', error);
        }
    }

    private parseTransferEmail(body: string): {
        amount: number;
        transferorName: string;
        identifierCode: string;
        transferDate: Date;
    } | null {
        try {
            // 住信SBIネット銀行のメール形式に合わせた正規表現
            // 実際のメールフォーマットに応じて調整が必要

            // 金額抽出（例: "金額：10,000円" または "ご入金額：10,000円"）
            const amountMatch = body.match(/(?:金額|ご入金額)[：:]\s*([0-9,]+)\s*円/);
            const amount = amountMatch
                ? parseInt(amountMatch[1].replace(/,/g, ''))
                : null;

            // 振込名義人抽出（例: "振込人：12345678 ヤマダタロウ"）
            const transferorMatch = body.match(/振込人|ご依頼人[：:]\s*([^\n]+)/);
            const transferorName = transferorMatch ? transferorMatch[1].trim() : null;

            // 識別コード抽出（名義人の先頭8桁の数字）
            const codeMatch = transferorName?.match(/^(\d{8})/);
            const identifierCode = codeMatch ? codeMatch[1] : null;

            // 振込日時抽出
            const dateMatch = body.match(
                /入金日|振込日[：:]\s*(\d{4})年(\d{1,2})月(\d{1,2})日/,
            );
            const transferDate = dateMatch
                ? new Date(
                    parseInt(dateMatch[1]),
                    parseInt(dateMatch[2]) - 1,
                    parseInt(dateMatch[3]),
                )
                : new Date();

            if (!amount || !identifierCode) {
                return null;
            }

            return {
                amount,
                transferorName: transferorName || '',
                identifierCode,
                transferDate,
            };
        } catch (error) {
            this.logger.error('Failed to parse email', error);
            return null;
        }
    }
}
