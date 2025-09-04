'use client';

import React from 'react';
import { Typography, Alert, Button } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface SharedReviewPageProps {
  userRole: 'author' | 'editor';
}

const { Title } = Typography;

export function SharedReviewPage({ userRole }: SharedReviewPageProps) {
  const getContent = () => {
    if (userRole === 'author') {
      return {
        title: 'Review Queue',
        alertTitle: 'Review Queue',
        alertMessage:
          'You have 3 items waiting for your review. Please review and provide feedback.',
      };
    }
    return {
      title: 'Review Queue',
      alertTitle: 'Editorial Review',
      alertMessage:
        'As an editor, you can approve, reject, or request changes to vocabulary submissions.',
    };
  };

  const content = getContent();

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {content.title}
      </Title>
      <Alert
        message={content.alertTitle}
        description={content.alertMessage}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Link href="/review">
        <Button type="primary" icon={<FileSearchOutlined />}>
          Go to Review Interface
        </Button>
      </Link>
    </div>
  );
}
