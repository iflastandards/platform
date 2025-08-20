import {
  HomeOutlined,
  ProjectOutlined,
  FolderOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  TranslationOutlined,
  ToolOutlined,
} from '@ant-design/icons';

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
      icon: HomeOutlined,
    },
    {
      id: 'projects',
      label: 'My Projects',
      href: '/dashboard/author/projects',
      icon: ProjectOutlined,
      badge: () => 0, // TODO: Dynamic count from user projects
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      href: '/dashboard/author/namespaces',
      icon: FolderOutlined,
      badge: () => 0, // TODO: Dynamic count from accessible namespaces
    },
    {
      id: 'tasks',
      label: 'Active Tasks',
      href: '/dashboard/author/tasks',
      icon: CheckSquareOutlined,
      badge: () => 6, // TODO: Dynamic count
    },
    {
      id: 'review',
      label: 'Review Queue',
      href: '/dashboard/author/review',
      icon: FileTextOutlined,
      badge: () => 3, // TODO: Dynamic count
    },
    {
      id: 'translation',
      label: 'Translation Tasks',
      href: '/dashboard/author/translation',
      icon: TranslationOutlined,
      badge: () => 2, // TODO: Dynamic count
    },
    {
      id: 'tools',
      label: 'Tools & Resources',
      href: '/dashboard/author/tools',
      icon: ToolOutlined,
    },
  ];
}