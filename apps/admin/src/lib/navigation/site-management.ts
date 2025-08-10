import {
  Dashboard as LayoutDashboard,
  Description as FileText,
  Storage as Database,
  AccountTree as GitBranch,
  People as Users,
  Inventory as Package,
  Security as Shield,
  GitHub,
  Settings,
} from '@mui/icons-material';

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
      icon: LayoutDashboard,
    },
    {
      id: 'content',
      label: 'Content Management',
      href: `/dashboard/${siteKey}/content`,
      icon: FileText,
      badge: () => 12, // TODO: Dynamic count
    },
    {
      id: 'rdf',
      label: 'RDF & Vocabularies',
      href: `/dashboard/${siteKey}/rdf`,
      icon: Database,
    },
    {
      id: 'workflow',
      label: 'Review & Workflow',
      href: `/dashboard/${siteKey}/workflow`,
      icon: GitBranch,
      badge: () => 5, // TODO: Dynamic count
    },
    {
      id: 'team',
      label: 'Team Management',
      href: `/dashboard/${siteKey}/team`,
      icon: Users,
      badge: () => 8, // TODO: Dynamic count
    },
    {
      id: 'releases',
      label: 'Releases & Publishing',
      href: `/dashboard/${siteKey}/releases`,
      icon: Package,
    },
    {
      id: 'quality',
      label: 'Quality Assurance',
      href: `/dashboard/${siteKey}/quality`,
      icon: Shield,
    },
    {
      id: 'github',
      label: 'GitHub',
      href: `/dashboard/${siteKey}/github`,
      icon: GitHub,
      badge: () => 3, // TODO: Dynamic count
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/dashboard/${siteKey}/settings`,
      icon: Settings,
    },
  ];
}