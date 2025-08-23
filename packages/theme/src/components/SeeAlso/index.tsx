import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface SeeAlsoProps {
  /**
   * Content of the see also section
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SeeAlso component for related content references
 * 
 * Using div instead of p tag to prevent DOM nesting issues
 * when component is used inside paragraphs
 */
export const SeeAlso: React.FC<SeeAlsoProps> = ({
  children,
  className,
}) => (
    <div
      className={clsx(
        'seeAlso',
        styles.seeAlso,
        className
      )}
    >
      <div className={styles.seeAlsoText}>
        <i>See also</i>: {children}
      </div>
    </div>
  );

export default SeeAlso;