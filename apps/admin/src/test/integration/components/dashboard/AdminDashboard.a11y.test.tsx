
/**
 * @integration @accessibility @dashboard @high-priority
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AdminDashboard from '@/app/(authenticated)/dashboard/AdminDashboard';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * @group integration
 * @group components
 * @group accessibility
 * @group dashboard
 */
describe('AdminDashboard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<AdminDashboard userRoles={['admin']} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
