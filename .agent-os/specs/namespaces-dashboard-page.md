# Namespaces Dashboard Page Specification

## Overview
Create a comprehensive namespaces overview page for the admin dashboard that dynamically displays cards for each standard in the `standards/` directory. Each card will provide key information about the namespace and a direct link to its specific dashboard.

## User Story
As an administrator or review group member, I want to see an overview of all available namespaces/standards in the platform, so that I can quickly navigate to the dashboard of any specific standard and understand its current status at a glance.

## Technical Architecture

### Component Structure
```
apps/admin/src/
├── app/(authenticated)/namespaces/
│   ├── page.tsx                    # Main page component
│   └── layout.tsx                  # Optional layout wrapper
├── components/namespaces/
│   ├── NamespacesGrid.tsx         # Grid container for cards
│   ├── NamespaceCard.tsx          # Individual namespace card
│   └── NamespaceCardSkeleton.tsx  # Loading skeleton
└── lib/namespaces/
    ├── parser.ts                   # Standards directory parser
    └── types.ts                    # TypeScript interfaces
```

### Data Flow
1. **Server-side parsing** of `standards/` directory at build/request time
2. **File system reading** of each standard's configuration files
3. **Data extraction** from docusaurus.config.ts and docs/index.mdx
4. **Card generation** with extracted metadata
5. **Client-side navigation** to individual dashboards

## Detailed Requirements

### Functional Requirements

#### FR1: Standards Directory Scanning
- **FR1.1**: Scan the `standards/` directory to identify all valid Docusaurus sites
- **FR1.2**: Filter out non-standard directories (e.g., `test-integration`, hidden folders)
- **FR1.3**: Handle missing or malformed sites gracefully

#### FR2: Metadata Extraction
- **FR2.1**: Parse `docusaurus.config.ts` for:
  - Site title
  - Tagline/description
  - URL configuration
  - Custom fields (if any)
- **FR2.2**: Read `docs/index.mdx` frontmatter for:
  - Namespace title
  - Description
  - Additional metadata
- **FR2.3**: Fall back to directory name if metadata unavailable

#### FR3: Card Display
- **FR3.1**: Display Material-UI cards in a responsive grid layout
- **FR3.2**: Each card must show:
  - Namespace title (from config or frontmatter)
  - Description/tagline
  - Directory name (as identifier)
  - Status indicator (if available)
  - Last updated date (from git or file system)
- **FR3.3**: Cards should be visually consistent with existing admin UI

#### FR4: Navigation
- **FR4.1**: Each card links to `/dashboard/[siteKey]`
- **FR4.2**: Links open in the same tab by default
- **FR4.3**: Support keyboard navigation (Tab, Enter)
- **FR4.4**: Include breadcrumb navigation

#### FR5: Access Control
- **FR5.1**: Page requires authentication
- **FR5.2**: Display cards based on user permissions
- **FR5.3**: Show all namespaces for superadmins
- **FR5.4**: Filter namespaces for role-specific access

### Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Page load time < 2 seconds
- **NFR1.2**: Use React Suspense for progressive loading
- **NFR1.3**: Cache parsed data for 5 minutes
- **NFR1.4**: Implement skeleton loaders during data fetch

#### NFR2: Accessibility (WCAG 2.1 AA)
- **NFR2.1**: Full keyboard navigation support
- **NFR2.2**: ARIA labels for all interactive elements
- **NFR2.3**: Color contrast ratio ≥ 4.5:1
- **NFR2.4**: Screen reader compatible
- **NFR2.5**: Focus indicators on all cards

#### NFR3: Responsive Design
- **NFR3.1**: Mobile-first responsive grid
- **NFR3.2**: 1 column on mobile (< 600px)
- **NFR3.3**: 2 columns on tablet (600-960px)
- **NFR3.4**: 3-4 columns on desktop (> 960px)

#### NFR4: Error Handling
- **NFR4.1**: Graceful degradation for parsing errors
- **NFR4.2**: User-friendly error messages
- **NFR4.3**: Fallback to basic list view if grid fails
- **NFR4.4**: Log errors to monitoring service

## Implementation Details

### Data Structure
```typescript
interface NamespaceMetadata {
  key: string;              // Directory name (e.g., 'ISBDM')
  title: string;            // From config or frontmatter
  description: string;      // Tagline or description
  url: string;              // Production URL
  baseUrl: string;          // Base path
  lastUpdated?: Date;       // From git or file system
  status?: 'active' | 'draft' | 'archived';
  elementCount?: number;    // Optional statistics
  vocabularyCount?: number; // Optional statistics
}

interface NamespacesPageData {
  namespaces: NamespaceMetadata[];
  totalCount: number;
  lastFetched: Date;
}
```

### API Endpoints

#### GET /api/namespaces
```typescript
// apps/admin/src/app/api/namespaces/route.ts
export async function GET(request: NextRequest) {
  // 1. Check user authentication
  // 2. Parse standards directory
  // 3. Filter based on user permissions
  // 4. Return namespace metadata
  return NextResponse.json({
    namespaces: [...],
    totalCount: 8,
    lastFetched: new Date()
  });
}
```

### Component Implementation

#### NamespaceCard Component
```typescript
interface NamespaceCardProps {
  namespace: NamespaceMetadata;
  onClick?: () => void;
}

export function NamespaceCard({ namespace, onClick }: NamespaceCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardActionArea 
        component={Link}
        href={`/dashboard/${namespace.key.toLowerCase()}`}
        onClick={onClick}
      >
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {namespace.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {namespace.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={namespace.key} 
              size="small" 
              variant="outlined"
            />
            {namespace.status && (
              <Chip 
                label={namespace.status}
                size="small"
                color={namespace.status === 'active' ? 'success' : 'default'}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
```

#### Directory Parser
```typescript
// lib/namespaces/parser.ts
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export async function parseStandardsDirectory(): Promise<NamespaceMetadata[]> {
  const standardsPath = path.join(process.cwd(), 'standards');
  const directories = await fs.readdir(standardsPath);
  
  const namespaces = await Promise.all(
    directories
      .filter(dir => !dir.startsWith('.') && dir !== 'test-integration')
      .map(async (dir) => {
        try {
          // Parse docusaurus.config.ts
          const configPath = path.join(standardsPath, dir, 'docusaurus.config.ts');
          const config = await parseDocusaurusConfig(configPath);
          
          // Parse index.mdx frontmatter
          const indexPath = path.join(standardsPath, dir, 'docs', 'index.mdx');
          const frontmatter = await parseIndexFrontmatter(indexPath);
          
          return {
            key: dir,
            title: config?.title || frontmatter?.title || dir,
            description: config?.tagline || frontmatter?.description || '',
            url: config?.url || '',
            baseUrl: config?.baseUrl || `/${dir.toLowerCase()}`,
            lastUpdated: await getLastModified(path.join(standardsPath, dir)),
            status: determineStatus(dir, config, frontmatter)
          };
        } catch (error) {
          console.error(`Error parsing ${dir}:`, error);
          return {
            key: dir,
            title: dir,
            description: 'Unable to load description',
            url: '',
            baseUrl: `/${dir.toLowerCase()}`,
            status: 'draft'
          };
        }
      })
  );
  
  return namespaces.filter(Boolean);
}
```

## Testing Requirements

### Unit Tests
1. **Parser Tests**
   - Test directory scanning logic
   - Test config file parsing
   - Test frontmatter extraction
   - Test error handling for missing files

2. **Component Tests**
   - Test NamespaceCard rendering
   - Test grid layout responsiveness
   - Test loading states
   - Test error states

### Integration Tests
1. **API Tests**
   - Test /api/namespaces endpoint
   - Test authentication requirements
   - Test permission filtering
   - Test caching behavior

2. **Page Tests**
   - Test full page rendering
   - Test navigation to dashboards
   - Test responsive behavior
   - Test accessibility compliance

### E2E Tests
1. Navigate to namespaces page
2. Verify all namespace cards display
3. Click on a card and verify navigation
4. Test keyboard navigation
5. Test with different user roles

## Implementation Tasks

### Phase 1: Core Infrastructure (2-3 hours)
- [ ] Create directory structure
- [ ] Set up TypeScript interfaces
- [ ] Implement directory parser
- [ ] Create API endpoint

### Phase 2: UI Components (3-4 hours)
- [ ] Create NamespaceCard component
- [ ] Create NamespacesGrid component
- [ ] Implement loading skeletons
- [ ] Add error boundaries

### Phase 3: Page Implementation (2-3 hours)
- [ ] Create namespaces page
- [ ] Implement data fetching
- [ ] Add authentication checks
- [ ] Set up routing

### Phase 4: Styling & Polish (2 hours)
- [ ] Apply Material-UI theme
- [ ] Ensure responsive design
- [ ] Add hover effects
- [ ] Implement transitions

### Phase 5: Testing (3-4 hours)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Perform accessibility audit
- [ ] Fix any issues found

### Phase 6: Documentation (1 hour)
- [ ] Document API endpoint
- [ ] Add JSDoc comments
- [ ] Update README
- [ ] Create usage examples

## Success Criteria
1. ✅ All standards in the directory are displayed as cards
2. ✅ Each card shows accurate metadata from the standard's configuration
3. ✅ Navigation to individual dashboards works correctly
4. ✅ Page is fully accessible (WCAG 2.1 AA compliant)
5. ✅ Page loads within 2 seconds
6. ✅ Responsive design works on all screen sizes
7. ✅ Error handling prevents crashes from malformed data
8. ✅ User permissions are respected

## Future Enhancements
- Add search/filter functionality
- Include statistics (element count, vocabulary count)
- Show recent activity/commits
- Add favorite/bookmark functionality
- Implement sorting options (alphabetical, last updated)
- Add visual indicators for build status
- Include quick actions (edit, view site, view repo)