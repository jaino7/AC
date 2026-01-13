import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface BankAccountRegisteredEmailProps {
    creatorName: string;
    creatorHandle: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
}

export function BankAccountRegisteredEmail({
    creatorName,
    creatorHandle,
    bankName,
    branchName,
    accountNumber,
}: BankAccountRegisteredEmailProps) {
    // 口座番号の下4桁のみ表示
    const maskedNumber = '**** ' + accountNumber.slice(-4);

    return (
        <Html>
            <Head />
            <Preview>振込先口座の登録が完了しました</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>✅ 振込先口座の登録完了</Heading>

                    <Text style={text}>
                        {creatorName} 様
                    </Text>

                    <Text style={text}>
                        振込先口座の登録が正常に完了しました。
                    </Text>

                    <Section style={infoBox}>
                        <Heading style={h2}>登録された口座情報</Heading>
                        <Text style={infoText}>
                            <strong>金融機関：</strong>{bankName}<br />
                            <strong>支店名：</strong>{branchName}<br />
                            <strong>口座番号：</strong>{maskedNumber}
                        </Text>
                    </Section>

                    <Text style={text}>
                        この口座へ、売上金が振り込まれます。口座情報に誤りがある場合は、すぐに修正してください。
                    </Text>

                    <Section style={linkSection}>
                        <Link
                            href={`https://creatorspace.jp/creators/${creatorHandle}/earnings`}
                            style={button}
                        >
                            収益ページを見る
                        </Link>
                    </Section>

                    <Text style={footer}>
                        CreatorSpace運営チーム
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: '700',
    margin: '30px 0',
};

const h2 = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
};

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
};

const infoBox = {
    backgroundColor: '#e8f5e9',
    border: '1px solid #4caf50',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
};

const infoText = {
    color: '#1a1a1a',
    fontSize: '15px',
    lineHeight: '26px',
    margin: '0',
};

const linkSection = {
    margin: '28px 0',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#223C7D',
    borderRadius: '8px',
    color: '#fff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 32px',
    textDecoration: 'none',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    margin: '28px 0 0 0',
    textAlign: 'center' as const,
};
