import { EditorDashboardLayout } from '@/components/dashboard/editor/EditorDashboardLayout';

interface Props {
  children: React.ReactNode;
}

export default function EditorLayout({ children }: Props) {
  return (
    <EditorDashboardLayout>
      {children}
    </EditorDashboardLayout>
  );
}