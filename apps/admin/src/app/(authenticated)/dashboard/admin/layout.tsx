import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminDashboardLayout>
      {children}
    </AdminDashboardLayout>
  );
}