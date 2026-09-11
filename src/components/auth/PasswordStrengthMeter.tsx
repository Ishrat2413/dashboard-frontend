'use client';

import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function evaluatePassword(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[\W_]/.test(password);

  // Backend regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
  const isValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (password.length >= 12) score++;

  let label = 'Too Weak';
  let color = '#f43f5e'; // Red

  if (score <= 1) {
    label = 'Weak';
    color = '#f43f5e';
  } else if (score === 2) {
    label = 'Fair';
    color = '#f59e0b'; // Amber
  } else if (score === 3 || score === 4) {
    label = isValid ? 'Strong' : 'Almost there';
    color = '#38bdf8'; // Cyan
  } else if (score >= 5 && isValid) {
    label = 'Banking-Grade';
    color = '#10b981'; // Emerald
  }

  return {
    score,
    isValid,
    label,
    color,
    checks: [
      { id: 'len', label: '8+ characters', pass: hasMinLength },
      { id: 'case', label: 'Uppercase & Lowercase', pass: hasUppercase && hasLowercase },
      { id: 'num', label: 'At least 1 number', pass: hasNumber },
      { id: 'spec', label: '1 special symbol (!@#$...)', pass: hasSpecial },
    ],
  };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label, color, checks } = evaluatePassword(password);

  return (
    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
      {/* Strength Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Password Entropy
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>
          {label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px', height: '5px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map((seg) => (
          <div
            key={seg}
            style={{
              flex: 1,
              borderRadius: '2px',
              background: seg <= score ? color : 'rgba(255, 255, 255, 0.1)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {checks.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: c.pass ? '#34d399' : 'var(--text-dim)',
              transition: 'color 0.2s ease',
            }}
          >
            <span>{c.pass ? '✓' : '○'}</span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
