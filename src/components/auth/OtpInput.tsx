'use client';

import React, { useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char || ' ';
    const newOtp = newDigits.join('').trimEnd();
    onChange(newOtp);

    // Focus next box if digit entered
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && (!digits[index] || digits[index] === ' ') && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        margin: '20px 0',
      }}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: '48px',
            height: '56px',
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            background: 'var(--bg-input)',
            color: 'var(--text-main)',
            border: digits[i] && digits[i] !== ' '
              ? '2px solid var(--primary)'
              : '1px solid var(--border-medium)',
            borderRadius: '12px',
            outline: 'none',
            boxShadow: digits[i] && digits[i] !== ' ' ? '0 0 12px var(--primary-glow)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        />
      ))}
    </div>
  );
}
