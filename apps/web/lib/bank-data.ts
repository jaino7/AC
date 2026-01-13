import zenginCode from "zengin-code";

// zengin-codeから全銀行データを取得
export const banks = Object.entries(zenginCode).map(([code, data]) => ({
    code: code,
    name: data.name,
    kana: data.kana,
    hira: data.hira,
}));

// 銀行名で検索
export function searchBanks(query: string) {
    if (!query) return banks;
    const lowerQuery = query.toLowerCase();
    return banks.filter(
        (bank) =>
            bank.name.toLowerCase().includes(lowerQuery) ||
            bank.kana?.toLowerCase().includes(lowerQuery) ||
            bank.hira?.toLowerCase().includes(lowerQuery) ||
            bank.code.includes(query)
    );
}

// 指定銀行の全支店を取得
export function getBranches(bankCode: string) {
    const bank = zenginCode[bankCode];
    if (!bank || !bank.branches) return [];

    return Object.entries(bank.branches).map(([code, data]) => ({
        code: code,
        name: data.name,
        kana: data.kana,
        hira: data.hira,
    }));
}

// 支店名で検索
export function searchBranches(bankCode: string, query: string) {
    const branches = getBranches(bankCode);
    if (!query) return branches;

    const lowerQuery = query.toLowerCase();
    return branches.filter(
        (branch) =>
            branch.name.toLowerCase().includes(lowerQuery) ||
            branch.kana?.toLowerCase().includes(lowerQuery) ||
            branch.hira?.toLowerCase().includes(lowerQuery) ||
            branch.code.includes(query)
    );
}

// 銀行コードから銀行情報を取得
export function getBankByCode(code: string) {
    const bank = zenginCode[code];
    if (!bank) return null;

    return {
        code: code,
        name: bank.name,
        kana: bank.kana,
        hira: bank.hira,
    };
}

// 支店コードから支店情報を取得
export function getBranchByCode(bankCode: string, branchCode: string) {
    const bank = zenginCode[bankCode];
    if (!bank || !bank.branches || !bank.branches[branchCode]) return null;

    const branch = bank.branches[branchCode];
    return {
        code: branchCode,
        name: branch.name,
        kana: branch.kana,
        hira: branch.hira,
    };
}
