'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, type ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

interface SiteRdfManagementPageProps {
  siteKey: string;
}

const rdfActions: ManagementAction[] = [
  {
    id: 'csv-to-rdf',
    title: 'CSV → RDF',
    description: 'Convert CSV vocabulary data to RDF format',
    type: 'github-cli',
  },
  {
    id: 'rdf-to-csv',
    title: 'RDF → CSV',
    description: 'Extract CSV data from RDF fragments',
    type: 'github-cli',
  },
  {
    id: 'sync-sheets',
    title: 'Sync Google Sheets',
    description: 'Pull/push data between CSV files and Google Sheets',
    type: 'github-cli',
  },
  {
    id: 'validate-rdf',
    title: 'Validate RDF',
    description: 'Check RDF fragments against DCTAP profile',
    type: 'github-cli',
  },
  {
    id: 'update-dctap',
    title: 'Manage DC-TAP',
    description: 'Maintain DC-TAP and JSON-LD context files for this namespace',
    type: 'codespaces',
  },
  {
    id: 'generate-release',
    title: 'Generate RDF Release',
    description: 'Compile fragments into master RDF files',
    type: 'github-cli',
  },
];

export function SiteRdfManagementPage({ siteKey }: SiteRdfManagementPageProps) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>RDF & Vocabularies</Title>
        <Text type="secondary">
          Manage RDF data, vocabularies, and semantic web resources for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={rdfActions} />
    </div>
  );
}