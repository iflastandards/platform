import React from 'react';
export default function TabItem({ label, value, children }: { label: React.ReactNode; value: string; children: React.ReactNode }) {
  return (
    <div data-testid={`tab-${value || (typeof label === 'string' ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'unknown')}`}>
      <div>{label}</div>
      <div>{children}</div>
    </div>
  );
} 