# Next.js Component Standards

## Component Architecture

### refine.dev + Ant Design Pattern
The admin application uses refine.dev for CRUD operations with Ant Design (antd) components for UI. This provides:

- **Consistent UI**: Ant Design design system
- **Type Safety**: TypeScript throughout  
- **CRUD Operations**: Built-in data fetching and mutations
- **Form Handling**: Automatic form validation and submission
- **Table Management**: Sorting, filtering, pagination
- **RBAC Integration**: Role-based access control

### Component Hierarchy
```
Page Components (refine CRUD)
├── Layout Components (Ant Design)
├── Business Components (Custom)
├── UI Components (Ant Design + Custom)
└── Utility Components (Shared)
```

## Page Components (refine.dev CRUD)

### List Pages
```typescript
// app/(authenticated)/users/page.tsx
'use client'
import { List, useTable } from '@refinedev/antd';
import { Table, Space, Button } from 'antd';

function UsersListPage() {
  const { tableProps } = useTable({
    resource: 'users',
    sorters: {
      initial: [{ field: 'createdAt', order: 'desc' }],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column
          title="Actions"
          render={(_, record) => (
            <Space>
              <Button type="link" href={`/users/${record.id}`}>
                View
              </Button>
              <Button type="link" href={`/users/${record.id}/edit`}>
                Edit
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
}

export default UsersListPage;
```

### Create Pages
```typescript
// app/(authenticated)/users/new/page.tsx
'use client'
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

function CreateUserPage() {
  const { formProps, saveButtonProps } = useForm({
    resource: 'users',
    redirect: 'list',
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Must be valid email' },
          ]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="editor">Editor</Select.Option>
            <Select.Option value="author">Author</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Create>
  );
}

export default CreateUserPage;
```

### Detail Pages
```typescript
// app/(authenticated)/users/[id]/page.tsx
'use client'
import { Show, TextField, EmailField } from '@refinedev/antd';
import { Typography } from 'antd';

interface PageProps {
  params: { id: string };
}

function UserDetailPage({ params }: PageProps) {
  return (
    <Show resource="users" recordItemId={params.id}>
      <Typography.Title level={5}>Name</Typography.Title>
      <TextField source="name" />
      
      <Typography.Title level={5}>Email</Typography.Title>
      <EmailField source="email" />
      
      <Typography.Title level={5}>Role</Typography.Title>
      <TextField source="role" />
    </Show>
  );
}

export default UserDetailPage;
```

### Edit Pages
```typescript
// app/(authenticated)/users/[id]/edit/page.tsx
'use client'
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

interface PageProps {
  params: { id: string };
}

function EditUserPage({ params }: PageProps) {
  const { formProps, saveButtonProps } = useForm({
    resource: 'users',
    id: params.id,
    redirect: 'show',
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input />
        </Form.Item>
        <Form.Item label="Role" name="role">
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="editor">Editor</Select.Option>
            <Select.Option value="author">Author</Select.Option>
          </Select>
        </Select>
      </Form>
    </Edit>
  );
}

export default EditUserPage;
```

## Business Components

### Custom Resource Components
```typescript
// components/CsvUpload.tsx
'use client'
import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

interface CsvUploadProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

function CsvUpload({ onUpload, loading = false }: CsvUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadProps: UploadProps = {
    accept: '.csv',
    beforeUpload: (file) => {
      if (file.type !== 'text/csv') {
        message.error('Only CSV files are allowed');
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        message.error('File must be smaller than 10MB');
        return false;
      }

      onUpload(file);
      return false; // Prevent automatic upload
    },
    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
  };

  return (
    <Upload {...uploadProps}>
      <Button 
        icon={<UploadOutlined />} 
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Select CSV File'}
      </Button>
    </Upload>
  );
}

export default CsvUpload;
```

### Job Status Component
```typescript
// components/JobStatus.tsx
'use client'
import { Progress, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { Job } from '@/packages/contracts/schemas/Job.zod';

interface JobStatusProps {
  job: Job;
  showProgress?: boolean;
}

function JobStatus({ job, showProgress = true }: JobStatusProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'running':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'processing';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {getStatusIcon()}
        <Tag color={getStatusColor()}>
          {job.status.toUpperCase()}
        </Tag>
        <Typography.Text type="secondary">
          {job.type}
        </Typography.Text>
      </div>
      
      {showProgress && job.status === 'running' && (
        <Progress 
          percent={job.progress} 
          size="small"
          status={job.status === 'failed' ? 'exception' : 'active'}
        />
      )}
      
      {job.error && (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          Error: {job.error}
        </Typography.Text>
      )}
    </div>
  );
}

export default JobStatus;
```

## Form Components

### Validation Patterns
```typescript
// components/UserForm.tsx
'use client'
import { Form, Input, Select, Button } from 'antd';
import { UserSchema } from '@/packages/contracts/schemas/User.zod';
import type { User } from '@/packages/contracts/schemas/User.zod';

interface UserFormProps {
  initialValues?: Partial<User>;
  onSubmit: (values: Omit<User, 'id'>) => Promise<void>;
  loading?: boolean;
}

function UserForm({ initialValues, onSubmit, loading }: UserFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      // Validate with Zod before submission
      const validatedData = UserSchema.omit({ id: true }).parse(values);
      await onSubmit(validatedData);
      form.resetFields();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to form errors
        const formErrors = error.errors.map(err => ({
          name: err.path,
          errors: [err.message],
        }));
        form.setFields(formErrors);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[
          { required: true, message: 'Name is required' },
          { min: 1, max: 100, message: 'Name must be 1-100 characters' },
        ]}
      >
        <Input placeholder="Enter full name" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Must be a valid email address' },
        ]}
      >
        <Input placeholder="user@example.com" />
      </Form.Item>

      <Form.Item
        label="Role"
        name="role"
        rules={[{ required: true, message: 'Please select a role' }]}
      >
        <Select placeholder="Select user role">
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="editor">Editor</Select.Option>
          <Select.Option value="author">Author</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save User'}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default UserForm;
```

## Data Display Components

### Table Components
```typescript
// components/UsersTable.tsx
'use client'
import { Table, Tag, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { User } from '@/packages/contracts/schemas/User.zod';
import type { ColumnsType } from 'antd/es/table';

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

function UsersTable({ users, loading, onEdit, onDelete }: UsersTableProps) {
  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap = {
          admin: 'red',
          editor: 'blue',
          author: 'green',
        };
        return <Tag color={colorMap[role as keyof typeof colorMap]}>{role}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Editor', value: 'editor' },
        { text: 'Author', value: 'author' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete user"
            description="Are you sure you want to delete this user?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} users`,
      }}
    />
  );
}

export default UsersTable;
```

## Layout Components

### Page Headers
```typescript
// components/PageHeader.tsx
import { PageHeader as AntPageHeader, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showCreateButton?: boolean;
  showRefreshButton?: boolean;
  onCreateClick?: () => void;
  onRefreshClick?: () => void;
  extra?: React.ReactNode;
}

function PageHeader({
  title,
  subtitle,
  showCreateButton,
  showRefreshButton,
  onCreateClick,
  onRefreshClick,
  extra,
}: PageHeaderProps) {
  const actions = [];

  if (showRefreshButton && onRefreshClick) {
    actions.push(
      <Button
        key="refresh"
        icon={<ReloadOutlined />}
        onClick={onRefreshClick}
      >
        Refresh
      </Button>
    );
  }

  if (showCreateButton && onCreateClick) {
    actions.push(
      <Button
        key="create"
        type="primary"
        icon={<PlusOutlined />}
        onClick={onCreateClick}
      >
        Create
      </Button>
    );
  }

  if (extra) {
    actions.push(extra);
  }

  return (
    <AntPageHeader
      title={title}
      subTitle={subtitle}
      extra={actions.length > 0 ? <Space>{actions}</Space> : undefined}
    />
  );
}

export default PageHeader;
```

## Accessibility Guidelines

### ARIA Labels and Roles
```typescript
// Accessible form example
<Form
  form={form}
  layout="vertical"
  role="form"
  aria-labelledby="form-title"
>
  <Typography.Title id="form-title" level={2}>
    Create New User
  </Typography.Title>
  
  <Form.Item
    label="Name"
    name="name"
    required
  >
    <Input
      placeholder="Enter full name"
      aria-describedby="name-help"
      aria-required="true"
    />
    <Typography.Text id="name-help" type="secondary">
      Enter the user's full name (required)
    </Typography.Text>
  </Form.Item>
  
  <Button
    type="primary"
    htmlType="submit"
    aria-describedby="submit-help"
  >
    Create User
  </Button>
  <Typography.Text id="submit-help" type="secondary">
    This will create a new user account with the specified role
  </Typography.Text>
</Form>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Proper tab order and focus management
- Visual focus indicators
- Escape key support for modals and dropdowns

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy (h1 → h2 → h3)
- Alternative text for images and icons
- Status updates announced to screen readers

## Testing Patterns

### Component Testing
```typescript
// UserForm.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { UserForm } from './UserForm';

describe('UserForm @integration @ui @validation', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should validate required fields', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByText('Save User');
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'admin');
    
    await userEvent.click(screen.getByText('Save User'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    });
  });
});
```

This component architecture ensures consistency, maintainability, and accessibility across all Next.js admin components while leveraging the power of refine.dev and Ant Design.