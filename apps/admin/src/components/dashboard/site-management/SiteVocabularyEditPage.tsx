'use client';

import React from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Alert,
  Spin,
  Form,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SiteVocabularyEditPageProps {
  siteKey: string;
  vocabularyId: string;
}

interface Vocabulary {
  id: string;
  name: string;
  description: string;
  namespaceUri: string;
  prefix: string;
}

export function SiteVocabularyEditPage({ siteKey, vocabularyId }: SiteVocabularyEditPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();

  // Mock data fetching - replace with actual API call
  const { data: vocabulary, isLoading, error } = useQuery({
    queryKey: ['vocabulary', siteKey, vocabularyId],
    queryFn: async (): Promise<Vocabulary> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock vocabulary data
      return {
        id: vocabularyId,
        name: 'Content Types',
        description: 'Controlled vocabulary for content type classifications',
        namespaceUri: `http://iflastandards.info/ns/${siteKey}/content-types/`,
        prefix: `${siteKey}-ct`,
      };
    },
  });

  const handleCancel = () => {
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  const handleSubmit = (values: any) => {
    // TODO: Implement vocabulary update logic
    console.log('Updating vocabulary:', vocabularyId, 'for site:', siteKey, values);
    // After successful update, redirect back to vocabularies list
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !vocabulary) {
    return (
      <Alert
        message="Error Loading Vocabulary"
        description={`Unable to load vocabulary ${vocabularyId} for site ${siteKey}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Edit Vocabulary: {vocabulary.name}</Title>
        <Text type="secondary">
          Modify vocabulary settings for {siteKey.toUpperCase()}
        </Text>
      </div>

      <Alert
        message="This is a placeholder form. In the full implementation, this would connect to the vocabulary management system."
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            name: vocabulary.name,
            description: vocabulary.description,
            namespaceUri: vocabulary.namespaceUri,
            prefix: vocabulary.prefix,
          }}
        >
          <Form.Item
            label="Vocabulary Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a vocabulary name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Namespace URI"
            name="namespaceUri"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Prefix"
            name="prefix"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}