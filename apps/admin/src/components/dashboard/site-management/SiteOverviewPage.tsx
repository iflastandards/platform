'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Alert,
  Tag,
  List,
  Spin,
} from 'antd';
import { useSiteInfo, useSiteActivity, useSiteStats } from '@/lib/hooks/useSiteManagement';

const { Title, Text } = Typography;

interface SiteOverviewPageProps {
  siteKey: string;
}

export function SiteOverviewPage({ siteKey }: SiteOverviewPageProps) {
  const { data: siteInfo, isLoading: siteInfoLoading } = useSiteInfo(siteKey);
  const { data: siteActivity, isLoading: activityLoading } = useSiteActivity(siteKey);
  const { data: siteStats, isLoading: statsLoading } = useSiteStats(siteKey);

  if (siteInfoLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!siteInfo) {
    return (
      <Alert
        message="Error"
        description={`Unable to load site information for ${siteKey}`}
        type="error"
        showIcon
      />
    );
  }

  const { title: siteTitle, code: siteCode, isSpecialCase } = siteInfo;

  const statusListData = [
    {
      label: 'Type',
      value: isSpecialCase ? 'Special System Area' : 'Standard Site',
    },
    {
      label: 'Last Updated',
      value: siteInfo.lastUpdated,
    },
    {
      label: 'Build Status',
      value: (
        <Tag 
          color={siteInfo.buildStatus === 'passing' ? 'success' : siteInfo.buildStatus === 'failing' ? 'error' : 'warning'}
          aria-label={`Build status: ${siteInfo.buildStatus}`}
        >
          {siteInfo.buildStatus === 'passing' ? 'Passing' : siteInfo.buildStatus === 'failing' ? 'Failing' : 'Pending'}
        </Tag>
      ),
    },
    {
      label: isSpecialCase ? 'System Issues' : 'Open PRs',
      value: <span aria-label={`${isSpecialCase ? 'System Issues' : 'Open PRs'}: ${siteInfo.openPRs}`}>{siteInfo.openPRs}</span>,
    },
    {
      label: isSpecialCase ? 'Active Tasks' : 'Pending Reviews',
      value: <span aria-label={`${isSpecialCase ? 'Active Tasks' : 'Pending Reviews'}: ${siteInfo.pendingReviews}`}>{siteInfo.pendingReviews}</span>,
    },
  ];

  const activityData = activityLoading ? [] : (siteActivity || []).map((activity: any) => ({
    title: activity.type === 'commit' ? 'Last Commit' : activity.type === 'pr' ? 'Last PR' : activity.type === 'issue' ? 'Last Issue' : 'Last Release',
    description: activity.description,
    meta: activity.time,
  }));

  return (
    <div>
      {isSpecialCase && (
        <Alert
          message="Special Management Area"
          description={
            siteKey === 'portal' ? 
              'The Portal is not a standard namespace. It serves as the main IFLA standards platform and requires superadmin permissions for all management operations.' :
              'This is a development/testing environment, not a standard namespace. It requires superadmin permissions and should be used with caution.'
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          role="alert"
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card 
            title={<Title level={5} style={{ margin: 0 }}>{isSpecialCase ? 'System' : 'Site'} Status</Title>}
            role="region"
            aria-labelledby={`${siteKey}-status-title`}
          >
            <List
              dataSource={statusListData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.label}
                    description={item.value}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title={<Title level={5} style={{ margin: 0 }}>Recent Activity - {siteCode}</Title>}
            role="region"
            aria-labelledby={`${siteKey}-activity-title`}
          >
            {activityLoading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin />
              </div>
            ) : (
              <List
                dataSource={activityData}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <>
                          {item.description}
                          {item.meta && (
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                              {item.meta}
                            </Text>
                          )}
                        </>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: isSpecialCase ? 'No recent system activity' : 'No recent activity' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {statsLoading ? (
        <Card style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        </Card>
      ) : siteStats && (
        <Card 
          title={<Title level={5} style={{ margin: 0 }}>{isSpecialCase ? 'System' : 'Site'} Statistics</Title>}
          style={{ marginTop: 24 }}
          role="region"
          aria-labelledby={`${siteKey}-stats-title`}
        >
          <Row gutter={16}>
            {Object.entries(siteStats).map(([key, value]) => (
              <Col span={6} key={key}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                    {String(value)}
                  </Title>
                  <Text type="secondary" style={{ textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
}