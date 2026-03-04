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

interface CreatorWelcomeEmailProps {
    creatorName: string;
}

export function CreatorWelcomeEmail({
    creatorName,
}: CreatorWelcomeEmailProps) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/creators/dashboard`;

    return (
        <Html>
            <Head />
            <Preview>CocoBaへようこそ！クリエイター登録が完了しました</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={logo}>CocoBa</Text>
                    <Heading style={h1}>クリエイター登録が完了しました</Heading>

                    <Text style={text}>
                        {creatorName} 様
                    </Text>

                    <Text style={text}>
                        CocoBaへのクリエイター登録が完了しました。<br />
                        これからあなたの創作活動をサポートします。
                    </Text>

                    <Text style={text}>
                        ダッシュボードからプロフィールの設定やコンテンツの管理ができます。
                    </Text>

                    <Section style={buttonContainer}>
                        <Button href={dashboardUrl} style={button}>
                            ダッシュボードへ
                        </Button>
                    </Section>

                    <Hr style={divider} />

                    <Text style={footer}>
                        このメールに心当たりがない場合は、お手数ですが削除してください。<br />
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

const container = {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
};

const logo = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#223C7D',
    margin: '30px 0 0 0',
    padding: '0 40px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '16px 0',
    padding: '0 40px',
};

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    padding: '0 40px',
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
    fontSize: '16px',
    fontWeight: '600',
};

const divider = {
    borderColor: '#e5e5e5',
    margin: '20px 40px',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '16px 0',
    textAlign: 'center' as const,
    padding: '0 40px 40px',
};
