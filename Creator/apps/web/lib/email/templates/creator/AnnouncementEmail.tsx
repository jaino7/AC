import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface AnnouncementEmailProps {
    creatorName: string;
    title: string;
    message: string;
}

export function AnnouncementEmail({
    creatorName,
    title,
    message,
}: AnnouncementEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>📢 {title}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>📢 CocoBaからのお知らせ</Heading>

                    <Text style={text}>{creatorName} 様</Text>

                    <Section style={messageBox}>
                        <Text style={titleText}>{title}</Text>
                        <Text style={messageText}>{message}</Text>
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

const messageBox = {
    backgroundColor: '#fff',
    border: '1px solid #e1e8ed',
    borderRadius: '10px',
    padding: '24px',
    margin: '20px 0',
};

const titleText = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 12px 0',
};

const messageText = {
    color: '#404040',
    fontSize: '15px',
    lineHeight: '26px',
    margin: '0',
    whiteSpace: 'pre-wrap' as const,
};

const footer = {
    color: '#8898aa',
    fontSize: '13px',
    lineHeight: '22px',
    margin: '28px 0 0 0',
    textAlign: 'center' as const,
};
