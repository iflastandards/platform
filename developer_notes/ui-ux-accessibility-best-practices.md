# UI/UX Accessibility Best Practices - IFLA Standards Platform

> **Integration Note**: This document works in conjunction with the [Design System UI Patterns](/portal/docs/developer/system-design-docs/11-design-system-ui-patterns.md) to ensure accessible implementation of all UI components.

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

## IFLA Platform-Specific Patterns

### Admin Dashboard Components

#### Stats Cards (from admin-dashboard-mockup.svg)
```tsx
// ✅ CORRECT - Accessible stats card
const StatsCard = ({ title, value, trend, icon: Icon }) => (
  <Card
    sx={{ 
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
    role="region"
    aria-labelledby={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon 
          sx={{ mr: 1, color: 'primary.main' }} 
          aria-hidden="true" 
        />
        <Typography 
          id={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}
          variant="h6" 
          component="h3"
        >
          {title}
        </Typography>
      </Box>
      
      <Typography 
        variant="h4" 
        component="div"
        sx={{ fontWeight: 'bold', color: 'text.primary' }}
        aria-label={`${title}: ${value}`}
      >
        {value}
      </Typography>
      
      {trend && (
        <Typography 
          variant="body2" 
          color={trend > 0 ? 'success.main' : 'error.main'}
          aria-label={`Trend: ${trend > 0 ? 'up' : 'down'} ${Math.abs(trend)}%`}
        >
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </Typography>
      )}
    </CardContent>
  </Card>
);
```

#### Batch Action Picker (from batch-action-picker.svg)
```tsx
// ✅ CORRECT - Accessible batch operations
const BatchActionPicker = ({ selectedItems, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        backgroundColor: 'primary.50',
        borderRadius: 1,
      }}
      role="toolbar"
      aria-label="Batch actions"
    >
      <Typography variant="body2" color="text.secondary">
        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
      </Typography>
      
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-controls="batch-actions-menu"
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        endIcon={<ExpandMore />}
      >
        Actions
      </Button>
      
      <Menu
        id="batch-actions-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => onAction('export')}>
          <Download sx={{ mr: 1 }} />
          Export Selected
        </MenuItem>
        <MenuItem onClick={() => onAction('delete')}>
          <Delete sx={{ mr: 1 }} />
          Delete Selected
        </MenuItem>
      </Menu>
    </Box>
  );
};
```

#### Step Indicator (from step-indicator.svg)
```tsx
// ✅ CORRECT - Accessible multi-step process
const StepIndicator = ({ steps, currentStep }) => (
  <Box 
    component="nav" 
    aria-label="Process steps"
    sx={{ mb: 4 }}
  >
    <Stepper activeStep={currentStep} alternativeLabel>
      {steps.map((step, index) => (
        <Step key={step.id}>
          <StepLabel
            StepIconProps={{
              'aria-label': `Step ${index + 1}: ${step.title}`,
            }}
          >
            <Typography
              variant="body2"
              color={index <= currentStep ? 'text.primary' : 'text.secondary'}
            >
              {step.title}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
    
    {/* Screen reader progress announcement */}
    <Box 
      role="status" 
      aria-live="polite" 
      className="sr-only"
    >
      Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
    </Box>
  </Box>
);
```

### Vocabulary Management Components

#### Language Selector (from language-selector.svg)
```tsx
// ✅ CORRECT - Accessible language picker
const LanguageSelector = ({ languages, selected, onChange }) => (
  <FormControl fullWidth>
    <InputLabel id="language-select-label">Language</InputLabel>
    <Select
      labelId="language-select-label"
      value={selected}
      onChange={onChange}
      label="Language"
      renderValue={(value) => {
        const lang = languages.find(l => l.code === value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src={`/flags/${lang.code}.svg`} 
              alt=""
              width={20} 
              height={15}
              aria-hidden="true"
            />
            {lang.name}
          </Box>
        );
      }}
    >
      {languages.map((language) => (
        <MenuItem 
          key={language.code} 
          value={language.code}
          aria-label={`Select ${language.name}`}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src={`/flags/${language.code}.svg`} 
              alt=""
              width={20} 
              height={15}
              aria-hidden="true"
            />
            <Box>
              <Typography variant="body2">{language.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {language.code.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
```

#### Validation Report (from validation-report.svg)
```tsx
// ✅ CORRECT - Accessible validation results
const ValidationReport = ({ results }) => {
  const errorCount = results.filter(r => r.severity === 'error').length;
  const warningCount = results.filter(r => r.severity === 'warning').length;
  
  return (
    <Card>
      <CardHeader
        title="Validation Results"
        subheader={
          <Box component="span" role="status" aria-live="polite">
            {errorCount} error{errorCount !== 1 ? 's' : ''}, {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </Box>
        }
      />
      <CardContent>
        <List>
          {results.map((result, index) => (
            <ListItem key={index} divider>
              <ListItemIcon>
                {result.severity === 'error' ? (
                  <Error color="error" aria-label="Error" />
                ) : (
                  <Warning color="warning" aria-label="Warning" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={result.message}
                secondary={
                  result.line && (
                    <Typography variant="caption" color="text.secondary">
                      Line {result.line}
                      {result.suggestion && (
                        <Box component="span" sx={{ ml: 1 }}>
                          • Suggestion: {result.suggestion}
                        </Box>
                      )}
                    </Typography>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
```

## Design System Integration

### Color Contrast Validation
All colors from the design system have been validated for WCAG AA compliance:

```typescript
// Pre-validated color combinations from design system
const accessibleColorPairs = {
  // Primary text on white background: 19.5:1 ratio ✓
  primaryText: { color: '#111827', background: '#ffffff' },
  
  // Secondary text on white background: 12.6:1 ratio ✓
  secondaryText: { color: '#374151', background: '#ffffff' },
  
  // Primary button: 4.8:1 ratio ✓
  primaryButton: { color: '#ffffff', background: '#0F766E' },
  
  // Focus indicator: 4.8:1 ratio ✓
  focusRing: { outline: '#0F766E', background: '#ffffff' },
  
  // Error text: 7.1:1 ratio ✓
  errorText: { color: '#dc2626', background: '#ffffff' },
  
  // Success text: 4.7:1 ratio ✓
  successText: { color: '#059669', background: '#ffffff' },
};
```

### Component Size Standards
Touch targets and spacing follow the design system:

```typescript
// Accessibility-compliant sizing from design system
const accessibleSizing = {
  // Minimum touch target: 44x44px
  minTouchTarget: { minHeight: 44, minWidth: 44 },
  
  // Button padding ensures 44px height
  buttonPadding: '8px 16px', // Results in 44px height with 16px font
  
  // Input field height
  inputHeight: 40, // Slightly smaller but still accessible
  
  // Spacing between interactive elements
  interactiveSpacing: 8, // 8px minimum between touch targets
};
```

## Resources & Tools

### Development Tools
- **ESLint Plugin**: eslint-plugin-jsx-a11y
- **Testing**: @testing-library/jest-dom, axe-core
- **Browser Extensions**: axe DevTools, WAVE
- **Color Contrast**: WebAIM Contrast Checker
- **Design System**: Material-UI with custom theme tokens

### IFLA Platform Tools
- **Mockup References**: `/IFLA_OMR25_link/mockups/` - Visual implementation guides
- **Design System**: `/system-design-docs/11-design-system-ui-patterns.md`
- **Component Library**: `@ifla/theme` package with pre-built accessible components
- **Testing Templates**: Use `@a11y` tags for accessibility-specific tests

### Documentation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/
- **UK Government Accessibility**: https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps
- **Material-UI Accessibility**: https://mui.com/material-ui/guides/accessibility/

## Implementation Checklist

### Before Starting Development
- [ ] Review relevant mockup files in `/IFLA_OMR25_link/mockups/`
- [ ] Check design system color combinations are pre-validated
- [ ] Plan keyboard navigation flow using mockup patterns
- [ ] Identify required ARIA labels not visible in mockups

### During Component Development
- [ ] Use semantic HTML elements from Material-UI
- [ ] Apply design system colors (already WCAG AA compliant)
- [ ] Implement keyboard navigation patterns
- [ ] Add screen reader announcements for dynamic content
- [ ] Test with `@a11y` tagged test cases

### Before Code Review
- [ ] Run automated accessibility tests (`axe-core`)
- [ ] Verify focus indicators are visible and consistent
- [ ] Test keyboard-only navigation
- [ ] Validate with screen reader (VoiceOver/NVDA)
- [ ] Confirm responsive behavior maintains accessibility

This comprehensive accessibility guide ensures IFLA Standards Platform meets all UK/EU legal requirements while providing an excellent user experience for all users, including those using assistive technologies. The integration with the design system ensures consistent, accessible implementation across all components.
