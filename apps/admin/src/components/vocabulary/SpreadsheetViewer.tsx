'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Input,
  Alert,
  Skeleton,
  Dropdown,
  Space,
  Pagination,
  Row,
  Col,
  type MenuProps,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  ExportOutlined,
} from '@ant-design/icons';

const { Title, Text, Link } = Typography;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<SpreadsheetData[]>(data);
  const [selectedRow, setSelectedRow] = useState<SpreadsheetData | null>(null);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm]);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDownload = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      downloadCSV();
    } else {
      downloadJSON();
    }
  };

  const downloadCSV = () => {
    const headers = columns.map((col) => col.label).join(',');
    const rows = filteredData.map((row) =>
      columns
        .map((col) => {
          const value = row[col.id];
          // Escape values containing commas or quotes
          if (value && value.toString().includes(',')) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value || '';
        })
        .join(','),
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRowMenu = (record: SpreadsheetData): MenuProps => ({
    items: [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => onRowClick?.(record),
      },
      ...(onEdit
        ? [
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined />,
              onClick: () => onEdit(record),
            },
          ]
        : []),
      {
        key: 'copy',
        label: 'Copy ID',
        onClick: () => {
          navigator.clipboard.writeText(record.id);
        },
      },
    ],
  });

  const renderCellContent = (value: any, column: SpreadsheetColumn) => {
    if (value === null || value === undefined) {
      return <Text type="secondary">-</Text>;
    }

    switch (column.type) {
      case 'url':
        return (
          <Link href={value.toString()} target="_blank">
            {value.toString()}
            <ExportOutlined style={{ marginLeft: 4, fontSize: 10 }} />
          </Link>
        );
      case 'identifier':
        return (
          <Text code style={{ fontSize: 12 }}>
            {value.toString()}
          </Text>
        );
      case 'language':
        return <Tag>{value.toString()}</Tag>;
      case 'date':
        return new Date(value.toString()).toLocaleDateString();
      default:
        return value.toString();
    }
  };

  const tableColumns = [
    ...columns.map((col) => ({
      title: (
        <Space direction="vertical" size={0}>
          <Text strong>{col.label}</Text>
          {col.required && (
            <Tag color="red" style={{ fontSize: 10 }}>
              Required
            </Tag>
          )}
          {col.description && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {col.description}
            </Text>
          )}
        </Space>
      ),
      dataIndex: col.id,
      key: col.id,
      render: (value: any) => renderCellContent(value, col),
      ellipsis: true,
    })),
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: SpreadsheetData) => (
        <Dropdown menu={getRowMenu(record)} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            aria-label="More actions"
          />
        </Dropdown>
      ),
    },
  ];

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <Alert
          message="No Data Available"
          description="There is no vocabulary data to display."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const downloadMenu: MenuProps = {
    items: [
      {
        key: 'csv',
        label: 'Download as CSV',
        onClick: () => handleDownload('csv'),
      },
      {
        key: 'json',
        label: 'Download as JSON',
        onClick: () => handleDownload('json'),
      },
    ],
  };

  return (
    <Card>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {title}
            </Title>
            {subtitle && <Text type="secondary">{subtitle}</Text>}
          </Col>
          <Col>
            <Space>
              {searchable && (
                <Input.Search
                  placeholder="Search all columns..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: 250 }}
                  prefix={<SearchOutlined />}
                />
              )}
              {filterable && <Button icon={<FilterOutlined />}>Filters</Button>}
              {downloadable && (
                <Dropdown menu={downloadMenu}>
                  <Button icon={<DownloadOutlined />}>Download</Button>
                </Dropdown>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Total Records</Text>
            <Title level={4} style={{ margin: '8px 0 0 0' }}>
              {data.length.toLocaleString()}
            </Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Filtered</Text>
            <Title level={4} style={{ margin: '8px 0 0 0' }}>
              {filteredData.length.toLocaleString()}
            </Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Required Fields</Text>
            <Title level={4} style={{ margin: '8px 0 0 0' }}>
              {columns.filter((c) => c.required).length}
            </Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">Completeness</Text>
            <Title level={4} style={{ margin: '8px 0 0 0' }}>
              {Math.round(
                (filteredData.reduce((acc, row) => {
                  const filledRequired = columns
                    .filter((c) => c.required)
                    .filter(
                      (c) => row[c.id] !== null && row[c.id] !== undefined,
                    ).length;
                  return (
                    acc +
                    filledRequired / columns.filter((c) => c.required).length
                  );
                }, 0) /
                  filteredData.length) *
                  100,
              )}
              %
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Search Results Info */}
      {searchTerm && (
        <Alert
          message={`Showing ${filteredData.length} results for "${searchTerm}"`}
          type="info"
          showIcon
          closable
          onClose={() => setSearchTerm('')}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Data Table */}
      <Table
        columns={tableColumns}
        dataSource={paginatedData}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content', y: maxHeight }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRow(record);
            onRowClick?.(record);
          },
          style: {
            cursor: onRowClick ? 'pointer' : 'default',
          },
        })}
        rowClassName={(record) =>
          selectedRow?.id === record.id ? 'ant-table-row-selected' : ''
        }
      />

      {/* Pagination */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={handlePageChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          pageSizeOptions={['10', '25', '50', '100']}
        />
      </div>
    </Card>
  );
}
