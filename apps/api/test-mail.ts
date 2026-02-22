import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MailService } from './src/mail/mail.service';

async function testMail() {
  console.log('🧪 Testing Mail Implementation...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const mailService = app.get(MailService);

    console.log('✅ MailService successfully initialized\n');

    // Test 1: Welcome Email
    console.log('📧 Test 1: Sending Welcome Email...');
    await mailService.sendWelcomeEmail(
      'test@example.com',
      {
        userType: 'creator',
        name: 'テストユーザー',
        email: 'test@example.com',
        handle: 'testuser123',
      },
      'test-user-id-123',
    );

    console.log('\n✅ All tests passed!\n');

    await app.close();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testMail();
