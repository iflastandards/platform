import {
  DashboardOutlined,
  TeamOutlined,
  FolderOutlined,
  ProjectOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { NavigationItem } from '@/components/layout/StandardDashboardLayout';

export const rgNavigation: NavigationItem[] = [
  {
    id: 'overview',
    label: 'RG Dashboard',
    href: '/dashboard/rg',
    icon: DashboardOutlined,
  },
  {
    id: 'projects',
    label: 'My Projects',
    href: '/dashboard/rg/projects',
    icon: ProjectOutlined,
  },
  {
    id: 'namespaces',
    label: 'My Namespaces',
    href: '/dashboard/rg/namespaces',
    icon: FolderOutlined,
    badge: () => 4, // This would be dynamic in production
  },
  {
    id: 'team',
    label: 'Team Members',
    href: '/dashboard/rg/team',
    icon: TeamOutlined,
  },
  {
    id: 'activity',
    label: 'Activity Log',
    href: '/dashboard/rg/activity',
    icon: HistoryOutlined,
  },
];