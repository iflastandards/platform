'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Spin } from 'antd';
import { mockNamespaceData } from '@/lib/mock-namespace-data';

const { Title, Text } = Typography;

export function AdminNamespacesPageSimple() {
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setNamespaces(mockNamespaceData);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Namespace Management (Simple Test)
      </Title>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>
            Found {namespaces.length} namespaces
          </Title>
          {namespaces.map((ns) => (
            <div
              key={ns.id}
              style={{
                padding: 16,
                border: '1px solid #f0f0f0',
                marginBottom: 8,
                borderRadius: 4,
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                {ns.name} ({ns.id})
              </Text>
              <br />
              <Text type="secondary">{ns.description}</Text>
              <br />
              <Text style={{ fontSize: 12 }}>
                Review Group: {ns.reviewGroup} | Status: {ns.status} | Visibility: {ns.visibility}
              </Text>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}