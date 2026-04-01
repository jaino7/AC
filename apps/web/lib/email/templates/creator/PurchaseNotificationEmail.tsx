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

interface PurchaseNotificationEmailProps {
    creatorName: string;
    purchaseType: 'content' | 'plan';
    itemName: string;
    amount: number;
    dashboardUrl: string;
}

export function PurchaseNotificationEmail({
    creatorName,
    purchaseType,
    itemName,
    amount,
    dashboardUrl,
}: PurchaseNotificationEmailProps) {
    const label = purchaseType === 'content' ? 'コンテンツ' : 'プラン';

    return (
        <Html>
            <Head />
            <Preview>💰 {label}「{itemName}」が購入されました</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>💰 新しい購入がありました</Heading>

                    <Text style={text}>{creatorName} 様</Text>

                    <Text style={text}>
                        あなたの{label}が購入されました。
                    </Text>

                    <Section style={infoBox}>
                        <Text style={infoLabel}>種別</Text>
                        <Text style={infoValue}>{label}購入</Text>
                        <Text style={infoLabel}>{label}名</Text>
                        <Text style={infoValue}>{itemName}</Text>
                        <Text style={infoLabel}>金額</Text>
                        <Text style={infoValue}>¥{amount.toLocaleString()}</Text>
                    </Section>

                    <Section style={linkSection}>
                        <Link href={dashboardUrl} style={button}>
                            ダッシュボードで確認する
                        </Link>
                    </Section>

                    <Text style={footer}>
                        CocoBa 運営チーム
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

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
    fontSize: '26px',
    fontWeight: '700',
    margin: '30px 0',
};

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
};

const infoBox = {
    backgroundColor: '#f0f9f0',
    border: '1px solid #c3e6cb',
    borderRadius: '10px',
    padding: '20px 24px',
    margin: '20px 0',
};

const infoLabel = {
    color: '#1a6b2a',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: '10px 0 2px 0',
};

const infoValue = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 4px 0',
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
    fontSize: '15px',
    fontWeight: '600',
    padding: '13px 30px',
    textDecoration: 'none',
};

const footer = {
    color: '#8898aa',
    fontSize: '13px',
    lineHeight: '22px',
    margin: '28px 0 0 0',
    textAlign: 'center' as const,
};
