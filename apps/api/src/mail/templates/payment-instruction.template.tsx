import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import { formatDate, formatCurrency } from '../utils/formatters';

interface PaymentInstructionEmailProps {
  fanName: string;
  creatorName: string;
  creatorHandle: string;
  planName?: string;
  amount: number;
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  identifierCode: string;
  dueDate: Date;
}

export default function PaymentInstructionEmail({
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
}: PaymentInstructionEmailProps) {
  const accountTypeJa = accountType === 'ORDINARY' ? '普通' : '当座';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>お振込のご案内</Text>

            <Text style={paragraph}>
              {fanName}さん、こんにちは！
            </Text>

            <Text style={paragraph}>
              {creatorName}
              {planName ? `（${planName}）` : ''}
              へのお支払いについて、以下の口座へお振込をお願いします。
            </Text>

            <Section style={amountBox}>
              <Text style={amountLabel}>お支払い金額</Text>
              <Text style={amountValue}>{formatCurrency(amount)}</Text>
            </Section>

            <Section style={bankInfoCard}>
              <Text style={cardTitle}>振込先情報</Text>

              <Section style={bankRow}>
                <Text style={bankLabel}>金融機関名</Text>
                <Text style={bankValue}>{bankName}</Text>
              </Section>

              <Section style={bankRow}>
                <Text style={bankLabel}>支店名</Text>
                <Text style={bankValue}>{branchName}</Text>
              </Section>

              <Section style={bankRow}>
                <Text style={bankLabel}>口座種別</Text>
                <Text style={bankValue}>{accountTypeJa}</Text>
              </Section>

              <Section style={bankRow}>
                <Text style={bankLabel}>口座番号</Text>
                <Text style={bankValue}>{accountNumber}</Text>
              </Section>

              <Section style={bankRow}>
                <Text style={bankLabel}>口座名義</Text>
                <Text style={bankValue}>{accountHolder}</Text>
              </Section>
            </Section>

            <Section style={identifierBox}>
              <Text style={identifierLabel}>
                ⚠️ 重要：振込人名義に必ず以下の識別コードを含めてください
              </Text>
              <Text>{identifierCode}</Text>
              <Text style={identifierNote}>
                例: {identifierCode} ヤマダタロウ
              </Text>
            </Section>

            <Section style={dueDateBox}>
              <Text style={dueDateLabel}>お振込期限</Text>
              <Text style={dueDateValue}>{formatDate(dueDate)}</Text>
            </Section>

            <Section style={noteBox}>
              <Text style={noteTitle}>ご注意</Text>
              <Text style={noteText}>
                • 識別コードを振込人名義に含めないと、入金確認が遅れる場合があります
              </Text>
              <Text style={noteText}>
                • 振込手数料はお客様のご負担となります
              </Text>
              <Text style={noteText}>
                • 入金確認後、自動的にクレジットが付与されます
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              ご不明な点がございましたら、サポートまでお問い合わせください。
            </Text>
            <Text style={footerText}>© 2026 CocoBa. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  padding: '20px 40px',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#223C7D',
  margin: 0,
};

const content = {
  padding: '0 40px 40px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  margin: '0 0 16px',
};

const amountBox = {
  backgroundColor: '#fff3e0',
  padding: '24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const amountLabel = {
  fontSize: '14px',
  color: '#e65100',
  margin: '0 0 8px',
};

const amountValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#bf360c',
  margin: 0,
};

const bankInfoCard = {
  backgroundColor: '#f9f9f9',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
};

const bankRow = {
  marginBottom: '12px',
};

const bankLabel = {
  fontSize: '12px',
  color: '#666666',
  margin: '0 0 4px',
};

const bankValue = {
  fontSize: '16px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: 0,
};

const identifierBox = {
  backgroundColor: '#fff9c4',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '2px solid #fbc02d',
};

const identifierLabel = {
  fontSize: '14px',
  color: '#f57f17',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const identifierCode = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#e65100',
  textAlign: 'center' as const,
  margin: '12px 0',
  letterSpacing: '2px',
};

const identifierNote = {
  fontSize: '12px',
  color: '#666666',
  textAlign: 'center' as const,
  margin: '8px 0 0',
};

const dueDateBox = {
  backgroundColor: '#ffebee',
  padding: '16px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const dueDateLabel = {
  fontSize: '14px',
  color: '#c62828',
  margin: '0 0 8px',
};

const dueDateValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#b71c1c',
  margin: 0,
};

const noteBox = {
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const noteTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 12px',
};

const noteText = {
  fontSize: '14px',
  color: '#404040',
  margin: '0 0 8px',
  lineHeight: '20px',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '20px 40px',
};

const footer = {
  padding: '0 40px 20px',
};

const footerText = {
  fontSize: '12px',
  color: '#999999',
  lineHeight: '18px',
  margin: '0 0 8px',
};
