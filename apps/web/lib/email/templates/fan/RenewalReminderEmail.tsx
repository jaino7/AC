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

interface RenewalReminderEmailProps {
    fanName: string;
    creatorName: string;
    creatorHandle: string;
    planName: string;
    amount: number;
    expiryDate: Date;
    daysRemaining: number;
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    identifierCode: string;
}

export function RenewalReminderEmail({
    fanName,
    creatorName,
    creatorHandle,
    planName,
    amount,
    expiryDate,
    daysRemaining,
    bankName,
    branchName,
    accountType,
    accountNumber,
    accountHolder,
    identifierCode,
}: RenewalReminderEmailProps) {
    const accountTypeText = accountType === 'SAVINGS' ? '普通' : '当座';
    const urgencyColor = daysRemaining <= 3 ? '#d9534f' : '#f0ad4e';

    return (
        <Html>
            <Head />
            <Preview>{`【${daysRemaining}日後に期限切れ】更新手続きのご案内 - ${creatorName}`}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>🔔 更新手続きのご案内</Heading>

                    <Text style={text}>
                        {fanName} 様
                    </Text>

                    <Section style={{ ...alertBox, borderColor: urgencyColor, backgroundColor: urgencyColor + '15' }}>
                        <Text style={{ ...alertText, color: urgencyColor }}>
                            ⚠️ お知らせ：購読期限まで残り <strong>{daysRemaining}日</strong> です
                        </Text>
                        <Text style={alertSubtext}>
                            期限日: {formatDate(expiryDate)}
                        </Text>
                    </Section>

                    <Text style={text}>
                        {creatorName} の「{planName}」をご利用いただきありがとうございます。
                    </Text>

                    <Text style={text}>
                        <strong>銀行振込での更新手続きが必要です。</strong>購読を継続される場合は、以下の口座へお振込をお願いいたします。
                    </Text>

                    <Section style={infoBox}>
                        <Heading style={h2}>お振込先情報</Heading>
                        <Text style={infoText}>
                            <strong>金融機関：</strong>{bankName}<br />
                            <strong>支店名：</strong>{branchName}<br />
                            <strong>預金種別：</strong>{accountTypeText}<br />
                            <strong>口座番号：</strong>{accountNumber}<br />
                            <strong>口座名義：</strong>{accountHolder}
                        </Text>

                        <div style={amountBox}>
                            <Text style={amountLabel}>更新料金</Text>
                            <Text style={amountValue}>{formatCurrency(amount)}</Text>
                        </div>
                    </Section>

                    <Section style={warningBox}>
                        <Text style={warningTitle}>⚠️ 振込名義人について</Text>
                        <Text style={warningText}>
                            振込名義人には必ず以下の識別コードを含めてください：
                        </Text>
                        <div style={codeBox}>
                            <Text style={codeText}>{identifierCode}</Text>
                        </div>
                    </Section>

                    <Text style={noteText}>
                        ※ 期限までにお振込が確認できない場合、自動的に購読が停止されます。<br />
                        ※ 購読停止後も、再度お申し込みいただくことで継続が可能です。
                    </Text>

                    <Section style={linkSection}>
                        <Link
                            href={`https://creatorspace.jp/creators/${creatorHandle}`}
                            style={button}
                        >
                            {creatorName}のページを見る
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
    lineHeight: '1.3',
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

const alertBox = {
    border: '2px solid',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
    textAlign: 'center' as const,
};

const alertText = {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0',
};

const alertSubtext = {
    color: '#666',
    fontSize: '14px',
    margin: '8px 0 0 0',
};

const infoBox = {
    backgroundColor: '#fff',
    border: '1px solid #e1e8ed',
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

const amountBox = {
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    padding: '12px',
    margin: '16px 0 0 0',
    textAlign: 'center' as const,
};

const amountLabel = {
    color: '#666',
    fontSize: '13px',
    margin: '0 0 6px 0',
};

const amountValue = {
    color: '#223C7D',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
};

const warningBox = {
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
};

const warningTitle = {
    color: '#856404',
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 8px 0',
};

const warningText = {
    color: '#856404',
    fontSize: '14px',
    margin: '6px 0',
};

const codeBox = {
    backgroundColor: '#fff',
    border: '1px dashed #ffc107',
    borderRadius: '4px',
    padding: '8px',
    margin: '8px 0',
    textAlign: 'center' as const,
};

const codeText = {
    color: '#223C7D',
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '1px',
    margin: '0',
};

const noteText = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '20px 0',
};

const linkSection = {
    margin: '24px 0',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#223C7D',
    borderRadius: '6px',
    color: '#fff',
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '600',
    padding: '12px 28px',
    textDecoration: 'none',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    margin: '28px 0 0 0',
    textAlign: 'center' as const,
};
