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

interface PasswordResetEmailProps {
  userType: 'creator' | 'fan';
  name: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  userType,
  name,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>パスワード再設定のご案内</Text>

            <Text style={paragraph}>
              {name}さん、こんにちは！
            </Text>

            <Text style={paragraph}>
              パスワードの再設定リクエストを受け付けました。以下のボタンをクリックして、新しいパスワードを設定してください。
            </Text>

            <Section style={buttonContainer}>
              <Link href={resetUrl} style={button}>
                パスワードを再設定する
              </Link>
            </Section>

            <Section style={noteBox}>
              <Text style={noteTitle}>ご注意</Text>
              <Text style={noteText}>
                • このリンクは24時間以内に有効です
              </Text>
              <Text style={noteText}>
                • リンクは1回のみ使用可能です
              </Text>
              <Text style={noteText}>
                • 身に覚えがない場合は、このメールを無視してください
              </Text>
            </Section>

            <Text style={paragraph}>
              セキュリティのため、リンクをクリックする前にメールアドレスが正しいことをご確認ください。
            </Text>
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#223C7D',
  color: '#ffffff',
  padding: '14px 40px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
};

const noteBox = {
  backgroundColor: '#fff9e6',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #ffd54f',
};

const noteTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#f57f17',
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
