'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { useTheme as useAppTheme } from '@/contexts/theme-context';
import { Layout, Menu, Button, Badge, Tag, Drawer, Space, Grid } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  FolderOutlined,
  BellOutlined,
  CodeOutlined,
  TranslationOutlined,
  CommentOutlined,
  GithubOutlined,
  BuildOutlined,
  LineChartOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { getMockGitHubData } from '@/lib/github-mock-service';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { useBreakpoint } = Grid;

function Navbar() {
  const { mode, toggleTheme } = useAppTheme();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get current user from Clerk
  const { user: clerkUser, isLoaded } = useUser();
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';

  // Determine user role based on demo mode
  let userRole = 'member';
  let isAdmin = false;
  let isStaff = false;

  if (isLoaded && clerkUser) {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';

    if (isDemo) {
      // In demo mode, get role from mock GitHub data
      const mockData = getMockGitHubData(email);
      isAdmin = mockData.systemRole === 'admin';
      isStaff =
        isAdmin || mockData.reviewGroups.some((rg) => rg.role === 'maintainer');

      if (isAdmin) {
        userRole = 'admin';
      } else if (isStaff) {
        userRole = 'maintainer';
      } else if (
        mockData.reviewGroups.length > 0 ||
        Object.keys(mockData.projects).length > 0
      ) {
        userRole = 'member';
      } else {
        userRole = 'guest';
      }
    } else {
      // In production mode, use Clerk metadata
      userRole = (clerkUser.publicMetadata?.iflaRole as string) || 'member';
      isAdmin = userRole === 'admin';
      isStaff = userRole === 'staff' || isAdmin;
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: 'namespaces',
      icon: <FolderOutlined />,
      label: 'Namespaces',
      children: [
        {
          key: 'isbd',
          label: <Link href="/namespaces/isbd">ISBD</Link>,
        },
        {
          key: 'isbdm',
          label: <Link href="/namespaces/isbdm">ISBD-M</Link>,
        },
        {
          key: 'muldicat',
          label: <Link href="/namespaces/muldicat">MulDiCat</Link>,
        },
        {
          key: 'all-namespaces',
          label: <Link href="/namespaces">All Namespaces</Link>,
        },
      ],
    },
    {
      key: 'import',
      icon: <CodeOutlined />,
      label: <Link href="/import">Import Workflow</Link>,
    },
    {
      key: 'translation',
      icon: <TranslationOutlined />,
      label: <Link href="/translation">Translation</Link>,
    },
    {
      key: 'review',
      icon: (
        <Badge count={3} size="small">
          <CommentOutlined />
        </Badge>
      ),
      label: <Link href="/review">Review Queue</Link>,
    },
  ];

  if (isStaff) {
    menuItems.push(
      {
        key: 'github',
        icon: <GithubOutlined />,
        label: <Link href="/github">GitHub Integration</Link>,
      },
      {
        key: 'builds',
        icon: <BuildOutlined />,
        label: <Link href="/builds">Build Pipeline</Link>,
      },
      {
        key: 'cycles',
        icon: <LineChartOutlined />,
        label: <Link href="/cycles">Editorial Cycles</Link>,
      },
    );
  }

  const drawer = (
    <Menu
      mode="inline"
      items={menuItems}
      style={{ height: '100%', borderRight: 0 }}
      onClick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 1000,
          width: '100%',
          height: 48,
          lineHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: mode === 'dark' ? '#001529' : '#0066CC',
          padding: '0 16px',
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleDrawerToggle}
            style={{ color: 'white', marginRight: 16 }}
            aria-label="Open navigation menu"
          />
        )}

        <div
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 500,
            marginRight: 32,
          }}
        >
          IFLA Admin
        </div>

        {!isMobile && (
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems.slice(0, 5)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderBottom: 'none',
            }}
          />
        )}

        <Space
          size="middle"
          style={{ marginLeft: 'auto', alignItems: 'center' }}
        >
          {!isMobile && (
            <Tag
              color={isAdmin ? 'red' : isStaff ? 'blue' : 'default'}
              style={{ margin: 0 }}
            >
              {userRole}
            </Tag>
          )}

          <Badge count={5} size="small" offset={[-2, 6]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: 'white', display: 'flex', alignItems: 'center' }}
              aria-label="View notifications (5 unread)"
            />
          </Badge>

          <Button
            type="text"
            icon={mode === 'dark' ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            style={{ color: 'white', display: 'flex', alignItems: 'center' }}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          />

          <div
            style={{ display: 'flex', alignItems: 'center', height: '32px' }}
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8',
                },
              }}
            />
          </div>
        </Space>
      </Header>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        width={240}
        styles={{ body: { padding: 0 } }}
        title="Navigation"
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
