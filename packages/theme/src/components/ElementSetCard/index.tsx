import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Link } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import styles from './styles.module.scss';

interface ElementSetCardProps {
  elementSet: {
    id: string;
    title: string;
    description: string;
    elementCount: number;
    languages?: string[];
    url?: string;
    lastUpdated?: string;
    path?: string;
    categories?: string[];
    prefix?: string;
    baseIRI?: string;
  };
}

export function ElementSetCard({ elementSet }: ElementSetCardProps) {
  return (
    <Card className={styles.card}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" className={styles.title}>
            <Link href={elementSet.path || elementSet.url || `/docs/elements/${elementSet.id}`} underline="hover">
              {elementSet.title}
            </Link>
          </Typography>
          <Chip 
            label={`${elementSet.elementCount} elements`}
            size="small"
            color="primary"
            className={styles.countChip}
          />
        </Box>
        
        {elementSet.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {elementSet.description}
          </Typography>
        )}
        
        {elementSet.languages && elementSet.languages.length > 0 && (
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <LanguageIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {elementSet.languages.join(', ')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}