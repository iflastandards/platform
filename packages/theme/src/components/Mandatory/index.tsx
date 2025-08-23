import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

export interface MandatoryProps {
  /** URL for more info; defaults to the intro page */
  link?: string;
  /** Symbol to render; defaults to '✽' */
  symbol?: string;
  /** Tooltip/title text; defaults to 'Mandatory' */
  tooltipText?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
}

export const Mandatory: React.FC<MandatoryProps> = ({
  link: rawLink,
  symbol: rawSymbol,
  tooltipText: rawTooltipText,
  className,
}) => {
  const defaultTooltipText = 'Mandatory';
  const linkPathRaw = rawLink ?? 'docs/intro#i022';
  const tooltipText = rawTooltipText ?? defaultTooltipText;
  const symbol = rawSymbol ?? '✽';

  // Process URL through Docusaurus hook
  const processedViaHook = useBaseUrl(linkPathRaw);
  const processedLink = processedViaHook
    ? processedViaHook
    : linkPathRaw.startsWith('/')
      ? linkPathRaw
      : `/${  linkPathRaw}`;

  // Accessibility labels
  const defaultLabel = `${defaultTooltipText} - click for more information`;
  const customLabel = `${tooltipText} - click for more information`;
  const isCustomTooltipOnly = rawTooltipText !== undefined && rawLink === undefined;

  // Determine anchor attributes
  const anchorProps = isCustomTooltipOnly
    ? { 'aria-labelledby': 'mandatory-default-label', 'aria-label': customLabel }
    : { 'aria-label': customLabel };

  return (
    <span
      className={clsx('mandatory', styles.mandatory, className)}
      title={tooltipText}
      aria-label={tooltipText}
    >
      {isCustomTooltipOnly && (
        <span
          id="mandatory-default-label"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            margin: '-1px',
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {defaultLabel}
        </span>
      )}
      <a
        href={processedLink}
        className={styles.mandatoryLink}
        {...anchorProps}
      >
        {symbol}
      </a>
    </span>
  );
};

export default Mandatory;
