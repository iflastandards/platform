'use client';

import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Breadcrumb } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ImportJobStatus from '@/components/import/ImportJobStatus';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ImportStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const handleComplete = () => {
    // Redirect to dashboard or namespace page after completion
    router.push('/dashboard');
  };

  return (
    <div style={{ maxWidth: 896, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Breadcrumb
          items={[
            {
              title: <Link href="/dashboard">Dashboard</Link>,
            },
            {
              title: <Link href="/import">Import</Link>,
            },
            {
              title: 'Status',
            },
          ]}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        
        <Title level={3} style={{ marginBottom: 8 }}>
          Import Status
        </Title>
        <Text type="secondary">
          Monitor the progress of your vocabulary import
        </Text>
      </div>

      <ImportJobStatus jobId={jobId} onComplete={handleComplete} />
    </div>
  );
}