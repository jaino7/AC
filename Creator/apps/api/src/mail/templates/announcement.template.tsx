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

interface AnnouncementEmailProps {
  recipientName: string;
  title: string;
  content: string;
}

export default function AnnouncementEmail({
  recipientName,
  title,
  content,
}: AnnouncementEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>{title}</Text>

            <Text style={greeting}>
              {recipientName}さん、こんにちは！
            </Text>

            <Section style={messageBox}>
              <Text style={messageText}>{content}</Text>
            </Section>

            <Text style={paragraph}>
              今後ともCocoBaをよろしくお願いいたします。
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              このメールは、CocoBa運営チームから送信されています。
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

const contentSection = {
  padding: '0 20px 40px',
};

const heading = {
  fontSize: '24px',
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

const messageBox = {
  backgroundColor: '#f9f9f9',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const messageText = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#1a1a1a',
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  margin: '0 0 16px',
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
