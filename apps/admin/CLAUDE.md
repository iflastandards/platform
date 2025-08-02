# CLAUDE.md - Admin App Specific Guide

This file provides Next.js admin app-specific guidance for Claude Code when working in the apps/admin directory.

## 🔴 ADMIN APP CONTEXT - YOU ARE HERE!

You are working in the **Next.js Admin App** with critical basePath configuration at `/admin`.

### ⚠️ CRITICAL basePath RULES - CHECK EVERY TIME

The admin app runs at `/admin` basePath. **EVERY** path-related operation must account for this:

#### 1. **Navigation Links - Write as if at root**
```tsx
// ✅ ALWAYS DO THIS - Next.js adds /admin automatically
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
<Link href="/users">Users</Link>
<Link href="/settings">Settings</Link>
<Link href={`/users/${userId}`}>User Profile</Link>

// ❌ NEVER DO THIS - Results in /admin/admin/...
<Link href="/admin/dashboard">Dashboard</Link>
<a href="/admin/users">Users</a>  // Also wrong - use Link!
```

#### 2. **API Calls - MUST use addBasePath**
```tsx
// ✅ ALWAYS DO THIS
import { addBasePath } from '@ifla/theme/utils';

// For all fetch calls
const response = await fetch(addBasePath('/api/vocabularies'));
const userRes = await fetch(addBasePath(`/api/users/${id}`));
const data = await fetch(addBasePath('/api/stats'), {
  method: 'POST',
  body: JSON.stringify(payload)
});

// ❌ NEVER DO THIS
const response = await fetch('/api/vocabularies');  // Fails in production
const response = await fetch('/admin/api/vocabularies');  // Double prefix
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`);  // Use addBasePath!
```

#### 3. **Static Assets & Images**
```tsx
// ✅ ALWAYS DO THIS
import { addBasePath } from '@ifla/theme/utils';

<img src={addBasePath('/logo.png')} alt="Logo" />
<link rel="icon" href={addBasePath('/favicon.ico')} />
<Image src={addBasePath('/hero.jpg')} width={800} height={400} />

// For dynamic assets
const imageUrl = addBasePath(`/uploads/${filename}`);

// ❌ NEVER DO THIS
<img src="/admin/logo.png" />  // Double prefix
<img src="/logo.png" />  // Missing basePath
```

#### 4. **Router Navigation**
```tsx
// ✅ ALWAYS DO THIS - Write paths as if at root
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/dashboard');
router.replace('/login');
router.prefetch('/users');

// ❌ NEVER DO THIS
router.push('/admin/dashboard');  // Double prefix
```

#### 5. **Form Actions & Redirects**
```tsx
// ✅ ALWAYS DO THIS
import { redirect } from 'next/navigation';

// In server actions
async function submitForm() {
  'use server';
  // ... process form
  redirect('/dashboard');  // Next.js handles basePath
}

// ❌ NEVER DO THIS
redirect('/admin/dashboard');  // Double prefix
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
├── next.config.js            # Next.js config with basePath
└── tailwind.config.ts        # Tailwind config
```

---

## 🚀 Quick Admin Commands

All commands run from the **repository root**, not from apps/admin:

```bash
# Development
nx dev admin --turbopack        # Start dev server with turbo
nx dev admin                    # Start dev server

# Building
nx build admin                  # Production build
nx serve admin                  # Serve production build

# Testing & Quality
pnpm test                      # Run affected tests
pnpm typecheck                 # Type check affected
pnpm lint                      # Lint affected

# Admin-specific
nx run admin:analyze           # Bundle analysis
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
    redirect('/login');  // Next.js adds basePath
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
    redirect('/dashboard');  // Not '/admin/dashboard'!
  }
}
```

---

## 🐛 Common Admin App Issues

### Issue: 404 on API calls
**Cause**: Missing `addBasePath()` on fetch calls
**Fix**: 
```tsx
// Before
const res = await fetch('/api/data');

// After
import { addBasePath } from '@ifla/theme/utils';
const res = await fetch(addBasePath('/api/data'));
```

### Issue: Broken navigation links
**Cause**: Hardcoded `/admin` prefix in Link components
**Fix**:
```tsx
// Before
<Link href="/admin/users">Users</Link>

// After
<Link href="/users">Users</Link>
```

### Issue: Missing static assets
**Cause**: Incorrect asset paths
**Fix**:
```tsx
// Before
<img src="/images/logo.png" />

// After
<img src={addBasePath('/images/logo.png')} />
```

### Issue: Double /admin in URL
**Cause**: Manual basePath prepending
**Fix**: Remove all manual `/admin` prefixes, let Next.js handle it

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
nx test admin

# Run only integration tests (NO server-dependent)
nx test:integration admin

# Run server-dependent tests (starts servers)
nx test:server-dependent admin

# Run E2E tests
nx e2e admin
```

### Important: Server-Dependent Tests
Some tests require the admin server to be running. These are isolated in `src/test/integration/server-dependent/` to prevent hanging during regular test runs. See [Server-Dependent Testing Guide](../../developer_notes/SERVER_DEPENDENT_TESTING.md) for details.

---

## 💡 Admin Development Tips

1. **Always import addBasePath** at the top of files that make API calls
2. **Use TypeScript** - The app is fully typed with TypeScript 5.7
3. **Server Components by default** - Only add 'use client' when needed
4. **Use App Router patterns** - Not Pages Router
5. **Tailwind for styling** - Avoid inline styles when possible
6. **Check the network tab** - If API calls fail, check if basePath is missing
7. **Test organization** - Keep server-dependent tests separate to avoid CI issues

---

## 🚨 BEFORE YOU CODE

Ask yourself:
- [ ] Am I handling paths correctly? (no hardcoded /admin)
- [ ] Are my API calls using addBasePath?
- [ ] Are my Links using root-relative paths?
- [ ] Is this a client or server component?
- [ ] Have I checked existing patterns in the codebase?

Remember: **Write all paths as if the app is at the root!**