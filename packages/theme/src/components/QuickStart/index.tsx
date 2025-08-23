import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface QuickStartProps {
  /** Path to introduction documentation */
  introductionPath?: string;
  /** Path to elements documentation */
  elementsPath?: string;
  /** Path to examples documentation */
  examplesPath?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuickStart component for cataloguers to navigate to key sections
 * Provides quick access to introduction, elements, and examples
 */
export const QuickStart: React.FC<QuickStartProps> = ({
  introductionPath = '/docs/intro',
  elementsPath = '/docs/elements',
  examplesPath = '/docs/examples',
  className = '',
}) => (
    <div className={clsx(styles.quickstartPanel, className)}>
      <h2>Quick Start for Cataloguers</h2>
      <p>Get started with the key sections of this standard:</p>
      <div className={styles.quickstartLinks}>
        <Link
          className={clsx('button', 'button--primary', 'button--lg', styles.quickstartLink)}
          to={introductionPath}>
          📖 Introduction
        </Link>
        <Link
          className={clsx('button', 'button--secondary', 'button--lg', styles.quickstartLink)}
          to={elementsPath}>
          🔧 Elements
        </Link>
        <Link
          className={clsx('button', 'button--secondary', 'button--lg', styles.quickstartLink)}
          to={examplesPath}>
          💡 Examples
        </Link>
      </div>
    </div>
  );

export default QuickStart;