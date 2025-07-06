import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const Link: React.FC<LinkProps> = ({ to, children, ...props }) => (
  <a href={to} {...props} data-testid="docusaurus-link">
    {children}
  </a>
);

export default Link; 