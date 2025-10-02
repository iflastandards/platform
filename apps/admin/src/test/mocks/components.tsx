import React from 'react';
import { vi } from 'vitest';

// Type definitions for mock components
interface MockTableProps {
  headers?: string[];
  rows?: React.ReactNode[][];
  className?: string;
}

// Mock SiteManagementLink component from theme
export const MockSiteManagementLink = vi.fn(({ children, ...props }) => (
  <button type="button" data-testid="site-management-link" {...props}>
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
export const MockButton = vi.fn(
  ({ children, onClick, disabled, type = 'button', ...props }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
);

export const MockTable = vi.fn(
  ({ headers, rows, className = '' }: MockTableProps) => (
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
  ),
);

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
  Table: MockTable,
  Badge: MockBadge,
};
