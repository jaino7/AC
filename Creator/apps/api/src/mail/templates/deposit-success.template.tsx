import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import { formatDate, formatCurrency } from '../utils/formatters';

interface DepositSuccessEmailProps {
  fanName: string;
  amount: number;
  balance: number;
  transferorName: string;
  transferDate: Date;
}

export default function DepositSuccessEmail({
  fanName,
  amount,
  balance,
  transferorName,
  transferDate,
}: DepositSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>入金が完了しました</Text>

            <Text style={paragraph}>
              {fanName}さん、こんにちは！
            </Text>

            <Text style={paragraph}>
              クレジットチャージの入金を確認しました。
            </Text>

            <Section style={amountBox}>
              <table role="presentation" cellPadding="0" cellSpacing="0" style={metricTable}>
                <tbody>
                  <tr>
                    <td style={metricCell}>
                      <Text style={amountLabel}>入金額</Text>
                      <Text style={amountValue}>{formatCurrency(amount)}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={infoBox}>
              <Text style={infoRow}>
                <strong>振込名義人:</strong> {transferorName}
              </Text>
              <Text style={infoRow}>
                <strong>入金日時:</strong> {formatDate(transferDate)}
              </Text>
            </Section>

            <Section style={balanceBox}>
              <table role="presentation" cellPadding="0" cellSpacing="0" style={metricTable}>
                <tbody>
                  <tr>
                    <td style={metricCell}>
                      <Text style={balanceLabel}>現在の残高</Text>
                      <Text style={balanceValue}>{formatCurrency(balance)}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text style={paragraph}>
              チャージしたクレジットで、お気に入りのコンテンツをお楽しみください。
            </Text>

            <Section style={buttonContainer}>
              <Link
                href={`${process.env.NEXT_PUBLIC_WEB_URL}/account/credits`}
                style={button}
              >
                クレジット履歴を見る
              </Link>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              このメールに心当たりがない場合は、すぐにサポートまでご連絡ください。
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
  width: '100%',
  boxSizing: 'border-box' as const,
};

const header = {
  padding: '20px',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#223C7D',
  margin: 0,
};

const content = {
  padding: '0 20px 32px',
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
  backgroundColor: '#e8f5e9',
  boxSizing: 'border-box' as const,
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const metricTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  tableLayout: 'fixed' as const,
};

const metricCell = {
  padding: '0',
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
};

const amountLabel = {
  fontSize: '14px',
  color: '#2e7d32',
  display: 'block',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const amountValue = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1b5e20',
  display: 'block',
  lineHeight: '38px',
  margin: 0,
};

const infoBox = {
  backgroundColor: '#f9f9f9',
  boxSizing: 'border-box' as const,
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const infoRow = {
  fontSize: '14px',
  color: '#404040',
  margin: '0 0 8px',
};

const balanceBox = {
  backgroundColor: '#e3f2fd',
  boxSizing: 'border-box' as const,
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const balanceLabel = {
  fontSize: '14px',
  color: '#1565c0',
  display: 'block',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const balanceValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0d47a1',
  display: 'block',
  lineHeight: '30px',
  margin: 0,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#223C7D',
  color: '#ffffff',
  padding: '12px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '20px',
};

const footer = {
  padding: '0 20px 20px',
};

const footerText = {
  fontSize: '12px',
  color: '#999999',
  lineHeight: '18px',
  margin: '0 0 8px',
};
