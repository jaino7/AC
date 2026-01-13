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
import { formatCurrency } from '../../utils/formatters';

interface NewSubscriberEmailProps {
    creatorName: string;
    creatorHandle: string;
    fanName: string;
    planName: string;
    amount: number;
}

export function NewSubscriberEmail({
    creatorName,
    creatorHandle,
    fanName,
    planName,
    amount,
}: NewSubscriberEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>🎉 新しい購読希望者が現れました - {fanName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>🎉 新しい購読希望者</Heading>

                    <Text style={text}>
                        {creatorName} 様
                    </Text>

                    <Text style={text}>
                        嬉しいお知らせです！新しい方があなたのプランに購読を申し込みました。
                    </Text>

                    <Section style={destacBox}>
                        <Text style={highlightLabel}>購読者</Text>
                        <Text style={highlightValue}>{fanName}</Text>

                        <Text style={highlightLabel}>プラン</Text>
                        <Text style={highlightValue}>{planName}</Text>

                        <div style={amountBox}>
                            <Text style={amountLabel}>予定金額</Text>
                            <Text style={amountValue}>{formatCurrency(amount)}</Text>
                        </div>
                    </Section>

                    <Text style={noteText}>
                        ※ 入金確認後、自動的に購読が開始されます。<br />
                        ※ 決済完了時に改めて通知メールをお送りします。
                    </Text>

                    <Section style={linkSection}>
                        <Link
                            href={`https://creatorspace.jp/creators/${creatorHandle}/fans`}
                            style={button}
                        >
                            ファン一覧を見る
                        </Link>
                    </Section>

                    <Text style={footer}>
                        引き続きCreatorSpaceをよろしくお願いいたします。<br />
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

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
};

const highlightBox = {
    backgroundColor: '#fff',
    border: '1px solid #e1e8ed',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
};

const highlightLabel = {
    color: '#666',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '12px 0 4px 0',
};

const highlightValue = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
};

const amountBox = {
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0 0 0',
    textAlign: 'center' as const,
};

const amountLabel = {
    color: '#1976d2',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
};

const amountValue = {
    color: '#0d47a1',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
};

const noteText = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '20px 0',
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '6px',
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
    lineHeight: '22px',
    margin: '28px 0 0 0',
    textAlign: 'center' as const,
};
