import { PrismaClient, BankTransferType, ChargeRequestStatus } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const AUTOMATION_WEBHOOK_SECRET = process.env.AUTOMATION_WEBHOOK_SECRET || 'test-secret-123';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logResult(step: string, success: boolean, message: string, data?: any) {
  results.push({ step, success, message, data });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${step}: ${message}`);
  if (data && !success) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

async function testWebhookFlow() {
  console.log('='.repeat(80));
  console.log('WEBHOOK TEST: Fan Credit Charge Flow');
  console.log('='.repeat(80));
  console.log('');

  let testUserId: string | null = null;
  let testCreatorId: string | null = null;
  let testFanProfileId: string | null = null;
  let testChargeRequestId: string | null = null;
  let testVirtualAccountId: string | null = null;
  let testAccountNumber: string | null = null;

  try {
    // Step 1: Find or create test user
    console.log('Step 1: Setup test data...');

    let testUser = await prisma.user.findFirst({
      where: { email: 'webhook-test@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'webhook-test@example.com',
          name: 'Webhook Test User',
          password: 'hashed_password',
        },
      });
      logResult('1.1', true, `Created test user: ${testUser.id}`);
    } else {
      logResult('1.1', true, `Found existing test user: ${testUser.id}`);
    }
    testUserId = testUser.id;

    // Step 2: Find or create test creator
    let testCreator = await prisma.creatorProfile.findFirst({
      where: { handle: 'webhook-test-creator' },
    });

    if (!testCreator) {
      const creatorUser = await prisma.user.create({
        data: {
          email: 'webhook-test-creator@example.com',
          name: 'Webhook Test Creator',
          password: 'hashed_password',
        },
      });

      testCreator = await prisma.creatorProfile.create({
        data: {
          userId: creatorUser.id,
          handle: 'webhook-test-creator',
          displayName: 'Webhook Test Creator',
        },
      });
      logResult('1.2', true, `Created test creator: ${testCreator.id}`);
    } else {
      logResult('1.2', true, `Found existing test creator: ${testCreator.id}`);
    }
    testCreatorId = testCreator.id;

    // Step 3: Find or create fan profile
    let fanProfile = await prisma.fanProfile.findUnique({
      where: {
        userId_creatorId: {
          userId: testUserId,
          creatorId: testCreatorId,
        },
      },
    });

    if (!fanProfile) {
      fanProfile = await prisma.fanProfile.create({
        data: {
          userId: testUserId,
          creatorId: testCreatorId,
          credits: 0,
        },
      });
      logResult('1.3', true, `Created fan profile: ${fanProfile.id}`);
    } else {
      logResult('1.3', true, `Found existing fan profile: ${fanProfile.id}, credits: ${fanProfile.credits}`);
    }
    testFanProfileId = fanProfile.id;

    // Step 4: Create ChargeRequest
    console.log('\nStep 2: Create ChargeRequest...');
    const chargeAmount = 10000;
    const chargeRequest = await prisma.chargeRequest.create({
      data: {
        fanId: testFanProfileId,
        amount: chargeAmount,
        status: ChargeRequestStatus.PENDING,
        identifierCode: `TEST-${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });
    testChargeRequestId = chargeRequest.id;
    logResult('2.1', true, `Created ChargeRequest: ${chargeRequest.id}, amount: ¥${chargeAmount}`);

    // Step 5: Assign virtual account
    console.log('\nStep 3: Assign virtual account...');

    // Find available virtual account
    const availableAccount = await prisma.virtualAccount.findFirst({
      where: {
        purpose: BankTransferType.FAN_CREDIT,
        isUsed: false,
        isActive: true,
      },
    });

    if (!availableAccount) {
      // Create a test virtual account
      const testAccount = await prisma.virtualAccount.create({
        data: {
          accountNumber: `TEST${Date.now()}`,
          accountName: 'テスト用口座',
          branchCode: '001',
          purpose: BankTransferType.FAN_CREDIT,
          isActive: true,
          isUsed: false,
        },
      });
      testVirtualAccountId = testAccount.id;
      testAccountNumber = testAccount.accountNumber;
      logResult('3.1', true, `Created test virtual account: ${testAccountNumber}`);
    } else {
      testVirtualAccountId = availableAccount.id;
      testAccountNumber = availableAccount.accountNumber;
      logResult('3.1', true, `Found available virtual account: ${testAccountNumber}`);
    }

    // Assign to ChargeRequest
    await prisma.virtualAccount.update({
      where: { id: testVirtualAccountId },
      data: {
        isUsed: true,
        assignedToPaymentId: testChargeRequestId,
        assignedAt: new Date(),
      },
    });
    logResult('3.2', true, `Assigned virtual account to ChargeRequest`);

    // Step 6: Simulate Automation Webhook
    console.log('\nStep 4: Simulate Automation Webhook...');

    const webhookPayload = {
      accountNumber: testAccountNumber,
      amount: chargeAmount,
      transferorName: 'テストユーザー',
      transferDate: new Date().toISOString(),
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/webhooks/automation/bank-transfer`,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': AUTOMATION_WEBHOOK_SECRET,
          },
        }
      );

      logResult('4.1', true, `Webhook processed successfully`, response.data);
    } catch (error: any) {
      logResult('4.1', false, `Webhook failed: ${error.message}`, error.response?.data);
      throw error;
    }

    // Step 7: Verify results
    console.log('\nStep 5: Verify results...');

    // Check ChargeRequest status
    const updatedChargeRequest = await prisma.chargeRequest.findUnique({
      where: { id: testChargeRequestId },
    });

    if (updatedChargeRequest?.status === ChargeRequestStatus.APPROVED) {
      logResult('5.1', true, `ChargeRequest status: APPROVED`);
    } else {
      logResult('5.1', false, `ChargeRequest status: ${updatedChargeRequest?.status} (expected: APPROVED)`);
    }

    // Check fan credits
    const updatedFanProfile = await prisma.fanProfile.findUnique({
      where: { id: testFanProfileId },
    });

    const expectedCredits = fanProfile.credits + chargeAmount;
    if (updatedFanProfile?.credits === expectedCredits) {
      logResult('5.2', true, `Fan credits updated: ${fanProfile.credits} -> ${updatedFanProfile.credits}`);
    } else {
      logResult('5.2', false, `Fan credits: ${updatedFanProfile?.credits} (expected: ${expectedCredits})`);
    }

    // Check virtual account released
    const updatedVirtualAccount = await prisma.virtualAccount.findUnique({
      where: { id: testVirtualAccountId },
    });

    if (!updatedVirtualAccount?.isUsed && !updatedVirtualAccount?.assignedToPaymentId) {
      logResult('5.3', true, `Virtual account released back to inventory`);
    } else {
      logResult('5.3', false, `Virtual account still assigned (isUsed: ${updatedVirtualAccount?.isUsed})`);
    }

    // Check BankTransfer record
    const bankTransfer = await prisma.bankTransfer.findFirst({
      where: { chargeRequestId: testChargeRequestId },
    });

    if (bankTransfer) {
      logResult('5.4', true, `BankTransfer record created: ${bankTransfer.id}, status: ${bankTransfer.status}`);
    } else {
      logResult('5.4', false, `BankTransfer record not found`);
    }

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalCount = results.length;

    console.log(`Total steps: ${totalCount}`);
    console.log(`✅ Passed: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`Success rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));

    if (failCount === 0) {
      console.log('\n🎉 All tests passed!\n');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.\n');
    }

    await prisma.$disconnect();
  }
}

// Run the test
testWebhookFlow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
