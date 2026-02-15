import { PrismaClient, BankTransferType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';

const prisma = new PrismaClient();

/**
 * CSVファイルからバーチャル口座をインポート
 *
 * CSVフォーマット（Shift_JIS）:
 * 支店,支店名(カナ),口座番号,口座名義,口座タイプ,...
 *
 * 実行: ts-node import-from-csv.ts <csv-file-path> <purpose>
 * 例: ts-node import-from-csv.ts ~/Downloads/account_list.csv CREATOR_PLAN
 */

interface VirtualAccountRow {
  branchCode: string;
  branchName: string;
  accountNumber: string;
  accountName: string;
  purpose: BankTransferType;
}

async function importFromCSV() {
  console.log('Starting CSV import...\n');

  // コマンドライン引数から取得
  const csvPath = process.argv[2];
  const purpose = process.argv[3] as BankTransferType;

  if (!csvPath) {
    console.error('Error: CSV file path is required');
    console.log('Usage: ts-node import-from-csv.ts <csv-file-path> <purpose>');
    console.log('Example: ts-node import-from-csv.ts ~/Downloads/account_list.csv CREATOR_PLAN');
    console.log('Purpose: CREATOR_PLAN or FAN_CREDIT');
    process.exit(1);
  }

  if (!purpose || !['CREATOR_PLAN', 'FAN_CREDIT'].includes(purpose)) {
    console.error('Error: Invalid purpose. Must be CREATOR_PLAN or FAN_CREDIT');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  console.log(`CSV file: ${csvPath}`);
  console.log(`Purpose: ${purpose}\n`);

  // CSVファイルを読み込み（Shift_JIS）
  const csvBuffer = fs.readFileSync(csvPath);
  const csvContent = iconv.decode(csvBuffer, 'shift_jis');

  // 行ごとに分割
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length <= 1) {
    console.error('Error: CSV file is empty or has only header');
    process.exit(1);
  }

  console.log(`Found ${lines.length - 1} accounts in CSV file\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // ヘッダー行をスキップ
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // CSVパース（簡易版）
    const columns = line.split(',').map(col => col.replace(/^"/, '').replace(/"$/, '').trim());

    if (columns.length < 4) {
      console.log(`⏭️  Skipped (invalid format): Line ${i + 1}`);
      skipCount++;
      continue;
    }

    const branchCode = columns[0]; // 支店コード
    const branchName = columns[1]; // 支店名
    const accountNumber = columns[2]; // 口座番号
    const accountName = columns[3]; // 口座名義

    if (!accountNumber || accountNumber.length < 5) {
      console.log(`⏭️  Skipped (invalid account number): Line ${i + 1}`);
      skipCount++;
      continue;
    }

    try {
      // 既存チェック
      const existing = await prisma.virtualAccount.findUnique({
        where: { accountNumber },
      });

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${accountNumber}`);
        skipCount++;
        continue;
      }

      // インポート
      await prisma.virtualAccount.create({
        data: {
          accountNumber,
          accountName,
          branchCode,
          purpose,
          isActive: true,
          isUsed: false,
          gmoAccountId: null,
        },
      });

      console.log(`✅ Imported: ${accountNumber} (${accountName})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error importing ${accountNumber}:`, (error as any).message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`⏭️  Skipped (duplicates):  ${skipCount}`);
  console.log(`❌ Errors:                ${errorCount}`);
  console.log(`📊 Total processed:       ${lines.length - 1}`);
  console.log('='.repeat(60) + '\n');

  // 在庫状況を表示
  const creatorPlanCount = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.CREATOR_PLAN, isUsed: false },
  });
  const fanCreditCount = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.FAN_CREDIT, isUsed: false },
  });

  console.log('Current Inventory Status:');
  console.log(`  CREATOR_PLAN available: ${creatorPlanCount}`);
  console.log(`  FAN_CREDIT available:   ${fanCreditCount}\n`);
}

importFromCSV()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
