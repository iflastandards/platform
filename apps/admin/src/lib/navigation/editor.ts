import {
  HomeOutlined,
  ProjectOutlined,
  FolderOutlined,
  EditOutlined,
  UploadOutlined,
  FileTextOutlined,
  TranslationOutlined,
  BuildOutlined,
} from '@ant-design/icons';

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
      icon: HomeOutlined,
    },
    {
      id: 'projects',
      label: 'My Projects',
      href: '/dashboard/editor/projects',
      icon: ProjectOutlined,
      badge: () => 0, // TODO: Dynamic count from user projects
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      href: '/dashboard/editor/namespaces',
      icon: FolderOutlined,
      badge: () => 0, // TODO: Dynamic count from accessible namespaces
    },
    {
      id: 'editorial',
      label: 'Editorial Tools',
      href: '/dashboard/editor/editorial',
      icon: EditOutlined,
    },
    {
      id: 'import-export',
      label: 'Import/Export',
      href: '/dashboard/editor/import-export',
      icon: UploadOutlined,
    },
    {
      id: 'review',
      label: 'Review Queue',
      href: '/dashboard/editor/review',
      icon: FileTextOutlined,
      badge: () => 0, // TODO: Dynamic count
    },
    {
      id: 'translation',
      label: 'Translations',
      href: '/dashboard/editor/translation',
      icon: TranslationOutlined,
      badge: () => 0, // TODO: Dynamic count
    },
    {
      id: 'system',
      label: 'System Status',
      href: '/dashboard/editor/system',
      icon: BuildOutlined,
    },
  ];
}