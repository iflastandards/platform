import React, { useEffect, useState } from 'react';
import { EditChoiceModal } from '@ifla/theme';

interface RootProps {
  children: React.ReactNode;
}

interface ModalState {
  isOpen: boolean;
  editUrl: string;
  pageUrl: string;
  pageTitle: string;
}

export default function Root({ children }: RootProps): React.ReactElement {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    editUrl: '',
    pageUrl: '',
    pageTitle: '',
  });

  useEffect(() => {
    const handleEditClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const editLink = target.closest('a[href*="/edit/"]') as HTMLAnchorElement;
      
      if (editLink) {
        event.preventDefault();
        event.stopPropagation();

        // Extract page information
        const pageUrl = window.location.href;
        const pageTitle = document.title.replace(' | unimarc', '').replace(' | UNIMARC', '');

        setModalState({
          isOpen: true,
          editUrl: editLink.href,
          pageUrl,
          pageTitle,
        });
      }
    };

    // Add event listener with capture to catch before other handlers
    document.addEventListener('click', handleEditClick, true);

    return () => {
      document.removeEventListener('click', handleEditClick, true);
    };
  }, []);

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {children}
      <EditChoiceModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        editUrl={modalState.editUrl}
        pageUrl={modalState.pageUrl}
        pageTitle={modalState.pageTitle}
        siteKey="unimarc"
      />
    </>
  );
}
