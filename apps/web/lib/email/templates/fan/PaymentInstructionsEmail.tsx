import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PaymentInstructionsEmailProps {
    fanName: string;
    creatorName: string;
    creatorHandle: string;
    planName: string;
    amount: number;
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    identifierCode: string;
    dueDate?: Date;
}

export function PaymentInstructionsEmail({
    fanName,
    creatorName,
    creatorHandle,
    planName,
    amount,
    bankName,
    branchName,
    accountType,
    accountNumber,
    accountHolder,
    identifierCode,
    dueDate,
}: PaymentInstructionsEmailProps) {
    const accountTypeText = accountType === 'SAVINGS' ? '普通' : '当座';

    return (
        <Html>
            <Head />
            <Preview>【重要】お振込先のご案内 - {creatorName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>💳 お振込先のご案内</Heading>

                    <Text style={text}>
                        {fanName} 様
                    </Text>

                    <Text style={text}>
                        この度は {creatorName} の「{planName}」へのお申し込み、誠にありがとうございます。
                    </Text>

                    <Section style={importantBox}>
                        <Heading style={h2}>お振込先情報</Heading>
                        <Text style={infoText}>
                            <strong>金融機関：</strong>{bankName}<br />
                            <strong>支店名：</strong>{branchName}<br />
                            <strong>預金種別：</strong>{accountTypeText}<br />
                            <strong>口座番号：</strong>{accountNumber}<br />
                            <strong>口座名義：</strong>{accountHolder}
                        </Text>

                        <div style={amountBox}>
                            <Text style={amountLabel}>お振込金額</Text>
                            <Text style={amountValue}>{formatCurrency(amount)}</Text>
                        </div>
                    </Section>

                    <Section style={warningBox}>
                        <Text style={warningTitle}>⚠️ 重要：振込名義人について</Text>
                        <Text style={warningText}>
                            お振込の際、振込名義人には必ず以下の<strong>識別コード</strong>を先頭に含めてください：
                        </Text>
                        <div style={codeBox}>
                            <Text style={codeText}>{identifierCode}</Text>
                        </div>
                        <Text style={warningText}>
                            例：<code>{identifierCode} {fanName}</code>
                        </Text>
                        <Text style={warningSubtext}>
                            識別コードがない場合、入金確認が遅れる可能性があります。
                        </Text>
                    </Section>

                    {dueDate && (
                        <Text style={text}>
                            <strong>お振込期限：</strong>{formatDate(dueDate)}
                        </Text>
                    )}

                    <Text style={text}>
                        入金確認後、コンテンツへのアクセスが可能になります。通常、1-3営業日以内に反映されます。
                    </Text>

                    <Section style={linkSection}>
                        <Link
                            href={`https://creatorspace.jp/creators/${creatorHandle}`}
                            style={button}
                        >
                            {creatorName}のページを見る
                        </Link>
                    </Section>

                    <Text style={footer}>
                        ご不明な点がございましたら、お気軽にお問い合わせください。<br />
                        CreatorSpace運営チーム
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '30px 0',
};

const h2 = {
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 16px 0',
};

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
};

const importantBox = {
    backgroundColor: '#fff',
    border: '2px solid #223C7D',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
};

const infoText = {
    color: '#1a1a1a',
    fontSize: '16px',
    lineHeight: '28px',
    margin: '0',
};

const amountBox = {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0 0 0',
    textAlign: 'center' as const,
};

const amountLabel = {
    color: '#666',
    fontSize: '14px',
    margin: '0 0 8px 0',
};

const amountValue = {
    color: '#223C7D',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
};

const warningBox = {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
};

const warningTitle = {
    color: '#856404',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 12px 0',
};

const warningText = {
    color: '#856404',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '8px 0',
};

const warningSubtext = {
    color: '#856404',
    fontSize: '13px',
    margin: '12px 0 0 0',
};

const codeBox = {
    backgroundColor: '#fff',
    border: '2px dashed #ffc107',
    borderRadius: '6px',
    padding: '12px',
    margin: '12px 0',
    textAlign: 'center' as const,
};

const codeText = {
    color: '#223C7D',
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '2px',
    margin: '0',
};

const linkSection = {
    margin: '32px 0',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#223C7D',
    borderRadius: '8px',
    color: '#fff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 32px',
    textDecoration: 'none',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '32px 0 0 0',
    textAlign: 'center' as const,
};
