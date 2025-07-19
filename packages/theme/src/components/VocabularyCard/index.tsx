import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Link } from '@mui/material';
import { Language as LanguageIcon, Category as CategoryIcon } from '@mui/icons-material';
import styles from './styles.module.scss';

interface VocabularyCardProps {
  vocabulary: {
    id: string;
    title: string;
    description?: string;
    conceptCount?: number;
    termCount?: number; // Alternative to conceptCount
    languages?: string[];
    category?: string;
    url?: string;
    path?: string;
  };
}

export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  return (
    <Card className={styles.card}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" className={styles.title}>
            <Link href={vocabulary.path || vocabulary.url || `/docs/vocabularies/${vocabulary.id}`} underline="hover">
              {vocabulary.title}
            </Link>
          </Typography>
          <Chip 
            label={`${vocabulary.conceptCount || vocabulary.termCount || 0} ${vocabulary.termCount ? 'terms' : 'concepts'}`}
            size="small"
            color="secondary"
            className={styles.countChip}
          />
        </Box>
        
        {vocabulary.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {vocabulary.description}
          </Typography>
        )}
        
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
          {vocabulary.category && (
            <Box display="flex" alignItems="center" gap={1}>
              <CategoryIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {vocabulary.category.charAt(0).toUpperCase() + vocabulary.category.slice(1).replace(/-/g, ' ')}
              </Typography>
            </Box>
          )}
          
          {vocabulary.languages && vocabulary.languages.length > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <LanguageIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {vocabulary.languages.join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}