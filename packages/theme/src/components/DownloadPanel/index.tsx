import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface DownloadPanelProps {
  /** URL for PDF download */
  pdfUrl?: string;
  /** URL for TTL (Turtle) download */
  ttlUrl?: string;
  /** URL for JSON-LD download */
  jsonLdUrl?: string;
  /** URL for RDF/XML download */
  xmlUrl?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DownloadPanel component for displaying download links to various formats
 * Supports PDF documentation and RDF serializations (TTL, JSON-LD, RDF/XML)
 */
export const DownloadPanel: React.FC<DownloadPanelProps> = ({
  pdfUrl,
  ttlUrl,
  jsonLdUrl,
  xmlUrl,
  className = '',
}) => (
    <div className={clsx(styles.downloadPanel, className)}>
      <h2>Download Resources</h2>
      <div className={styles.downloadSections}>
        <div className={styles.downloadSection}>
          <h3>📄 Documentation</h3>
          <p>Download the complete standard documentation</p>
          {pdfUrl ? (
            <Link
              className="button button--primary button--block"
              to={pdfUrl}>
              Download PDF
            </Link>
          ) : (
            <button
              className="button button--primary button--block"
              disabled>
              Download PDF (Coming Soon)
            </button>
          )}
        </div>
        
        <div className={styles.downloadSection}>
          <h3>🔗 RDF Formats</h3>
          <p>Download the standard in various RDF serializations</p>
          <div className={styles.downloadButtons}>
            {ttlUrl ? (
              <Link
                className="button button--secondary button--block"
                to={ttlUrl}>
                TTL (Turtle)
              </Link>
            ) : (
              <button
                className="button button--secondary button--block"
                disabled>
                TTL (Coming Soon)
              </button>
            )}
            {jsonLdUrl ? (
              <Link
                className="button button--secondary button--block"
                to={jsonLdUrl}>
                JSON-LD
              </Link>
            ) : (
              <button
                className="button button--secondary button--block"
                disabled>
                JSON-LD (Coming Soon)
              </button>
            )}
            {xmlUrl ? (
              <Link
                className="button button--secondary button--block"
                to={xmlUrl}>
                RDF/XML
              </Link>
            ) : (
              <button
                className="button button--secondary button--block"
                disabled>
                RDF/XML (Coming Soon)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

export default DownloadPanel;