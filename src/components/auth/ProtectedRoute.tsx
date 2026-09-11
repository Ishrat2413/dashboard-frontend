'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Verifying security session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '80px auto',
          textAlign: 'center',
          padding: '40px',
        }}
        className="glass-panel"
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          This page requires one of the following permissions: {allowedRoles.join(', ')}. Your role is{' '}
          <span className="badge badge-warning">{user.role}</span>.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-primary"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
