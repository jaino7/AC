const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const iconv = require('iconv-lite');

const prisma = new PrismaClient();

// 引数からCSVファイルのパスと目的（FAN_CREDIT or CREATOR_PLAN）を取得
const CSV_FILE_PATH = process.argv[2];
const PURPOSE = process.argv[3] === 'creator' ? 'CREATOR_PLAN' : 'FAN_CREDIT';

if (!CSV_FILE_PATH) {
    console.error('Usage: node scripts/import-custom-accounts.js <path-to-csv> [fan|creator]');
    process.exit(1);
}

// Parse CSV with Shift-JIS encoding
function parseCSV(filePath) {
    console.log(`Reading CSV file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    // Shift-JIS から UTF-8 に変換
    const content = iconv.decode(buffer, 'Shift_JIS');
    const lines = content.split('\n').filter(line => line.trim());

    const rows = lines.map(line => {
        const fields = [];
        let field = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(field);
                field = '';
            } else {
                field += char;
            }
        }
        fields.push(field);
        return fields;
    });

    return rows;
}

async function importAccounts() {
    try {
        const rows = parseCSV(CSV_FILE_PATH);
        const header = rows[0];
        const dataRows = rows.slice(1);

        console.log(`Header: ${header.join(', ')}`);
        console.log(`Found ${dataRows.length} accounts to import for ${PURPOSE}`);

        // Prepare account data
        const accounts = dataRows.map((row, index) => {
            const branchCode = row[0]?.trim();
            const originalBranchName = row[1]?.trim();
            const accountNumber = row[2]?.trim();

            if (!accountNumber) {
                console.warn(`Skipping row ${index + 2}: Missing account number`);
                return null;
            }

            // 要件に基づくカスタマイズ
            // 1. 支店名は "支店名（支店コード）" 形式にする
            const finalBranchName = originalBranchName && branchCode
                ? `${originalBranchName}（${branchCode}）`
                : originalBranchName || '';

            // 2. 口座名義は元のデータを使用せず「ココバ」固定
            const fixedAccountName = 'ココバ';

            return {
                id: `va_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                accountNumber,
                accountName: fixedAccountName,
                branchCode: branchCode || null,
                branchName: finalBranchName,
                purpose: PURPOSE,
                // 余計なカラム（assignedAt, isUsed, assignedToPaymentId, releasedAt）は
                // データベースでの初期値（またはNULL）に任せるため明示的に指定しない
                isActive: true,
            };
        }).filter(Boolean);

        console.log(`\nPrepared ${accounts.length} valid accounts`);
        if (accounts.length > 0) {
            console.log(`Sample account:`, JSON.stringify(accounts[0], null, 2));
        }

        console.log(`\nAbout to insert ${accounts.length} accounts into VirtualAccount table.`);
        console.log('Inserting...');

        const BATCH_SIZE = 50;
        let inserted = 0;

        for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
            const batch = accounts.slice(i, i + BATCH_SIZE);
            await prisma.virtualAccount.createMany({
                data: batch,
                skipDuplicates: true, // 口座番号の重複エラーを避ける
            });
            inserted += batch.length;
            console.log(`Inserted ${inserted}/${accounts.length} accounts...`);
        }

        console.log(`\n✅ Successfully imported ${inserted} virtual accounts!`);

    } catch (error) {
        console.error('Error importing accounts:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

importAccounts()
    .then(() => {
        console.log('\nImport completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nImport failed:', error);
        process.exit(1);
    });
