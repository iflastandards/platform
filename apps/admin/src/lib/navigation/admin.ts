import {
  Home,
  People as PeopleIcon,
  Language as LanguageIcon,
  Folder as FolderIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { NavigationItem } from '@/components/layout/StandardDashboardLayout';

export const adminNavigation: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    href: '/dashboard/admin',
    icon: Home,
  },
  {
    id: 'users',
    label: 'Users',
    href: '/dashboard/admin/users',
    icon: PeopleIcon,
    badge: () => 352,
  },
  {
    id: 'review-groups',
    label: 'Review Groups',
    href: '/dashboard/admin/review-groups',
    icon: LanguageIcon,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/dashboard/admin/projects',
    icon: AssignmentIcon,
    badge: () => 12,
  },
  {
    id: 'namespaces',
    label: 'Namespaces',
    href: '/dashboard/admin/namespaces',
    icon: FolderIcon,
  },
  {
    id: 'vocabularies',
    label: 'Vocabularies',
    href: '/dashboard/admin/vocabularies',
    icon: BookIcon,
    badge: () => 824,
  },
  {
    id: 'profiles',
    label: 'DCTAP Profiles',
    href: '/dashboard/admin/profiles',
    icon: BookIcon,
  },
  {
    id: 'adopt-spreadsheet',
    label: 'Adopt Spreadsheet',
    href: '/dashboard/admin/adopt-spreadsheet',
    icon: CloudUploadIcon,
    specialAccess: true,
  },
  {
    id: 'activity',
    label: 'Activity Log',
    href: '/dashboard/admin/activity',
    icon: HistoryIcon,
  },
];