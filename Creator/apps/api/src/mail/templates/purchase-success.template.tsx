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
import { formatCurrency } from '../utils/formatters';

interface PurchaseSuccessEmailProps {
  fanName: string;
  contentTitle: string;
  amount: number;
  balance: number;
  contentUrl: string;
}

export default function PurchaseSuccessEmail({
  fanName,
  contentTitle,
  amount,
  balance,
  contentUrl,
}: PurchaseSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>コンテンツ購入が完了しました</Text>

            <Text style={paragraph}>
              {fanName}さん、こんにちは！
            </Text>

            <Text style={paragraph}>
              コンテンツの購入が完了しました。早速お楽しみください。
            </Text>

            <Section style={contentBox}>
              <Text style={contentLabel}>購入したコンテンツ</Text>
              <Text>{contentTitle}</Text>
            </Section>

            <Section style={purchaseInfo}>
              <Section style={infoRow}>
                <Text style={infoLabel}>お支払い金額</Text>
                <Text style={infoValue}>{formatCurrency(amount)}</Text>
              </Section>

              <Section style={infoRow}>
                <Text style={infoLabel}>残高</Text>
                <Text style={infoValue}>{formatCurrency(balance)}</Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Link href={contentUrl} style={button}>
                コンテンツを見る
              </Link>
            </Section>

            <Text style={paragraph}>
              今後も素敵なコンテンツをお楽しみください。
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              購入履歴は、アカウントページからご確認いただけます。
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
  fontWeight: 'bold' as const,
  color: '#223C7D',
  margin: 0,
};

const content = {
  padding: '0 20px 40px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  margin: '0 0 24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  margin: '0 0 16px',
};

const contentBox = {
  backgroundColor: '#e8f5e9',
  padding: '24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const contentLabel = {
  fontSize: '14px',
  color: '#2e7d32',
  margin: '0 0 8px',
};

const contentTitle = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#1b5e20',
  margin: 0,
};

const purchaseInfo = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const infoRow = {
  marginBottom: '12px',
};

const infoLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: 0,
};

const infoValue = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  margin: 0,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#223C7D',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600' as const,
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
