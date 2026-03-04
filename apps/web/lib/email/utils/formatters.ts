/**
 * 日付をフォーマット
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

/**
 * 金額をフォーマット
 */
export function formatCurrency(amount: number): string {
    return `${amount.toLocaleString('ja-JP')}クレジット`;
}

/**
 * 識別コードを生成（6桁の英数字）
 */
export function generateIdentifierCode(): string {
    const chars = 'ABCDEFGH JKLMNPQRSTUVWXYZ0123456789'; // 紛らわしいI, Oを除外
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * メールアドレスのバリデーション
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
