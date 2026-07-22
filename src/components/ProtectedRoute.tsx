import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        const localAuth = JSON.parse(localStorage.getItem('kozzak_auth') || 'null');

        if (isMounted) {
          if (!session && !localAuth) {
            setHasSession(false);
            setIsAdmin(false);
          } else {
            setHasSession(true);
            const sessionEmail = session?.user?.email?.toLowerCase();
            const localEmail = localAuth?.email?.toLowerCase();
            const activeEmail = sessionEmail || localEmail;
            const isUserAdmin = activeEmail === 'samirazmain8@gmail.com';
            setIsAdmin(isUserAdmin);
          }
        }
      } catch (err) {
        console.error('Error checking Supabase auth session:', err);
        if (isMounted) {
          setHasSession(false);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        const localAuth = JSON.parse(localStorage.getItem('kozzak_auth') || 'null');
        const sessionEmail = session?.user?.email?.toLowerCase();
        const localEmail = localAuth?.email?.toLowerCase();
        const activeEmail = sessionEmail || localEmail;

        if (!session && !localAuth) {
          setHasSession(false);
          setIsAdmin(false);
        } else {
          setHasSession(true);
          const isUserAdmin = activeEmail === 'samirazmain8@gmail.com';
          setIsAdmin(isUserAdmin);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-silver">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cobalt border-t-transparent rounded-full animate-spin" />
          <p className="text-xs tracking-widest uppercase text-silver/60 font-semibold">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // If no session, redirect to /login
  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  // If admin is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
