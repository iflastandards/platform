import React, { useState, useEffect, useCallback } from 'react';
import styles from './styles.module.scss';

export interface EditChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUrl: string;
  pageUrl: string;
  siteKey: string;
  pageTitle?: string;
}

export function EditChoiceModal({
  isOpen,
  onClose,
  editUrl,
  pageUrl,
  siteKey,
  pageTitle,
}: EditChoiceModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Generate GitHub issue URL with pre-filled data
  const generateIssueUrl = () => {
    const baseUrl = 'https://github.com/iflastandards/standards-dev/issues/new';
    const template = 'documentation-issue.yml';
    
    // Extract relative path from full URL for cleaner display
    const relativePath = pageUrl.split('/docs/')[1] || pageUrl;
    const issueTitle = pageTitle 
      ? `[${siteKey}] Issue with: ${pageTitle}` 
      : `[${siteKey}] Documentation Issue`;

    const params = new URLSearchParams({
      template,
      labels: `documentation,${siteKey.toLowerCase()}`,
      title: issueTitle,
      'page-url': pageUrl,
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleEditClick = () => {
    window.open(editUrl, '_blank');
    onClose();
  };

  const handleReportClick = () => {
    window.open(generateIssueUrl(), '_blank');
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalBackdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-choice-title"
    >
      <div className={styles.modalContent}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
          type="button"
        >
          ×
        </button>
        
        <h2 id="edit-choice-title" className={styles.modalTitle}>
          How would you like to contribute?
        </h2>
        
        <p className={styles.modalDescription}>
          You can edit the page directly or report an issue for others to address.
        </p>

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.choiceButton} ${styles.editButton}`}
            onClick={handleEditClick}
            type="button"
          >
            <span className={styles.buttonIcon}>✏️</span>
            <div className={styles.buttonText}>
              <strong>Edit on GitHub</strong>
              <small>Make changes directly to the documentation</small>
            </div>
          </button>

          <button
            className={`${styles.choiceButton} ${styles.reportButton}`}
            onClick={handleReportClick}
            type="button"
          >
            <span className={styles.buttonIcon}>🐛</span>
            <div className={styles.buttonText}>
              <strong>Report an Issue</strong>
              <small>Let others know about a problem you found</small>
            </div>
          </button>
        </div>

        <div className={styles.pageInfo}>
          <small>
            <strong>Page:</strong> {pageUrl}
          </small>
        </div>
      </div>
    </div>
  );
}

export default EditChoiceModal;