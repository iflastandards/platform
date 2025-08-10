#!/usr/bin/env tsx

import { getAllTestUsers, TEST_USER_EMAILS, TestUsers, verifyTestUserMetadata, clearTestUsersCache, TEST_USER_METADATA } from '../apps/admin/src/test-config/clerk-test-users';

async function main() {
  console.log('🔍 Debugging test users...\n');
  
  // Clear cache to get fresh data
  clearTestUsersCache();
  
  try {
    const users = await getAllTestUsers();
    
    console.log(`Found ${users.length} test users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });
    
    console.log('\nExpected test user emails:');
    Object.entries(TEST_USER_EMAILS).forEach(([key, email]) => {
      const found = users.find(u => u.email === email);
      console.log(`- ${key}: ${email} ${found ? '✅' : '❌'}`);
    });
    
    console.log('\n🔍 Testing namespace admin specifically:');
    const namespaceAdmin = await TestUsers.getNamespaceAdmin();
    console.log('Namespace admin:', namespaceAdmin ? 'Found' : 'Not found');
    if (namespaceAdmin) {
      console.log('Email:', namespaceAdmin.email);
      console.log('Actual roles:', JSON.stringify(namespaceAdmin.roles, null, 2));
      console.log('Expected roles:', JSON.stringify(TEST_USER_METADATA.NAMESPACE_ADMIN, null, 2));
      const isValid = verifyTestUserMetadata(namespaceAdmin, 'NAMESPACE_ADMIN');
      console.log('Metadata valid:', isValid);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
