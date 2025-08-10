import {
  Home,
  Assignment as ProjectIcon,
  Folder as FolderIcon,
  Task as TaskIcon,
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
  Build as ToolsIcon,
} from '@mui/icons-material';

export interface DashboardNavigation {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: () => number | string;
}

export function getAuthorNavigation(): DashboardNavigation[] {
  return [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard/author',
      icon: Home,
    },
    {
      id: 'projects',
      label: 'My Projects',
      href: '/dashboard/author/projects',
      icon: ProjectIcon,
      badge: () => 0, // TODO: Dynamic count from user projects
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      href: '/dashboard/author/namespaces',
      icon: FolderIcon,
      badge: () => 0, // TODO: Dynamic count from accessible namespaces
    },
    {
      id: 'tasks',
      label: 'Active Tasks',
      href: '/dashboard/author/tasks',
      icon: TaskIcon,
      badge: () => 6, // TODO: Dynamic count
    },
    {
      id: 'review',
      label: 'Review Queue',
      href: '/dashboard/author/review',
      icon: ReviewIcon,
      badge: () => 3, // TODO: Dynamic count
    },
    {
      id: 'translation',
      label: 'Translation Tasks',
      href: '/dashboard/author/translation',
      icon: TranslateIcon,
      badge: () => 2, // TODO: Dynamic count
    },
    {
      id: 'tools',
      label: 'Tools & Resources',
      href: '/dashboard/author/tools',
      icon: ToolsIcon,
    },
  ];
}