# UI/UX Accessibility Best Practices - IFLA Standards Platform

## Legal Requirements & Standards

### Compliance Requirements
The IFLA Standards Platform **MUST** comply with:
- **🇪🇺 EU**: Web Accessibility Directive (WAD) 2016/2102 - WCAG 2.1 Level AA
- **🇬🇧 UK**: Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018
- **🌍 International**: WCAG 2.1 Level AA minimum (working towards AAA where possible)

### Target Standard
- **Minimum**: WCAG 2.1 Level AA compliance
- **Goal**: WCAG 2.1 Level AAA where feasible
- **Testing**: Automated + manual testing required

## Core Accessibility Principles

### 1. Perceivable
Users must be able to perceive the information being presented.

#### Color Contrast Requirements
```typescript
// ✅ CORRECT - WCAG AA compliant contrast ratios
const colorContrast = {
  // Normal text: 4.5:1 minimum
  normalText: {
    color: '#111827',        // gray-900
    background: '#ffffff',   // Ratio: 19.5:1 ✓
  },
  
  // Large text (18pt+ or 14pt+ bold): 3:1 minimum
  largeText: {
    color: '#374151',        // gray-700
    background: '#ffffff',   // Ratio: 12.6:1 ✓
  },
  
  // UI components: 3:1 minimum
  uiComponents: {
    border: '#0F766E',       // primary-600
    background: '#ffffff',   // Ratio: 4.8:1 ✓
  },
  
  // Focus indicators: 3:1 minimum
  focusIndicator: {
    outline: '#0F766E',      // primary-600
    background: '#ffffff',   // Ratio: 4.8:1 ✓
  },
};

// ❌ WRONG - Poor contrast (fails WCAG AA)
const poorContrast = {
  color: '#999999',          // light gray
  background: '#f0f0f0',     // light background
  // Ratio: 1.9:1 ✗ (fails 4.5:1 requirement)
};
```

#### Visual Information
- **Never use color alone** to convey information
- **Provide text alternatives** for images and icons
- **Use patterns, shapes, or text** alongside color coding

```tsx
// ✅ CORRECT - Multiple indicators
<Chip 
  label="Error" 
  color="error"
  icon={<ErrorIcon />}  // Icon + color + text
/>

// ❌ WRONG - Color only
<div style={{ backgroundColor: 'red' }}>Important</div>
```

### 2. Operable
Users must be able to operate the interface.

#### Keyboard Navigation
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

// ❌ WRONG - Click only, no keyboard support
<div onClick={handleClick}>Delete</div>
```

#### Focus Management
```typescript
// Focus indicator styles (required)
const focusStyles = {
  // Default focus ring
  default: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
    borderRadius: 'inherit',
  },
  
  // High contrast mode
  highContrast: {
    outline: '3px solid #0F766E',
    outlineOffset: '2px',
  },
  
  // Focus-visible only (modern browsers)
  focusVisible: {
    '&:focus': { outline: 'none' },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
    },
  },
};
```

#### Touch Targets
- **Minimum size**: 44x44px for touch targets
- **Spacing**: At least 8px between adjacent targets
- **Visual feedback**: Clear hover/active states

### 3. Understandable
Users must be able to understand the information and UI operation.

#### Form Accessibility
```tsx
// ✅ CORRECT - Fully accessible form
<form onSubmit={handleSubmit} noValidate>
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
      aria-describedby="vocabulary-name-error vocabulary-name-help"
      aria-invalid={!!errors.vocabularyName}
    />
    <div id="vocabulary-name-help" className="help-text">
      Enter a unique name for this vocabulary
    </div>
    {errors.vocabularyName && (
      <div id="vocabulary-name-error" role="alert" className="error">
        {errors.vocabularyName}
      </div>
    )}
  </div>
</form>

// ❌ WRONG - Inaccessible form
<form>
  <input type="text" placeholder="Vocabulary Name" />
  {errors && <div className="error">{errors}</div>}
</form>
```

#### Error Handling
```tsx
// ✅ CORRECT - Accessible error messages
const ErrorMessage = ({ message, fieldId }: { message: string; fieldId: string }) => (
  <div 
    id={`${fieldId}-error`}
    role="alert"
    aria-live="polite"
    className="error-message"
  >
    <ErrorIcon aria-hidden="true" />
    {message}
  </div>
);

// Usage with form field
<TextField
  error={!!errors.email}
  helperText={errors.email?.message}
  aria-describedby={errors.email ? 'email-error' : 'email-help'}
  inputProps={{
    'aria-invalid': !!errors.email,
    'aria-required': true,
  }}
/>
```

### 4. Robust
Content must be robust enough for various assistive technologies.

#### Semantic HTML & ARIA
```tsx
// ✅ CORRECT - Semantic structure with ARIA
<nav aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">
      <Link 
        href="/dashboard" 
        aria-current={isActive ? 'page' : undefined}
      >
        Dashboard
      </Link>
    </li>
  </ul>
</nav>

<main role="main" aria-labelledby="page-title">
  <h1 id="page-title">User Management</h1>
  <section aria-labelledby="active-users">
    <h2 id="active-users">Active Users</h2>
    {/* Content */}
  </section>
</main>

// ❌ WRONG - Non-semantic structure
<div className="nav">
  <div><Link href="/dashboard">Dashboard</Link></div>
</div>
<div className="content">
  <div className="title">User Management</div>
</div>
```

## Component-Specific Guidelines

### Data Tables
```tsx
// ✅ CORRECT - Accessible data table
<table role="table" aria-label="User list">
  <caption>List of active users with their roles and status</caption>
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col" aria-sort="ascending">
        Name
        <button aria-label="Sort by name ascending">↑</button>
      </th>
      <th role="columnheader" scope="col">Role</th>
      <th role="columnheader" scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="cell">John Doe</td>
      <td role="cell">Editor</td>
      <td role="cell">
        <button aria-label="Edit John Doe">Edit</button>
        <button aria-label="Delete John Doe">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Modal Dialogs
```tsx
// ✅ CORRECT - Accessible modal
const AccessibleModal = ({ open, onClose, title, children }) => {
  const titleId = useId();
  const descId = useId();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descId}
      role="dialog"
      aria-modal="true"
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <div id={descId}>{children}</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Loading States
```tsx
// ✅ CORRECT - Accessible loading states
const LoadingSpinner = ({ label = "Loading content" }) => (
  <div 
    role="status" 
    aria-live="polite" 
    aria-label={label}
  >
    <CircularProgress aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </div>
);

// Progress indicator
const ProgressBar = ({ value, label }) => (
  <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className="progress-label" id="progress-label">
      {label}: {value}%
    </div>
    <div className="progress-bar" aria-labelledby="progress-label">
      <div style={{ width: `${value}%` }} />
    </div>
  </div>
);
```

## Testing Requirements

### Automated Testing
```typescript
// ✅ CORRECT - Accessibility test patterns
describe('Component Accessibility @a11y', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: /submit/i });
    
    // Test keyboard activation
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockSubmit).toHaveBeenCalled();
    
    await userEvent.keyboard('{Space}');
    expect(mockSubmit).toHaveBeenCalledTimes(2);
  });
  
  it('should announce changes to screen readers', async () => {
    render(<MyComponent />);
    const liveRegion = screen.getByRole('status');
    
    // Trigger change
    await userEvent.click(screen.getByRole('button'));
    
    expect(liveRegion).toHaveTextContent('Action completed');
  });
});
```

### Manual Testing Checklist

#### Pre-Development Checklist
- [ ] **Design review**: Color contrast meets WCAG AA (4.5:1 normal, 3:1 large text)
- [ ] **Interaction design**: All functionality available via keyboard
- [ ] **Content structure**: Logical heading hierarchy planned
- [ ] **Focus management**: Focus flow and indicators designed

#### Development Checklist
- [ ] **Semantic HTML**: Proper elements used (button, nav, main, etc.)
- [ ] **ARIA labels**: All interactive elements have accessible names
- [ ] **Form labels**: All inputs properly labeled and described
- [ ] **Error handling**: Errors announced to screen readers
- [ ] **Focus indicators**: Visible focus states on all interactive elements
- [ ] **Color contrast**: WCAG AA compliant (test with tools)
- [ ] **Keyboard navigation**: Tab order logical, all functions accessible
- [ ] **Screen reader**: Test with NVDA/JAWS/VoiceOver

#### Testing Tools
- **Automated**: axe-core, Lighthouse accessibility audit
- **Manual**: Screen readers (NVDA, JAWS, VoiceOver)
- **Color contrast**: WebAIM Contrast Checker, Colour Contrast Analyser
- **Keyboard**: Tab through interface, test all functionality

### Browser & Assistive Technology Support

#### Minimum Support Requirements
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
- **Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Keyboard Navigation**: All major browsers
- **High Contrast Mode**: Windows High Contrast, macOS Increase Contrast

## Implementation Guidelines

### Skip Links
```tsx
// ✅ REQUIRED - Skip navigation links
const SkipLinks = () => (
  <div className="skip-links">
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <a href="#navigation" className="skip-link">
      Skip to navigation
    </a>
  </div>
);

// CSS for skip links
const skipLinkStyles = {
  position: 'absolute',
  left: '-9999px',
  top: 0,
  padding: '8px 16px',
  backgroundColor: '#0F766E',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: 4,
  
  '&:focus': {
    left: 8,
    top: 8,
    zIndex: 9999,
  },
};
```

### Live Regions
```tsx
// ✅ CORRECT - Announce dynamic changes
const LiveRegion = ({ message, priority = 'polite' }) => (
  <div 
    role="status"
    aria-live={priority}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// Usage for form validation
const FormWithLiveRegion = () => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = async () => {
    try {
      await submitForm();
      setMessage('Form submitted successfully');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
      <LiveRegion message={message} />
    </>
  );
};
```

### Responsive Design
```typescript
// ✅ CORRECT - Accessible responsive patterns
const responsiveAccessibility = {
  // Touch targets (minimum 44x44px)
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
    padding: '12px 16px',
  },
  
  // Text scaling support
  textScaling: {
    fontSize: 'clamp(14px, 2.5vw, 18px)',
    lineHeight: 1.5,
    // Support up to 200% zoom
  },
  
  // Focus indicators scale with zoom
  focusIndicator: {
    outline: '3px solid #0F766E',
    outlineOffset: '2px',
    // Remains visible at all zoom levels
  },
};
```

## Common Accessibility Patterns

### Error Prevention & Recovery
```tsx
// ✅ CORRECT - Comprehensive error handling
const AccessibleForm = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = (name, value) => {
    // Real-time validation
    const fieldErrors = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldErrors }));
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Error summary at top */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="error-summary">
          <h2>Please correct the following errors:</h2>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#${field}`}>{error}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Form fields with inline validation */}
      <TextField
        id="email"
        label="Email"
        error={!!errors.email}
        helperText={errors.email}
        onBlur={(e) => {
          setTouched(prev => ({ ...prev, email: true }));
          validateField('email', e.target.value);
        }}
        aria-describedby={errors.email ? 'email-error' : 'email-help'}
        inputProps={{
          'aria-invalid': !!errors.email,
          'aria-required': true,
        }}
      />
    </form>
  );
};
```

### Data Visualization
```tsx
// ✅ CORRECT - Accessible charts and graphs
const AccessibleChart = ({ data, title }) => (
  <figure role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
    <h3 id="chart-title">{title}</h3>
    <div id="chart-desc" className="sr-only">
      Chart showing {/* detailed description */}
    </div>
    
    {/* Visual chart */}
    <div className="chart-visual">
      {/* Chart implementation */}
    </div>
    
    {/* Data table alternative */}
    <details>
      <summary>View data table</summary>
      <table>
        <caption>Data for {title}</caption>
        {/* Tabular representation of chart data */}
      </table>
    </details>
  </figure>
);
```

## Accessibility Testing Integration

### Test Tags & Organization
```typescript
// Use @a11y tag for accessibility-specific tests
describe('VocabularyTable @a11y @integration', () => {
  it('should support screen reader navigation', async () => {
    // Test screen reader compatibility
  });
  
  it('should maintain focus management', async () => {
    // Test focus behavior
  });
});
```

### CI/CD Integration
- **Pre-commit**: Basic accessibility linting (eslint-plugin-jsx-a11y)
- **Pre-push**: Automated accessibility testing (axe-core)
- **CI**: Full accessibility audit with reporting
- **Manual**: Regular testing with actual assistive technologies

## Resources & Tools

### Development Tools
- **ESLint Plugin**: eslint-plugin-jsx-a11y
- **Testing**: @testing-library/jest-dom, axe-core
- **Browser Extensions**: axe DevTools, WAVE
- **Color Contrast**: WebAIM Contrast Checker

### Documentation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/
- **UK Government Accessibility**: https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps

This comprehensive accessibility guide ensures IFLA Standards Platform meets all UK/EU legal requirements while providing an excellent user experience for all users, including those using assistive technologies.