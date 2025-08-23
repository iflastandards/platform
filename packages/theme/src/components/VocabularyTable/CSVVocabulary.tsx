import React from 'react';
import { VocabularyTable } from './VocabularyTable';
import { type VocabularyTableProps } from './types';

// Simplified wrapper component for CSV-only vocabularies
export interface CSVVocabularyProps extends Omit<VocabularyTableProps, 'csvFile' | 'preferCsvData'> {
  csvFile: string;
}

export function CSVVocabulary({ csvFile, ...otherProps }: CSVVocabularyProps) {
  return (
    <VocabularyTable 
      csvFile={csvFile}
      preferCsvData={true}
      {...otherProps}
    />
  );
}

// Alternative: Function that returns a component with CSV file path
export function VocabularyTableFromCSV(csvFilePath: string, props?: Partial<VocabularyTableProps>) {
  return function CSVVocabularyComponent() {
    return (
      <VocabularyTable 
        csvFile={csvFilePath}
        preferCsvData={true}
        {...props}
      />
    );
  };
}

export default CSVVocabulary;