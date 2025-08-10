#!/usr/bin/env tsx

import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function checkNamespaceAdmin() {
  console.log('🔍 Checking for namespace admin user...\n');
  
  try {
    const users = await clerkClient.users.getUserList({ 
      emailAddress: ['ns_admin+clerk_test@example.com'] 
    });
    
    console.log(`Found ${users.data.length} user(s) with email ns_admin+clerk_test@example.com`);
    
    if (users.data.length > 0) {
      const user = users.data[0];
      console.log('\n📋 User Details:');
      console.log('ID:', user.id);
      console.log('Email:', user.emailAddresses[0]?.emailAddress);
      console.log('First Name:', user.firstName);
      console.log('Last Name:', user.lastName);
      console.log('\n📦 Public Metadata:');
      console.log(JSON.stringify(user.publicMetadata, null, 2));
    } else {
      console.log('\n❌ User not found!');
      console.log('\nSearching for all test users...');
      
      const allTestUsers = await clerkClient.users.getUserList({
        emailAddress: [
          'superadmin+clerk_test@example.com',
          'rg_admin+clerk_test@example.com',
          'ns_admin+clerk_test@example.com',
          'editor+clerk_test@example.com',
          'author+clerk_test@example.com',
          'translator+clerk_test@example.com'
        ]
      });
      
      console.log(`\nFound ${allTestUsers.data.length} test users:`);
      allTestUsers.data.forEach(u => {
        console.log(`- ${u.emailAddresses[0]?.emailAddress}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNamespaceAdmin();