'use client';

import React, { useState } from 'react';
import {
  Layout,
  Drawer,
  List,
  Typography,
  Button,
  Tag,
  Breadcrumb,
  Grid,
  theme,
} from 'antd';
import {
  MenuOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { generateBreadcrumbs } from '@/lib/navigation/breadcrumbs';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Skip Links Component (Required for Accessibility)
const SkipLinks = () => (
  <div
    style={{
      position: 'absolute',
      left: '-9999px',
      top: 0,
    }}
    onFocus={(e) => {
      const target = e.target as HTMLElement;
      target.style.position = 'static';
      target.style.left = 'auto';
      target.style.top = 'auto';
      target.style.zIndex = '9999';
      target.style.padding = '16px';
      target.style.backgroundColor = '#1890ff';
    }}
    onBlur={(e) => {
      const target = e.target as HTMLElement;
      target.style.position = 'absolute';
      target.style.left = '-9999px';
    }}
  >
    <a href="#main-content" style={{ color: 'white', marginRight: 16 }}>
      Skip to main content
    </a>
    <a href="#navigation" style={{ color: 'white', marginRight: 16 }}>
      Skip to navigation
    </a>
    <a href="#external-resources" style={{ color: 'white' }}>
      Skip to external resources
    </a>
  </div>
);

// Live Region for Screen Reader Announcements
const LiveRegion = ({ message }: { message: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    style={{ 
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    }}
  >
    {message}
  </div>
);

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  badge?: () => number | string;
  specialAccess?: boolean;
}

interface StandardDashboardLayoutProps {
  title: string;
  subtitle?: string;
  navigation: NavigationItem[];
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function StandardDashboardLayout({
  title,
  subtitle,
  navigation,
  children,
  footerContent,
}: StandardDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setLiveMessage(mobileOpen ? 'Navigation closed' : 'Navigation opened');
  };

  const handleNavigation = (itemLabel: string) => {
    setLiveMessage(`Navigating to ${itemLabel} section`);
    if (isMobile) {
      setMobileOpen(false);
    }
    // Clear message after announcement
    setTimeout(() => setLiveMessage(''), 1000);
  };

  const drawerContent = (
    <div role="navigation" aria-label="Dashboard navigation">
      <div style={{ 
        padding: 16, 
        borderBottom: '1px solid #f0f0f0',
        minHeight: 64,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {subtitle}
          </Text>
        )}
      </div>
      
      <List
        id="navigation"
        dataSource={navigation}
        renderItem={(item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <List.Item
              key={item.id}
              style={{ 
                padding: 0,
                borderBottom: 'none'
              }}
            >
              <Link
                href={item.href}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 16px',
                  color: isActive ? '#1890ff' : 'inherit',
                  backgroundColor: isActive ? '#e6f7ff' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                }}
                onClick={() => handleNavigation(item.label)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label}${item.specialAccess ? ' (Restricted)' : ''}`}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent style={{ 
                  fontSize: 20,
                  marginRight: collapsed ? 0 : 12,
                  color: isActive ? '#1890ff' : '#8c8c8c'
                }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>
                      {item.label}
                      {item.specialAccess && (
                        <Tag color="warning" style={{ marginLeft: 8 }}>
                          Restricted
                        </Tag>
                      )}
                    </span>
                    {item.badge && (
                      <Tag color="blue">
                        {item.badge()}
                      </Tag>
                    )}
                  </>
                )}
              </Link>
            </List.Item>
          );
        }}
      />
      
      {footerContent && !collapsed && (
        <>
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />
          <div style={{ padding: 16 }}>
            {footerContent}
          </div>
        </>
      )}
    </div>
  );

  const { token } = theme.useToken();

  return (
    <>
      <SkipLinks />
      <LiveRegion message={liveMessage} />
      
      <Layout style={{ minHeight: '100vh' }}>
        {/* Mobile Header */}
        {isMobile && (
          <Header
            style={{
              position: 'fixed',
              top: 0,
              zIndex: 1000,
              width: '100%',
              padding: '0 16px',
              background: token.colorBgContainer,
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={handleDrawerToggle}
              aria-label="open navigation menu"
              style={{ marginRight: 16 }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {title}
            </Title>
          </Header>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            placement="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            width={240}
            styles={{
              body: { padding: 0 },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            width={240}
            collapsedWidth={80}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{
              background: token.colorBgContainer,
              borderRight: '1px solid #f0f0f0',
            }}
          >
            {drawerContent}
          </Sider>
        )}

        {/* Main Content */}
        <Layout>
          <Content
            id="main-content"
            style={{
              padding: 24,
              marginTop: isMobile ? 64 : 0,
              background: token.colorBgLayout,
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
              <nav aria-label="Breadcrumb navigation" style={{ marginBottom: 16 }}>
                <Breadcrumb
                  separator={<RightOutlined style={{ fontSize: 10 }} />}
                  items={breadcrumbs.map((crumb, index) => ({
                    title: index < breadcrumbs.length - 1 ? (
                      <Link href={crumb.href}>
                        {crumb.label}
                      </Link>
                    ) : (
                      crumb.label
                    ),
                  }))}
                />
              </nav>
            )}

            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}