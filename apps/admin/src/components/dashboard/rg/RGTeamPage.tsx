'use client';

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Button,
  Card,
  Avatar,
  List,
  Tag,
  Space,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function RGTeamPage() {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Maria Editor', 
      email: 'maria@example.com', 
      role: 'lead', 
      projects: ['ISBD Translation', 'ISBD/M Update'],
      avatar: 'ME'
    },
    { 
      id: 2, 
      name: 'John Smith', 
      email: 'john@example.com', 
      role: 'editor', 
      projects: ['ISBD/M Update'],
      avatar: 'JS'
    },
    { 
      id: 3, 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      role: 'reviewer', 
      projects: ['ISBD Translation', 'ISBD Review Cycle'],
      avatar: 'SW'
    },
    { 
      id: 4, 
      name: 'Jean Translator', 
      email: 'jean@example.com', 
      role: 'translator', 
      projects: ['ISBD Translation'],
      avatar: 'JT'
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return 'blue';
      case 'editor': return 'purple';
      case 'reviewer': return 'cyan';
      case 'translator': return 'success';
      default: return 'default';
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <Title level={2}>Team Members</Title>
        <Link href="/dashboard/rg/team/invite">
          <Button type="primary" icon={<UserAddOutlined />}>
            Invite Team Member
          </Button>
        </Link>
      </div>

      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          ISBD Review Group Team
        </Title>
        <List
          dataSource={teamMembers}
          renderItem={(member, index) => (
            <>
              <List.Item
                style={{ paddingTop: 16, paddingBottom: 16 }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      style={{ backgroundColor: '#1890ff' }}
                      size="large"
                    >
                      {member.avatar}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{member.name}</Text>
                      <Tag color={getRoleColor(member.role)}>
                        {member.role}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">{member.email}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Projects: {member.projects.join(', ')}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
              {index < teamMembers.length - 1 && <Divider />}
            </>
          )}
        />
      </Card>
    </div>
  );
}