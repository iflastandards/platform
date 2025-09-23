import React from 'react';
import InLink from '../InLink';
import styles from './styles.module.scss';

export type ExampleProperty = {
  property: string;
  value: React.ReactNode;
};

export type ExampleProps = {
  /** Optional short label/title for this example row-set */
  label?: React.ReactNode;
  /** Array of { property, value } pairs to render as a table */
  properties?: ExampleProperty[];
  /** Optional link to a full example page */
  fullExampleHref?: string;
  /** Optional trailing note under the table */
  note?: React.ReactNode;
  /** Optional header shown above the example (defaults to none) */
  header?: React.ReactNode;
  /** Whether to show the Property/Value table header row (defaults true) */
  showTableHeader?: boolean;
};

/**
 * <Example>
 * Declarative, structured example with an optional header and full-example link.
 * - Use `properties` for clean tables (preferred for consistency/export).
 * - Or pass `children` to render raw Markdown tables or custom markup (lowest friction).
 */
export default function Example({
  header,
  label,
  properties,
  fullExampleHref,
  note,
  children,
  showTableHeader = true,
}: React.PropsWithChildren<ExampleProps>) {
  const hasStructured = Array.isArray(properties) && properties.length > 0;

  return (
    <section className={styles.example}>
      {header ? <h4 className={styles.header}>{header}</h4> : null}
      {label ? <div className={styles.label}>{label}</div> : null}

      {hasStructured ? (
        <table className={styles.table}>
          {showTableHeader ? (
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
          ) : null}
          <tbody>
            {properties!.map((row, i) => (
              <tr key={i}>
                <td className={styles.prop}>{row.property}</td>
                <td className={styles.val}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {/* If authors prefer Markdown tables or custom content, render children */}
      {children ? <div className={styles.custom}>{children}</div> : null}

      {fullExampleHref ? (
        <div className={styles.fullref}>
          <em>
            Full example:{' '}
            <InLink href={fullExampleHref}>{fullExampleHref}</InLink>
          </em>
        </div>
      ) : null}

      {note ? <div className={styles.note}>{note}</div> : null}
    </section>
  );
}
