# Integrating Site Management with Docusaurus Navbar

The `@ifla/theme` package provides a `SiteManagementLink` component that can be easily integrated into Docusaurus sites to provide direct access to the admin portal.

## Quick Integration

### Method 1: Add to Navbar Items (Recommended)

Add the Site Management link directly to your `docusaurus.config.ts` navbar items:

```typescript
// docusaurus.config.ts
const config: Config = {
  // ... other config
  customFields: {
    siteKey: 'your-site-key', // Required for SiteManagementLink
  },
  themeConfig: {
    navbar: {
      items: [
        // ... your existing items
        {
          type: 'html',
          position: 'right',
          value: '<a href="http://localhost:3007/dashboard/your-site-key" class="navbar__link" target="_blank" rel="noopener noreferrer" style="background: var(--ifm-color-primary); color: white; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-weight: 500; margin-left: 0.5rem;">Manage Site</a>',
        },
      ],
    },
  },
};
```

### Method 2: Using the React Component

For more advanced integration, you can swizzle navbar components and use the React component:

```typescript
// In a swizzled navbar component
import { SiteManagementNavbarLink } from '@ifla/theme/components/SiteManagementLink';

export default function CustomNavbar() {
  return (
    <div className="navbar">
      {/* ... other navbar content */}
      <SiteManagementNavbarLink />
    </div>
  );
}
```

### Method 3: Add to Individual Pages

Add the link to specific pages or components:

```tsx
import { SiteManagementButton } from '@ifla/theme/components/SiteManagementLink';

export default function MyComponent() {
  return (
    <div>
      <h1>My Page</h1>
      <SiteManagementButton size="sm" />
    </div>
  );
}
```

## Component Variants

The SiteManagementLink component comes in several pre-configured variants:

### 1. SiteManagementNavbarLink
```tsx
import { SiteManagementNavbarLink } from '@ifla/theme/components/SiteManagementLink';

<SiteManagementNavbarLink />
```
- Styled for navbar integration
- Appears as a primary-colored button
- Opens in new tab

### 2. SiteManagementButton  
```tsx
import { SiteManagementButton } from '@ifla/theme/components/SiteManagementLink';

<SiteManagementButton size="lg" />
```
- Styled as a prominent button
- Available sizes: 'sm', 'md', 'lg'

### 3. SiteManagementTextLink
```tsx
import { SiteManagementTextLink } from '@ifla/theme/components/SiteManagementLink';

<SiteManagementTextLink>Custom Link Text</SiteManagementTextLink>
```
- Styled as a regular text link
- Customizable text content

## Configuration

### Required: Site Key

The component requires a `siteKey` to determine which admin dashboard to link to. This can be provided in several ways:

1. **Via customFields (Recommended):**
```typescript
// docusaurus.config.ts
customFields: {
  siteKey: 'your-site-key',
},
```

2. **Auto-detection:** The component will attempt to detect the site key from:
   - Site title (for known IFLA sites)
   - Base URL path
   - Current pathname

### Site Key Mapping

| Site | Site Key | Admin URL |
|------|----------|-----------|
| Portal | `portal` | `/dashboard/portal` |
| ISBD Manifestation | `ISBDM` | `/dashboard/ISBDM` |
| Library Reference Model | `LRM` | `/dashboard/LRM` |
| FRBR | `FRBR` | `/dashboard/FRBR` |
| ISBD | `isbd` | `/dashboard/isbd` |
| MulDiCat | `muldicat` | `/dashboard/muldicat` |
| UNIMARC | `unimarc` | `/dashboard/unimarc` |

### Environment Configuration

The component automatically detects the environment:

- **Development:** Links to `http://localhost:3007`
- **Production:** Links to configured `ADMIN_PORTAL_URL` environment variable

## Styling

The component includes built-in CSS modules for consistent styling. You can override styles by:

1. **Custom CSS classes:**
```tsx
<SiteManagementNavbarLink className="my-custom-class" />
```

2. **CSS variables:**
```css
:root {
  --ifm-color-primary: #your-color;
}
```

## Testing

To test the integration:

1. Start the admin portal: `nx serve admin-portal`
2. Start your Docusaurus site: `nx start your-site`
3. Navigate to your site and look for the "Manage Site" link
4. Click the link to open the admin portal in a new tab

## Example Implementation

Here's a complete example for the `newtest` site:

```typescript
// standards/newtest/docusaurus.config.ts
const config: Config = {
  title: 'New Test Site',
  // ... other config
  customFields: {
    siteKey: 'newtest',
  },
  themeConfig: {
    navbar: {
      items: [
        // ... existing items
        {
          type: 'html',
          position: 'right',
          value: '<a href="http://localhost:3007/dashboard/newtest" class="navbar__link site-management-navbar-link" target="_blank" rel="noopener noreferrer">Manage Site</a>',
        },
      ],
    },
  },
};
```

## Security Considerations

- Links open in new tabs (`target="_blank"`) with security attributes
- Admin portal requires authentication before granting access
- Site keys are validated on the admin portal side
- No sensitive information is exposed in the client-side code

## Troubleshooting

### Link Not Appearing
1. Check that `siteKey` is properly configured in `customFields`
2. Verify the admin portal is running on the expected port
3. Check browser console for any JavaScript errors

### Wrong Admin URL
1. Verify the site key matches the expected mapping
2. Check environment variables for production deployments
3. Ensure the admin portal URL is correctly configured

### Authentication Issues
1. Make sure you're signed in to the admin portal
2. Verify your GitHub account has the necessary permissions
3. Check that the site key exists in the admin portal configuration