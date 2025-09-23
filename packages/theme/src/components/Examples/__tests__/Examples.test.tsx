/**
 * @testing-library @unit @high-priority @ui @docs
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Examples from '../index';

describe('<Examples />', () => {
  it('renders summary text and details', () => {
    render(
      <Examples summary="Examples" open>
        <div>child</div>
      </Examples>,
    );

    expect(screen.getByText('Examples')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
