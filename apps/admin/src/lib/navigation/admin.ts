import {
  HomeOutlined,
  UserOutlined,
  FolderOutlined,
  BookOutlined,
  ProjectOutlined,
  HistoryOutlined,
  CloudUploadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { type NavigationItem } from '@/components/layout/StandardDashboardLayout';

export const adminNavigation: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    href: '/dashboard/admin',
    icon: HomeOutlined,
  },
  {
    id: 'users',
    label: 'Users',
    href: '/dashboard/admin/users',
    icon: UserOutlined,
    badge: () => 352,
  },
  {
    id: 'review-groups',
    label: 'Review Groups',
    href: '/dashboard/admin/review-groups',
    icon: TeamOutlined,
    badge: () => 4, // 4 review groups
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/dashboard/admin/projects',
    icon: ProjectOutlined,
    badge: () => 12,
  },
  {
    id: 'namespaces',
    label: 'Namespaces',
    href: '/dashboard/admin/namespaces',
    icon: FolderOutlined,
  },
  {
    id: 'vocabularies',
    label: 'Vocabularies',
    href: '/dashboard/admin/vocabularies',
    icon: BookOutlined,
    badge: () => 824,
  },
  {
    id: 'profiles',
    label: 'DCTAP Profiles',
    href: '/dashboard/admin/profiles',
    icon: BookOutlined,
  },
  {
    id: 'adopt-spreadsheet',
    label: 'Adopt Spreadsheet',
    href: '/dashboard/admin/adopt-spreadsheet',
    icon: CloudUploadOutlined,
    specialAccess: true,
  },
  {
    id: 'activity',
    label: 'Activity Log',
    href: '/dashboard/admin/activity',
    icon: HistoryOutlined,
  },
];