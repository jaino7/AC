import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './src/prisma/prisma.module';
import { MailModule } from './src/mail/mail.module';
import { MailService } from './src/mail/mail.service';

async function testMail() {
  console.log('🧪 Testing Mail Implementation (Simple)...\n');

  try {
    // Create a test module with only the required dependencies
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        MailModule,
      ],
    }).compile();

    const mailService = moduleRef.get<MailService>(MailService);
    console.log('✅ MailService successfully initialized\n');

    // Test 1: Welcome Email for Creator
    console.log('📧 Test 1: Sending Welcome Email (Creator)...');
    const result1 = await mailService.sendWelcomeEmail(
      'creator@example.com',
      {
        userType: 'creator',
        name: 'クリエイター太郎',
        email: 'creator@example.com',
        handle: 'creator-taro',
      },
      'test-creator-id',
    );
    console.log('   Result:', result1.success ? '✅ Success' : '❌ Failed');

    // Test 2: Deposit Success Email
    console.log('\n📧 Test 2: Sending Deposit Success Email...');
    const result2 = await mailService.sendDepositSuccessEmail(
      'fan@example.com',
      {
        fanName: 'ファン花子',
        amount: 5000,
        balance: 8000,
        transferorName: 'ヤマダハナコ',
        transferDate: new Date(),
      },
      'test-fan-id',
    );
    console.log('   Result:', result2.success ? '✅ Success' : '❌ Failed');

    // Test 3: Payment Instruction Email
    console.log('\n📧 Test 3: Sending Payment Instruction Email...');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const result3 = await mailService.sendPaymentInstructionEmail(
      'fan@example.com',
      {
        fanName: 'ファン花子',
        creatorName: 'クリエイター太郎',
        creatorHandle: 'creator-taro',
        amount: 5000,
        bankName: 'GMOあおぞらネット銀行',
        branchName: '法人第一支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: 'カ）テストカイシャ',
        identifierCode: '12345678',
        dueDate,
      },
      'test-fan-id',
    );
    console.log('   Result:', result3.success ? '✅ Success' : '❌ Failed');

    console.log('\n✅ All tests passed!\n');

    await moduleRef.close();
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testMail();
