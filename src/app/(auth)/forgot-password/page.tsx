'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/context/ToastContext';
import { OtpInput } from '@/components/auth/OtpInput';
import { PasswordStrengthMeter, evaluatePassword } from '@/components/auth/PasswordStrengthMeter';
import { ResetTokenPayload, ServiceResponse } from '@/lib/types';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      toast.success('If an account exists, a reset code was sent.');
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset code.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and acquire reset_token
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length < 6) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res: ServiceResponse<ResetTokenPayload> = await apiRequest(
        '/auth/forget-password-verify-otp',
        {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
        }
      );

      if (res.data?.reset_token) {
        setResetToken(res.data.reset_token);
        toast.success('Code verified! Please choose a new password.');
        setStep(3);
      } else {
        throw new Error('No reset token returned.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired OTP code.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password with reset_token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = evaluatePassword(newPassword);
    if (!isValid) {
      setErrorMsg(
        'Password must contain at least 8 characters, with upper & lowercase letters, numbers, and special symbols.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          reset_token: resetToken.trim().toLowerCase(),
          newPassword,
        }),
      });

      toast.success('Password reset successfully! Please sign in.');
      router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password.';
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
        margin: '60px auto 80px',
        padding: '0 20px',
      }}
    >
      <div className="glass-panel-glow" style={{ padding: '36px 32px' }}>
        {/* Progress indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: s === step ? 'var(--primary)' : s < step ? '#059669' : 'rgba(255,255,255,0.15)',
                transition: 'all var(--transition-normal)',
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.7rem', marginBottom: '8px' }}>
            {step === 1
              ? 'Reset Your Password'
              : step === 2
              ? 'Enter Reset Code'
              : 'Set New Password'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {step === 1
              ? "Enter your email and we'll send a 6-digit recovery code."
              : step === 2
              ? `Enter the 6-digit code sent to ${email}.`
              : 'Choose a strong password satisfying the security policy.'}
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

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="input-label" htmlFor="forgot-email">
                Account Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !email}
              style={{ width: '100%', height: '46px' }}
            >
              {loading ? <span className="animate-spin">⟳</span> : 'Send Recovery Code'}
            </button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || otp.length < 6}
              style={{ width: '100%', height: '46px' }}
            >
              {loading ? <span className="animate-spin">⟳</span> : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
            >
              Change email address
            </button>
          </form>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="input-label" htmlFor="new-password">
                New Password (Complexity Enforced)
              </label>
              <input
                id="new-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>
            <div>
              <label className="input-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !evaluatePassword(newPassword).isValid || !confirmPassword}
              style={{ width: '100%', height: '46px' }}
            >
              {loading ? <span className="animate-spin">⟳</span> : 'Update Password & Sign In'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href="/login"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
