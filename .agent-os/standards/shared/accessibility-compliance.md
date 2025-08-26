# Accessibility Compliance Standards

## Accessibility Philosophy

### Universal Design Principles
- **Inclusive by Default**: Design for all users from the start, not as an afterthought
- **Progressive Enhancement**: Ensure core functionality works without JavaScript or CSS
- **Multiple Access Methods**: Support keyboard, mouse, touch, and assistive technologies
- **Clear Communication**: Use plain language and intuitive interfaces

### WCAG 2.1 Level AA Compliance
All components and content must meet WCAG 2.1 Level AA standards across four principles:
- **Perceivable**: Information presented in ways users can perceive
- **Operable**: Interface components users can operate
- **Understandable**: Information and UI operation is understandable
- **Robust**: Content can be interpreted by assistive technologies

## Technical Implementation

### Semantic HTML Standards

#### Document Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - IFLA Standards</title>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <!-- Navigation content -->
    </nav>
  </header>
  
  <main id="main" role="main">
    <h1>Page Heading</h1>
    <!-- Main content -->
  </main>
  
  <footer role="contentinfo">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

#### Heading Hierarchy
```html
<!-- Always start with h1, follow logical progression -->
<h1>ISBD - International Standard Bibliographic Description</h1>
  <h2>Area 1: Title and Statement of Responsibility</h2>
    <h3>Title Proper</h3>
    <h3>Parallel Titles</h3>
  <h2>Area 2: Edition Area</h2>
    <h3>Edition Statement</h3>

<!-- Never skip levels -->
<!-- ❌ Bad: h1 → h3 -->
<!-- ✅ Good: h1 → h2 → h3 -->
```

#### Form Accessibility
```html
<form>
  <fieldset>
    <legend>User Account Information</legend>
    
    <div class="form-group">
      <label for="user-name">Full Name *</label>
      <input 
        type="text" 
        id="user-name" 
        name="name"
        required
        aria-required="true"
        aria-describedby="name-help name-error"
        aria-invalid="false"
      />
      <div id="name-help" class="help-text">
        Enter your full name as it appears on official documents
      </div>
      <div id="name-error" class="error-text" aria-live="polite">
        <!-- Error message populated dynamically -->
      </div>
    </div>
    
    <div class="form-group">
      <label for="user-role">Role</label>
      <select id="user-role" name="role" aria-describedby="role-help">
        <option value="">Select a role</option>
        <option value="cataloger">Cataloger</option>
        <option value="administrator">Administrator</option>
        <option value="editor">Editor</option>
      </select>
      <div id="role-help" class="help-text">
        Choose your primary role in the system
      </div>
    </div>
  </fieldset>
  
  <button type="submit" aria-describedby="submit-help">
    Create Account
  </button>
  <div id="submit-help" class="sr-only">
    This will create your user account and send a confirmation email
  </div>
</form>
```

### ARIA Implementation

#### Interactive Components
```typescript
// VocabularyTable component with comprehensive ARIA
function VocabularyTable({ vocabulary, searchable = true }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  return (
    <section aria-labelledby="vocabulary-heading">
      <h2 id="vocabulary-heading">
        Vocabulary Terms ({filteredVocabulary.length} of {vocabulary.length})
      </h2>
      
      {searchable && (
        <div className="search-controls" role="search">
          <label htmlFor="vocabulary-search">Search Terms</label>
          <input
            id="vocabulary-search"
            type="search"
            placeholder="Search terms or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-describedby="search-help"
            aria-expanded={false}
            aria-haspopup={false}
          />
          <div id="search-help" className="sr-only">
            Type to filter vocabulary terms by name or definition. 
            Results update automatically as you type.
          </div>
        </div>
      )}
      
      <div className="filter-controls">
        <label htmlFor="category-filter">Filter by Category</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-describedby="filter-help"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        <div id="filter-help" className="sr-only">
          Select a category to show only terms from that category
        </div>
      </div>
      
      {filteredVocabulary.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          <p>No vocabulary terms found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            aria-describedby="reset-help"
          >
            Clear All Filters
          </button>
          <div id="reset-help" className="sr-only">
            This will clear search and category filters to show all terms
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table 
            className="vocabulary-table" 
            role="table"
            aria-labelledby="vocabulary-heading"
            aria-describedby="table-help"
          >
            <caption id="table-help" className="sr-only">
              Vocabulary terms table with {filteredVocabulary.length} entries. 
              Use arrow keys to navigate between cells.
            </caption>
            
            <thead>
              <tr>
                <th scope="col" aria-sort="none">Term</th>
                <th scope="col" aria-sort="none">Definition</th>
                <th scope="col" aria-sort="none">Category</th>
                <th scope="col" aria-sort="none">Status</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredVocabulary.map((term, index) => (
                <tr 
                  key={term.id}
                  className={onTermSelect ? 'clickable' : ''}
                  onClick={() => onTermSelect?.(term)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTermSelect?.(term);
                    }
                  }}
                  role={onTermSelect ? "button" : undefined}
                  tabIndex={onTermSelect ? 0 : undefined}
                  aria-describedby={`term-${term.id}-details`}
                >
                  <th scope="row">{term.term}</th>
                  <td>
                    {term.definition}
                    {term.examples && term.examples.length > 0 && (
                      <div className="examples">
                        <strong>Examples:</strong>
                        <ul>
                          {term.examples.map((example, i) => (
                            <li key={i}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td>
                    <span 
                      className={`category-badge category-${term.category}`}
                      aria-label={`Category: ${term.category}`}
                    >
                      {term.category}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`status-badge status-${term.status || 'active'}`}
                      aria-label={`Status: ${term.status || 'active'}`}
                    >
                      {term.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Screen reader summary -->
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing {filteredVocabulary.length} of {vocabulary.length} vocabulary terms
        {searchTerm && ` matching "${searchTerm}"`}
        {selectedCategory !== 'all' && ` in category "${selectedCategory}"`}.
      </div>
    </section>
  );
}
```

#### Navigation Components
```typescript
// NavigationCard with full accessibility support
function NavigationCard({ title, description, href, external }: Props) {
  return (
    <div className="navigation-card">
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="card-link"
          aria-label={`${title} (opens in new tab)`}
          aria-describedby={`${title.replace(/\s+/g, '-').toLowerCase()}-desc`}
        >
          <div className="card-content">
            <h3>{title}</h3>
            <p id={`${title.replace(/\s+/g, '-').toLowerCase()}-desc`}>
              {description}
            </p>
            <span className="external-indicator" aria-hidden="true">
              ↗
            </span>
          </div>
        </a>
      ) : (
        <Link
          to={href}
          className="card-link"
          aria-describedby={`${title.replace(/\s+/g, '-').toLowerCase()}-desc`}
        >
          <div className="card-content">
            <h3>{title}</h3>
            <p id={`${title.replace(/\s+/g, '-').toLowerCase()}-desc`}>
              {description}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}
```

### Keyboard Navigation

#### Focus Management
```css
/* Visible focus indicators */
*:focus {
  outline: 2px solid var(--ifla-color-focus);
  outline-offset: 2px;
  transition: outline 0.2s ease;
}

/* Enhanced focus for interactive elements */
button:focus,
input:focus,
select:focus,
textarea:focus,
a:focus {
  outline: 3px solid var(--ifla-color-focus);
  outline-offset: 1px;
  box-shadow: 0 0 0 1px var(--ifla-color-focus-shadow);
}

/* Focus within containers */
.card:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### Skip Links
```css
/* Skip link - hidden until focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--ifla-color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: top 0.3s ease;
  z-index: 9999;
}

.skip-link:focus {
  top: 6px;
}
```

### Color and Contrast

#### Color Palette (WCAG AA Compliant)
```css
:root {
  /* Primary colors with 4.5:1 contrast ratio */
  --ifla-color-primary: #1976d2;        /* Blue - 4.5:1 on white */
  --ifla-color-primary-dark: #1565c0;   /* Dark blue - 7:1 on white */
  --ifla-color-secondary: #dc004e;      /* Red - 4.5:1 on white */
  
  /* Text colors */
  --ifla-color-text: #212529;           /* Dark gray - 16.7:1 on white */
  --ifla-color-text-secondary: #6c757d; /* Medium gray - 4.5:1 on white */
  
  /* Background colors */
  --ifla-color-background: #ffffff;
  --ifla-color-background-secondary: #f8f9fa;
  --ifla-color-background-tertiary: #e9ecef;
  
  /* Interactive states */
  --ifla-color-focus: #0056b3;          /* Focus outline */
  --ifla-color-focus-shadow: rgba(0, 86, 179, 0.25);
  --ifla-color-hover: #f8f9fa;
  --ifla-color-active: #e9ecef;
  
  /* Status colors (WCAG compliant) */
  --ifla-color-success: #28a745;        /* Green - 4.5:1 */
  --ifla-color-warning: #856404;        /* Dark yellow - 4.5:1 */
  --ifla-color-error: #dc3545;          /* Red - 4.5:1 */
  --ifla-color-info: #0c5460;           /* Dark cyan - 4.5:1 */
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --ifla-color-text: #f8f9fa;
    --ifla-color-text-secondary: #adb5bd;
    --ifla-color-background: #212529;
    --ifla-color-background-secondary: #343a40;
    --ifla-color-background-tertiary: #495057;
  }
}
```

#### Status Indicators
```css
/* Status badges with accessible colors and icons */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.status-active::before {
  content: "✓";
  color: #28a745;
  font-weight: bold;
}

.status-deprecated {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
}

.status-deprecated::before {
  content: "⚠";
  color: #dc3545;
  font-weight: bold;
}
```

## Content Accessibility

### Plain Language Standards
- **Reading level**: Write at 8th-grade reading level or lower
- **Sentence length**: Maximum 20 words per sentence
- **Paragraph length**: Maximum 3-4 sentences per paragraph
- **Active voice**: Use active voice over passive voice
- **Common words**: Choose familiar words over technical jargon

#### Example Transformations
```markdown
<!-- ❌ Complex, passive voice -->
"The bibliographic description methodology that has been implemented by the International Federation of Library Associations is utilized for the standardization of cataloging procedures across multiple institutional contexts."

<!-- ✅ Simple, active voice -->
"IFLA created a standard method for describing library materials. Libraries worldwide use this method to catalog books, journals, and other resources."
```

### Image and Media Accessibility

#### Alternative Text Guidelines
```html
<!-- Decorative images -->
<img src="decorative-border.svg" alt="" aria-hidden="true" />

<!-- Informative images -->
<img 
  src="isbd-area-diagram.svg" 
  alt="Diagram showing ISBD's eight areas: Area 0 through Area 8, with arrows indicating the flow from content type to bibliographic details to physical description" 
/>

<!-- Complex images with detailed descriptions -->
<figure>
  <img 
    src="cataloging-workflow.png" 
    alt="Cataloging workflow diagram" 
    aria-describedby="workflow-description"
  />
  <figcaption id="workflow-description">
    <h3>Cataloging Workflow Process</h3>
    <p>The diagram shows four main steps:</p>
    <ol>
      <li>Resource identification and classification</li>
      <li>ISBD area completion (Areas 0-8)</li>
      <li>Authority control and subject assignment</li>
      <li>Record validation and publication</li>
    </ol>
  </figcaption>
</figure>
```

#### Video and Audio Content
```html
<!-- Video with captions and transcript -->
<video controls aria-describedby="video-description">
  <source src="isbd-tutorial.mp4" type="video/mp4" />
  <track kind="captions" src="isbd-tutorial-captions.vtt" srclang="en" label="English" default />
  <track kind="descriptions" src="isbd-tutorial-descriptions.vtt" srclang="en" label="Audio descriptions" />
  
  <p>Your browser doesn't support video playback. 
     <a href="isbd-tutorial-transcript.html">Read the full transcript</a>.
  </p>
</video>
<div id="video-description">
  <h3>Video: Introduction to ISBD Areas</h3>
  <p>Duration: 15 minutes | <a href="isbd-tutorial-transcript.html">Full transcript available</a></p>
</div>
```

## Testing and Validation

### Automated Testing
```typescript
// Comprehensive accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

describe('VocabularyTable Accessibility @accessibility @critical', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(
      <VocabularyTable vocabulary={mockVocabulary} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<VocabularyTable vocabulary={mockVocabulary} searchable />);
    
    // Tab to search input
    await user.tab();
    expect(screen.getByLabelText(/search terms/i)).toHaveFocus();
    
    // Tab to category filter
    await user.tab();
    expect(screen.getByLabelText(/category/i)).toHaveFocus();
    
    // Tab to first interactive row (if clickable)
    await user.tab();
    const firstRow = screen.getByRole('button');
    expect(firstRow).toHaveFocus();
    
    // Activate with Enter
    await user.keyboard('{Enter}');
    // Verify activation behavior
  });

  it('should have proper ARIA labels and descriptions', () => {
    render(<VocabularyTable vocabulary={mockVocabulary} />);
    
    // Check section labeling
    expect(screen.getByRole('region')).toHaveAccessibleName(/vocabulary terms/i);
    
    // Check table structure
    const table = screen.getByRole('table');
    expect(table).toHaveAccessibleName(/vocabulary terms/i);
    expect(table).toHaveAccessibleDescription();
    
    // Check form controls
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAccessibleName(/search/i);
    expect(searchInput).toHaveAccessibleDescription();
  });

  it('should announce dynamic content changes', async () => {
    const user = userEvent.setup();
    render(<VocabularyTable vocabulary={mockVocabulary} searchable />);
    
    // Search for terms
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'Area 0');
    
    // Verify live region updates
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent(/showing.*1.*of.*terms/i);
  });

  it('should handle high contrast mode', () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    render(<VocabularyTable vocabulary={mockVocabulary} />);
    
    // Verify high contrast styles are applied
    const table = screen.getByRole('table');
    const computedStyle = window.getComputedStyle(table);
    
    // Check for enhanced borders and colors
    expect(computedStyle.borderWidth).not.toBe('0px');
  });
});
```

### Manual Testing Checklist

#### Keyboard Navigation Testing
- [ ] All interactive elements reachable via Tab key
- [ ] Tab order follows logical reading order
- [ ] No keyboard traps (can always tab away)
- [ ] Enter and Space activate buttons/links
- [ ] Arrow keys work in menus and data tables
- [ ] Escape key dismisses modals/dropdowns
- [ ] Focus indicators clearly visible

#### Screen Reader Testing
Test with multiple screen readers:
- [ ] **NVDA** (Windows, free)
- [ ] **JAWS** (Windows, commercial)  
- [ ] **VoiceOver** (macOS, built-in)
- [ ] **Orca** (Linux, built-in)
- [ ] **TalkBack** (Android, built-in)

#### Browser Testing
- [ ] **Chrome** with ChromeVox extension
- [ ] **Firefox** with built-in accessibility tools
- [ ] **Safari** with VoiceOver
- [ ] **Edge** with Narrator
- [ ] Mobile browsers with screen readers enabled

### Accessibility Audit Tools

#### Browser Extensions
- **axe DevTools**: Comprehensive WCAG testing
- **WAVE**: Web accessibility evaluation  
- **Lighthouse**: Performance and accessibility audit
- **Color Oracle**: Color blindness simulation

#### Command Line Tools
```bash
# Pa11y for automated accessibility testing
npm install -g pa11y
pa11y http://localhost:3000/isbd/vocabulary --standard WCAG2AA

# axe-cli for CI/CD integration
npm install -g @axe-core/cli  
axe http://localhost:3000 --tags wcag2a,wcag2aa --exit
```

## Compliance Documentation

### Accessibility Statement Template
```markdown
# Accessibility Statement - IFLA Standards Platform

## Commitment to Accessibility
The International Federation of Library Associations is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

## Conformance Status
The IFLA Standards Platform is partially conformant with WCAG 2.1 Level AA. "Partially conformant" means that some parts of the content do not fully conform to the accessibility standard.

## Current Accessibility Features
- ✅ Semantic HTML structure with proper headings
- ✅ Keyboard navigation support for all interactive elements
- ✅ ARIA labels and descriptions for complex components
- ✅ Color contrast ratios meeting WCAG AA standards
- ✅ Alternative text for informative images
- ✅ Skip links for efficient navigation
- ✅ Responsive design supporting zoom up to 200%

## Known Issues and Limitations
- 🔄 Some third-party embedded content may not meet accessibility standards
- 🔄 PDF documents are being updated for screen reader compatibility
- 🔄 Video content is being captioned and audio described

## Feedback and Contact Information
We welcome feedback on the accessibility of the IFLA Standards Platform. Please contact us:

- **Email**: [accessibility@ifla.org]
- **Phone**: [contact number]
- **Address**: [mailing address]

## Assessment and Testing
This statement was created on [date] and last updated on [date]. The assessment was conducted using:
- Automated testing with axe-core and WAVE
- Manual testing with keyboard navigation
- Screen reader testing with NVDA, JAWS, and VoiceOver
- User testing with people who have disabilities
```

This accessibility framework ensures the IFLA Standards Platform meets international accessibility standards and provides an inclusive experience for all users.