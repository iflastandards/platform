# IFLA Standards Platform Permission Matrix Reference

**Version:** 1.0  
**Date:** January 2025  
**Status:** Complete Reference  
**Purpose:** Quick reference for all role-based permissions

## Quick Reference Summary

### Clerk Organizations Architecture
```
System Level:
├── Superadmin (1-2 users) - Global Clerk admin

Clerk Organization Level (Review Groups):
├── ICP Organization (org_icp)
│   ├── Organization Admin (1-3 users) - Clerk org admin role
│   └── Organization Members (10-30 users) - Clerk basic_member role
├── BCM Organization (org_bcm)
├── ISBD Organization (org_isbd)
└── PUC Organization (org_puc)

Custom Permission Level:
├── namespace:admin:{namespace} (16-32 users)
├── namespace:editor:{namespace} (48-160 users)
├── namespace:reviewer:{namespace} (32-80 users)
├── namespace:translator:{namespace}:{lang} (100-400 users)
├── project:lead:{projectId} (10-20 users)
├── project:editor:{projectId} (40-160 users)
├── project:reviewer:{projectId} (15-60 users)
└── project:translator:{projectId}:{lang} (50-200 users)
```

### Permission Implementation
- **Clerk Organization Roles**: `admin` (RG Admin) | `basic_member` (RG Member)
- **Custom Permissions**: Granular permissions stored in user metadata
- **Permission Format**: `{resource}:{action}:{scope}` (e.g., `namespace:editor:isbd`)

### Permission Scope Summary (Clerk Organizations)

| Role/Permission | Global | Organization | Namespace | Project | Translation |
|-----------------|--------|--------------|-----------|---------|-------------|
| **Superadmin** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| **Org Admin** (Clerk role) | ❌ | ✅ Own Org | ✅ Org Namespaces | ✅ Org Projects | ✅ Org Languages |
| **Org Member** (Clerk role) | ❌ | ✅ Read Own | ✅ Read Org NS | ✅ Assigned | ❌ |
| **namespace:admin:{ns}** | ❌ | ❌ | ✅ Specific NS | ❌ | ✅ NS Languages |
| **namespace:editor:{ns}** | ❌ | ❌ | ✅ Edit Specific NS | ❌ | ❌ |
| **namespace:reviewer:{ns}** | ❌ | ❌ | ✅ Review Specific NS | ❌ | ❌ |
| **namespace:translator:{ns}:{lang}** | ❌ | ❌ | ✅ Translate Specific NS | ❌ | ✅ Specific Lang |
| **project:lead:{id}** | ❌ | ❌ | ✅ Project NS | ✅ Specific Project | ❌ |
| **project:editor:{id}** | ❌ | ❌ | ✅ Project NS | ✅ Edit Specific Project | ❌ |
| **project:reviewer:{id}** | ❌ | ❌ | ✅ Review Project NS | ✅ Review Specific Project | ❌ |
| **project:translator:{id}:{lang}** | ❌ | ❌ | ✅ Translate Project NS | ✅ Specific Project | ✅ Project Lang |

## Comprehensive Permission Matrix

### System Administration

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Platform Configuration** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Monitoring** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Global Backup/Restore** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Emergency Override** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System User Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Review Group Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Review Group** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Delete Review Group** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Update RG Settings** | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage RG Members** | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View RG Information** | ✅ | ✅ (own) | ✅ (in RG) | ✅ (in RG) | ✅ (in RG) | ✅ (in RG) | ✅ (in RG) | ✅ (in RG) | ✅ (in RG) | ✅ (in RG) |
| **Invite to RG** | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Namespace Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Namespace** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Delete Namespace** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configure Namespace** | ✅ | ✅ (in RG) | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage NS Team** | ✅ | ✅ (in RG) | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View NS Information** | ✅ | ✅ (in RG) | ✅ (own) | ✅ (assigned) | ✅ (assigned) | ✅ (assigned) | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) |
| **NS Backup/Restore** | ✅ | ✅ (in RG) | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Project Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Project** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Delete Project** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Project Charter** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ❌ |
| **Assign Teams to Project** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ❌ |
| **Assign NS to Project** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Project Board** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ❌ |
| **View Project** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (assigned) | ✅ (assigned) | ✅ (assigned) | ✅ (assigned) |
| **Project Analytics** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ✅ (assigned) | ✅ (assigned) | ✅ (assigned) |

### Team Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Team** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Delete Team** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Add Team Members** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (proj teams) | ❌ | ❌ | ❌ |
| **Remove Team Members** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (proj teams) | ❌ | ❌ | ❌ |
| **Update Member Roles** | ✅ | ✅ (in RG) | ❌ | ❌ | ❌ | ❌ | ✅ (proj teams) | ❌ | ❌ | ❌ |
| **View Team Members** | ✅ | ✅ (in RG) | ✅ (own teams) | ✅ (own teams) | ✅ (own teams) | ✅ (own teams) | ✅ (proj teams) | ✅ (own teams) | ✅ (own teams) | ✅ (own teams) |

### Content Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Pages** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (translations) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj trans) |
| **Edit Pages** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (translations) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj trans) |
| **Delete Pages** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Manage Media** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (own uploads) | ❌ | ✅ (proj NS) | ❌ | ✅ (own uploads) |
| **Content Templates** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Content Validation** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ❌ | ✅ (proj NS) | ✅ (proj NS) | ❌ |

### Vocabulary Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Element Sets** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Edit Element Sets** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Delete Element Sets** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Create Concept Schemes** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Edit Concept Schemes** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (translations) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj trans) |
| **Delete Concept Schemes** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Manage DCTAP Profiles** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Generate RDF** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) |

### Import/Export Operations

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Spreadsheet Import** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (translations) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj trans) |
| **Spreadsheet Export** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) |
| **Bulk Operations** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **External Integration** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Data Backup** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Data Restore** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Translation Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Configure Languages** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Assign Translators** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Manage Translation Workflows** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (assigned lang) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj lang) |
| **Edit Translations** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (assigned lang) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj lang) |
| **Approve Translations** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Translation Tools** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ✅ (assigned lang) | ❌ | ✅ (proj NS) | ❌ | ✅ (proj lang) |

### Publishing & Deployment

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Releases** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ❌ | ❌ | ❌ | ✅ (proj NS) | ❌ | ❌ |
| **Publish Releases** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configure Deployment** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Previews** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) |
| **Production Deployment** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Rollback Operations** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Analytics & Monitoring

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **View Usage Analytics** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) |
| **Performance Monitoring** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ❌ | ✅ (proj NS) | ✅ (proj NS) | ❌ |
| **Content Analytics** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ✅ (proj NS) | ✅ (proj NS) | ✅ (proj NS) |
| **SEO Analytics** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ❌ | ✅ (proj NS) | ✅ (proj NS) | ❌ |
| **System Monitoring** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Issue & Pull Request Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Issues** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (proj) | ✅ (proj) | ✅ (proj) | ✅ (proj) |
| **Edit Issues** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (proj) | ✅ (own) | ✅ (own) | ✅ (own) |
| **Delete Issues** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (proj) | ✅ (own) | ✅ (own) | ✅ (own) |
| **Assign Issues** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ✅ (proj) | ❌ | ❌ | ❌ |
| **Create Pull Requests** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (proj) | ✅ (proj) | ✅ (proj) | ✅ (proj) |
| **Review Pull Requests** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ❌ | ✅ (proj) | ✅ (proj) | ✅ (proj) | ❌ |
| **Merge Pull Requests** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ✅ (proj) | ❌ | ❌ | ❌ |

### Discussion Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Create Discussions** | ✅ | ✅ (in RG) | ✅ (own NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (assigned NS) | ✅ (proj) | ✅ (proj) | ✅ (proj) | ✅ (proj) |
| **Moderate Discussions** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ✅ (proj) | ❌ | ❌ | ❌ |
| **Pin Discussions** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ✅ (proj) | ❌ | ❌ | ❌ |
| **Lock Discussions** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ✅ (proj) | ❌ | ❌ | ❌ |
| **Manage Categories** | ✅ | ✅ (in RG) | ✅ (own NS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### User Management

| Permission | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|------------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| **Invite Users** | ✅ | ✅ (to RG) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage User Roles** | ✅ | ✅ (RG scope) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View User Profiles** | ✅ | ✅ (RG members) | ✅ (NS team) | ✅ (NS team) | ✅ (NS team) | ✅ (NS team) | ✅ (proj team) | ✅ (proj team) | ✅ (proj team) | ✅ (proj team) |
| **Update Own Profile** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Delete Users** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Impersonate Users** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Site Management Component Permissions

### Tab 1: Site Configuration

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Basic Site Info** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |
| **Technical Config** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |
| **Navigation** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |
| **Theme** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |

### Tab 2: Content Management

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Page Management** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ✅ (translations) |
| **Media Library** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ✅ (own uploads) |
| **Templates** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |
| **Validation** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ❌ |

### Tab 3: Vocabulary Management

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Element Sets** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |
| **Concept Schemes** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ✅ (translations) |
| **DCTAP Profiles** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |
| **RDF Generation** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) |

### Tab 4: Import/Export

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Spreadsheet Integration** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ✅ (translations) |
| **Bulk Operations** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |
| **External Integration** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |
| **Backup/Restore** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |

### Tab 5: Translation Management

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Language Config** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |
| **Translation Workflows** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ✅ (assigned lang) |
| **Translation Tools** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ✅ (assigned lang) |
| **Multilingual Publishing** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |

### Tab 6: Publishing & Deployment

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Release Management** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ❌ | ❌ |
| **Deployment Config** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |
| **Preview/Testing** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) |
| **Go-Live Operations** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |

### Tab 7: Analytics & Monitoring

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Usage Analytics** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) |
| **Performance Monitoring** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ❌ |
| **Content Analytics** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) |
| **SEO/Accessibility** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ❌ |

### Tab 8: Team & Collaboration

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|
| **Team Management** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |
| **Collaboration Tools** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) |
| **Project Integration** | ✅ | ✅ (own RG) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) | ✅ (own NS) |
| **External Collaboration** | ✅ | ✅ (own RG) | ✅ (own NS) | ❌ | ❌ | ❌ |

## API Endpoint Permissions

### Authentication & Authorization (5 endpoints)

| Endpoint | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| `POST /api/admin/auth/signin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/admin/auth/session` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/admin/auth/signout` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/admin/users/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/admin/users/me/permissions` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### User Management (8 endpoints)

| Endpoint | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| `GET /api/admin/users` | ✅ | ✅ (RG scope) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/admin/users/:userId` | ✅ | ✅ (RG scope) | ✅ (team) | ✅ (team) | ✅ (team) | ✅ (team) | ✅ (proj team) | ✅ (proj team) | ✅ (proj team) | ✅ (proj team) |
| `PUT /api/admin/users/:userId` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /api/admin/users/:userId` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `PUT /api/admin/users/:userId/roles` | ✅ | ✅ (RG scope) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /api/admin/users/:userId/teams` | ✅ | ✅ (RG scope) | ❌ | ❌ | ❌ | ❌ | ✅ (proj teams) | ❌ | ❌ | ❌ |
| `DELETE /api/admin/users/:userId/teams/:teamId` | ✅ | ✅ (RG scope) | ❌ | ❌ | ❌ | ❌ | ✅ (proj teams) | ❌ | ❌ | ❌ |

### Review Group Management (12 endpoints)

| Endpoint | Superadmin | RG Admin | NS Admin | NS Editor | NS Reviewer | NS Translator | Project Lead | Project Editor | Project Reviewer | Project Translator |
|----------|------------|----------|----------|-----------|-------------|---------------|--------------|----------------|------------------|--------------------|
| `GET /api/admin/review-groups` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/admin/review-groups` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/admin/review-groups/:rgId` | ✅ | ✅ (own) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) |
| `PUT /api/admin/review-groups/:rgId` | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /api/admin/review-groups/:rgId` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/admin/review-groups/:rgId/members` | ✅ | ✅ (own) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) |
| `POST /api/admin/review-groups/:rgId/members` | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /api/admin/review-groups/:rgId/members/:userId` | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/admin/review-groups/:rgId/namespaces` | ✅ | ✅ (own) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) |
| `POST /api/admin/review-groups/:rgId/namespaces` | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/admin/review-groups/:rgId/teams` | ✅ | ✅ (own) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) | ✅ (member) |
| `POST /api/admin/review-groups/:rgId/teams` | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Permission Scope Definitions

### Scope Abbreviations Used in Matrix

- **✅**: Full permission granted
- **❌**: Permission denied
- **own**: User's own resources
- **own RG**: Resources within user's review group (for RG Admins)
- **own NS**: Resources within user's assigned namespace
- **assigned**: Resources user is specifically assigned to
- **assigned NS**: Namespaces user is assigned to work on
- **assigned lang**: Languages user is assigned to translate
- **in RG**: Resources within the user's review group
- **member**: Resources accessible to review group members
- **team**: Resources accessible to team members
- **proj**: Resources within assigned projects
- **proj NS**: Namespaces assigned to user's projects
- **proj teams**: Teams within user's projects
- **proj trans**: Translation work within user's projects
- **proj lang**: Languages within user's project scope
- **public**: Publicly accessible resources
- **translations**: Translation-specific content only
- **own uploads**: Media files uploaded by the user

### Permission Inheritance Rules

1. **Superadmin** inherits all permissions globally
2. **RG Admin** inherits all permissions within review group scope
3. **NS Admin** inherits all permissions within namespace scope
4. **Project Lead** inherits all permissions within project scope
5. **Higher roles** include permissions of lower roles within their scope
6. **Cross-scope permissions** require explicit grants

### Resource Boundary Enforcement

1. **Review Group Boundaries**: Users cannot access resources outside their review groups unless explicitly granted
2. **Namespace Boundaries**: Users cannot access namespaces they're not assigned to
3. **Project Boundaries**: Project-based permissions are limited to assigned projects
4. **Language Boundaries**: Translation permissions are limited to assigned languages
5. **Temporal Boundaries**: Some permissions may be time-limited (not currently implemented)

## Quick Permission Lookup

### "Can I...?" Quick Reference

#### Create Content
- **Create namespaces**: Superadmin, RG Admin (in RG)
- **Create projects**: Superadmin, RG Admin (in RG)
- **Create pages**: Superadmin, RG Admin (in RG), NS Admin (own), NS Editor (assigned), Project Editor (proj NS)
- **Create vocabularies**: Superadmin, RG Admin (in RG), NS Admin (own), NS Editor (assigned), Project Editor (proj NS)

#### Manage Teams
- **Invite users**: Superadmin, RG Admin (to RG)
- **Assign roles**: Superadmin, RG Admin (RG scope)
- **Manage teams**: Superadmin, RG Admin (in RG), Project Lead (proj teams)

#### Publish Content
- **Publish releases**: Superadmin, RG Admin (in RG), NS Admin (own)
- **Deploy to production**: Superadmin, RG Admin (in RG), NS Admin (own)

#### Translate Content
- **Edit translations**: Superadmin, RG Admin (in RG), NS Admin (own), NS Editor (assigned), NS Translator (assigned lang), Project Translator (proj lang)
- **Approve translations**: Superadmin, RG Admin (in RG), NS Admin (own), NS Editor (assigned), Project Editor (proj NS)

#### Access Analytics
- **View usage data**: All roles (within their scope)
- **View performance data**: All roles except NS Translator and Project Translator (within their scope)

This permission matrix serves as the authoritative reference for all role-based access control decisions in the IFLA Standards Platform.