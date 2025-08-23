'use client';

import React from 'react';
import {
  Typography,
  Alert,
  Button,
} from 'antd';
import {
  TranslationOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

interface SharedTranslationPageProps {
  role: 'author' | 'editor';
}

const { Title } = Typography;

export function SharedTranslationPage({ role }: SharedTranslationPageProps) {
  const getContent = () => {
    if (role === 'author') {
      return {
        title: 'Translation Tasks',
        alertTitle: 'Translation Tasks',
        alertMessage: 'You have 2 items that need translation. Your language expertise is valuable to the community.',
      };
    } 
      return {
        title: 'Translation Management',
        alertTitle: 'Multilingual Content',
        alertMessage: 'Coordinate translation efforts across multiple languages and manage translation workflows.',
      };
    
  };

  const content = getContent();

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>{content.title}</Title>
      <Alert
        message={content.alertTitle}
        description={content.alertMessage}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Link href="/translation">
        <Button
          type="primary"
          icon={<TranslationOutlined />}
        >
          Go to Translation Interface
        </Button>
      </Link>
    </div>
  );
}