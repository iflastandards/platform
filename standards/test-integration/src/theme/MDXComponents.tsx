// MDXComponents.tsx
// Import the original MDX components
import MDXComponents from '@theme-original/MDXComponents';
// Import all shared theme components dynamically
import * as ThemeComponents from '@ifla/theme';

// Export the enhanced MDX components
export default {
  // Include all the original components
  ...MDXComponents,
  // Add all shared theme components dynamically
  ...ThemeComponents,
};