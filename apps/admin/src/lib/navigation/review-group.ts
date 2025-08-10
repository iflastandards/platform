import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { NavigationItem } from '@/components/layout/StandardDashboardLayout';

export const rgNavigation: NavigationItem[] = [
  {
    id: 'overview',
    label: 'RG Dashboard',
    href: '/dashboard/rg',
    icon: DashboardIcon,
  },
  {
    id: 'projects',
    label: 'My Projects',
    href: '/dashboard/rg/projects',
    icon: AssignmentIcon,
  },
  {
    id: 'namespaces',
    label: 'My Namespaces',
    href: '/dashboard/rg/namespaces',
    icon: FolderIcon,
    badge: () => 4, // This would be dynamic in production
  },
  {
    id: 'team',
    label: 'Team Members',
    href: '/dashboard/rg/team',
    icon: PeopleIcon,
  },
  {
    id: 'activity',
    label: 'Activity Log',
    href: '/dashboard/rg/activity',
    icon: HistoryIcon,
  },
];