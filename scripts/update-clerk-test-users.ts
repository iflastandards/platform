#!/usr/bin/env tsx

/**
 * Update Clerk Test Users Script
 * 
 * This script updates the Clerk test users with the correct metadata structure
 * that the system and test harness expects.
 * 
 * Usage:
 *   pnpm tsx scripts/update-clerk-test-users.ts
 * 
 * Prerequisites:
 *   - CLERK_SECRET_KEY environment variable must be set
 *   - Test users must already exist in Clerk with the expected email addresses
 */

import { clerkClient } from '@clerk/nextjs/server';
import { TEST_USER_EMAILS, TEST_USER_METADATA } from '../apps/admin/src/test-config/clerk-test-users';

interface UpdateResult {
  email: string;
  success: boolean;
  error?: string;
  updated?: boolean;
}

async function updateTestUser(email: string, expectedMetadata: any): Promise<UpdateResult> {
  try {
    const clerk = await clerkClient();
    
    // Find user by email
    const users = await clerk.users.getUserList({
      emailAddress: [email],
      limit: 1
    });
    
    if (users.data.length === 0) {
      return {
        email,
        success: false,
        error: `User not found: ${email}`
      };
    }
    
    const user = users.data[0];
    const currentMetadata = user.publicMetadata || {};
    
    // Check if metadata needs updating
    const currentMetadataStr = JSON.stringify(currentMetadata);
    const expectedMetadataStr = JSON.stringify(expectedMetadata);
    
    if (currentMetadataStr === expectedMetadataStr) {
      return {
        email,
        success: true,
        updated: false
      };
    }
    
    // Update user metadata
    await clerk.users.updateUser(user.id, {
      publicMetadata: expectedMetadata
    });
    
    console.log(`✅ Updated ${email}`);
    console.log(`   Previous: ${currentMetadataStr}`);
    console.log(`   New:      ${expectedMetadataStr}`);
    
    return {
      email,
      success: true,
      updated: true
    };
    
  } catch (error) {
    return {
      email,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function main() {
  console.log('🔄 Updating Clerk test users...\n');
  
  // Check if CLERK_SECRET_KEY is set
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY environment variable is not set');
    console.error('   Please set it in your .env.local file or environment');
    process.exit(1);
  }
  
  const results: UpdateResult[] = [];
  
  // Update each test user
  const updates = [
    { email: TEST_USER_EMAILS.SUPERADMIN, metadata: TEST_USER_METADATA.SUPERADMIN },
    { email: TEST_USER_EMAILS.RG_ADMIN, metadata: TEST_USER_METADATA.RG_ADMIN },
    { email: TEST_USER_EMAILS.NAMESPACE_ADMIN, metadata: TEST_USER_METADATA.NAMESPACE_ADMIN },
    { email: TEST_USER_EMAILS.EDITOR, metadata: TEST_USER_METADATA.EDITOR },
    { email: TEST_USER_EMAILS.AUTHOR, metadata: TEST_USER_METADATA.AUTHOR },
    { email: TEST_USER_EMAILS.TRANSLATOR, metadata: TEST_USER_METADATA.TRANSLATOR },
  ];
  
  for (const { email, metadata } of updates) {
    console.log(`Updating ${email}...`);
    const result = await updateTestUser(email, metadata);
    results.push(result);
    
    if (!result.success) {
      console.error(`❌ Failed to update ${email}: ${result.error}`);
    } else if (result.updated) {
      console.log(`✅ Updated ${email}`);
    } else {
      console.log(`ℹ️  ${email} already has correct metadata`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('===========');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const updated = results.filter(r => r.success && r.updated);
  const alreadyCorrect = results.filter(r => r.success && !r.updated);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`🔄 Updated: ${updated.length}`);
  console.log(`ℹ️  Already correct: ${alreadyCorrect.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed updates:');
    failed.forEach(result => {
      console.log(`   ${result.email}: ${result.error}`);
    });
  }
  
  if (updated.length > 0) {
    console.log('\n🔄 Updated users:');
    updated.forEach(result => {
      console.log(`   ${result.email}`);
    });
  }
  
  if (failed.length > 0) {
    process.exit(1);
  }
  
  console.log('\n🎉 All test users updated successfully!');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});