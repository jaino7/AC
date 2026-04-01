import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';

interface InquiryEmailProps {
  creatorName: string;
  fanName: string;
  fanEmail: string;
  message: string;
  customFields?: { label: string; value: string }[];
  dashboardUrl: string;
}

export default function InquiryEmail({
  creatorName,
  fanName,
  fanEmail,
  message,
  customFields = [],
  dashboardUrl,
}: InquiryEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>新しいお問い合わせが届きました</Text>

            <Text style={greeting}>
              {creatorName}さん、こんにちは！
            </Text>

            <Text style={paragraph}>
              ファンからお問い合わせが届きました。内容をご確認ください。
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>送信者</Text>
              <Text style={infoValue}>{fanName}（{fanEmail}）</Text>
            </Section>

            <Section style={messageBox}>
              <Text style={messageLabel}>メッセージ</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

            {customFields.length > 0 && (
              <Section style={messageBox}>
                <Text style={messageLabel}>追加情報</Text>
                {customFields.map((field, i) => (
                  <React.Fragment key={i}>
                    <Text style={fieldLabel}>{field.label}</Text>
                    <Text style={fieldValue}>{field.value}</Text>
                  </React.Fragment>
                ))}
              </Section>
            )}

            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={ctaButton}>
                ダッシュボードで確認する
              </Link>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              このメールは、CocoBaを通じてファンから送信されたお問い合わせの通知です。
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

const contentSection = {
  padding: '0 40px 40px',
};

const heading = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 24px',
};

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#404040',
  margin: '0 0 20px',
};

const infoBox = {
  backgroundColor: '#f0f4ff',
  padding: '16px 20px',
  borderRadius: '8px',
  margin: '0 0 16px',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#223C7D',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const infoValue = {
  fontSize: '15px',
  color: '#1a1a1a',
  margin: 0,
};

const messageBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  margin: '0 0 16px',
};

const messageLabel = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#666',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const messageText = {
  fontSize: '15px',
  lineHeight: '26px',
  color: '#1a1a1a',
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
};

const fieldLabel = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#555',
  margin: '12px 0 2px',
};

const fieldValue = {
  fontSize: '15px',
  color: '#1a1a1a',
  margin: 0,
};

const ctaSection = {
  margin: '24px 0 0',
};

const ctaButton = {
  display: 'inline-block',
  backgroundColor: '#223C7D',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 'bold',
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
