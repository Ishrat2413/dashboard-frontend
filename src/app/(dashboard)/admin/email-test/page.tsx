'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/context/ToastContext';
import { apiRequest } from '@/lib/api-client';

export default function AdminEmailTestPage() {
  const toast = useToast();

  const [toEmail, setToEmail] = useState('recipient@example.com');
  const [subject, setSubject] = useState('Test Transactional Email from Zentura');
  const [body, setBody] = useState('Hello! This is a test email dispatched via BullMQ background queue.');
  const [sendingSingle, setSendingSingle] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Bulk Test
  const [bulkRecipients, setBulkRecipients] = useState('user1@example.com\nuser2@example.com\nuser3@example.com');
  const [sendingBulk, setSendingBulk] = useState(false);

  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail || !subject || !body) return;

    setSendingSingle(true);
    setLastResult(null);

    try {
      const res = await apiRequest('/test/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: toEmail.includes(',') ? toEmail.split(',').map((s) => s.trim()) : toEmail,
          subject,
          body,
        }),
      });

      setLastResult(res);
      toast.success(res.message || 'Email job successfully queued in BullMQ!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to enqueue email.');
    } finally {
      setSendingSingle(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailsList = bulkRecipients
      .split('\n')
      .map((e) => e.trim())
      .filter(Boolean);

    if (emailsList.length === 0) {
      toast.error('Please specify at least one recipient.');
      return;
    }

    setSendingBulk(true);
    setLastResult(null);

    try {
      const items = emailsList.map((addr) => ({
        to: addr,
        subject: `Bulk Notice for ${addr}`,
        body: `Bulk message body sent at ${new Date().toLocaleTimeString()}`,
      }));

      const res = await apiRequest('/test/email/send-bulk', {
        method: 'POST',
        body: JSON.stringify({
          emails: items,
        }),
      });

      setLastResult(res);
      toast.success(res.message || `Queued ${emailsList.length} jobs in BullMQ!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to enqueue bulk emails.');
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px', width: '100%' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-admin">Admin Only</span>
              <h1 style={{ fontSize: '2rem' }}>BullMQ Email Diagnostics</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Test the background BullMQ transactional queue and Opossum circuit breaker pipeline.
            </p>
          </div>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
          {/* Single Email Dispatch */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Single Email Job</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Enqueues a single email or comma-separated fan-out into Redis DB 4.
            </p>

            <form onSubmit={handleSendSingle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label" htmlFor="single-to">
                  Recipient(s) (comma separated)
                </label>
                <input
                  id="single-to"
                  type="text"
                  className="input-field"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label" htmlFor="single-subj">
                  Subject Line
                </label>
                <input
                  id="single-subj"
                  type="text"
                  className="input-field"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label" htmlFor="single-body">
                  Email Body (HTML / Text)
                </label>
                <textarea
                  id="single-body"
                  className="input-field"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={sendingSingle}
                style={{ height: '44px' }}
              >
                {sendingSingle ? <span className="animate-spin">⟳</span> : 'Dispatch to Queue (POST /test/email/send)'}
              </button>
            </form>
          </div>

          {/* Bulk Email Dispatch */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Bulk Email Dispatch</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Exercises the bulk validation pipe and enqueues multiple BullMQ jobs.
            </p>

            <form onSubmit={handleSendBulk} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label" htmlFor="bulk-to">
                  Recipients (One address per line)
                </label>
                <textarea
                  id="bulk-to"
                  className="input-field"
                  rows={7}
                  value={bulkRecipients}
                  onChange={(e) => setBulkRecipients(e.target.value)}
                  required
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={sendingBulk}
                style={{
                  height: '44px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                }}
              >
                {sendingBulk ? <span className="animate-spin">⟳</span> : 'Queue Bulk Batch (POST /test/email/send-bulk)'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Queue Result Console */}
        {lastResult && (
          <div className="glass-panel" style={{ marginTop: '28px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                ✓ BullMQ Job Enqueued Response
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                HTTP {lastResult.statusCode || 200}
              </span>
            </div>
            <pre
              style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '16px',
                borderRadius: '8px',
                overflowX: 'auto',
                fontSize: '0.85rem',
                color: '#34d399',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
