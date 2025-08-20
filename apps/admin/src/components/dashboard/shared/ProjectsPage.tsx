'use client';

import React from 'react';
import {
  Typography,
  List,
  Button,
  Tag,
  Space,
} from 'antd';
import {
  EditOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface SharedProjectsPageProps {
  user: AppUser;
  role: 'author' | 'editor';
}

const { Title, Text } = Typography;

export function SharedProjectsPage({ user, role }: SharedProjectsPageProps) {
  const userProjects = Object.values(user.projects);
  
  // Filter projects based on role
  const filteredProjects = role === 'author' 
    ? userProjects.filter(p => p.role === 'reviewer' || p.role === 'translator')
    : userProjects.filter(p => p.role === 'lead' || p.role === 'editor');

  // Get role display
  const getRoleDisplay = (projectRole: string) => {
    const roleMap: Record<string, string> = {
      'reviewer': 'Reviewer',
      'translator': 'Translator',
      'lead': 'Project Lead',
      'editor': 'Editor',
    };
    return roleMap[projectRole] || projectRole;
  };

  // Get role color for authors only (editors use primary)
  const getRoleColor = (projectRole: string) => {
    if (role === 'editor') return 'blue';
    
    switch (projectRole) {
      case 'reviewer': return 'purple';
      case 'translator': return 'cyan';
      default: return 'default';
    }
  };

  const getEmptyMessage = () => {
    if (role === 'author') {
      return {
        primary: 'No projects assigned',
        secondary: "You don't have any projects with reviewer or translator roles"
      };
    } else {
      return {
        primary: 'No projects assigned',
        secondary: "You don't have any projects with editor or lead roles"
      };
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>My Projects</Title>
      <List
        dataSource={filteredProjects}
        renderItem={(project) => (
          <List.Item
            actions={[
              <Link key="edit" href={`/projects/${project.number}`}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  aria-label={role === 'author' ? `View ${project.title} project` : `Edit ${project.title}`}
                />
              </Link>,
            ]}
          >
            <List.Item.Meta
              avatar={<ProjectOutlined style={{ fontSize: 20 }} />}
              title={project.title}
              description={
                <Space>
                  <Tag color={getRoleColor(project.role)}>
                    {getRoleDisplay(project.role)}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {project.namespaces.length} namespaces
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div>
              <Text strong>{getEmptyMessage().primary}</Text>
              <br />
              <Text type="secondary">{getEmptyMessage().secondary}</Text>
            </div>
          ),
        }}
      />
    </div>
  );
}