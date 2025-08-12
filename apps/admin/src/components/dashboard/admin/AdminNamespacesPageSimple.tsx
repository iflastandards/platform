'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { mockNamespaceData } from '@/lib/mock-namespace-data';

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
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Namespace Management (Simple Test)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Found {namespaces.length} namespaces
            </Typography>
            {namespaces.map((ns) => (
              <Box key={ns.id} p={2} border={1} borderColor="divider" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {ns.name} ({ns.id})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ns.description}
                </Typography>
                <Typography variant="caption">
                  Review Group: {ns.reviewGroup} | Status: {ns.status} | Visibility: {ns.visibility}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}