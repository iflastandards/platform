/**
 * @testing-library @unit @high-priority @ui @docs
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../InLink', () => ({
  default: (props: any) => <a {...props} />,
}));

import Example from '../index';

describe('<Example />', () => {
  it('renders a table with header by default', () => {
    render(
      <Example
        properties={[
          { property: 'has category of carrier', value: '"volume"' },
          { property: 'has extent of manifestation', value: '"1 volume"' },
        ]}
      />,
    );

    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('"volume"')).toBeInTheDocument();
  });

  it('omits header when showTableHeader is false', () => {
    render(
      <Example
        showTableHeader={false}
        properties={[{ property: 'p', value: 'v' }]}
      />,
    );

    // No th elements
    expect(screen.queryByText('Property')).toBeNull();
    expect(screen.queryByText('Value')).toBeNull();
    expect(screen.getByText('p')).toBeInTheDocument();
    expect(screen.getByText('v')).toBeInTheDocument();
  });

  it('renders children when provided (markdown table block)', () => {
    render(
      <Example>
        <table>
          <tbody>
            <tr>
              <td>p</td>
              <td>v</td>
            </tr>
          </tbody>
        </table>
      </Example>,
    );

    expect(screen.getByText('p')).toBeInTheDocument();
    expect(screen.getByText('v')).toBeInTheDocument();
  });
});
