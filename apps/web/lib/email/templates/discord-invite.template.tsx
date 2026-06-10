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

interface DiscordInviteEmailProps {
  recipientName: string;
  discordUrl: string;
}

export default function DiscordInviteEmail({
  recipientName,
  discordUrl,
}: DiscordInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>CocoBa</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={heading}>
              Discordコミュニティへご招待
            </Text>

            <Text style={greeting}>
              {recipientName}さん、こんにちは！
            </Text>

            <Text style={paragraph}>
              CocoBaへの登録、ありがとうございます！
            </Text>

            <Text style={paragraph}>
             私たちは、単なるツールを提供するだけでなく、クリエイターの皆様がワクワクするような場所を共に作り上げたいと考えています。
             そこで、初期メンバーの方々と一緒にサービスを作り上げていための、限定Discordコミュニティをご用意しました。
            </Text>

            <Section style={messageBox}>
              <Text style={messageText}>
                Discordコミュニティでできること：
              </Text>
              <Text style={listItem}>・バグや不具合の報告</Text>
              <Text style={listItem}>・新機能のリクエスト・アイデア共有</Text>
              <Text style={listItem}>・開発チームへの直接フィードバック</Text>
            </Section>

            <Section style={ctaSection}>
              <Link href={discordUrl} style={ctaButton}>
                Discordに参加する
              </Link>
            </Section>

            <Text style={paragraph}>
              良かったら、ぜひ気軽に参加してみてください。
              皆さまの声がCocoBaをより良いサービスにしていく力になります！
            </Text>

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

const paragraph = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#404040',
  margin: '0 0 16px',
};

const messageBox = {
  backgroundColor: '#f0f4ff',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const messageText = {
  fontSize: '16px',
  lineHeight: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const listItem = {
  fontSize: '15px',
  lineHeight: '26px',
  color: '#404040',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#5865F2',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'inline-block',
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
