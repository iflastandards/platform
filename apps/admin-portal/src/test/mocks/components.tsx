import React from 'react';
import { vi } from 'vitest';

// Mock SiteManagementLink component from theme
export const MockSiteManagementLink = vi.fn(({ children, ...props }) => (
  <button data-testid="site-management-link" {...props}>
    {children || 'Site Management'}
  </button>
));

// Mock navigation components
export const MockNavbar = vi.fn(({ children }) => (
  <nav data-testid="navbar">{children}</nav>
));

export const MockSidebar = vi.fn(({ children }) => (
  <aside data-testid="sidebar">{children}</aside>
));

// Mock form components
export const MockButton = vi.fn(({ children, onClick, disabled, type = 'button', ...props }) => (
  <button
    data-testid="button"
    onClick={onClick}
    disabled={disabled}
    type={type}
    {...props}
  >
    {children}
  </button>
));

export const MockInput = vi.fn(({ value, onChange, placeholder, ...props }) => (
  <input
    data-testid="input"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    {...props}
  />
));

export const MockTextarea = vi.fn(({ value, onChange, placeholder, rows = 4, ...props }) => (
  <textarea
    data-testid="textarea"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    {...props}
  />
));

export const MockSelect = vi.fn(({ value, onChange, children, ...props }) => (
  <select data-testid="select" value={value} onChange={onChange} {...props}>
    {children}
  </select>
));

// Mock loading components
export const MockLoadingSpinner = vi.fn(() => (
  <div data-testid="loading-spinner">Loading...</div>
));

export const MockErrorBoundary = vi.fn(({ children, fallback }) => (
  <div data-testid="error-boundary">
    {fallback || children}
  </div>
));

// Mock layout components
export const MockContainer = vi.fn(({ children, className = '' }) => (
  <div data-testid="container" className={className}>
    {children}
  </div>
));

export const MockCard = vi.fn(({ children, title, className = '' }) => (
  <div data-testid="card" className={className}>
    {title && <h3 data-testid="card-title">{title}</h3>}
    <div data-testid="card-content">{children}</div>
  </div>
));

// Mock tab components
export const MockTabs = vi.fn(({ activeTab, onTabChange, children }) => (
  <div data-testid="tabs">
    <div data-testid="tab-list">
      {React.Children.map(children, (child, index) => (
        <button
          key={index}
          data-testid={`tab-${index}`}
          onClick={() => onTabChange?.(index)}
          className={activeTab === index ? 'active' : ''}
        >
          Tab {index}
        </button>
      ))}
    </div>
    <div data-testid="tab-content">
      {React.Children.toArray(children)[activeTab]}
    </div>
  </div>
));

export const MockTabPanel = vi.fn(({ children }) => (
  <div data-testid="tab-panel">{children}</div>
));

interface MockTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export const MockTable = vi.fn(({ headers, rows, className = '' }: MockTableProps) => (
  <table data-testid="table" className={className}>
    <thead>
      <tr>
        {headers?.map((header: string, index: number) => (
          <th key={index} data-testid={`header-${index}`}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows?.map((row: React.ReactNode[], rowIndex: number) => (
        <tr key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <td key={cellIndex} data-testid={`cell-${rowIndex}-${cellIndex}`}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
));

export const MockBadge = vi.fn(({ children, variant = 'default' }) => (
  <span data-testid="badge" data-variant={variant}>
    {children}
  </span>
));

// Export all mocks for easy importing
export const mockComponents = {
  SiteManagementLink: MockSiteManagementLink,
  Navbar: MockNavbar,
  Sidebar: MockSidebar,
  Button: MockButton,
  Input: MockInput,
  Textarea: MockTextarea,
  Select: MockSelect,
  LoadingSpinner: MockLoadingSpinner,
  ErrorBoundary: MockErrorBoundary,
  Container: MockContainer,
  Card: MockCard,
  Tabs: MockTabs,
  TabPanel: MockTabPanel,
  Table: MockTable,
  Badge: MockBadge,
};