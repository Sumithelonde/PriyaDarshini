import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '../services/authService';
import { getToken, setUser, signOut } from '../utils/authStorage';

interface Props {
  roles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ roles, children }) => {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'redirect'>('checking');
  const [redirectTo, setRedirectTo] = useState('/login');
  const rolesKey = useMemo(() => roles.join('|'), [roles]);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const token = getToken();
      if (!token) {
        if (active) {
          setRedirectTo('/login');
          setStatus('redirect');
        }
        return;
      }

      try {
        const response = await getMe();
        const user = response?.user;

        if (!user) {
          signOut();
          if (active) {
            setRedirectTo('/login');
            setStatus('redirect');
          }
          return;
        }

        setUser(user);

        if (user.status !== 'verified') {
          if (active) {
            setRedirectTo('/wait');
            setStatus('redirect');
          }
          return;
        }

        if (!roles.includes(user.role)) {
          if (active) {
            setRedirectTo('/login');
            setStatus('redirect');
          }
          return;
        }

        if (active) {
          setStatus('allowed');
        }
      } catch (error) {
        signOut();
        if (active) {
          setRedirectTo('/login');
          setStatus('redirect');
        }
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [rolesKey]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <span className="text-sm font-medium text-muted-foreground">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (status === 'redirect') {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
