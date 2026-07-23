import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { GET } from '../apps/web/app/api/cron/renew-subscriptions/route';

loadEnv({ path: 'apps/web/.env.local', override: false });

if (process.env.FORCE_DEV_EMAIL === '1') {
  delete process.env.RESEND_API_KEY;
}

const prisma = new PrismaClient();
const testEmail = process.env.TEST_FAN_EMAIL ?? 'test-fan@example.com';

function calculateNextBillingDate(fromDate: Date): Date {
  const nextDate = new Date(fromDate);
  const originalDate = nextDate.getDate();
  nextDate.setMonth(nextDate.getMonth() + 1);

  if (nextDate.getDate() !== originalDate) {
    nextDate.setDate(0);
  }

  return nextDate;
}

function dueSoonDate(): Date {
  return new Date(Date.now() + 60 * 60 * 1000);
}

async function callRenewalCron() {
  const headers = new Headers();
  if (process.env.CRON_SECRET) {
    headers.set('authorization', `Bearer ${process.env.CRON_SECRET}`);
  }

  const request = new NextRequest('http://localhost:3000/api/cron/renew-subscriptions', {
    method: 'GET',
    headers,
  });

  const response = await GET(request);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Cron failed with ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

async function main() {
  const creatorUser = await prisma.user.upsert({
    where: { email: 'codex-renewal-creator@example.com' },
    update: {
      name: 'Codex Renewal Creator',
      role: 'CREATOR',
    },
    create: {
      email: 'codex-renewal-creator@example.com',
      name: 'Codex Renewal Creator',
      role: 'CREATOR',
    },
  });

  const testCreator = await prisma.creatorProfile.upsert({
    where: { handle: 'codex-renewal-test' },
    update: {
      displayName: 'Codex Renewal Test',
    },
    create: {
      userId: creatorUser.id,
      handle: 'codex-renewal-test',
      displayName: 'Codex Renewal Test',
      bio: 'Renewal cron test creator',
      theme: 'creator-pro',
    },
  });

  const testPlan = await prisma.subscriptionPlan.upsert({
    where: { id: `test-renewal-plan-${testCreator.id}` },
    update: {
      creatorId: testCreator.id,
      name: 'Renewal Test Plan',
      price: 1000,
      description: 'Plan used by the renewal cron test',
    },
    create: {
      id: `test-renewal-plan-${testCreator.id}`,
      creatorId: testCreator.id,
      name: 'Renewal Test Plan',
      price: 1000,
      description: 'Plan used by the renewal cron test',
    },
  });

  const creator = await prisma.creatorProfile.findUnique({
    where: { id: testCreator.id },
    include: {
      plans: {
        where: { id: testPlan.id },
        take: 1,
      },
    },
  });

  if (!creator || creator.plans.length === 0) {
    throw new Error('No creator with a fan subscription plan was found.');
  }

  const plan = creator.plans[0];
  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      name: 'Renewal Test Fan',
      role: 'USER',
    },
    create: {
      email: testEmail,
      name: 'Renewal Test Fan',
      role: 'USER',
    },
  });

  const fan = await prisma.fanProfile.upsert({
    where: {
      userId_creatorId: {
        userId: user.id,
        creatorId: creator.id,
      },
    },
    update: {
      displayName: 'Renewal Test Fan',
      credits: plan.price * 2,
    },
    create: {
      userId: user.id,
      creatorId: creator.id,
      displayName: 'Renewal Test Fan',
      credits: plan.price * 2,
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: {
      id: `test-renewal-${fan.id}`,
    },
    update: {
      planId: plan.id,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: dueSoonDate(),
    },
    create: {
      id: `test-renewal-${fan.id}`,
      fanId: fan.id,
      planId: plan.id,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: dueSoonDate(),
    },
  });

  const firstEndDate = subscription.endDate!;
  const firstResult = await callRenewalCron();
  const renewed = await prisma.subscription.findUniqueOrThrow({
    where: { id: subscription.id },
    include: { fan: true },
  });

  const expectedRenewedEndDate = calculateNextBillingDate(firstEndDate);
  const renewalPassed =
    renewed.status === 'ACTIVE' &&
    renewed.fan.credits === plan.price &&
    renewed.endDate?.toISOString() === expectedRenewedEndDate.toISOString();

  await prisma.fanProfile.update({
    where: { id: fan.id },
    data: { credits: Math.max(plan.price - 1, 0) },
  });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'ACTIVE',
      endDate: dueSoonDate(),
    },
  });

  const secondResult = await callRenewalCron();
  const cancelled = await prisma.subscription.findUniqueOrThrow({
    where: { id: subscription.id },
    include: { fan: true },
  });
  const latestEmailLog = await prisma.emailLog.findFirst({
    where: {
      toEmail: testEmail,
      emailType: 'FAN_SUBSCRIPTION_EXPIRED',
    },
    orderBy: { createdAt: 'desc' },
  });

  const cancellationPassed =
    cancelled.status === 'CANCELLED' &&
    cancelled.fan.credits === Math.max(plan.price - 1, 0) &&
    !!latestEmailLog;

  console.log(JSON.stringify({
    testEmail,
    creator: {
      id: creator.id,
      handle: creator.handle,
      displayName: creator.displayName,
    },
    plan: {
      id: plan.id,
      name: plan.name,
      price: plan.price,
    },
    renewal: {
      passed: renewalPassed,
      cronResult: firstResult.results,
      finalStatus: renewed.status,
      finalCredits: renewed.fan.credits,
      expectedCredits: plan.price,
      finalEndDate: renewed.endDate,
      expectedEndDate: expectedRenewedEndDate,
    },
    insufficientCredits: {
      passed: cancellationPassed,
      cronResult: secondResult.results,
      finalStatus: cancelled.status,
      finalCredits: cancelled.fan.credits,
      emailLog: latestEmailLog
        ? {
            id: latestEmailLog.id,
            status: latestEmailLog.status,
            subject: latestEmailLog.subject,
            createdAt: latestEmailLog.createdAt,
          }
        : null,
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
