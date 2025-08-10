import {
  Home,
  Assignment as ProjectIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  FileUpload as ImportIcon,
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

export interface DashboardNavigation {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: () => number | string;
}

export function getEditorNavigation(): DashboardNavigation[] {
  return [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard/editor',
      icon: Home,
    },
    {
      id: 'projects',
      label: 'My Projects',
      href: '/dashboard/editor/projects',
      icon: ProjectIcon,
      badge: () => 0, // TODO: Dynamic count from user projects
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      href: '/dashboard/editor/namespaces',
      icon: FolderIcon,
      badge: () => 0, // TODO: Dynamic count from accessible namespaces
    },
    {
      id: 'editorial',
      label: 'Editorial Tools',
      href: '/dashboard/editor/editorial',
      icon: EditIcon,
    },
    {
      id: 'import-export',
      label: 'Import/Export',
      href: '/dashboard/editor/import-export',
      icon: ImportIcon,
    },
    {
      id: 'review',
      label: 'Review Queue',
      href: '/dashboard/editor/review',
      icon: ReviewIcon,
      badge: () => 0, // TODO: Dynamic count
    },
    {
      id: 'translation',
      label: 'Translations',
      href: '/dashboard/editor/translation',
      icon: TranslateIcon,
      badge: () => 0, // TODO: Dynamic count
    },
    {
      id: 'system',
      label: 'System Status',
      href: '/dashboard/editor/system',
      icon: BuildIcon,
    },
  ];
}