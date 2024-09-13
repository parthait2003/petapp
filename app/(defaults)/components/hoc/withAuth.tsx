'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const auth = localStorage.getItem('auth');
      console.log('Checking authentication...');

      if (auth) {
        console.log('Authenticated');
        setIsAuthenticated(true);
      } else {
        console.log('Not authenticated, redirecting to login...');
        router.push('/login');
      }
    }, [router]);

    if (!isAuthenticated) {
      return null; // Render nothing if not authenticated
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
