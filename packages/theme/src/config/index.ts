// Configuration exports for IFLA theme

// Site configuration utilities are now in the contracts package
export {
  getSiteConfig,
  getSiteConfigMap,
  getAdminPortalConfig,
  getPortalUrl,
  SITE_CONFIG,
  ADMIN_PORTAL_CONFIG,
  type SiteKey,
  type Environment,
  type SiteConfigEntry,
  type AdminPortalConfig,
} from '@ifla/contracts';

// Footer configuration utility
export { createStandardFooter } from './footerConfig';
