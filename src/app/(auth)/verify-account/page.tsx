'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { OtpInput } from '@/components/auth/OtpInput';

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyAccount, resendVerificationOtp } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length < 6) {
      setErrorMsg('Please enter your email and the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await verifyAccount(email, otp);
      toast.success('Account verified successfully! Please log in.');
      router.push('/login?verified=1');
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired OTP code.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Please enter your email first.');
      return;
    }
    if (cooldown > 0) return;

    setResending(true);
    setErrorMsg(null);

    try {
      await resendVerificationOtp(email);
      toast.success('A new verification code has been dispatched to your email.');
      setCooldown(60);
    } catch (err: any) {
      const msg = err.message || 'Could not resend code. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '460px',
        width: '100%',
        margin: '60px auto 80px',
        padding: '0 20px',
      }}
    >
      <div className="glass-panel-glow" style={{ padding: '36px 32px', textAlign: 'center' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '18px',
          }}
        >
          ✉️
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Verify Your Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Enter the 6-digit code delivered to your registered email address.
        </p>

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
              textAlign: 'left',
            }}
          >
            ✕ {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label className="input-label" htmlFor="verify-email">
              Verification Email
            </label>
            <input
              id="verify-email"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="input-label" style={{ textAlign: 'center' }}>
            Enter 6-Digit Code
          </label>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.length < 6}
            style={{ width: '100%', marginTop: '10px', height: '46px' }}
          >
            {loading ? <span className="animate-spin">⟳</span> : 'Confirm & Activate Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            style={{
              color: cooldown > 0 ? 'var(--text-dim)' : 'var(--accent-cyan)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {resending
              ? 'Sending code...'
              : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Didn't receive code? Resend OTP"}
          </button>

          <Link
            href="/login"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading verification...</div>}>
      <VerifyAccountContent />
    </Suspense>
  );
}
