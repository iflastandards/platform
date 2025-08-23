import { useState, useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { type CSVConceptRow } from '../types';

interface CsvLoaderState {
  data: CSVConceptRow[];
  loading: boolean;
  error: string | null;
}

export function useCsvLoader(csvFile?: string): CsvLoaderState {
  const [state, setState] = useState<CsvLoaderState>({
    data: [],
    loading: false,
    error: null
  });

  // Resolve the CSV file path using useBaseUrl
  const resolvedCsvPath = useBaseUrl(csvFile || '');

  useEffect(() => {
    if (!csvFile) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    const loadCsvFile = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Use the resolved path from useBaseUrl
        const response = await fetch(resolvedCsvPath);
        if (!response.ok) {
          throw new Error(`Failed to load CSV file: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        // Parse CSV using Papa Parse
        const Papa = await import('papaparse');
        const parsed = Papa.default.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimitersToGuess: [',', '\t', '|', ';']
        });
        
        if (parsed.errors.length > 0) {
          console.warn('CSV parsing warnings:', parsed.errors);
        }
        
        setState({
          data: parsed.data as CSVConceptRow[],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading CSV file:', error);
        setState({
          data: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error loading CSV file'
        });
      }
    };

    loadCsvFile();
  }, [csvFile, resolvedCsvPath]);

  return state;
}