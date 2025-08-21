'use client';

import { Layout } from 'antd';
import Navbar from '@/components/layout/Navbar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout.Content
        style={{
          padding: '24px',
          marginTop: '48px', // Navbar height
          backgroundColor: '#f5f5f5',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>{children}</div>
      </Layout.Content>
    </Layout>
  );
}
