'use client';

import React from 'react';
import {
  Typography,
  Card,
  Button,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export function ImportExportPage() {
  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Import/Export Tools</Title>
      
      <Alert
        message="Vocabulary Management"
        description="Import vocabularies from spreadsheets or export them for external editing and review."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Import Vocabulary">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Import vocabulary from CSV, Excel, or Google Sheets
            </Text>
            <Link href="/import">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                block
                size="large"
              >
                Start Import
              </Button>
            </Link>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Export to Sheets">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Export vocabulary to Google Sheets for collaborative editing
            </Text>
            <Link href="/export">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                block
                size="large"
              >
                Start Export
              </Button>
            </Link>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Recent Import/Export Activities">
            <Text type="secondary">
              No recent activities
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}