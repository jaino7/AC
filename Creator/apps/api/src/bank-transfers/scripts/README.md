# Bank Transfers Scripts

## Overview

This directory contains scripts for managing virtual accounts and testing bank transfer webhooks.

## Scripts

### 1. import-accounts.ts

Import virtual accounts from a JSON file into the database.

**Usage:**

```bash
cd apps/api
npm run import:virtual-accounts
```

**Setup:**

1. Create `virtual-accounts.json` in the same directory with the following structure:

```json
[
  {
    "accountNumber": "1234567890",
    "accountName": "ファンクレジット用口座001",
    "branchCode": "001",
    "purpose": "FAN_CREDIT"
  },
  {
    "accountNumber": "1234567891",
    "accountName": "クリエイタープラン用口座001",
    "branchCode": "001",
    "purpose": "CREATOR_PLAN"
  }
]
```

2. Run the import script (see Usage above)

### 2. test-webhook.ts

Test the complete webhook flow for fan credit charging.

**Usage:**

```bash
cd apps/api
npm run test:webhook
```

**Prerequisites:**

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Add to your `.env` file:

```env
# Automation Webhook Secret (Make/Zapier)
AUTOMATION_WEBHOOK_SECRET=your-secret-key-here

# API Base URL (for testing)
API_BASE_URL=http://localhost:3001
```

3. **Start the API server:**

```bash
npm run start:dev
```

4. **Run the test:**

```bash
npm run test:webhook
```

**What the test does:**

1. Creates test data:
   - Test user (fan)
   - Test creator
   - Fan profile
   - Charge request

2. Assigns a virtual account to the charge request

3. Simulates an automation webhook (Make/Zapier) with bank transfer data

4. Verifies:
   - Charge request is approved
   - Fan credits are updated
   - Virtual account is released back to inventory
   - Bank transfer record is created

**Expected output:**

```
================================================================================
WEBHOOK TEST: Fan Credit Charge Flow
================================================================================

Step 1: Setup test data...
✅ 1.1: Found existing test user: cml35joeg0003vjvcw3zo0wp6
✅ 1.2: Found existing test creator: cml35joeg0004vjvcw3zo0wp7
✅ 1.3: Found existing fan profile: cml35joeg0005vjvcw3zo0wp8, credits: 0

Step 2: Create ChargeRequest...
✅ 2.1: Created ChargeRequest: cml35joeg0006vjvcw3zo0wp9, amount: ¥10000

Step 3: Assign virtual account...
✅ 3.1: Found available virtual account: TEST1234567890
✅ 3.2: Assigned virtual account to ChargeRequest

Step 4: Simulate Automation Webhook...
✅ 4.1: Webhook processed successfully

Step 5: Verify results...
✅ 5.1: ChargeRequest status: APPROVED
✅ 5.2: Fan credits updated: 0 -> 10000
✅ 5.3: Virtual account released back to inventory
✅ 5.4: BankTransfer record created: cml35joeg0007vjvcw3zo0wpa, status: PROCESSED

================================================================================
TEST SUMMARY
================================================================================
Total steps: 10
✅ Passed: 10
❌ Failed: 0
Success rate: 100.0%
================================================================================

🎉 All tests passed!
```

## Troubleshooting

### Test fails with "Virtual account inventory is currently unavailable"

**Solution:** Import virtual accounts first using `npm run import:virtual-accounts`

### Test fails with "User ID is required in X-User-Id header"

**Solution:** Make sure the API server is running and the `API_BASE_URL` is correct in your `.env` file

### Test fails with "Invalid webhook secret"

**Solution:** Make sure `AUTOMATION_WEBHOOK_SECRET` is set correctly in your `.env` file

### Test fails with "Connection refused"

**Solution:** Make sure the API server is running (`npm run start:dev`)

## Environment Variables

```env
# Required for webhook testing
AUTOMATION_WEBHOOK_SECRET=your-secret-key-here
API_BASE_URL=http://localhost:3001

# Required for GMO integration (production)
GMO_WEBHOOK_SECRET=your-gmo-webhook-secret
GMO_API_KEY=your-gmo-api-key
GMO_API_ENDPOINT=https://api.gmo-aozora.com/v1
```

## Related Documentation

- [Virtual Account Payment Flow](../../../VIRTUAL_ACCOUNT_PAYMENT_FLOW.md)
- [GMO Integration Guide](../../../GMO_INTEGRATION_GUIDE.md)
- [Bank Transfers Service](../bank-transfers.service.ts)
