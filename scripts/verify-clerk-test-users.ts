#!/usr/bin/env tsx

/**
 * Verify Clerk Test Users Script
 * 
 * This script verifies that the Clerk test users have the correct metadata structure
 * that the system and test harness expects.
 * 
 * Usage:
 *   pnpm tsx scripts/verify-clerk-test-users.ts
 * 
 * Prerequisites:
 *   - CLERK_SECRET_KEY environment variable must be set
 */

import { clerkClient } from '@clerk/nextjs/server';
import { TEST_USER_EMAILS, TEST_USER_METADATA } from '../apps/admin/src/test-config/clerk-test-users';

/**
 * Deep equality comparison for objects
 */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

interface VerificationResult {
  email: string;
  exists: boolean;
  metadataCorrect: boolean;
  currentMetadata?: any;
  expectedMetadata?: any;
  error?: string;
}

async function verifyTestUser(email: string, expectedMetadata: any): Promise<VerificationResult> {
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
        exists: false,
        metadataCorrect: false,
        expectedMetadata,
        error: 'User not found'
      };
    }
    
    const user = users.data[0];
    const currentMetadata = user.publicMetadata || {};
    
    // Compare metadata using deep comparison
    const metadataCorrect = deepEqual(currentMetadata, expectedMetadata);
    
    return {
      email,
      exists: true,
      metadataCorrect,
      currentMetadata,
      expectedMetadata
    };
    
  } catch (error) {
    return {
      email,
      exists: false,
      metadataCorrect: false,
      expectedMetadata,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function printMetadataDiff(current: any, expected: any) {
  console.log('   Current metadata:');
  console.log('   ' + JSON.stringify(current, null, 2).split('\n').join('\n   '));
  console.log('   Expected metadata:');
  console.log('   ' + JSON.stringify(expected, null, 2).split('\n').join('\n   '));
}

async function main() {
  console.log('🔍 Verifying Clerk test users...\n');
  
  // Check if CLERK_SECRET_KEY is set
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY environment variable is not set');
    console.error('   Please set it in your .env.local file or environment');
    process.exit(1);
  }
  
  const results: VerificationResult[] = [];
  
  // Verify each test user
  const verifications = [
    { email: TEST_USER_EMAILS.SUPERADMIN, metadata: TEST_USER_METADATA.SUPERADMIN, role: 'Superadmin' },
    { email: TEST_USER_EMAILS.RG_ADMIN, metadata: TEST_USER_METADATA.RG_ADMIN, role: 'Review Group Admin' },
    { email: TEST_USER_EMAILS.NAMESPACE_ADMIN, metadata: TEST_USER_METADATA.NAMESPACE_ADMIN, role: 'Namespace Admin' },
    { email: TEST_USER_EMAILS.EDITOR, metadata: TEST_USER_METADATA.EDITOR, role: 'Editor' },
    { email: TEST_USER_EMAILS.AUTHOR, metadata: TEST_USER_METADATA.AUTHOR, role: 'Author' },
    { email: TEST_USER_EMAILS.TRANSLATOR, metadata: TEST_USER_METADATA.TRANSLATOR, role: 'Translator' },
  ];
  
  for (const { email, metadata, role } of verifications) {
    console.log(`Verifying ${role} (${email})...`);
    const result = await verifyTestUser(email, metadata);
    results.push(result);
    
    if (!result.exists) {
      console.error(`❌ User does not exist: ${result.error}`);
    } else if (!result.metadataCorrect) {
      console.error(`❌ Metadata incorrect`);
      printMetadataDiff(result.currentMetadata, result.expectedMetadata);
    } else {
      console.log(`✅ Correct`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('===========');
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  const correct = results.filter(r => r.exists && r.metadataCorrect);
  const incorrect = results.filter(r => r.exists && !r.metadataCorrect);
  
  console.log(`👥 Total users: ${results.length}`);
  console.log(`✅ Existing: ${existing.length}`);
  console.log(`❌ Missing: ${missing.length}`);
  console.log(`✅ Correct metadata: ${correct.length}`);
  console.log(`❌ Incorrect metadata: ${incorrect.length}`);
  
  if (missing.length > 0) {
    console.log('\n❌ Missing users:');
    missing.forEach(result => {
      console.log(`   ${result.email}: ${result.error}`);
    });
  }
  
  if (incorrect.length > 0) {
    console.log('\n❌ Users with incorrect metadata:');
    incorrect.forEach(result => {
      console.log(`   ${result.email}`);
    });
  }
  
  // Overall status
  const allCorrect = existing.length === results.length && correct.length === existing.length;
  
  if (allCorrect) {
    console.log('\n🎉 All test users exist and have correct metadata!');
  } else {
    console.log('\n⚠️  Some test users need attention.');
    console.log('   Run: pnpm tsx scripts/update-clerk-test-users.ts');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
