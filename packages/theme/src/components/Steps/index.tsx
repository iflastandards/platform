import React, { type PropsWithChildren } from 'react';
import styles from './styles.module.scss';

/**
 * <Steps>
 * Wrap nested lists and enforce consistent numbering styles via CSS only.
 * Props allow per-block styling tweaks without changing list markup.
 */
export default function Steps({
  children,
  level1 = 'decimal',
  level2 = 'lower-alpha',
  level3 = 'lower-roman',
}: PropsWithChildren<{ level1?: string; level2?: string; level3?: string }>) {
  return (
    <div
      className={styles.steps}
      data-list-level1={level1}
      data-list-level2={level2}
      data-list-level3={level3}
    >
      {children}
    </div>
  );
}
