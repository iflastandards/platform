#!/usr/bin/env node
/**
 * Script to set up Clerk organizations and roles for IFLA Standards Platform
 * 
 * This script creates:
 * - 4 Review Group organizations
 * - Custom roles for each organization
 * - Initial metadata structure
 * 
 * Run with: pnpm tsx scripts/setup-clerk-organizations.ts
 */

import { clerkClient } from "@clerk/nextjs/server";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Review Groups configuration
const REVIEW_GROUPS = [
  {
    name: "International Cataloguing Principles",
    slug: "icp",
    description: "ICP Review Group managing cataloguing principles",
    publicMetadata: {
      type: "review_group",
      abbreviation: "ICP",
      namespaces: ["icp", "muldicat"],
      establishedYear: 1961
    }
  },
  {
    name: "Bibliographic Conceptual Models",
    slug: "bcm",
    description: "BCM Review Group for conceptual models",
    publicMetadata: {
      type: "review_group",
      abbreviation: "BCM",
      namespaces: ["frbr", "lrm", "frad"],
      establishedYear: 1998
    }
  },
  {
    name: "International Standard Bibliographic Description",
    slug: "isbd",
    description: "ISBD Review Group for bibliographic standards",
    publicMetadata: {
      type: "review_group",
      abbreviation: "ISBD",
      namespaces: ["isbd", "isbdm"],
      establishedYear: 1971
    }
  },
  {
    name: "Permanent UNIMARC Committee",
    slug: "puc",
    description: "PUC managing UNIMARC formats",
    publicMetadata: {
      type: "review_group",
      abbreviation: "PUC",
      namespaces: ["unimarc", "mri"],
      establishedYear: 1991
    }
  }
];

// Role definitions
const ORGANIZATION_ROLES = [
  {
    name: "Review Group Administrator",
    key: "rg_admin",
    description: "Full administrative control over the review group",
    permissions: [
      "org:manage",
      "org:member:manage",
      "namespace:create",
      "namespace:delete",
      "namespace:publish",
      "project:create",
      "project:archive"
    ]
  },
  {
    name: "Namespace Administrator",
    key: "ns_admin",
    description: "Administrative control over specific namespaces",
    permissions: [
      "namespace:manage",
      "content:publish",
      "vocabulary:manage",
      "team:manage",
      "settings:namespace"
    ]
  },
  {
    name: "Namespace Editor",
    key: "ns_editor",
    description: "Create and edit content within namespaces",
    permissions: [
      "content:create",
      "content:update",
      "content:delete",
      "vocabulary:create",
      "vocabulary:update",
      "vocabulary:delete",
      "import:execute"
    ]
  },
  {
    name: "Namespace Translator",
    key: "ns_translator",
    description: "Translate content to other languages",
    permissions: [
      "content:read",
      "content:translate",
      "translation:submit",
      "comment:create"
    ]
  },
  {
    name: "Namespace Reviewer",
    key: "ns_reviewer",
    description: "Review and comment on content",
    permissions: [
      "content:read",
      "content:review",
      "comment:create",
      "issue:create"
    ]
  },
  {
    name: "Project Lead",
    key: "project_lead",
    description: "Lead specific projects with full control",
    permissions: [
      "project:manage",
      "project:member:manage",
      "content:manage",
      "milestone:manage"
    ]
  },
  {
    name: "Project Manager",
    key: "project_manager",
    description: "Coordinate project activities",
    permissions: [
      "project:coordinate",
      "task:manage",
      "member:invite",
      "report:generate"
    ]
  },
  {
    name: "Project Member",
    key: "project_member",
    description: "Contribute to project activities",
    permissions: [
      "project:view",
      "content:contribute",
      "task:update",
      "comment:create"
    ]
  }
];

/**
 * Create or update an organization
 */
async function createOrUpdateOrganization(orgConfig: typeof REVIEW_GROUPS[0]) {
  const clerk = await clerkClient();
  
  try {
    // Try to create the organization
    const org = await clerk.organizations.createOrganization({
      name: orgConfig.name,
      slug: orgConfig.slug,
      publicMetadata: orgConfig.publicMetadata,
      maxAllowedMemberships: 1000
    });
    
    console.log(`✅ Created organization: ${org.name} (${org.id})`);
    return org;
  } catch (error) {
    if ((error as any)?.errors?.[0]?.code === 'form_identifier_exists') {
      // Organization already exists, try to find and update it
      console.log(`ℹ️  Organization ${orgConfig.name} already exists, updating metadata...`);
      
      // List all organizations to find the existing one
      const orgs = await clerk.organizations.getOrganizationList({
        limit: 100
      });
      
      const existingOrg = orgs.data.find((org: any) => org.slug === orgConfig.slug);
      if (existingOrg) {
        // Update the organization metadata
        const updatedOrg = await clerk.organizations.updateOrganizationMetadata(existingOrg.id, {
          publicMetadata: orgConfig.publicMetadata
        });
        console.log(`✅ Updated organization: ${updatedOrg.name} (${updatedOrg.id})`);
        return updatedOrg;
      }
    }
    
    throw error;
  }
}

/**
 * Set up roles for an organization
 */
async function setupOrganizationRoles(orgId: string) {
  console.log(`\n📋 Setting up roles for organization ${orgId}...`);
  
  for (const role of ORGANIZATION_ROLES) {
    try {
      // Note: Clerk's API for custom roles might be limited
      // This is a placeholder for when custom roles are fully supported
      console.log(`  ℹ️  Role: ${role.name} (${role.key})`);
      console.log(`     Permissions: ${role.permissions.join(', ')}`);
      
      // TODO: When Clerk supports custom roles via API, implement here
      // await clerkClient.organizations.createRole(orgId, role);
    } catch (error) {
      console.error(`  ❌ Error creating role ${role.name}:`, error);
    }
  }
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 Setting up Clerk organizations for IFLA Standards Platform\n');
  
  // Check if Clerk environment variables are set
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY environment variable is not set');
    console.error('   Please add it to your .env.local file');
    process.exit(1);
  }
  
  console.log('📊 Creating Review Group organizations...\n');
  
  const createdOrgs = [];
  
  for (const rgConfig of REVIEW_GROUPS) {
    try {
      const org = await createOrUpdateOrganization(rgConfig);
      createdOrgs.push(org);
      
      // Set up roles for the organization
      await setupOrganizationRoles(org.id);
      
    } catch (error) {
      console.error(`❌ Error creating organization ${rgConfig.name}:`, error);
    }
  }
  
  console.log('\n✨ Setup complete!');
  console.log(`   Created/Updated ${createdOrgs.length} organizations`);
  
  // Display organization IDs for reference
  console.log('\n📋 Organization IDs for reference:');
  createdOrgs.forEach(org => {
    console.log(`   ${org.name}: ${org.id}`);
  });
  
  console.log('\n💡 Next steps:');
  console.log('   1. Configure custom roles in Clerk Dashboard (if not using API)');
  console.log('   2. Assign users to organizations');
  console.log('   3. Update user metadata with proper role structure');
  console.log('   4. Test authorization in the application');
}

// Run the setup
main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});