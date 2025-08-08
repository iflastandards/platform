import jsxA11y from 'eslint-plugin-jsx-a11y';

/**
 * Accessibility-specific ESLint configuration
 * Enforces WCAG 2.1 AA compliance and accessibility best practices
 */
export default [
  // Accessibility configuration for JSX/TSX files
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Recommended accessibility rules
      ...jsxA11y.configs.recommended.rules,
      
      // WCAG 2.1 AA Level Rules (Critical)
      'jsx-a11y/alt-text': ['error', {
        elements: ['img', 'object', 'area', 'input[type="image"]'],
        img: ['Image'],
        object: ['Object'],
        area: ['Area'],
        'input[type="image"]': ['InputImage'],
      }],
      'jsx-a11y/anchor-has-content': ['error', { components: ['Link'] }],
      'jsx-a11y/anchor-is-valid': ['error', {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      }],
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: false }],
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/autocomplete-valid': ['error', { inputComponents: ['Input'] }],
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/control-has-associated-label': ['error', {
        labelAttributes: ['label'],
        controlComponents: ['CustomComponent'],
        ignoreElements: [
          'audio',
          'canvas',
          'embed',
          'input',
          'textarea',
          'tr',
          'video',
        ],
        ignoreRoles: [
          'grid',
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'row',
          'tablist',
          'toolbar',
          'tree',
          'treegrid',
        ],
        depth: 5,
      }],
      'jsx-a11y/heading-has-content': ['error', { components: ['Heading', 'MyHeading'] }],
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': ['error', {
        labelComponents: ['CustomLabel'],
        labelAttributes: ['inputLabel'],
        controlComponents: ['CustomInput'],
        assert: 'both',
        depth: 25,
      }],
      'jsx-a11y/lang': 'error',
      'jsx-a11y/media-has-caption': ['error', {
        audio: ['Audio'],
        video: ['Video'],
        track: ['Track'],
      }],
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/no-distracting-elements': ['error', {
        elements: ['marquee', 'blink'],
      }],
      'jsx-a11y/no-interactive-element-to-noninteractive-role': ['error', {
        tr: ['none', 'presentation'],
      }],
      'jsx-a11y/no-noninteractive-element-interactions': ['error', {
        handlers: [
          'onClick',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
      }],
      'jsx-a11y/no-noninteractive-element-to-interactive-role': ['error', {
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
      }],
      'jsx-a11y/no-noninteractive-tabindex': ['error', {
        tags: [],
        roles: ['tabpanel'],
      }],
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': ['error', {
        handlers: [
          'onClick',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
      }],
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      
      // Additional WCAG 2.1 AA Rules (Warnings - should be addressed)
      'jsx-a11y/accessible-emoji': 'warn',
      'jsx-a11y/aria-describedby-has-tabindex': 'warn',
      'jsx-a11y/no-aria-hidden-on-focusable': 'warn',
      'jsx-a11y/prefer-tag-over-role': 'warn',
      
      // Form Accessibility (Critical for admin interfaces)
      'jsx-a11y/label-has-for': 'off', // Deprecated in favor of label-has-associated-control
      
      // Custom rules for better UX
      'jsx-a11y/anchor-ambiguous-text': 'warn', // Avoid "click here", "read more"
      'jsx-a11y/no-generic-link-text': 'warn', // Custom rule if available
    },
    settings: {
      'jsx-a11y': {
        polymorphicPropName: 'as',
        components: {
          // Map custom components to their semantic equivalents
          Button: 'button',
          Link: 'a',
          Image: 'img',
          Input: 'input',
          TextArea: 'textarea',
          Select: 'select',
          Heading: 'h1',
          Text: 'span',
          Box: 'div',
          List: 'ul',
          ListItem: 'li',
          Nav: 'nav',
          Main: 'main',
          Header: 'header',
          Footer: 'footer',
          Section: 'section',
          Article: 'article',
          Aside: 'aside',
        },
      },
    },
  },
  
  // Accessibility configuration for regular JS/TS files (limited scope)
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Only apply non-JSX specific accessibility rules
      'jsx-a11y/lang': 'error',
      'jsx-a11y/html-has-lang': 'error',
    },
  },
  
  // Stricter rules for critical accessibility components
  {
    files: [
      '**/components/accessibility/**/*.{jsx,tsx}',
      '**/components/ui/**/*.{jsx,tsx}',
      '**/components/forms/**/*.{jsx,tsx}',
      '**/components/navigation/**/*.{jsx,tsx}',
    ],
    rules: {
      // Upgrade warnings to errors for critical components
      'jsx-a11y/accessible-emoji': 'error',
      'jsx-a11y/aria-describedby-has-tabindex': 'error',
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'jsx-a11y/prefer-tag-over-role': 'error',
      'jsx-a11y/anchor-ambiguous-text': 'error',
      
      // Additional strict rules for UI components
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-access-key': 'error',
    },
  },
  
  // Relaxed rules for test files
  {
    files: [
      '**/*.test.{jsx,tsx}',
      '**/*.spec.{jsx,tsx}',
      '**/__tests__/**/*.{jsx,tsx}',
      '**/test/**/*.{jsx,tsx}',
      '**/tests/**/*.{jsx,tsx}',
    ],
    rules: {
      // Allow some accessibility violations in test files
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      
      // But still enforce critical accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
    },
  },
];