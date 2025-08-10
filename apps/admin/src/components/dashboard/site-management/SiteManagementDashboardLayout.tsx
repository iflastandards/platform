'use client';

import { StandardDashboardLayout } from '@/components/layout/StandardDashboardLayout';
import { getSiteManagementNavigation } from '@/lib/navigation/site-management';
import { Typography, Box, Chip } from '@mui/material';

interface SiteManagementDashboardLayoutProps {
  siteKey: string;
  children: React.ReactNode;
}

export function SiteManagementDashboardLayout({
  siteKey,
  children,
}: SiteManagementDashboardLayoutProps) {
  const navigation = getSiteManagementNavigation(siteKey);
  
  // Determine if this is a special case site
  const isSpecialCase = siteKey === 'portal' || siteKey === 'dev' || siteKey === 'test';
  
  // Get site title (you might want to fetch this from a config or API)
  const getSiteTitle = (key: string) => {
    const titleMap: Record<string, string> = {
      portal: 'IFLA Standards Portal',
      isbd: 'ISBD',
      isbdm: 'ISBDM',
      unimarc: 'UNIMARC',
      mri: 'MRI',
      frbr: 'FRBR',
      lrm: 'LRM',
      mia: 'MIA',
      pressoo: 'PRESSoo',
      muldicat: 'MULDICAT',
    };
    return titleMap[key] || key.toUpperCase();
  };

  const siteTitle = getSiteTitle(siteKey);

  const footerContent = (
    <>
      <Typography variant="caption" color="textSecondary">
        {siteTitle}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Box 
          sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%', mr: 1 }}
          role="img"
          aria-label="Status: Connected"
        />
        <Typography variant="caption">Connected</Typography>
      </Box>
      {isSpecialCase && (
        <Chip 
          label="Special Case" 
          size="small" 
          color="warning"
          sx={{ mt: 1 }}
          aria-label="Special case site requiring superadmin access"
        />
      )}
    </>
  );

  return (
    <StandardDashboardLayout
      title={`${siteTitle} Management`}
      subtitle={isSpecialCase ? 'System Management Area' : 'Site Management Dashboard'}
      navigation={navigation}
      footerContent={footerContent}
    >
      {children}
    </StandardDashboardLayout>
  );
}