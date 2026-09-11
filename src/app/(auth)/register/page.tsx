'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PasswordStrengthMeter, evaluatePassword } from '@/components/auth/PasswordStrengthMeter';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      return;
    }

    const { isValid } = evaluatePassword(password);
    if (!isValid) {
      setErrorMsg(
        'Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await register(fullName, email, password, role);
      toast.success('Registration successful! Check your email for the 6-digit OTP.');
      router.push(`/verify-account?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        width: '100%',
        margin: '50px auto 80px',
        padding: '0 20px',
      }}
    >
      <div className="glass-panel-glow" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enterprise-grade identity registration for Zentura Finance
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
            <label className="input-label" htmlFor="fullname-input">
              Full Legal Name (2–100 chars)
            </label>
            <input
              id="fullname-input"
              type="text"
              className="input-field"
              placeholder="Alex Vance"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email-input">
              Corporate / Personal Email
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
              Password (Complexity Policy)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
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

            {/* Real-Time Entropy Evaluator */}
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <label className="input-label">Account Tier / Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {(['CUSTOMER', 'SHOP_OWNER'] as const).map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '8px',
                      border: isSelected
                        ? '1px solid var(--primary)'
                        : '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'var(--primary-subtle)'
                        : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {r === 'CUSTOMER' ? 'Individual (Customer)' : 'Merchant (Shop Owner)'}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px', display: 'block' }}>
              * System Admin accounts are provisioned out-of-band for security.
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !evaluatePassword(password).isValid}
            style={{ width: '100%', marginTop: '8px', height: '46px' }}
          >
            {loading ? <span className="animate-spin">⟳</span> : 'Create Protected Account'}
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
