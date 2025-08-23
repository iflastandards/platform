#!/usr/bin/env tsx

import {
  TEST_USER_EMAILS,
  TestUsers,
  clearTestUsersCache,
  TEST_USER_METADATA,
  getAllTestUsers,
} from '@ifla/fixtures';

async function main() {
  console.log('🔍 Debugging test users...\n');

  // Clear cache to get fresh data
  clearTestUsersCache();

  try {
    const users = await getAllTestUsers();

    console.log(`Found ${users.length} test users:`);
    users.forEach((user) => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });

    console.log('\nExpected test user emails:');
    Object.entries(TEST_USER_EMAILS).forEach(([key, email]) => {
      const found = users.find((u) => u.email === email);
      console.log(`- ${key}: ${email} ${found ? '✅' : '❌'}`);
    });

    console.log('\n🔍 Testing namespace admin specifically:');
    const namespaceAdmin = await TestUsers.getNamespaceAdmin();
    console.log('Namespace admin:', namespaceAdmin ? 'Found' : 'Not found');
    if (namespaceAdmin) {
      console.log('Email:', namespaceAdmin.email);
      console.log(
        'Actual roles:',
        JSON.stringify(namespaceAdmin.roles, null, 2),
      );
      console.log(
        'Expected roles:',
        JSON.stringify(TEST_USER_METADATA.NAMESPACE_ADMIN, null, 2),
      );
      // Note: verifyTestUserMetadata expects ClerkTestUser, not TestUserInfo
      // Would need to get the raw ClerkTestUser to verify metadata
      console.log('Metadata validation: skipped (type mismatch)');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
