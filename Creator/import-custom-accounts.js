const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CSV_FILE_PATH = process.argv[2];
const PURPOSE = process.argv[3] === 'creator' ? 'CREATOR_PLAN' : 'FAN_CREDIT';

if (!CSV_FILE_PATH) {
    console.error('Usage: node import-custom-accounts.js <path-to-csv> [fan|creator]');
    process.exit(1);
}

function parseCSV(filePath) {
    console.log(`Reading CSV file: ${filePath}`);
    // UTF-8として読み込む
    const content = fs.readFileSync(filePath, 'utf-8');
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

        console.log(`Found ${dataRows.length} accounts to import for ${PURPOSE}`);

        let upsertedCount = 0;

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const branchCode = row[0]?.trim();
            const originalBranchName = row[1]?.trim();
            const accountNumber = row[2]?.trim();

            if (!accountNumber) {
                continue;
            }

            const finalBranchName = originalBranchName && branchCode
                ? `${originalBranchName}（${branchCode}）`
                : originalBranchName || '';

            const data = {
                accountName: 'ココバ',
                branchCode: branchCode || null,
                branchName: finalBranchName,
                purpose: PURPOSE,
                isActive: true,
            };

            // 上書き(UPDATE) または 新規作成(CREATE) を行う
            await prisma.virtualAccount.upsert({
                where: { accountNumber: accountNumber },
                update: data,
                create: {
                    id: `va_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                    accountNumber: accountNumber,
                    ...data,
                }
            });
            upsertedCount++;
        }

        console.log(`\n✅ Successfully upserted (updated/created) ${upsertedCount} virtual accounts!`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importAccounts().then(() => process.exit(0)).catch(() => process.exit(1));
