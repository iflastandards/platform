'use client';

import React from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Alert,
  Form,
} from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SiteVocabularyCreatePageProps {
  siteKey: string;
}

export function SiteVocabularyCreatePage({ siteKey }: SiteVocabularyCreatePageProps) {
  const router = useRouter();
  const [form] = Form.useForm();

  const handleCancel = () => {
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  const handleSubmit = (values: any) => {
    // TODO: Implement vocabulary creation logic
    console.log('Creating vocabulary for site:', siteKey, values);
    // After successful creation, redirect back to vocabularies list
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Create New Vocabulary</Title>
        <Text type="secondary">
          Add a new controlled vocabulary for {siteKey.toUpperCase()}
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
        >
          <Form.Item
            label="Vocabulary Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a vocabulary name' }]}
          >
            <Input placeholder="e.g., Content Types" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Describe the purpose and scope of this vocabulary"
            />
          </Form.Item>

          <Form.Item
            label="Namespace URI"
            name="namespaceUri"
          >
            <Input placeholder="e.g., http://iflastandards.info/ns/isbd/content-types/" />
          </Form.Item>

          <Form.Item
            label="Prefix"
            name="prefix"
          >
            <Input placeholder="e.g., isbd-ct" />
          </Form.Item>

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Vocabulary
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}