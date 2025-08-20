'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Space,
} from 'antd';
import {
  ThunderboltOutlined,
  DesktopOutlined,
  BuildOutlined,
  LinkOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

export interface ManagementAction {
  id: string;
  title: string;
  description: string;
  type: 'github-cli' | 'codespaces' | 'internal' | 'external';
  disabled?: boolean;
  requiredRole?: 'superadmin' | 'namespace-admin' | 'namespace-editor';
}

interface ActionGridProps {
  actions: ManagementAction[];
  isSuperAdmin?: boolean;
}

const { Title, Text } = Typography;

export function ActionGrid({ actions, isSuperAdmin }: ActionGridProps) {
  const getActionTypeIcon = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return <ThunderboltOutlined />;
      case 'codespaces':
        return <DesktopOutlined />;
      case 'internal':
        return <BuildOutlined />;
      case 'external':
        return <LinkOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getActionTypeLabel = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return 'GitHub CLI';
      case 'codespaces':
        return 'Codespaces';
      case 'internal':
        return 'Internal Tool';
      case 'external':
        return 'External Link';
      default:
        return 'Action';
    }
  };

  const canAccessAction = (action: ManagementAction) => {
    if (!action.requiredRole) return true;
    return action.requiredRole === 'superadmin' ? isSuperAdmin : true;
  };

  return (
    <Row gutter={[24, 24]}>
      {actions.map((action) => {
        const hasAccess = canAccessAction(action);
        return (
          <Col xs={24} md={12} lg={8} key={action.id}>
            <Card 
              style={{ height: '100%', opacity: hasAccess ? 1 : 0.6 }}
              role="article"
              aria-labelledby={`action-${action.id}-title`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div aria-hidden="true" style={{ fontSize: 20, marginRight: 16 }}>
                  {getActionTypeIcon(action.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <Title 
                    level={5}
                    id={`action-${action.id}-title`}
                    style={{ marginBottom: 8 }}
                  >
                    {action.title}
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {action.description}
                  </Text>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      disabled={!hasAccess || action.disabled !== false}
                      aria-label={`${action.title}: ${!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}`}
                    >
                      {!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}
                    </Button>
                    <Tag 
                      aria-label={`Action type: ${getActionTypeLabel(action.type)}`}
                    >
                      {getActionTypeLabel(action.type)}
                    </Tag>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}