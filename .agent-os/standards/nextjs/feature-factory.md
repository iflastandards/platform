# 7-Phase Admin Feature Factory

## Overview

The Feature Factory is the standardized workflow for developing admin features using a refine.dev-first, contract-driven approach. This process ensures UI-first development with perfect mock-to-live transitions.

## Quick Start Commands

```bash
# Start new feature (interactive)
pnpm admin:feature "user imports"

# Or resume existing feature
pnpm admin:resume

# Check current status
pnpm admin:status

# Save stable checkpoint
pnpm admin:checkpoint
```

## 7-Phase Workflow

### Phase 1: Feature Identification & Requirements (15-30 min)
**Command**: `pnpm admin:feature "feature-name"`

**Deliverables**:
- User stories and use cases
- RBAC matrix and permissions
- Initial Zod schemas in `/packages/contracts/schemas/`
- Resource name (plural, kebab-case)
- Keywords for code discovery

**Example Output**:
```typescript
// packages/contracts/schemas/CsvImport.zod.ts
export const CsvImportSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  rowCount: z.number().optional(),
  errorCount: z.number().optional(),
  createdAt: z.string().datetime(),
  userId: z.string().uuid(),
});

export type CsvImport = z.infer<typeof CsvImportSchema>;
```

**RBAC Planning**:
- Who can create/read/update/delete this resource?
- What roles and permissions are needed?
- How does this integrate with Clerk roles?

### Phase 2: Code Discovery & Analysis (10-15 min)
**Command**: `pnpm admin:discover`

**Purpose**: Find existing scripts to refactor into UI features

**Process**:
1. Search codebase for relevant scripts using keywords
2. Analyze refactoring potential (high/medium/low)
3. Identify dependencies and integration opportunities
4. Plan code reuse vs new implementation

**Example Discovery Results**:
```
Found relevant scripts:
- scripts/csv-processor.ts (HIGH refactor potential)
- tools/data-validator.js (MEDIUM - needs TypeScript conversion)
- scripts/bulk-import.py (LOW - different use case)

Integration opportunities:
- Existing CSV validation logic
- Error handling patterns
- Progress tracking utilities
```

### Phase 3: Instant Scaffolding (5 min)
**Command**: `pnpm admin:scaffold`

**Core Process**: Execute refine.dev CLI scaffolding command:
```bash
# Exact command generated in Phase 2
npm run refine create-resource csv-imports \
  --actions list,create,show,edit \
  --provider data-provider \
  --ui antd
```

**Resource Naming Rules**:
- Use plural, kebab-case (e.g., `csv-imports`, `user-profiles`)
- Must match `/packages/contracts/schemas/` file names
- Becomes URL path: `/dashboard/csv-imports`

**Generated Files**:
```
apps/admin/src/
├── app/(authenticated)/csv-imports/
│   ├── page.tsx                    # List view
│   ├── new/page.tsx               # Create form
│   └── [id]/
│       ├── page.tsx               # Detail view
│       └── edit/page.tsx          # Edit form
├── providers/adapters/
│   └── csvImports.adapter.ts      # Service adapter
└── mocks/handlers/
    └── csvImports.handlers.ts     # MSW mocks
```

**Generated Features**:
- ✅ refine.dev CRUD pages with Ant Design components
- ✅ TypeScript interfaces from Zod schemas
- ✅ MSW handlers for mock data
- ✅ Basic service adapter structure
- ✅ Integration planning for discovered scripts

**Result**: Working UI at `http://localhost:3007/csv-imports`

### Phase 4: Iterative Refinement (2-3 hours)
**Command**: `pnpm admin:refine`

**Process**: Iterate 3-5 times until UI is perfect with mock data

**Iteration Examples**:

**Iteration 1**: Add file upload widget
```typescript
// csv-imports/new/page.tsx
function CreateCsvImport() {
  return (
    <Create>
      <Form layout="vertical">
        <Form.Item label="CSV File" name="file">
          <Upload.Dragger>
            <p>Click or drag CSV file to upload</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
}
```

**Iteration 2**: Add validation and preview
```typescript
function CsvPreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<string[][]>([]);
  
  useEffect(() => {
    // Parse first 5 rows for preview
    parseCSVPreview(file).then(setPreview);
  }, [file]);

  return (
    <Table
      dataSource={preview.map((row, i) => ({ key: i, ...row }))}
      pagination={false}
      size="small"
    />
  );
}
```

**Iteration 3**: Integrate existing script functionality
```typescript
// Refactor existing scripts/csv-processor.ts functionality
import { validateCSVStructure } from '@/lib/csv-validator';

function validateFile(file: File): Promise<ValidationResult> {
  // Integrate existing validation logic
  return validateCSVStructure(file);
}
```

**Key Principles**:
- **UI First**: Perfect the interface before any backend
- **Mock-Driven**: MSW mocks become the contract specification
- **Iterate Freely**: Changes are cheap before backend implementation
- **Type-Safe**: Zod schemas ensure end-to-end type safety
- **RBAC Built-in**: Role-based access from the start
- **No Backend Yet**: Only mock data and frontend logic

### Phase 5: Backend Implementation (2 hours)
**Command**: `pnpm admin:backend`

**Only after UI/contracts are stable**

**Tasks**:
1. **Refactor existing scripts** into reusable service modules
2. **Create service adapters** wrapping script functionality
3. **Create/update Supabase schema** for data persistence
4. **Implement Edge Functions** calling refactored code
5. **Connect live endpoints** to service adapters

**Example Refactoring**:
```typescript
// Before: scripts/csv-processor.ts (standalone script)
async function processCSV(filePath: string) {
  // Script logic
}

// After: lib/services/csvProcessor.service.ts (reusable service)
export class CsvProcessorService {
  async processFile(file: File): Promise<CsvProcessingJob> {
    const job = await this.createJob(file);
    await this.validateStructure(job);
    await this.processRows(job);
    return job;
  }
  
  private async createJob(file: File): Promise<CsvProcessingJob> {
    return CsvProcessingJobSchema.parse({
      id: crypto.randomUUID(),
      filename: file.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }
}
```

**Service Adapter Integration**:
```typescript
// csvImports.adapter.ts
import { CsvProcessorService } from '@/lib/services/csvProcessor.service';

export class CsvImportsAdapter {
  private csvService = new CsvProcessorService();

  async create(importData: CreateCsvImportInput): Promise<CsvImport> {
    // Use refactored service
    const job = await this.csvService.processFile(importData.file);
    
    // Store in Supabase
    const { data } = await supabase
      .from('csv_imports')
      .insert(job)
      .select()
      .single();
      
    return CsvImportSchema.parse(data);
  }
}
```

### Phase 6: Testing (1 hour)
**Command**: `pnpm admin:test`

**Test Types**:
1. **Integration tests** with real refactored code
2. **E2E tests** with full workflows
3. **Accessibility compliance** validation
4. **RBAC** with real permissions

**Example Integration Test**:
```typescript
// csvImports.test.tsx
describe('CSV Imports Integration @integration @api @critical', () => {
  beforeAll(() => {
    server.use(mockCsvImportHandlers);
  });

  it('should process CSV file end-to-end', async () => {
    render(<CsvImportsPage />);
    
    const fileInput = screen.getByLabelText(/csv file/i);
    const testFile = new File(['col1,col2\nval1,val2'], 'test.csv');
    
    await userEvent.upload(fileInput, testFile);
    await userEvent.click(screen.getByText(/upload/i));
    
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });
});
```

**E2E Test**:
```typescript
// csv-imports.e2e.test.ts
test('CSV import workflow @e2e @critical @admin', async ({ page }) => {
  await page.goto('/csv-imports');
  await page.click('text=New Import');
  
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('fixtures/sample.csv');
  
  await page.click('text=Upload');
  await page.waitForText('Processing...');
  await page.waitForText('Completed', { timeout: 30000 });
  
  await expect(page.locator('text=2 rows processed')).toBeVisible();
});
```

### Phase 7: Documentation (1 hour)
**Command**: `pnpm admin:docs`

**Generated Documentation**:
1. **API docs** from Zod schemas
2. **User guide** with screenshots
3. **Developer README** including refactored code
4. **In-app help** components
5. **Guided tours** for new workflows

**Example Documentation Structure**:
```
apps/admin/docs/features/csv-imports/
├── README.md                 # Developer documentation
├── USER_GUIDE.md            # End-user instructions
├── API.md                   # Generated from Zod schemas
├── screenshots/
│   ├── upload-form.png
│   ├── processing-status.png
│   └── results-view.png
└── INTEGRATION.md           # How refactored scripts work
```

## File Structure After Completion

```
apps/admin/
├── src/
│   ├── app/(authenticated)/csv-imports/
│   │   ├── page.tsx                    # List view (refine List)
│   │   ├── loading.tsx                 # Loading state
│   │   ├── new/page.tsx               # Create form (refine Create)
│   │   └── [id]/
│   │       ├── page.tsx               # Detail view (refine Show)
│   │       └── edit/page.tsx          # Edit form (refine Edit)
│   │
│   ├── providers/adapters/
│   │   └── csvImports.adapter.ts      # Service adapter
│   │
│   ├── mocks/handlers/
│   │   └── csvImports.handlers.ts     # MSW mocks
│   │
│   ├── lib/services/                  # Refactored script code
│   │   └── csvProcessor.service.ts    # Business logic service
│   │
│   └── components/
│       ├── CsvUpload.tsx              # Custom upload component
│       ├── CsvPreview.tsx             # Preview table
│       └── ProcessingStatus.tsx        # Job progress indicator
│
├── docs/features/csv-imports/          # Generated documentation
└── packages/contracts/schemas/
    └── CsvImport.zod.ts               # Data contracts
```

## Integration with SuperClaude

The workflow integrates with SuperClaude's agent orchestration:

- **Phase 1**: `requirements-analyst` agent with brainstorming mode
- **Phase 2**: `general-purpose` agent for code discovery
- **Phase 3**: `frontend-architect` agent with Context7 MCP for refine.dev patterns
- **Phase 4**: `frontend-architect` + `refactoring-expert` agents for UI refinement
- **Phase 5**: `backend-architect` agent with parallel execution
- **Phase 6**: `quality-engineer` and `security-engineer` agents
- **Phase 7**: `technical-writer` agent for documentation

**SuperClaude Command**: Use `/sc:admin feature` in Claude Code to trigger the full orchestrated workflow.

## Key Success Patterns

### Contract-Driven Development
1. **Define Zod schemas first** in Phase 1
2. **Generate types automatically** - never manual types
3. **Mock data follows contracts** exactly
4. **Service adapters validate** all boundaries
5. **UI components are type-safe** end-to-end

### Mock-to-Live Transition
1. **Perfect UI with mocks** in Phase 4
2. **Contracts are battle-tested** before backend
3. **MSW handlers become API specifications**
4. **Zero UI changes** when switching to live data
5. **Confidence in production** through mock validation

### Script Integration Strategy
1. **Discover existing code** early in Phase 2
2. **Plan refactoring approach** before scaffolding
3. **Integrate incrementally** during UI refinement
4. **Extract reusable services** during backend phase
5. **Maintain backward compatibility** with existing scripts

### Testing Excellence
1. **Tag all tests** with AI tagging tool
2. **Integration-heavy approach** with MSW
3. **E2E critical user journeys**
4. **Accessibility compliance** validation
5. **RBAC testing** with real permissions

This 7-phase workflow ensures rapid, reliable feature development while maintaining high quality standards and architectural consistency.