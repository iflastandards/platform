import React, { type PropsWithChildren } from 'react';
import styles from './styles.module.scss';

/**
 * <Examples>
 * Accessible, consistent wrapper around <details>/<summary> for example blocks.
 * - `summary` defaults to "Examples".
 * - `open` optionally expands by default.
 */
export default function Examples({
  children,
  summary = 'Examples',
  open,
}: PropsWithChildren<{ summary?: string; open?: boolean }>) {
  return (
    <details className={styles.examples} {...(open ? { open: true } : {})}>
      <summary className={styles.summary}>{summary}</summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
