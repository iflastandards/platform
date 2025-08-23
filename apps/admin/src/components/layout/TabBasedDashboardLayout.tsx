'use client';

import React, { useState } from 'react';
import {
  Layout,
  Drawer,
  Menu,
  Typography,
  Badge,
  Tag,
  Grid,
  Button,
  Space,
  type MenuProps,
} from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number | string;
  specialAccess?: boolean;
}

interface TabBasedDashboardLayoutProps {
  title: string;
  subtitle?: string;
  navigationItems: NavigationItem[];
  selectedTab: string;
  onTabSelect: (tabId: string) => void;
  children: React.ReactNode;
}

export function TabBasedDashboardLayout({
  title,
  subtitle,
  navigationItems,
  selectedTab,
  onTabSelect,
  children,
}: TabBasedDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems: MenuProps['items'] = navigationItems.map((item) => {
    const IconComponent = item.icon;

    return {
      key: item.id,
      icon: <IconComponent />,
      label: (
        <Space>
          {item.label}
          {item.specialAccess && <Tag color="warning">Restricted</Tag>}
          {item.badge && <Badge count={item.badge} />}
        </Space>
      ),
    };
  });

  const drawerContent = (
    <div role="navigation" aria-label="Dashboard navigation">
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {subtitle}
          </Text>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedTab]}
        items={menuItems}
        onClick={({ key }) => {
          onTabSelect(key);
          if (isMobile) {
            setMobileOpen(false);
          }
        }}
        style={{ border: 'none' }}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Header */}
      {isMobile && (
        <Header
          style={{
            position: 'fixed',
            width: '100%',
            zIndex: 1000,
            background: '#001529',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleDrawerToggle}
            style={{ color: 'white', marginRight: '16px' }}
            aria-label="open navigation menu"
          />
          <Title level={4} style={{ margin: 0, color: 'white' }}>
            {title}
          </Title>
        </Header>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          placement="left"
          width={drawerWidth}
          styles={{ body: { padding: 0 } }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Layout hasSider={!isMobile}>
        {/* Desktop Sider */}
        {!isMobile && (
          <Sider
            width={drawerWidth}
            style={{
              background: '#fff',
              borderRight: '1px solid #f0f0f0',
              overflow: 'auto',
              height: '100vh',
              position: 'sticky',
              top: 0,
              left: 0,
            }}
          >
            {drawerContent}
          </Sider>
        )}

        {/* Main Content */}
        <Layout style={{ marginLeft: isMobile ? 0 : 0 }}>
          <Content
            style={{
              padding: '24px',
              minHeight: '100vh',
              marginTop: isMobile ? '64px' : 0,
              background: '#f5f5f5',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
