import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';

interface FanPasswordResetEmailProps {
    fanName: string;
    resetUrl: string;
}

export function FanPasswordResetEmail({ fanName, resetUrl }: FanPasswordResetEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>パスワード再設定のご案内</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={logo}>CocoBa</Text>
                    <Heading style={h1}>パスワード再設定のご案内</Heading>

                    <Text style={text}>{fanName} さん、こんにちは！</Text>

                    <Text style={text}>
                        パスワードの再設定リクエストを受け付けました。以下のボタンをクリックして、新しいパスワードを設定してください。
                    </Text>

                    <Section style={buttonContainer}>
                        <Button href={resetUrl} style={button}>
                            パスワードを再設定する
                        </Button>
                    </Section>

                    <Section style={noteBox}>
                        <Text style={noteTitle}>ご注意</Text>
                        <Text style={noteText}>• このリンクは24時間以内に有効です</Text>
                        <Text style={noteText}>• リンクは1回のみ使用可能です</Text>
                        <Text style={noteText}>• 身に覚えがない場合は、このメールを無視してください</Text>
                    </Section>

                    <Hr style={divider} />

                    <Text style={footer}>
                        このメールに心当たりがない場合は、すぐにサポートまでご連絡ください。<br />
                        CocoBa運営チーム
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};
const container = { margin: '0 auto', padding: '20px 0', maxWidth: '600px' };
const logo = { fontSize: '24px', fontWeight: 'bold', color: '#223C7D', margin: '30px 0 0 0', padding: '0 40px' };
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: '700', lineHeight: '1.3', margin: '16px 0', padding: '0 40px' };
const text = { color: '#404040', fontSize: '16px', lineHeight: '26px', margin: '16px 0', padding: '0 40px' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#223C7D', color: '#ffffff', padding: '14px 40px', borderRadius: '6px', textDecoration: 'none', fontSize: '16px', fontWeight: '600' };
const noteBox = { backgroundColor: '#fff9e6', padding: '20px 40px', margin: '24px 0', borderLeft: '4px solid #ffd54f' };
const noteTitle = { fontSize: '14px', fontWeight: 'bold', color: '#f57f17', margin: '0 0 12px' };
const noteText = { fontSize: '14px', color: '#404040', margin: '0 0 8px', lineHeight: '20px' };
const divider = { borderColor: '#e5e5e5', margin: '20px 40px' };
const footer = { color: '#8898aa', fontSize: '14px', lineHeight: '22px', margin: '16px 0', textAlign: 'center' as const, padding: '0 40px 40px' };
