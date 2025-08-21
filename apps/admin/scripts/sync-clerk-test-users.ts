#!/usr/bin/env tsx
/**
 * Sync Clerk Test Users Script
 *
 * Fetches current test user data from Clerk and generates fixtures
 * Run with: pnpm tsx scripts/sync-clerk-test-users.ts
 */

import { clerkClient } from '@clerk/nextjs/server';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const TEST_USER_EMAILS = [
  'superadmin+clerk_test@example.com',
  'rg_admin+clerk_test@example.com',
  'ns_admin+clerk_test@example.com',
  'editor+clerk_test@example.com',
  'author+clerk_test@example.com',
  'translator+clerk_test@example.com',
];

interface UserFixture {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  publicMetadata: any;
  privateMetadata: any;
  createdAt: number;
  updatedAt: number;
}

async function syncTestUsers() {
  console.log('🔄 Syncing Clerk test users...\n');

  try {
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ limit: 100 });

    const testUsers: Record<string, UserFixture> = {};
    const foundUsers: string[] = [];
    const missingUsers: string[] = [];

    for (const email of TEST_USER_EMAILS) {
      const user = users.data.find((u) =>
        u.emailAddresses.some((e) => e.emailAddress === email),
      );

      if (user) {
        foundUsers.push(email);
        const role = email.split('+')[0].replace('_', '');

        testUsers[role] = {
          id: user.id,
          email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          publicMetadata: user.publicMetadata,
          privateMetadata: user.privateMetadata,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        console.log(`✅ Found: ${email}`);
        console.log(`   ID: ${user.id}`);
        console.log(
          `   Public Metadata:`,
          JSON.stringify(user.publicMetadata, null, 2),
        );
        console.log(
          `   Private Metadata:`,
          JSON.stringify(user.privateMetadata, null, 2),
        );
        console.log('');
      } else {
        missingUsers.push(email);
        console.log(`❌ Not found: ${email}`);
      }
    }

    // Save fixtures
    const fixturesPath = resolve(
      __dirname,
      '../../../packages/fixtures/clerk-users.json',
    );
    writeFileSync(fixturesPath, JSON.stringify(testUsers, null, 2));
    console.log(`\n📝 Saved fixtures to: ${fixturesPath}`);

    // Generate report
    const reportPath = resolve(__dirname, '../test-users-report.md');
    const report = generateReport(testUsers, foundUsers, missingUsers);
    writeFileSync(reportPath, report);
    console.log(`📊 Generated report: ${reportPath}`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Found: ${foundUsers.length} users`);
    console.log(`   Missing: ${missingUsers.length} users`);

    if (missingUsers.length > 0) {
      console.log('\n⚠️  Missing users need to be created in Clerk dashboard:');
      missingUsers.forEach((email) => console.log(`   - ${email}`));
    }
  } catch (error) {
    console.error('❌ Error syncing users:', error);
    process.exit(1);
  }
}

function generateReport(
  users: Record<string, UserFixture>,
  found: string[],
  missing: string[],
): string {
  const timestamp = new Date().toISOString();

  let report = `# Clerk Test Users Report\n\n`;
  report += `Generated: ${timestamp}\n\n`;

  report += `## Summary\n\n`;
  report += `- **Found**: ${found.length} users\n`;
  report += `- **Missing**: ${missing.length} users\n\n`;

  if (missing.length > 0) {
    report += `## Missing Users\n\n`;
    report += `The following test users need to be created in Clerk:\n\n`;
    missing.forEach((email) => {
      report += `- ${email}\n`;
    });
    report += `\n`;
  }

  report += `## User Details\n\n`;

  for (const [role, user] of Object.entries(users)) {
    report += `### ${role.toUpperCase()}\n\n`;
    report += `- **Email**: ${user.email}\n`;
    report += `- **ID**: ${user.id}\n`;
    report += `- **Name**: ${user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'Not set'}\n`;
    report += `- **Created**: ${new Date(user.createdAt).toLocaleDateString()}\n\n`;

    report += `**Public Metadata**:\n`;
    report += '```json\n';
    report += JSON.stringify(user.publicMetadata, null, 2);
    report += '\n```\n\n';

    report += `**Private Metadata**:\n`;
    report += '```json\n';
    report += JSON.stringify(user.privateMetadata, null, 2);
    report += '\n```\n\n';

    report += `**Expected Dashboard Route**:\n`;
    report += `- ${getDashboardRoute(role, user)}\n\n`;

    report += `---\n\n`;
  }

  return report;
}

function getDashboardRoute(role: string, user: UserFixture): string {
  const metadata = user.publicMetadata as any;

  if (role === 'superadmin' || metadata?.systemRole === 'superadmin') {
    return '/dashboard/admin';
  }

  if (metadata?.reviewGroups?.some((rg: any) => rg.role === 'admin')) {
    return '/dashboard/rg';
  }

  if (
    metadata?.teams?.some(
      (t: any) => t.role === 'admin' && t.namespaces?.length > 0,
    )
  ) {
    const team = metadata.teams.find((t: any) => t.role === 'admin');
    return `/dashboard/${team.namespaces[0]}`;
  }

  if (metadata?.teams?.some((t: any) => t.role === 'editor')) {
    return '/dashboard/editor';
  }

  if (metadata?.teams?.some((t: any) => t.role === 'author')) {
    return '/dashboard/author';
  }

  if (metadata?.translations?.length > 0) {
    return '/dashboard';
  }

  return '/dashboard/pending';
}

// Run the sync
syncTestUsers().catch(console.error);
