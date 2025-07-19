import React from 'react';
import InLink from '../InLink';
import styles from './styles.module.scss';

interface CompactButtonProps {
  href: string;
  children: React.ReactNode;
}

export function CompactButton({ href, children }: CompactButtonProps) {
  return (
    <InLink href={href} className={`button button--primary button--sm ${styles.compactButton}`}>
      <span>{children}</span>
    </InLink>
  );
}

export default CompactButton;