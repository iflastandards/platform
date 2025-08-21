'use client';

import {
  Card,
  Typography,
  Tag,
  Button,
  Alert,
  Row,
  Col,
  Space,
  Statistic,
} from 'antd';
import {
  GithubOutlined,
  GlobalOutlined,
  SafetyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  mockNamespaces,
  getNamespaceStats,
} from '@/lib/mock-data/namespaces-extended';
import RequestInviteButton from '@/components/welcome/RequestInviteButton';
import SafeSignInButton from '@/components/auth/SafeSignInButton';

const { Title, Text, Paragraph } = Typography;

interface NamespaceStatusCardProps {
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  lastPublished: string;
  color: string;
  icon: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
}

function NamespaceStatusCard({
  name,
  description,
  status,
  currentVersion,
  lastPublished,
  color,
}: NamespaceStatusCardProps) {
  const statusConfig = {
    active: {
      color: 'success',
      label: 'Active',
      icon: <CheckCircleOutlined />,
    },
    maintenance: {
      color: 'warning',
      label: 'Maintenance',
      icon: <WarningOutlined />,
    },
    archived: {
      color: 'error',
      label: 'Archived',
      icon: <ExclamationCircleOutlined />,
    },
  };

  const config = statusConfig[status];
  const publishedDate = new Date(lastPublished).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderColor: '#f0f0f0',
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        const card = e.currentTarget as HTMLElement;
        card.style.borderColor = color;
        card.style.boxShadow = `0 4px 12px ${color}20`;
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget as HTMLElement;
        card.style.borderColor = '#f0f0f0';
        card.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ color, marginBottom: 8 }}>
            {name}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 8 }}>
            {description}
          </Paragraph>
        </div>
        <Tag 
          color={config.color} 
          icon={config.icon}
          style={{ height: 'fit-content' }}
        >
          {config.label}
        </Tag>
      </div>

      <Text type="secondary">
        Version {currentVersion} • Published {publishedDate}
      </Text>
    </Card>
  );
}

export default function WelcomePage() {
  const stats = getNamespaceStats();

  const features = [
    {
      icon: <GlobalOutlined style={{ fontSize: 24 }} />,
      title: 'Multilingual Standards',
      description:
        'Manage and maintain IFLA standards across multiple languages with collaborative translation workflows.',
    },
    {
      icon: <GithubOutlined style={{ fontSize: 24 }} />,
      title: 'GitHub Integration',
      description:
        'Seamless integration with GitHub for version control, issue tracking, and collaborative development.',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 24 }} />,
      title: 'Role-Based Access',
      description:
        'Secure, invitation-only access with granular permissions based on your role and project assignments.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      title: 'Team Collaboration',
      description:
        'Work together with review groups, editors, translators, and contributors in structured workflows.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero Section */}
      <header
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          color: 'white',
          padding: '80px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <Title 
              level={1}
              style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                color: 'white',
                marginBottom: 24,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              IFLA Standards Management Toolkit
            </Title>
            
            <Title 
              level={2}
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 400,
                color: 'white',
                opacity: 0.95,
                marginBottom: 40,
                maxWidth: 800,
                margin: '0 auto 40px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Collaborative platform for developing, maintaining, and publishing
              international library standards
            </Title>

            <Alert
              message={
                <Space wrap>
                  <Text strong style={{ fontSize: '1.1rem' }}>
                    🔒 Access by invitation only
                  </Text>
                  <RequestInviteButton />
                </Space>
              }
              description={
                <Text style={{ fontSize: '1rem' }}>
                  This platform is exclusively for IFLA review group members,
                  editors, translators, and authorized contributors.
                </Text>
              }
              type="info"
              showIcon
              style={{
                maxWidth: 650,
                margin: '0 auto 40px',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              }}
            />

            {/* CTA Section */}
            <SafeSignInButton>
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: 'white',
                  color: '#1890ff',
                  fontWeight: 'bold',
                  padding: '8px 40px',
                  height: 'auto',
                  fontSize: '1.2rem',
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  btn.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  btn.style.transform = 'translateY(-2px)';
                  btn.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  btn.style.backgroundColor = 'white';
                  btn.style.transform = 'translateY(0)';
                  btn.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                }}
              >
                Sign In
              </Button>
            </SafeSignInButton>

            {/* Decorative Elements */}
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 32 }}>
              {[
                { Icon: SafetyOutlined, label: 'Security' },
                { Icon: TeamOutlined, label: 'Collaboration' },
                { Icon: GlobalOutlined, label: 'Multilingual' }
              ].map(({ Icon, label }, index) => (
                <div
                  key={index}
                  style={{
                    padding: 16,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Icon 
                    style={{ fontSize: 32, color: 'white' }} 
                    aria-label={label}
                    role="img"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <main>
      <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Live Platform Statistics</Title>
          <Text type="secondary">
            Real-time overview of our collaborative standards development
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Active Standards"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Total Elements"
                value={stats.totalElements + stats.totalConcepts}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Languages"
                value={stats.totalTranslations}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Active Projects"
                value={stats.active}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Features Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Platform Features</Title>
          <Text type="secondary">
            Everything you need for collaborative standards development
          </Text>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {features.map((feature, index) => (
            <Col xs={24} md={12} key={index}>
              <Card style={{ height: '100%' }}>
                <Space align="start" size={16}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: '#1890ff',
                      color: 'white',
                      minWidth: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <Title level={3} style={{ marginBottom: 8 }}>
                      {feature.title}
                    </Title>
                    <Text type="secondary">
                      {feature.description}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Namespace Status */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Standards Overview</Title>
          <Text type="secondary">
            Current status of all IFLA standards and their development
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {Object.values(mockNamespaces).map((namespace) => (
            <Col xs={24} md={12} lg={8} key={namespace.id}>
              <NamespaceStatusCard {...namespace} />
            </Col>
          ))}
        </Row>
      </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          padding: '32px 24px',
          marginTop: 48,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <Text type="secondary">
            © 2024 International Federation of Library Associations and
            Institutions (IFLA)
          </Text>
          <br />
          <Text type="secondary">
            Standards Management Toolkit • Powered by modern web technologies
          </Text>
        </div>
      </footer>
    </div>
  );
}