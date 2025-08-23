# Feature: {FEATURE_NAME}

## Overview
{Brief description of what this feature does and its business value}

## Quick Start

### Prerequisites
- Admin role with {permissions}
- Access to {resource} module

### Basic Usage
1. Navigate to **{Menu Path}**
2. Click **{Action Button}**
3. {Step 3}
4. {Step 4}

## User Guide

### Creating {Resource}
{Step-by-step instructions with screenshots}

![Create Form](./screenshots/create-form.png)

### Managing {Resources}
- **Filtering**: Use the search bar to filter by {fields}
- **Sorting**: Click column headers to sort
- **Bulk Actions**: Select multiple items for batch operations

### Common Workflows

#### Workflow 1: {Name}
1. {Step}
2. {Step}
3. {Step}

#### Workflow 2: {Name}
1. {Step}
2. {Step}

## Configuration

### Required Permissions
| Role | Permissions | Description |
|------|------------|-------------|
| Admin | All | Full access to all features |
| Editor | Create, Read, Update | Can manage {resources} |
| Viewer | Read | View-only access |

### Environment Variables
```env
NEXT_PUBLIC_FEATURE_{NAME}_ENABLED=true
NEXT_PUBLIC_FEATURE_{NAME}_LIMIT=100
```

### Settings
Access settings at **Settings > {Feature Name}**

- **Option 1**: {Description}
- **Option 2**: {Description}

## API Reference

### Endpoints

#### Create {Resource}
```http
POST /api/{resources}
Content-Type: application/json

{
  "field1": "value",
  "field2": "value"
}
```

**Response:**
```json
{
  "id": "uuid",
  "field1": "value",
  "field2": "value",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### List {Resources}
```http
GET /api/{resources}?page=1&limit=10&sort=createdAt
```

#### Update {Resource}
```http
PUT /api/{resources}/{id}
```

#### Delete {Resource}
```http
DELETE /api/{resources}/{id}
```

### Response Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

## Data Model

### Zod Schema
```typescript
const {Resource}Schema = z.object({
  id: z.string().uuid(),
  field1: z.string().min(1),
  field2: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### Database Schema
```sql
CREATE TABLE {resources} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field1 TEXT NOT NULL,
  field2 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

#### Issue: {Error Message}
**Cause**: {Explanation}
**Solution**: 
1. {Step}
2. {Step}

#### Issue: Upload fails
**Cause**: File size exceeds limit or wrong format
**Solution**: 
- Check file size (max 10MB)
- Ensure CSV format with UTF-8 encoding
- Verify column headers match template

#### Issue: No data appearing
**Cause**: Permissions or filter issue
**Solution**:
- Check user has appropriate role
- Clear filters
- Refresh the page

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('DEBUG_FEATURE_{NAME}', 'true');
```

## Related Features
- [{Related Feature 1}](../related-feature-1/README.md)
- [{Related Feature 2}](../related-feature-2/README.md)

## Changelog

### Version 1.0.0 (2024-XX-XX)
- Initial release
- Basic CRUD operations
- CSV import/export

## Support

For issues or questions:
1. Check this documentation
2. Search existing [GitHub Issues]
3. Contact the development team

## Developer Notes

### Extension Points
- Custom validators: `src/validators/{feature}.validator.ts`
- Custom adapters: `src/providers/adapters/{feature}.adapter.ts`
- MSW handlers: `src/mocks/handlers/{feature}.handlers.ts`

### Testing
```bash
# Run tests
pnpm nx test admin --testFile={feature}.test.ts

# E2E tests
pnpm playwright test {feature}.e2e.test.ts
```

### Contributing
1. Follow the Feature Factory workflow
2. Update documentation with changes
3. Add tests for new functionality
4. Submit PR with documentation

---

*Generated with Feature Factory v1.0*