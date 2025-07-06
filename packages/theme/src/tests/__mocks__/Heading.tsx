import React from 'react';

export default function Heading({ as: Tag = 'h1', children, ...props }: { as?: React.ElementType; children: React.ReactNode; [key: string]: unknown }) {
  return <Tag {...props}>{children}</Tag>;
}