import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getAdminPortalConfig } from '../../config/siteConfig';

interface FooterManagementLinkProps {
  className?: string;
}

/**
 * Simple link for Docusaurus site footers pointing to the admin management dashboard.
 * This replaces the complex SiteManagementLink which has been moved to the admin app.
 */
export default function FooterManagementLink({ 
  className = ''
}: FooterManagementLinkProps) {
  const { siteConfig } = useDocusaurusContext();
  
  // Extract site key from various sources
  const getSiteKey = (): string | null => {
    // First try to get it from siteConfig customFields
    if (siteConfig.customFields?.siteKey) {
      return siteConfig.customFields.siteKey as string;
    }
    
    // Try to detect from title or other config
    const title = siteConfig.title;
    
    // Map known site titles to keys
    const titleToKey: Record<string, string> = {
      'IFLA Portal': 'portal',
      'ISBD Manifestation': 'isbdm', // Use lowercase for consistency
      'Library Reference Model': 'lrm',
      'FRBR': 'frbr',
      'International Standard Bibliographic Description': 'isbd',
      'Multilingual Dictionary of Cataloguing Terms': 'muldicat',
      'UNIMARC Format': 'unimarc',
      'New Test Site': 'newtest',
    };
    
    if (titleToKey[title]) {
      return titleToKey[title];
    }
    
    // Try to extract from baseUrl or URL path
    const baseUrl = siteConfig.baseUrl;
    if (baseUrl && baseUrl !== '/') {
      const pathParts = baseUrl.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1].toLowerCase();
      }
    }
    
    return null;
  };

  const siteKey = getSiteKey();
  
  // Don't render if we can't determine the site key
  if (!siteKey) {
    console.warn('FooterManagementLink: Could not determine site key from siteConfig');
    return null;
  }

  // Use centralized admin portal configuration
  const adminConfig = getAdminPortalConfig('local'); // For now, always use local in development
  const adminUrl = `${adminConfig.url}/dashboard/${siteKey}`;
  
  return (
    <a
      href={adminUrl}
      className={`footer__link-item ${className}`.trim()}
      target="_blank"
      rel="noopener noreferrer"
    >
      Management
    </a>
  );
}

// Keep legacy exports for compatibility, but they now point to FooterManagementLink
export const SiteManagementButton = FooterManagementLink;
export const SiteManagementNavbarLink = FooterManagementLink;
export const SiteManagementTextLink = FooterManagementLink;
