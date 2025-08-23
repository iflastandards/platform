import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface UniqueProps {
  /**
   * Symbol to display (default is "1")
   */
  symbol?: string;
  
  /**
   * Text for the tooltip
   */
  tooltipText?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Unique component for indicating unique elements in documentation
 */
export const Unique: React.FC<UniqueProps> = ({
  symbol = '1',
  tooltipText = 'Unique',
  className,
}) => (
    <span
      className={clsx(
        'unique',
        styles.unique,
        className
      )}
      title={tooltipText}
      aria-label={tooltipText}
    >
      {symbol}
    </span>
  );

export default Unique;