'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          let bg = 'rgba(15, 23, 42, 0.9)';
          let border = 'rgba(255, 255, 255, 0.1)';
          let icon = 'ℹ️';

          if (toast.type === 'success') {
            bg = 'rgba(6, 44, 34, 0.95)';
            border = 'rgba(16, 185, 129, 0.4)';
            icon = '✓';
          } else if (toast.type === 'error') {
            bg = 'rgba(50, 15, 25, 0.95)';
            border = 'rgba(244, 63, 94, 0.4)';
            icon = '✕';
          } else if (toast.type === 'warning') {
            bg = 'rgba(48, 30, 8, 0.95)';
            border = 'rgba(245, 158, 11, 0.4)';
            icon = '⚠';
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: bg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.3s ease-out',
                cursor: 'pointer',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
              <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
