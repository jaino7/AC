declare module 'zengin-code' {
    interface BranchData {
        name: string;
        kana: string;
        hira: string;
    }

    interface BankData {
        name: string;
        kana: string;
        hira: string;
        branches: Record<string, BranchData>;
    }

    const zenginCode: Record<string, BankData>;
    export default zenginCode;
}
