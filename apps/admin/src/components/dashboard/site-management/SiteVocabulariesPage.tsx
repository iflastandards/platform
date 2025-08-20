'use client';

import React from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  List, 
  Space,
  Tag,
  Divider,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import { ActionGrid, ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

interface SiteVocabulariesPageProps {
  siteKey: string;
}

const vocabularyActions: ManagementAction[] = [
  {
    id: 'import-vocabulary',
    title: 'Import Vocabulary',
    description: 'Import vocabulary data from CSV or RDF files',
    type: 'github-cli',
  },
  {
    id: 'export-vocabulary',
    title: 'Export Vocabulary',
    description: 'Export vocabulary data to various formats',
    type: 'github-cli',
  },
  {
    id: 'validate-vocabulary',
    title: 'Validate Vocabulary',
    description: 'Check vocabulary consistency and completeness',
    type: 'github-cli',
  },
];

// Mock vocabulary data - replace with actual API call
const mockVocabularies = [
  {
    id: 'content-types',
    name: 'Content Types',
    description: 'Controlled vocabulary for content type classifications',
    termCount: 15,
    status: 'active' as const,
  },
  {
    id: 'media-types',
    name: 'Media Types',
    description: 'Classification of media and carrier types',
    termCount: 23,
    status: 'draft' as const,
  },
  {
    id: 'audience-levels',
    name: 'Audience Levels',
    description: 'Target audience classification terms',
    termCount: 8,
    status: 'active' as const,
  },
];

export function SiteVocabulariesPage({ siteKey }: SiteVocabulariesPageProps) {
  return (
    <div>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div>
          <Title level={2}>Vocabularies</Title>
          <Text type="secondary">
            Manage controlled vocabularies and terminology for {siteKey.toUpperCase()}
          </Text>
        </div>
        <Link href={`/dashboard/${siteKey}/content/vocabularies/new`}>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Vocabulary
          </Button>
        </Link>
      </div>

      <Card style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Existing Vocabularies
        </Title>
        <List
          dataSource={mockVocabularies}
          renderItem={(vocab, index) => (
            <>
              <List.Item
                actions={[
                  <Link
                    key="edit"
                    href={`/dashboard/${siteKey}/content/vocabularies/${vocab.id}/edit`}
                  >
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      aria-label={`Edit ${vocab.name}`}
                    />
                  </Link>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${vocab.name}`}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={vocab.name}
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">{vocab.description}</Text>
                      <Space>
                        <Tag>{vocab.termCount} terms</Tag>
                        <Tag color={vocab.status === 'active' ? 'success' : 'warning'}>
                          {vocab.status}
                        </Tag>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
              {index < mockVocabularies.length - 1 && <Divider />}
            </>
          )}
        />
      </Card>

      <Title level={4} style={{ marginBottom: 16, marginTop: 32 }}>
        Vocabulary Management Tools
      </Title>
      <ActionGrid actions={vocabularyActions} />
    </div>
  );
}