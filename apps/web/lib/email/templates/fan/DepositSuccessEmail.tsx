import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';
import { formatCurrency } from '../../utils/formatters';

interface DepositSuccessEmailProps {
    fanName: string;
    amount: number;
    balance: number;
}

export function DepositSuccessEmail({
    fanName,
    amount,
    balance,
}: DepositSuccessEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>{formatCurrency(amount)}クレジットされました</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={logo}>CocoBa</Text>
                    <Heading style={h1}>入金が完了しました</Heading>

                    <Text style={text}>
                        {fanName} 様
                    </Text>

                    <Text style={text}>
                        振込確認が完了し、クレジットが付与されました。
                    </Text>

                    <Section style={amountBox}>
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={metricTable}>
                            <tbody>
                                <tr>
                                    <td style={metricCell}>
                                        <Text style={amountLabel}>付与クレジット</Text>
                                        <Text style={amountValue}>{formatCurrency(amount)}</Text>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Section style={balanceBox}>
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={metricTable}>
                            <tbody>
                                <tr>
                                    <td style={metricCell}>
                                        <Text style={balanceLabel}>現在の残高</Text>
                                        <Text style={balanceValue}>{formatCurrency(balance)}</Text>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Text style={text}>
                        チャージしたクレジットで、お気に入りのコンテンツをお楽しみください。
                    </Text>

                    <Hr style={divider} />

                    <Text style={footer}>
                        ご不明な点がございましたら、お気軽にお問い合わせください。<br />
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

const text = {
    color: '#404040',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    padding: '0 20px',
};

const amountBox = {
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    padding: '20px',
    margin: '24px 20px',
    textAlign: 'center' as const,
};

const metricTable = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    tableLayout: 'fixed' as const,
};

const metricCell = {
    padding: '0',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
};

const amountLabel = {
    color: '#2e7d32',
    display: 'block',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 8px 0',
};

const amountValue = {
    color: '#1b5e20',
    display: 'block',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '38px',
    margin: '0',
};

const balanceBox = {
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    padding: '20px',
    margin: '0 20px 24px',
    textAlign: 'center' as const,
};

const balanceLabel = {
    color: '#1565c0',
    display: 'block',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 8px 0',
};

const balanceValue = {
    color: '#0d47a1',
    display: 'block',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '30px',
    margin: '0',
};

const divider = {
    borderColor: '#e5e5e5',
    margin: '20px',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '16px 0',
    textAlign: 'center' as const,
    padding: '0 20px 40px',
};
