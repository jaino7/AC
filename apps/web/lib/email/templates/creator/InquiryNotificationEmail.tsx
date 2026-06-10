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

interface CustomField {
    label: string;
    value: string;
}

interface InquiryNotificationEmailProps {
    creatorName: string;
    fanName: string;
    fanEmail: string;
    message: string;
    customFields?: CustomField[];
    dashboardUrl: string;
}

export function InquiryNotificationEmail({
    creatorName,
    fanName,
    fanEmail,
    message,
    customFields = [],
    dashboardUrl,
}: InquiryNotificationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>📩 {fanName}さんからお問い合わせが届きました</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>📩 新しいお問い合わせ</Heading>

                    <Text style={text}>{creatorName} 様</Text>

                    <Text style={text}>
                        ファンからお問い合わせが届きました。内容をご確認ください。
                    </Text>

                    <Section style={infoBox}>
                        <Text style={infoLabel}>送信者</Text>
                        <Text style={infoValue}>{fanName}</Text>
                        <Text style={infoLabel}>メールアドレス</Text>
                        <Text style={infoValue}>{fanEmail}</Text>
                    </Section>

                    <Section style={messageBox}>
                        <Text style={infoLabel}>メッセージ</Text>
                        <Text style={messageText}>{message}</Text>
                    </Section>

                    {customFields.length > 0 && (
                        <Section style={messageBox}>
                            <Text style={infoLabel}>追加情報</Text>
                            {customFields.map((field, i) => (
                                <div key={i}>
                                    <Text style={fieldLabel}>{field.label}</Text>
                                    <Text style={fieldValue}>{field.value}</Text>
                                </div>
                            ))}
                        </Section>
                    )}

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
    width: '100%',
    boxSizing: 'border-box' as const,
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
    backgroundColor: '#f0f4ff',
    border: '1px solid #dce8ff',
    borderRadius: '10px',
    padding: '20px 24px',
    margin: '20px 0',
};

const messageBox = {
    backgroundColor: '#fff',
    border: '1px solid #e1e8ed',
    borderRadius: '10px',
    padding: '20px 24px',
    margin: '16px 0',
};

const infoLabel = {
    color: '#223C7D',
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

const messageText = {
    color: '#1a1a1a',
    fontSize: '15px',
    lineHeight: '26px',
    margin: '0',
    whiteSpace: 'pre-wrap' as const,
};

const fieldLabel = {
    color: '#555',
    fontSize: '13px',
    fontWeight: '600',
    margin: '10px 0 2px 0',
};

const fieldValue = {
    color: '#1a1a1a',
    fontSize: '15px',
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
