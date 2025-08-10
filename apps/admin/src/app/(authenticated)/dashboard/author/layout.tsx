import { AuthorDashboardLayout } from '@/components/dashboard/author/AuthorDashboardLayout';

interface Props {
  children: React.ReactNode;
}

export default function AuthorLayout({ children }: Props) {
  return (
    <AuthorDashboardLayout>
      {children}
    </AuthorDashboardLayout>
  );
}