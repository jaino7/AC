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
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PaymentInstructionsEmailProps {
    fanName: string;
    creatorName: string;
    creatorHandle: string;
    planName: string;
    amount: number;
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    dueDate?: Date;
}

export function PaymentInstructionsEmail({
    fanName,
    creatorName,
    creatorHandle,
    planName,
    amount,
    bankName,
    branchName,
    accountType,
    accountNumber,
    accountHolder,
    dueDate,
}: PaymentInstructionsEmailProps) {
    const accountTypeText = accountType === 'SAVINGS' || accountType === '普通' ? '普通' : '当座';

    return (
        <Html>
            <Head />
            <Preview>【お振込のご案内】{creatorName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={logo}>CocoBa</Text>
                    <Heading style={h1}>お振込のご案内</Heading>

                    <Text style={text}>
                        {fanName} 様
                    </Text>

                    <Text style={text}>
                        {creatorName} の「{planName}」へのお申し込み、ありがとうございます。<br />
                        以下の口座へお振込をお願いします。
                    </Text>

                    <Section style={importantBox}>
                        <Heading style={h2}>振込先情報</Heading>
                        <Text style={infoText}>
                            <strong>金融機関：</strong>{bankName}<br />
                            <strong>支店名：</strong>{branchName}<br />
                            <strong>預金種別：</strong>{accountTypeText}<br />
                            <strong>口座番号：</strong>{accountNumber}<br />
                            <strong>口座名義：</strong>{accountHolder}
                        </Text>

                        <div style={amountBox}>
                            <Text style={amountLabel}>お振込金額</Text>
                            <Text style={amountValue}>{formatCurrency(amount)}</Text>
                        </div>
                    </Section>

                    {dueDate && (
                        <Text style={dueDateText}>
                            <strong>お振込期限：</strong>{formatDate(dueDate)}
                        </Text>
                    )}

                    <Section style={noteBox}>
                        <Text style={noteTitle}>ご注意</Text>
                        <Text style={noteText}>• この口座はお客様専用の使い捨て口座です。他の方と共有しないでください。</Text>
                        <Text style={noteText}>• 振込手数料はお客様のご負担となります。</Text>
                        <Text style={noteText}>• 入金確認後、自動的にクレジットが付与されます。</Text>
                        <Text style={noteText}>• 期限を過ぎると口座が無効になります。期限内にお振込ください。</Text>
                    </Section>

                    <Section style={linkSection}>
                        <Link
                            href={`https://getcocoba.com/${creatorHandle}`}
                            style={button}
                        >
                            {creatorName}のページを見る
                        </Link>
                    </Section>

                    <Text style={footer}>
                        ご不明な点がございましたら、お気軽にお問い合わせください。<br />
                        CocoBa運営チーム
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
    width: '100%',
    boxSizing: 'border-box' as const,
};

const logo = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#223C7D',
    margin: '30px 0 0 0',
    padding: '0 20px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '16px 0',
    padding: '0 20px',
};

const h2 = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px 0',
};

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    padding: '0 20px',
};

const importantBox = {
    backgroundColor: '#fff',
    border: '2px solid #223C7D',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 20px',
};

const infoText = {
    color: '#1a1a1a',
    fontSize: '16px',
    lineHeight: '28px',
    margin: '0',
};

const amountBox = {
    backgroundColor: '#EEF2FF',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0 0 0',
    textAlign: 'center' as const,
};

const amountLabel = {
    color: '#223C7D',
    fontSize: '14px',
    margin: '0 0 8px 0',
};

const amountValue = {
    color: '#223C7D',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
};

const dueDateText = {
    color: '#b71c1c',
    fontSize: '16px',
    fontWeight: '600',
    margin: '16px 0',
    padding: '0 20px',
};

const noteBox = {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '20px 24px',
    margin: '24px 20px',
};

const noteTitle = {
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 12px 0',
};

const noteText = {
    color: '#404040',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 6px 0',
};

const linkSection = {
    margin: '32px 0',
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
    margin: '32px 0 0 0',
    textAlign: 'center' as const,
    padding: '0 20px 40px',
};
