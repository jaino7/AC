const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const iconv = require('iconv-lite');

const prisma = new PrismaClient();

// CSV file path
const CSV_FILE_PATH = process.argv[2] || 'c:\\Users\\仕事用\\Downloads\\account_list.csv';

// Parse CSV with Shift-JIS encoding
function parseCSV(filePath) {
  console.log(`Reading CSV file: ${filePath}`);

  // Read file as buffer
  const buffer = fs.readFileSync(filePath);

  // Convert from Shift-JIS to UTF-8
  const content = iconv.decode(buffer, 'Shift_JIS');

  // Split into lines
  const lines = content.split('\n').filter(line => line.trim());

  // Parse CSV (simple parser, handles quoted fields)
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
    fields.push(field); // Add last field

    return fields;
  });

  return rows;
}

async function importAccounts() {
  try {
    // Parse CSV
    const rows = parseCSV(CSV_FILE_PATH);

    // Skip header row
    const header = rows[0];
    const dataRows = rows.slice(1);

    console.log(`Header: ${header.join(', ')}`);
    console.log(`Found ${dataRows.length} accounts to import`);

    // Prepare account data
    const accounts = dataRows.map((row, index) => {
      const branchCode = row[0]?.trim();
      const branchName = row[1]?.trim();
      const accountNumber = row[2]?.trim();
      const accountName = row[3]?.trim();

      if (!accountNumber || !accountName) {
        console.warn(`Skipping row ${index + 2}: Missing required fields`);
        return null;
      }

      return {
        id: `va_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        accountNumber,
        accountName,
        branchCode: branchCode || null,
        purpose: 'FAN_CREDIT', // Default purpose
        isUsed: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }).filter(Boolean);

    console.log(`\nPrepared ${accounts.length} valid accounts`);
    console.log(`Sample account:`, JSON.stringify(accounts[0], null, 2));

    // Confirm before proceeding
    console.log(`\nAbout to insert ${accounts.length} accounts into VirtualAccount table.`);
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to proceed...');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Insert accounts in batches
    const BATCH_SIZE = 50;
    let inserted = 0;

    for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
      const batch = accounts.slice(i, i + BATCH_SIZE);

      await prisma.virtualAccount.createMany({
        data: batch,
        skipDuplicates: true, // Skip if account number already exists
      });

      inserted += batch.length;
      console.log(`Inserted ${inserted}/${accounts.length} accounts...`);
    }

    console.log(`\n✅ Successfully imported ${inserted} virtual accounts!`);

    // Show summary
    const summary = await prisma.virtualAccount.groupBy({
      by: ['purpose', 'isUsed'],
      _count: true,
    });

    console.log('\nSummary:');
    summary.forEach(s => {
      console.log(`  ${s.purpose} (isUsed: ${s.isUsed}): ${s._count} accounts`);
    });

  } catch (error) {
    console.error('Error importing accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importAccounts()
  .then(() => {
    console.log('\nImport completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport failed:', error);
    process.exit(1);
  });
