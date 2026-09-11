'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiRequest } from '@/lib/api-client';
import { OtpInput } from '@/components/auth/OtpInput';
import { PasswordStrengthMeter, evaluatePassword } from '@/components/auth/PasswordStrengthMeter';

export default function ProfilePage() {
  const { user, refreshProfile, changePassword, logout, logoutAll } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Name Update State
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Email Change State
  const [newEmail, setNewEmail] = useState('');
  const [emailAuthPassword, setEmailAuthPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [changingEmail, setChangingEmail] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email'>('general');

  // Handle Display Name Update
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingName(true);
    try {
      await apiRequest('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      });
      await refreshProfile();
      toast.success('Display name updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update name.';
      toast.error(msg);
    } finally {
      setSavingName(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('File exceeds maximum size of 3 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      await apiRequest('/profile/me/avatar', {
        method: 'POST',
        body: formData,
      });
      await refreshProfile();
      toast.success('Avatar uploaded successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar.';
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Avatar Removal
  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setRemovingAvatar(true);
    try {
      await apiRequest('/profile/me/avatar', {
        method: 'DELETE',
      });
      await refreshProfile();
      toast.success('Avatar removed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove avatar.';
      toast.error(msg);
    } finally {
      setRemovingAvatar(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    const { isValid } = evaluatePassword(newPassword);
    if (!isValid) {
      toast.error(
        'New password must contain at least 8 characters, with upper & lowercase letters, numbers, and special symbols.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Email Change Step 1 (Initiate)
  const handleInitiateEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailAuthPassword) return;

    setChangingEmail(true);
    try {
      await apiRequest('/auth/change-email/initiate', {
        method: 'POST',
        body: JSON.stringify({
          newEmail: newEmail.trim().toLowerCase(),
          password: emailAuthPassword,
        }),
      });
      toast.success(`Verification code sent to ${newEmail}`);
      setEmailStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not initiate email change.';
      toast.error(msg);
    } finally {
      setChangingEmail(false);
    }
  };

  // Handle Email Change Step 2 (Verify)
  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.length < 6) return;

    setChangingEmail(true);
    try {
      await apiRequest('/auth/change-email/verify', {
        method: 'POST',
        body: JSON.stringify({
          otp: emailOtp.trim(),
        }),
      });
      await refreshProfile();
      toast.success('Email changed successfully!');
      setEmailStep(1);
      setNewEmail('');
      setEmailAuthPassword('');
      setEmailOtp('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify email OTP.';
      toast.error(msg);
    } finally {
      setChangingEmail(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your personal profile, credentials, and session security.
          </p>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '32px',
            paddingBottom: '12px',
          }}
        >
          <button
            onClick={() => setActiveTab('general')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'general' ? 'var(--primary-subtle)' : 'transparent',
              color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-muted)',
              border: activeTab === 'general' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            General Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'security' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'security' ? '#38bdf8' : 'var(--text-muted)',
              border: activeTab === 'security' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            Password &amp; Security
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'email' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'email' ? '#c084fc' : 'var(--text-muted)',
              border: activeTab === 'email' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            Email Migration
          </button>
        </div>

        {/* Tab 1: General Profile */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Avatar Section */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Profile Photo</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Your avatar is securely stored on GCP Cloud Storage and signed with 15-minute temporary URLs.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#07090e',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarFile}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  >
                    {uploadingAvatar ? <span className="animate-spin">⟳</span> : 'Upload New Photo'}
                  </button>

                  {user?.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={removingAvatar}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(244, 63, 94, 0.12)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#fb7185',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {removingAvatar ? 'Removing...' : 'Remove Photo'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Display Name Form */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Personal Information</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Update your account display name across all Zentura financial tools.
              </p>

              <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '440px' }}>
                <div>
                  <label className="input-label" htmlFor="profile-name">
                    Display Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    className="input-field"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                    To change your email, switch to the &quot;Email Migration&quot; tab.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingName || name === user?.name}
                  style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  {savingName ? <span className="animate-spin">⟳</span> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Password & Security */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Change Password</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Requires your existing password to verify ownership before applying changes.
              </p>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '460px' }}>
                <div>
                  <label className="input-label" htmlFor="old-pass">
                    Current Password
                  </label>
                  <input
                    id="old-pass"
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label" htmlFor="new-pass">
                    New Password (Complexity Enforced)
                  </label>
                  <input
                    id="new-pass"
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
                  <label className="input-label" htmlFor="confirm-pass">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-pass"
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
                  disabled={savingPassword || !oldPassword || !evaluatePassword(newPassword).isValid}
                  style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  {savingPassword ? <span className="animate-spin">⟳</span> : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Session Management */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Active Sessions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Revoke tokens stored in Redis DB 1.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => logout()}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Sign Out Current Session
                </button>
                <button
                  onClick={() => {
                    if (confirm('Revoke all sessions across all devices?')) {
                      logoutAll();
                    }
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fb7185',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out of ALL Devices
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Email Migration */}
        {activeTab === 'email' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Change Account Email</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {emailStep === 1
                ? 'Initiate a secure transfer to a new email address. A 6-digit verification code will be sent to the new email.'
                : `Enter the 6-digit code sent to ${newEmail} to complete the change.`}
            </p>

            {emailStep === 1 ? (
              <form onSubmit={handleInitiateEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label className="input-label" htmlFor="new-email">
                    New Email Address
                  </label>
                  <input
                    id="new-email"
                    type="email"
                    className="input-field"
                    placeholder="new.email@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label" htmlFor="email-auth-pass">
                    Account Password (for verification)
                  </label>
                  <input
                    id="email-auth-pass"
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={emailAuthPassword}
                    onChange={(e) => setEmailAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={changingEmail || !newEmail || !emailAuthPassword}
                  style={{ height: '44px' }}
                >
                  {changingEmail ? <span className="animate-spin">⟳</span> : 'Send OTP to New Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <OtpInput value={emailOtp} onChange={setEmailOtp} disabled={changingEmail} />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={changingEmail || emailOtp.length < 6}
                  style={{ height: '44px' }}
                >
                  {changingEmail ? <span className="animate-spin">⟳</span> : 'Confirm & Commit New Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailStep(1)}
                  style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
                >
                  Cancel and change address
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
