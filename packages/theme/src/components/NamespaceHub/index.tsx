import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { ElementSetCard } from '../ElementSetCard';
import { VocabularyCard } from '../VocabularyCard';
import styles from './NamespaceHub.module.scss';

export interface ElementSet {
  id: string;
  title: string;
  description: string;
  elementCount: number;
  lastUpdated: string;
  path: string;
  categories?: string[];
  prefix?: string;
  baseIRI?: string;
}

export interface Vocabulary {
  id: string;
  title: string;
  termCount: number;
  path: string;
}

export interface NamespaceHubProps {
  namespace: {
    id: string;
    title: string;
    description: string;
    elementSets: ElementSet[];
    vocabularies: Vocabulary[];
  };
}

export function NamespaceHub({ namespace }: NamespaceHubProps) {
  const totalElements = namespace.elementSets.reduce((sum, set) => sum + set.elementCount, 0);
  const totalTerms = namespace.vocabularies.reduce((sum, vocab) => sum + vocab.termCount, 0);

  return (
    <div className={styles.namespaceHub}>
      <Box className={styles.statsBar} mb={4}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" component="div">{namespace.elementSets.length}</Typography>
              <Typography variant="body2" color="text.secondary">Element Sets</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" component="div">{totalElements}</Typography>
              <Typography variant="body2" color="text.secondary">Total Elements</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" component="div">{totalTerms}</Typography>
              <Typography variant="body2" color="text.secondary">Vocabulary Terms</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box mb={6}>
        <Typography variant="h5" component="h2" gutterBottom>
          Element Sets
        </Typography>
        <Grid container spacing={3}>
          {namespace.elementSets.map((elementSet) => (
            <Grid size={{ xs: 12, md: 6 }} key={elementSet.id}>
              <ElementSetCard elementSet={elementSet} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {namespace.vocabularies.length > 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Vocabularies
          </Typography>
          <Grid container spacing={3}>
            {namespace.vocabularies.map((vocabulary) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vocabulary.id}>
                <VocabularyCard vocabulary={vocabulary} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  );
}

// Re-export the component as default for backward compatibility
export default NamespaceHub;