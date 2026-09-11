'use client';

import React from 'react';

interface DevAccountSwitcherProps {
  onSelect: (email: string, pass: string) => void;
}

const DEV_ACCOUNTS = [
  {
    role: 'ADMIN',
    email: 'admin@example.com',
    pass: '12345678',
    color: 'rgba(244, 63, 94, 0.2)',
    border: 'rgba(244, 63, 94, 0.4)',
    textColor: '#fb7185',
  },
  {
    role: 'SHOP OWNER',
    email: 'shopowner@example.com',
    pass: '12345678',
    color: 'rgba(168, 85, 247, 0.2)',
    border: 'rgba(168, 85, 247, 0.4)',
    textColor: '#c084fc',
  },
  {
    role: 'CUSTOMER',
    email: 'customer@example.com',
    pass: '12345678',
    color: 'rgba(16, 185, 129, 0.2)',
    border: 'rgba(16, 185, 129, 0.4)',
    textColor: '#34d399',
  },
];

export function DevAccountSwitcher({ onSelect }: DevAccountSwitcherProps) {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px dashed rgba(255, 255, 255, 0.15)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          ⚡ Dev Seed Accounts (1-Click Fill)
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          pwd: 12345678
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {DEV_ACCOUNTS.map((acc) => (
          <button
            key={acc.role}
            type="button"
            onClick={() => onSelect(acc.email, acc.pass)}
            style={{
              padding: '8px 6px',
              borderRadius: '8px',
              background: acc.color,
              border: `1px solid ${acc.border}`,
              color: acc.textColor,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {acc.role}
          </button>
        ))}
      </div>
    </div>
  );
}
