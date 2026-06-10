import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import React from 'react';
import { getCreatorPlatformUrl } from '../../../platform-url';

interface InsufficientCreditsEmailProps {
    fanName: string;
    creatorName: string;
    creatorHandle: string;
    planName: string;
    requiredCredits: number;
    availableCredits: number;
}

function formatCredits(amount: number): string {
    return `${amount.toLocaleString('ja-JP')}クレジット`;
}

export function InsufficientCreditsEmail({
    fanName,
    creatorName,
    creatorHandle,
    planName,
    requiredCredits,
    availableCredits,
}: InsufficientCreditsEmailProps) {
    const shortage = Math.max(requiredCredits - availableCredits, 0);
    const creditsUrl = getCreatorPlatformUrl(creatorHandle, '/account/credits');
    const plansUrl = getCreatorPlatformUrl(creatorHandle, '/account/plans');

    return (
        <Html>
            <Head />
            <Preview>{creatorName}の{planName}プランを自動更新できませんでした</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={logo}>CocoBa</Text>
                    <Heading style={h1}>プランを自動更新できませんでした</Heading>

                    <Text style={text}>{fanName} 様</Text>

                    <Text style={text}>
                        {creatorName}の「{planName}」プランは、クレジット残高が不足していたため自動更新できませんでした。
                    </Text>

                    <Section style={summaryOuter}>
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={fullWidthTable}>
                            <tbody>
                                <tr>
                                    <td style={summaryBox}>
                                        <Text style={summaryLabel}>更新に必要なクレジット</Text>
                                        <Text style={summaryValue}>{formatCredits(requiredCredits)}</Text>
                                        <Hr style={summaryDivider} />
                                        <Text style={summaryLabel}>現在の残高</Text>
                                        <Text style={summaryValue}>{formatCredits(availableCredits)}</Text>
                                        <Hr style={summaryDivider} />
                                        <Text style={shortageLabel}>不足分</Text>
                                        <Text style={shortageValue}>{formatCredits(shortage)}</Text>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Text style={text}>
                        引き続きプラン特典を利用する場合は、クレジットをチャージしたうえで、プランページから再度お申し込みください。
                    </Text>

                    <Section style={buttonOuter}>
                        <table role="presentation" cellPadding="0" cellSpacing="0" style={fullWidthTable}>
                            <tbody>
                                <tr>
                                    <td style={buttonCell}>
                                        <Button href={creditsUrl} style={button}>
                                            クレジットをチャージする
                                        </Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={secondaryButtonCell}>
                                        <Button href={plansUrl} style={secondaryButton}>
                                            プランを確認する
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Hr style={divider} />

                    <Text style={footer}>
                        このメールに心当たりがない場合は、お手数ですがCocoBaサポートまでお問い合わせください。<br />
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
    overflow: 'hidden',
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
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
};

const summaryOuter = {
    margin: '24px 0',
    padding: '0 20px',
};

const fullWidthTable = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    tableLayout: 'fixed' as const,
};

const summaryBox = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    padding: '20px',
    width: '100%',
};

const summaryLabel = {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '18px',
    margin: '0 0 4px 0',
};

const summaryValue = {
    color: '#111827',
    fontSize: '22px',
    fontWeight: '700',
    lineHeight: '28px',
    margin: '0',
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
};

const shortageLabel = {
    ...summaryLabel,
    color: '#b91c1c',
};

const shortageValue = {
    ...summaryValue,
    color: '#b91c1c',
};

const summaryDivider = {
    borderColor: '#eef2f7',
    margin: '14px 0',
};

const buttonOuter = {
    margin: '30px 0',
    padding: '0 20px',
};

const buttonCell = {
    textAlign: 'center' as const,
    padding: '0 0 12px',
};

const secondaryButtonCell = {
    textAlign: 'center' as const,
    padding: '0',
};

const button = {
    backgroundColor: '#223C7D',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    boxSizing: 'border-box' as const,
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
};

const secondaryButton = {
    backgroundColor: '#ffffff',
    border: '1px solid #223C7D',
    color: '#223C7D',
    padding: '12px 28px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    boxSizing: 'border-box' as const,
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
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
