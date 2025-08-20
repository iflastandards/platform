import {
  LayoutOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  GithubOutlined,
  SettingOutlined,
} from '@ant-design/icons';

export interface DashboardNavigation {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: () => number | string;
}

export function getSiteManagementNavigation(siteKey: string): DashboardNavigation[] {
  return [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/${siteKey}`,
      icon: LayoutOutlined,
    },
    {
      id: 'content',
      label: 'Content Management',
      href: `/dashboard/${siteKey}/content`,
      icon: FileTextOutlined,
      badge: () => 12, // TODO: Dynamic count
    },
    {
      id: 'rdf',
      label: 'RDF & Vocabularies',
      href: `/dashboard/${siteKey}/rdf`,
      icon: DatabaseOutlined,
    },
    {
      id: 'workflow',
      label: 'Review & Workflow',
      href: `/dashboard/${siteKey}/workflow`,
      icon: BranchesOutlined,
      badge: () => 5, // TODO: Dynamic count
    },
    {
      id: 'team',
      label: 'Team Management',
      href: `/dashboard/${siteKey}/team`,
      icon: TeamOutlined,
      badge: () => 8, // TODO: Dynamic count
    },
    {
      id: 'releases',
      label: 'Releases & Publishing',
      href: `/dashboard/${siteKey}/releases`,
      icon: AppstoreOutlined,
    },
    {
      id: 'quality',
      label: 'Quality Assurance',
      href: `/dashboard/${siteKey}/quality`,
      icon: SafetyCertificateOutlined,
    },
    {
      id: 'github',
      label: 'GitHub',
      href: `/dashboard/${siteKey}/github`,
      icon: GithubOutlined,
      badge: () => 3, // TODO: Dynamic count
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/dashboard/${siteKey}/settings`,
      icon: SettingOutlined,
    },
  ];
}