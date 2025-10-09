import React, { useMemo } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface InLinkProps {
  /**
   * URL to link to - will be processed through useBaseUrl
   */
  href: string;

  /**
   * Link content
   */
  children: React.ReactNode;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Enable smart wrapping before parentheses
   * @default true
   */
  smartWrap?: boolean;
}

/**
 * Processes text to add zero-width spaces before parentheses for smart wrapping
 * and converts literal \n to line breaks
 */
const processTextForSmartWrap = (text: string): React.ReactNode => {
  // First, split by \n to handle line breaks
  const lines = text.split('\\n');

  if (lines.length === 1) {
    // No line breaks, just add zero-width spaces before parentheses
    return text.replace(/\(/g, '\u200B(');
  }

  // Multiple lines - create array of text nodes with <br/> elements
  return lines.reduce<React.ReactNode[]>((acc, line, index) => {
    // Add zero-width spaces before parentheses in this line
    const processedLine = line.replace(/\(/g, '\u200B(');
    acc.push(processedLine);

    // Add <br/> between lines (but not after the last line)
    if (index < lines.length - 1) {
      acc.push(<br key={`br-${index}`} />);
    }

    return acc;
  }, []);
};

/**
 * Recursively processes React children to apply smart wrapping to text nodes
 */
const processChildrenForSmartWrap = (
  children: React.ReactNode,
): React.ReactNode =>
  React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return processTextForSmartWrap(child);
    }
    if (React.isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const childWithProps = child as React.ReactElement<any>;
      if (childWithProps.props.children) {
        return React.cloneElement(childWithProps, {
          ...childWithProps.props,
          children: processChildrenForSmartWrap(childWithProps.props.children),
        });
      }
    }
    return child;
  });

/**
 * InLink component for internal documentation links with consistent styling
 * and smart text wrapping that breaks before parentheses when needed
 */
export const InLink: React.FC<InLinkProps> = ({
  href,
  children,
  className,
  smartWrap = true,
}) => {
  // Process URL through useBaseUrl
  const processedHref = useBaseUrl(href);

  // Process children for smart wrapping if enabled
  const processedChildren = useMemo(() => {
    if (smartWrap) {
      return processChildrenForSmartWrap(children);
    }
    return children;
  }, [children, smartWrap]);

  // Memoize className computation to ensure proper re-rendering
  const computedClassName = useMemo(() => {
    // If custom className is provided, use only that (no default styles)
    if (className) {
      return className;
    }
    // Otherwise, apply default IFLA link styling
    return clsx('linkInline', styles.inLink);
  }, [className]);

  return (
    <Link to={processedHref} className={computedClassName}>
      {processedChildren}
    </Link>
  );
};

export default InLink;
