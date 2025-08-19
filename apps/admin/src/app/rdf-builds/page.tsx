'use client';

import { List, useDataGrid } from '@refinedev/mui';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chip, Box, Skeleton, Alert } from '@mui/material';
import { useNavigation } from '@refinedev/core';
import type { RdfBuild } from '@/../../packages/contracts/schemas/RdfBuild.zod';

/**
 * RDF Builds List Page
 * Displays all RDF builds with status, namespace, and creation date
 */
export default function RdfBuildsListPage() {
  const { show, create } = useNavigation();
  const { dataGridProps, tableQuery } = useDataGrid<RdfBuild>({
    resource: 'rdf-builds',
    pagination: {
      pageSize: 10,
    },
    sorters: {
      initial: [
        {
          field: 'createdAt',
          order: 'desc',
        },
      ],
    },
  });

  const { isLoading, isError, error } = tableQuery;

  // Define columns for the data grid
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => show('rdf-builds', params.value)}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = params.value as RdfBuild['status'];
        const color = {
          queued: 'default',
          running: 'info',
          success: 'success',
          failed: 'error',
          cancelled: 'warning',
        }[status] as any;

        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: 'namespaceId',
      headerName: 'Namespace',
      width: 150,
    },
    {
      field: 'format',
      headerName: 'Format',
      width: 100,
      renderCell: (params) => params.value || 'turtle',
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 100,
      renderCell: (params) => `${params.value || 0}%`,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
  ];

  // Show loading skeleton
  if (isLoading) {
    return (
      <List>
        <Box sx={{ height: 400 }}>
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} />
        </Box>
      </List>
    );
  }

  // Show error message
  if (isError) {
    return (
      <List>
        <Alert severity="error">
          Failed to load RDF builds: {error?.message || 'Unknown error'}
        </Alert>
      </List>
    );
  }

  return (
    <List
      title="RDF Builds"
      canCreate
      createButtonProps={{
        onClick: () => create('rdf-builds'),
      }}
    >
      <DataGrid
        {...dataGridProps}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
        }}
        onRowClick={(params) => {
          show('rdf-builds', params.id);
        }}
      />
    </List>
  );
}
