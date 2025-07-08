import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import useIsBrowser from '@docusaurus/useIsBrowser';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AdminRouter } from '@ifla/theme';

export default function AdminPage(): React.ReactNode {
  return (
    <Layout
      title="IFLA Standards Administration"
      description="Administrative interface for IFLA Standards management">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => <AdminSPA />}
      </BrowserOnly>
    </Layout>
  );
}

function AdminSPA(): React.ReactNode {
  const isBrowser = useIsBrowser();
  const [currentPath, setCurrentPath] = useState('');
  
  useEffect(() => {
    if (isBrowser) {
      // Get the current path after /admin
      const path = window.location.pathname.replace(/^\/admin\/?/, '');
      setCurrentPath(path);
      
      // Listen for browser navigation
      const handlePopState = () => {
        const newPath = window.location.pathname.replace(/^\/admin\/?/, '');
        setCurrentPath(newPath);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isBrowser]);
  
  // Navigate function for internal navigation
  const navigate = (path: string) => {
    const newPath = `/admin/${path}`.replace(/\/+/g, '/');
    window.history.pushState({}, '', newPath);
    setCurrentPath(path);
  };
  
  if (!isBrowser) {
    return <div>Loading admin interface...</div>;
  }
  
  return (
    <AdminRouter 
      currentPath={currentPath} 
      navigate={navigate}
    />
  );
}