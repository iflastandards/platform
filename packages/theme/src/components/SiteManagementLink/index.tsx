import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface SiteManagementLinkProps {
  className?: string;
  children?: React.ReactNode;
  style?: 'button' | 'link' | 'navbar';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component that provides a link to the admin portal for the current site.
 * Automatically detects the current site and creates the appropriate admin URL.
 */
export default function SiteManagementLink({ 
  className = '', 
  children,
  style = 'button',
  size = 'md'
}: SiteManagementLinkProps) {
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();
  
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
      'ISBD Manifestation': 'ISBDM', 
      'Library Reference Model': 'LRM',
      'FRBR': 'FRBR',
      'International Standard Bibliographic Description': 'isbd',
      'Multilingual Dictionary of Cataloguing Terms': 'muldicat',
      'UNIMARC Format': 'unimarc',
    };
    
    if (titleToKey[title]) {
      return titleToKey[title];
    }
    
    // Try to extract from baseUrl or URL path
    const baseUrl = siteConfig.baseUrl;
    if (baseUrl && baseUrl !== '/') {
      const pathParts = baseUrl.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1];
      }
    }
    
    // Fallback: try to detect from current pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && pathParts[0] !== 'docs') {
      return pathParts[0];
    }
    
    return null;
  };

  const siteKey = getSiteKey();
  
  // Don't render if we can't determine the site key
  if (!siteKey) {
    console.warn('SiteManagementLink: Could not determine site key from siteConfig');
    return null;
  }

  // Determine admin portal URL (could be configurable via environment)
  const getAdminPortalUrl = (): string => {
    // In development, use localhost:3007
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3007';
    }
    
    // In production, this would be your deployed admin portal URL
    // This should be configurable via environment variables
    return process.env.ADMIN_PORTAL_URL || 'https://admin.iflastandards.info';
  };

  const adminUrl = `${getAdminPortalUrl()}/dashboard/${siteKey}`;
  
  // Style variants
  const getClassNames = (): string => {
    const baseClasses = className;
    
    switch (style) {
      case 'button':
        const buttonSize = size === 'sm' ? 'button--sm' : size === 'lg' ? 'button--lg' : '';
        return `button button--primary ${buttonSize} ${baseClasses}`.trim();
        
      case 'navbar':
        return `navbar__item navbar__link site-management-link ${baseClasses}`.trim();
        
      case 'link':
      default:
        return baseClasses;
    }
  };

  const defaultChildren = style === 'navbar' ? 'Manage Site' : 'Site Management';

  return (
    <Link
      to={adminUrl}
      className={getClassNames()}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children || defaultChildren}
    </Link>
  );
}

// Export individual style variants for convenience
export const SiteManagementButton = (props: Omit<SiteManagementLinkProps, 'style'>) => (
  <SiteManagementLink {...props} style="button" />
);

export const SiteManagementNavbarLink = (props: Omit<SiteManagementLinkProps, 'style'>) => (
  <SiteManagementLink {...props} style="navbar" />
);

export const SiteManagementTextLink = (props: Omit<SiteManagementLinkProps, 'style'>) => (
  <SiteManagementLink {...props} style="link" />
);