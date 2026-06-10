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

interface WelcomeEmailProps {
  userType: 'creator' | 'fan';
  name: string;
  email: string;
  handle?: string;
  creatorName?: string;
}

export default function WelcomeEmail({
  userType,
  name,
  email,
  handle,
  creatorName,
}: WelcomeEmailProps) {
  const isCreator = userType === 'creator';
  const title = isCreator
    ? 'CocoBaへようこそ！クリエイター登録が完了しました'
    : `${creatorName}のファンコミュニティへようこそ！`;

  const ctaUrl = isCreator
    ? `${process.env.WEB_URL}/creators/dashboard`
    : `${process.env.WEB_URL}/${handle}`;
  const ctaText = isCreator ? 'ダッシュボードへ' : 'コンテンツを見る';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>{title}</Text>

            <Text style={paragraph}>
              {name}さん、こんにちは！
            </Text>

            {isCreator ? (
              <>
                <Text style={paragraph}>
                  CocoBaへのクリエイター登録が完了しました。これからあなたの創作活動をサポートします。
                </Text>

                <Text style={paragraph}>
                  ダッシュボードからプロフィールの設定やコンテンツの管理ができます。
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  {creatorName}のファンコミュニティへようこそ！これから素敵なコンテンツをお楽しみください。
                </Text>

                <Text style={paragraph}>
                  登録メールアドレス: {email}
                </Text>
              </>
            )}

            <Section style={buttonContainer}>
              <Link href={ctaUrl} style={button}>
                {ctaText}
              </Link>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              このメールに心当たりがない場合は、お手数ですが削除してください。
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
  padding: '0 20px 40px',
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

const infoBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const infoLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 4px',
};

const infoValue = {
  fontSize: '16px',
  color: '#1a1a1a',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
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
