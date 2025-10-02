# CLAUDE.md - Admin App Specific Guide

This file provides Next.js admin app-specific guidance for Claude Code when working in the apps/admin directory.

## 🔴 ADMIN APP CONTEXT - YOU ARE HERE!

You are working in the **Next.js Admin App** that serves from the root path (no ).

### ✅ SIMPLIFIED ROUTING - NO BASEPATH

The admin app now serves from root. All paths work as standard Next.js routing:

#### 1. **Navigation Links - Standard Next.js**
```tsx
// ✅ STANDARD NEXT.JS ROUTING
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
<Link href="/users">Users</Link>
<Link href="/settings">Settings</Link>
<Link href={`/users/${userId}`}>User Profile</Link>
```

#### 2. **API Calls - Standard fetch**
```tsx
// ✅ STANDARD FETCH CALLS
const response = await fetch('/api/vocabularies');
const userRes = await fetch(`/api/users/${id}`);
const data = await fetch('/api/stats', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

#### 3. **Static Assets & Images**
```tsx
// ✅ STANDARD ASSET PATHS
<img src="/logo.png" alt="Logo" />
<link rel="icon" href="/favicon.ico" />
<Image src="/hero.jpg" width={800} height={400} />

// For dynamic assets
const imageUrl = `/uploads/${filename}`;
```

#### 4. **Router Navigation**
```tsx
// ✅ STANDARD ROUTER USAGE
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/dashboard');
router.replace('/login');
router.prefetch('/users');
```

#### 5. **Form Actions & Redirects**
```tsx
// ✅ STANDARD REDIRECTS
import { redirect } from 'next/navigation';

// In server actions
async function submitForm() {
  'use server';
  // ... process form
  redirect('/dashboard');
}
```

---

## 📁 Admin App Structure

```
apps/admin/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Auth group (login, register)
│   │   ├── (dashboard)/       # Dashboard group
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── auth/             # Auth components
│   │   ├── ui/               # UI components
│   │   └── ...
│   ├── lib/                   # Utilities
│   └── styles/               # Global styles
├── public/                    # Static assets
├── next.config.js            # Next.js config 
└── tailwind.config.ts        # Tailwind config
```

---

## 🚀 Quick Admin Commands

All commands run from the **repository root**, not from apps/admin:

```bash
# Development
pnpm nx dev admin --turbopack        # Start dev server with turbo
pnpm nx dev admin                    # Start dev server

# Building
pnpm nx build admin                  # Production build
pnpm nx serve admin                  # Serve production build

# Testing & Quality
pnpm test                      # Run affected tests
pnpm typecheck                 # Type check affected
pnpm lint                      # Lint affected

# Admin-specific
pnpm nx run admin:analyze           # Bundle analysis
```

---

## 🎨 Admin UI Components

### Using shadcn/ui
```tsx
// Components are in src/components/ui/
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';

// Theme utilities from shared package
import { cn } from '@ifla/theme/utils';
```

### Component Patterns
```tsx
// Client components (most UI)
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Counter() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(c => c + 1)}>{count}</Button>;
}

// Server components (data fetching)
import { getVocabularies } from '@/lib/api';

export async function VocabularyList() {
  const vocabs = await getVocabularies();
  return <ul>{vocabs.map(v => <li key={v.id}>{v.name}</li>)}</ul>;
}
```

---

## 🔌 API Routes

### App Router API Routes
```tsx
// src/app/api/vocabularies/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // API logic here
  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process body
  return NextResponse.json({ success: true });
}
```

### Dynamic API Routes
```tsx
// src/app/api/vocabularies/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // Fetch by ID
  return NextResponse.json({ id, name: 'Vocabulary' });
}
```

---

## 🔐 Authentication Patterns

### Protected Routes
```tsx
// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');  // Standard Next.js redirect
  }
  
  return <>{children}</>;
}
```

### Auth Components
```tsx
// Remember to handle redirects properly
import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function handleLogin(formData: FormData) {
  'use server';
  
  const success = await signIn(formData);
  if (success) {
    redirect('/dashboard');  // Standard Next.js routing
  }
}
```

---

## 🐛 Common Admin App Issues

### Issue: 404 on API calls
**Cause**: Incorrect API paths
**Fix**: 
```tsx
// ✅ CORRECT - Standard paths
const res = await fetch('/api/data');
```

### Issue: Broken navigation links
**Cause**: Incorrect Link paths
**Fix**:
```tsx
// ✅ CORRECT - Standard Next.js routing
<Link href="/users">Users</Link>
```

### Issue: Missing static assets
**Cause**: Incorrect asset paths
**Fix**:
```tsx
// ✅ CORRECT - Standard asset paths
<img src="/images/logo.png" />
```

---

## ♿ Accessibility Requirements (EU/GB Compliance)

### Legal Requirements
The admin app **MUST** comply with:
- **EU**: Web Accessibility Directive (WAD) 2016/2102 - WCAG 2.1 Level AA
- **UK**: Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018
- **Standard**: WCAG 2.1 Level AA minimum (working towards AAA where possible)

### Key Accessibility Patterns

#### 1. **Keyboard Navigation**
```tsx
// ✅ CORRECT - Full keyboard support
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  aria-label="Delete vocabulary item"
>
  Delete
</button>

// ❌ WRONG - Click only
<div onClick={handleClick}>Delete</div>
```

#### 2. **ARIA Labels and Roles**
```tsx
// ✅ CORRECT - Descriptive ARIA
<nav aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">
      <Link href="/dashboard" aria-current={isActive ? 'page' : undefined}>
        Dashboard
      </Link>
    </li>
  </ul>
</nav>

// ❌ WRONG - Missing semantics
<div className="nav">
  <div><Link href="/dashboard">Dashboard</Link></div>
</div>
```

#### 3. **Form Accessibility**
```tsx
// ✅ CORRECT - Accessible form
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="vocabulary-name">
      Vocabulary Name
      <span className="required" aria-label="required">*</span>
    </label>
    <input
      id="vocabulary-name"
      name="vocabularyName"
      type="text"
      required
      aria-required="true"
      aria-describedby="vocabulary-name-error"
      aria-invalid={!!errors.vocabularyName}
    />
    {errors.vocabularyName && (
      <span id="vocabulary-name-error" role="alert" className="error">
        {errors.vocabularyName}
      </span>
    )}
  </div>
</form>

// ❌ WRONG - Inaccessible form
<form>
  <input type="text" placeholder="Vocabulary Name" />
  {errors && <div className="error">{errors}</div>}
</form>
```

#### 4. **Color Contrast**
```tsx
// ✅ CORRECT - WCAG AA compliant contrast
// Ensure 4.5:1 for normal text, 3:1 for large text
const styles = {
  color: '#1a1a1a',        // Dark text
  backgroundColor: '#fff',  // White background
  // Contrast ratio: 19.5:1 ✓
};

// ❌ WRONG - Poor contrast
const styles = {
  color: '#999',           // Light gray
  backgroundColor: '#f0f0f0', // Light background
  // Contrast ratio: 1.9:1 ✗
};
```

#### 5. **Focus Management**
```tsx
// ✅ CORRECT - Manage focus on route change
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function PageHeader({ title }: { title: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Focus heading on route change for screen readers
    headingRef.current?.focus();
  }, [router.pathname]);
  
  return (
    <h1 ref={headingRef} tabIndex={-1}>
      {title}
    </h1>
  );
}
```

### Testing Accessibility

#### Manual Testing
```bash
# Keyboard navigation
- Tab through all interactive elements
- Ensure visible focus indicators
- Test keyboard shortcuts

# Screen reader testing
- Use NVDA (Windows) or JAWS
- Use VoiceOver (macOS)
- Verify all content is announced

# Color contrast
- Use Chrome DevTools
- Check with Colour Contrast Analyser
```

#### Automated Testing
```tsx
// In tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('page is accessible', async () => {
  const { container } = render(<DashboardPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Accessibility Checklist
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels for all controls
- [ ] Form labels associated with inputs
- [ ] Error messages linked to fields
- [ ] Color contrast WCAG AA compliant
- [ ] Focus indicators visible
- [ ] Skip navigation links
- [ ] Page language declared
- [ ] Headings hierarchical (h1 → h2 → h3)
- [ ] Images have alt text
- [ ] Videos have captions
- [ ] No keyboard traps
- [ ] Responsive zoom to 200%
- [ ] Works with screen readers

---

## 🧪 Testing Admin App Features

### Test Types
1. **Unit Tests**: `src/test/components/` - Test components in isolation
2. **Integration Tests**: `src/test/integration/` - Test with real I/O (files, DB)
3. **Server-Dependent Tests**: `src/test/integration/server-dependent/` - Tests requiring running servers
4. **E2E Tests**: `e2e/admin/` - Full browser automation tests

### Running Tests
```bash
# Run all tests (unit + integration, NO server-dependent)
pnpm nx test admin

# Run only integration tests (NO server-dependent)
pnpm nx test:integration admin

# Run server-dependent tests (starts servers)
pnpm nx test:server-dependent admin

# Run E2E tests
pnpm nx e2e admin
```

### Important: Server-Dependent Tests
Some tests require the admin server to be running. These are isolated in `src/test/integration/server-dependent/` to prevent hanging during regular test runs. See [Server-Dependent Testing Guide](../../developer_notes/SERVER_DEPENDENT_TESTING.md) for details.

---

## 🎨 Ant Design Vertical Spacing Guide

The admin app uses Ant Design components. Managing vertical spacing effectively is crucial for clean UI.

### Global Spacing Control

#### 1. ConfigProvider with Compact Theme
```tsx
import { ConfigProvider, theme } from 'antd';

const App = () => (
  <ConfigProvider theme={{ algorithm: theme.compactAlgorithm }}>
    {/* Reduces spacing globally */}
  </ConfigProvider>
);
```

#### 2. Custom Theme Tokens
```tsx
<ConfigProvider
  theme={{
    components: {
      Form: {
        itemMarginBottom: 12, // Default is 24
      },
      Card: {
        paddingLG: 16, // Default is 24
      },
    },
  }}
>
```

### Component-Level Spacing

#### Space Component
```tsx
import { Space, Button } from 'antd';

<Space direction="vertical" size={8}>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Space>
```

#### Grid System Gutter
```tsx
import { Row, Col } from 'antd';

<Row gutter={[16, 8]}> {/* [horizontal, vertical] */}
  <Col span={24}>Content</Col>
</Row>
```

### Individual Component Tweaks

#### Form Item Margin
```tsx
<Form.Item label="Field" style={{ marginBottom: 8 }}>
  <Input />
</Form.Item>
```

#### Card Padding
```tsx
<Card bodyStyle={{ padding: '16px' }}>
  Content
</Card>
```

### CSS Override File

The admin app includes `src/styles/antd-overrides.css` with tighter spacing defaults:
- Card padding: 24px → 16px
- Table cells: 16px → 12px
- Form margins: 24px → 16px
- Button heights: 40px → 36px

**Best Practices:**
1. Use ConfigProvider for global changes
2. Use Space/Row components for local spacing
3. Use inline styles for one-off adjustments
4. Avoid direct CSS overrides when possible
5. CSS overrides should be specific and documented

---

## 🤖 Ant Design AI Agent Guidelines

### Core Concepts for AI Development

**What Ant Design Is:**
- Enterprise-level UI design system and React component library
- Designed for internal dashboards, admin panels, data-heavy applications
- Maintained by Ant Group (Alibaba)

**Design Philosophy:**
- **Natural**: Intuitive interactions reflecting real-world processes
- **Certain**: Predictable UI with clear feedback
- **Meaningful**: Purposeful design with clear information hierarchy
- **Growing**: Scalable and adaptable to complex requirements

### Key Technical Patterns

#### 1. Component-Based Development
```tsx
// Compose pre-styled components
import { Button, Table, Form, Modal } from 'antd';

// Build pages by composing components
<Form>
  <Form.Item name="email">
    <Input />
  </Form.Item>
  <Button type="primary">Submit</Button>
</Form>
```

#### 2. Theming (Most Important)
```tsx
// ✅ PREFERRED - Use ConfigProvider and design tokens
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      marginXS: 8,
    },
    algorithm: theme.compactAlgorithm, // For tighter spacing
  }}
>
```

#### 3. Layout Patterns
```tsx
// Grid system (24-column)
<Row gutter={[16, 16]}>
  <Col span={8}>Content</Col>
</Row>

// Spacing between components
<Space direction="vertical" size="middle">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Space>

// Flexible layouts
<Flex justify="space-between" align="center">
  <div>Left</div>
  <div>Right</div>
</Flex>
```

#### 4. Form Handling
```tsx
// Built-in validation and state management
<Form onFinish={handleSubmit}>
  <Form.Item 
    name="username" 
    rules={[{ required: true, message: 'Required!' }]}
  >
    <Input />
  </Form.Item>
</Form>
```

#### 5. Icons
```tsx
// Use official icon library
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

<Button icon={<DeleteOutlined />}>Delete</Button>
```

### What to Avoid

❌ **Heavy CSS Overrides**
```css
/* DON'T: Brittle, breaks with updates */
.ant-btn.my-custom-class > span {
  color: red !important;
}
```

✅ **Use Design Tokens**
```tsx
/* DO: Update-proof customization */
<ConfigProvider theme={{ token: { colorPrimary: 'red' } }}>
```

❌ **Component-by-Component Styling**
```tsx
/* DON'T: Repetitive */
<Button style={{ height: 32 }}>Button 1</Button>
<Button style={{ height: 32 }}>Button 2</Button>
```

✅ **Global Theme Changes**
```tsx
/* DO: Consistent */
<ConfigProvider theme={{ components: { Button: { controlHeight: 32 } } }}>
```

### Primary Documentation Sources

1. **Official Docs** (Highest Priority): https://ant.design
   - Components section with live examples
   - API tables for all props and types
   - Design token documentation
   - Customize theme guide

2. **GitHub Repository**: https://github.com/ant-design/ant-design
   - Source code and issues
   - Community discussions

3. **Ant Design Pro**: https://pro.ant.design
   - Best practices examples
   - Complex pattern implementations

4. **npm Registry**: https://www.npmjs.com/package/antd
   - Version information and dependencies

### Quick Decision Framework

**For Spacing Issues:**
1. ConfigProvider theme tokens (global)
2. Space/Row/Col components (local)
3. Inline styles (individual)
4. CSS overrides (last resort)

**For Customization:**
1. Check design tokens first
2. Use ConfigProvider for global changes
3. Component-specific theme tokens
4. CSS classes only when necessary

---

## 💡 Admin Development Tips

1. **Use standard Next.js patterns** - No special path handling needed
2. **Use TypeScript** - The app is fully typed with TypeScript 5.7
3. **Server Components by default** - Only add 'use client' when needed
4. **Use App Router patterns** - Not Pages Router
5. **Tailwind for styling** - Avoid inline styles when possible
6. **Standard routing** - All paths work as normal Next.js routing
7. **Test organization** - Keep server-dependent tests separate to avoid CI issues

---

## 🔧 Refine.dev Integration (PRIORITY FOR ADMIN FEATURES)

### 🔴 CRITICAL RULE: Refine-First Development

**For ALL new admin features, ALWAYS consider Refine.dev generators FIRST before custom implementation.**

### Quick Decision Framework

#### 1. **Standard CRUD Operations** → **ALWAYS Use Refine**
```bash
# Generate complete CRUD resource
npx refine create resource [resource-name] --actions list,create,edit,show
```

**Use Refine When:**
- ✅ Data listing with pagination/filtering
- ✅ Create/Edit/Delete operations  
- ✅ Standard form handling
- ✅ Table display with sorting
- ✅ Modal management
- ✅ User management, vocabulary management, etc.

#### 2. **Custom Complex Logic** → **Refine + Custom**
```bash
# Generate base, then customize
npx refine create resource [resource-name] --actions list,create
# Then add custom logic on top
```

**Use Refine Base + Custom When:**
- ✅ AI analysis workflows (like Test Tag Manager)
- ✅ Multi-step wizards
- ✅ Complex configuration interfaces
- ✅ Domain-specific business logic

#### 3. **Pure Custom** → **Only When Necessary**
**Rarely Use Custom When:**
- ❌ Simple CRUD (use Refine instead)
- ❌ Standard admin patterns (use Refine instead)
- ✅ Completely unique UX requirements
- ✅ Non-data-driven interfaces

### Refine.dev + Ant Design Patterns

#### Core Hooks (Use These Instead of Manual State)
```tsx
// ✅ PREFERRED - Refine hooks
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import { useForm, useTable } from "@refinedev/antd";

// Replace manual useState with Refine hooks
const { data, isLoading, refetch } = useList({ 
  resource: "vocabularies",
  pagination: { current: 1, pageSize: 10 },
  filters: [{ field: "status", operator: "eq", value: "active" }]
});

const { mutate: createVocab } = useCreate();
const { mutate: updateVocab } = useUpdate();
const { mutate: deleteVocab } = useDelete();
```

#### Form Management
```tsx
// ✅ PREFERRED - Refine + Ant Design forms
import { Create, useForm } from "@refinedev/antd";

const { formProps, saveButtonProps } = useForm({
  resource: "vocabularies",
  action: "create",
  redirect: "list"
});

return (
  <Create saveButtonProps={saveButtonProps}>
    <Form {...formProps} layout="vertical">
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  </Create>
);
```

#### Table/List Management
```tsx
// ✅ PREFERRED - Refine + Ant Design tables
import { List, useTable } from "@refinedev/antd";

const { tableProps, searchFormProps } = useTable({
  resource: "vocabularies",
  filters: { initial: [{ field: "status", operator: "eq", value: "active" }] },
});

return (
  <List>
    <Table {...tableProps} rowKey="id">
      <Table.Column dataIndex="name" title="Name" />
      <Table.Column dataIndex="status" title="Status" />
    </Table>
  </List>
);
```

### Data Provider Integration

#### Standard REST API Pattern
```tsx
// src/providers/data-provider.ts
import { DataProvider } from "@refinedev/core";

const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `/api/${resource}`;
    // Convert Refine params to API params
    const response = await fetch(url);
    return {
      data: response.data,
      total: response.total,
    };
  },
  create: async ({ resource, variables }) => {
    const response = await fetch(`/api/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    return { data: response.data };
  },
  // ... other CRUD methods
};
```

### Generator Commands (Use These First)

#### Create New Resource
```bash
# Complete CRUD resource
npx refine create resource vocabularies --actions list,create,edit,show

# List-only resource
npx refine create resource analytics --actions list

# Custom resource with base
npx refine create resource test-tags --actions list,create
```

#### Add Authentication
```bash
npx refine add auth-provider clerk
```

#### Add UI Framework Integration
```bash
npx refine add ui antd
```

### When NOT to Use Custom Implementation

**❌ DON'T Build Manually:**
- User management pages
- Settings/configuration forms  
- Data listing tables
- Standard create/edit modals
- Search/filter interfaces
- Pagination controls

**✅ USE Refine Generators:**
- All standard admin CRUD operations
- Data tables with sorting/filtering
- Form validation and submission
- Modal management
- Navigation and routing
- Authentication flows

### Migration Strategy for Existing Features

**For New Features:**
1. Try Refine generators first
2. Customize generated code as needed
3. Add domain-specific logic on top

**For Existing Custom Features:**
1. Continue maintaining (don't rewrite working code)
2. Consider Refine migration only during major updates
3. Use Refine patterns for similar new features

---

## 🚨 BEFORE YOU CODE

Ask yourself:
- [ ] Can I use a Refine generator for this? (**CHECK FIRST!**)
- [ ] Am I building standard CRUD operations? (→ Use Refine)
- [ ] Am I using standard Next.js routing patterns?
- [ ] Are my API calls using standard paths (/api/*)?
- [ ] Are my Links using standard Next.js routing?
- [ ] Is this a client or server component?
- [ ] Have I checked existing patterns in the codebase?

**Priority Order:**
1. **Refine generators** (for CRUD/admin patterns)
2. **Standard Next.js patterns** (for routing/API)
3. **Custom implementation** (only when necessary)

Remember: **Refine-first for admin features, then standard Next.js patterns!**