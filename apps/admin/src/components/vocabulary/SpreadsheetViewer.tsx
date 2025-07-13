'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Paper,
  Button,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface SpreadsheetData {
  id: string;
  [key: string]: string | number | null;
}

interface SpreadsheetColumn {
  id: string;
  label: string;
  type: 'text' | 'url' | 'identifier' | 'language' | 'date';
  required: boolean;
  description?: string;
}

interface SpreadsheetViewerProps {
  data: SpreadsheetData[];
  columns: SpreadsheetColumn[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  onRowClick?: (row: SpreadsheetData) => void;
  onEdit?: (row: SpreadsheetData) => void;
  searchable?: boolean;
  filterable?: boolean;
  downloadable?: boolean;
  maxHeight?: number;
}

export default function SpreadsheetViewer({
  data,
  columns,
  title = 'Vocabulary Data',
  subtitle,
  loading = false,
  onRowClick,
  onEdit,
  searchable = true,
  filterable = true,
  downloadable = true,
  maxHeight = 600,
}: SpreadsheetViewerProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<SpreadsheetData[]>(data);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<SpreadsheetData | null>(null);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setPage(0);
  }, [data, searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, row: SpreadsheetData) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const formatCellValue = (value: any, column: SpreadsheetColumn) => {
    if (value === null || value === undefined || value === '') {
      return (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      );
    }

    switch (column.type) {
      case 'url':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' 
            }}>
              {value}
            </Typography>
            <IconButton size="small" href={value} target="_blank">
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      
      case 'identifier':
        return (
          <Chip 
            label={value} 
            size="small" 
            variant="outlined" 
            sx={{ fontFamily: 'monospace' }}
          />
        );
      
      case 'language':
        return (
          <Chip 
            label={value} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        );
      
      default:
        return (
          <Typography variant="body2" sx={{
            maxWidth: 250,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {value}
          </Typography>
        );
    }
  };

  const getColumnWidth = (column: SpreadsheetColumn) => {
    switch (column.type) {
      case 'identifier':
        return 120;
      case 'language':
        return 80;
      case 'url':
        return 200;
      default:
        return 'auto';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </CardContent>
      </Card>
    );
  }

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {downloadable && (
              <Button
                startIcon={<DownloadIcon />}
                size="small"
                variant="outlined"
              >
                Export
              </Button>
            )}
          </Box>

          {/* Search and Filters */}
          {(searchable || filterable) && (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {searchable && (
                <TextField
                  size="small"
                  placeholder="Search vocabulary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 300 }}
                />
              )}
              
              {filterable && (
                <Button
                  startIcon={<FilterIcon />}
                  size="small"
                  variant="outlined"
                >
                  Filters
                </Button>
              )}
            </Stack>
          )}

          {/* Results Summary */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing {paginatedData.length} of {filteredData.length} entries
            {searchTerm && ` matching "${searchTerm}"`}
          </Alert>
        </Box>

        {/* Table */}
        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ maxHeight }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column.id}
                    sx={{ 
                      width: getColumnWidth(column),
                      fontWeight: 'bold',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {column.label}
                      {column.required && (
                        <Chip label="Required" size="small" color="error" variant="outlined" />
                      )}
                    </Box>
                    {column.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {column.description}
                      </Typography>
                    )}
                  </TableCell>
                ))}
                <TableCell width={60} sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: onRowClick ? 'action.hover' : 'inherit',
                    }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {formatCellValue(row[column.id], column)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, row)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No results found for your search.' : 'No data available.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}

        {/* Row Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedRow) onRowClick?.(selectedRow);
            handleMenuClose();
          }}>
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          {onEdit && (
            <MenuItem onClick={() => {
              if (selectedRow) onEdit(selectedRow);
              handleMenuClose();
            }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
          )}
        </Menu>
      </CardContent>
    </Card>
  );
}