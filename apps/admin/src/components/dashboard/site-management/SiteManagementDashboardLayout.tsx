'use client';

import { StandardDashboardLayout } from '@/components/layout/StandardDashboardLayout';
import { getSiteManagementNavigation } from '@/lib/navigation/site-management';
import { Typography, Tag, Space } from 'antd';

const { Text } = Typography;

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
    <Space direction="vertical" size="small">
      <Text type="secondary" style={{ fontSize: 12 }}>
        {siteTitle}
      </Text>
      <Space align="center">
        <div 
          style={{ width: 8, height: 8, backgroundColor: '#52c41a', borderRadius: '50%' }}
          role="img"
          aria-label="Status: Connected"
        />
        <Text style={{ fontSize: 12 }}>Connected</Text>
      </Space>
      {isSpecialCase && (
        <Tag 
          color="warning"
          aria-label="Special case site requiring superadmin access"
        >
          Special Case
        </Tag>
      )}
    </Space>
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