'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { DevAccountSwitcher } from '@/components/auth/DevAccountSwitcher';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      setEmail('admin@example.com');
      setPassword('12345678');
    } else if (roleParam === 'shopowner') {
      setEmail('shopowner@example.com');
      setPassword('12345678');
    } else if (roleParam === 'customer') {
      setEmail('customer@example.com');
      setPassword('12345678');
    }

    if (searchParams.get('expired') === '1') {
      toast.warning('Session expired. Please log in again.');
    }
    if (searchParams.get('verified') === '1') {
      toast.success('Account verified successfully! You can now log in.');
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify your credentials.';
      setErrorMsg(msg);
      toast.error(msg);

      // Check if account not verified
      if (err.statusCode === 403 && msg.toLowerCase().includes('verif')) {
        setTimeout(() => {
          router.push(`/verify-account?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevFill = (devEmail: string, devPass: string) => {
    setEmail(devEmail);
    setPassword(devPass);
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        width: '100%',
        margin: '60px auto 80px',
        padding: '0 20px',
      }}
    >
      <div className="glass-panel-glow" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access your Zentura financial portfolio
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              color: '#fb7185',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" htmlFor="password-input" style={{ margin: 0 }}>
                Password
              </label>
              <Link
                href="/forgot-password"
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem',
                  padding: '4px',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '6px', height: '46px' }}
          >
            {loading ? <span className="animate-spin">⟳</span> : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Dev Account Switcher */}
        <DevAccountSwitcher onSelect={handleDevFill} />

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
