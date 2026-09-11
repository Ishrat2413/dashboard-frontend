'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await register(name, email, password, role);
      toast.success('Registration successful! Check your email for the 6-digit OTP.');
      router.push(`/verify-account?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '460px',
        width: '100%',
        margin: '50px auto 80px',
        padding: '0 20px',
      }}
    >
      <div className="glass-panel-glow" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join Zentura Finance with next-gen security
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
            }}
          >
            ✕ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label" htmlFor="name-input">
              Full Name
            </label>
            <input
              id="name-input"
              type="text"
              className="input-field"
              placeholder="Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="input-field"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password-input">
              Password (min 8 characters)
            </label>
            <input
              id="password-input"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="input-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['CUSTOMER', 'SHOP_OWNER', 'ADMIN'] as const).map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '8px',
                      border: isSelected
                        ? '1px solid var(--primary)'
                        : '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'var(--primary-subtle)'
                        : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {r === 'CUSTOMER' ? 'Customer' : r === 'SHOP_OWNER' ? 'Shop Owner' : 'Admin'}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', height: '46px' }}
          >
            {loading ? <span className="animate-spin">⟳</span> : 'Create Account'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Already registered?{' '}
          <Link
            href="/login"
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
