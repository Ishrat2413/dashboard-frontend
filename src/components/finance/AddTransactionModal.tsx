'use client';

import React, { useState } from 'react';
import { IncomeRecord, ExpenseRecord } from '@/types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (item: IncomeRecord) => void;
  onAddExpense: (item: ExpenseRecord) => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAddIncome,
  onAddExpense,
}: AddTransactionModalProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Operations & Banking');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState<'BDT' | 'USD' | 'GBP'>('BDT');
  const [foreignAmount, setForeignAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a description / title');
      return;
    }

    const id = `${type === 'INCOME' ? 'inc' : 'exp'}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    if (type === 'INCOME') {
      const incomeItem: IncomeRecord = {
        id,
        source: title.trim(),
        category: (category as IncomeRecord['category']) || 'Other Income',
        amountBDT: numAmount,
        notes: notes.trim() || undefined,
        currencyMeta:
          currency !== 'BDT' && foreignAmount
            ? {
                originalCurrency: currency,
                originalAmount: parseFloat(foreignAmount) || undefined,
                incentivesOrNotes: 'Simulated Inflow Entry',
              }
            : undefined,
        date: today,
        verified: false,
      };
      onAddIncome(incomeItem);
    } else {
      const expenseItem: ExpenseRecord = {
        id,
        categoryTitle: title.trim(),
        categoryGroup: (category as ExpenseRecord['categoryGroup']) || 'Operations & Banking',
        amountBDT: numAmount,
        paymentMethod,
        notes: notes.trim() || undefined,
        status: 'Completed',
        date: today,
        verified: false,
      };
      onAddExpense(expenseItem);
    }

    // Reset & close
    setTitle('');
    setAmount('');
    setNotes('');
    setForeignAmount('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-glow"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '32px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Financial Entry</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Simulate additions to the August ledger with automatic KPI recalculation.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Inflow vs Outflow Switch */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setCategory('Client Retainer');
            }}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: type === 'INCOME' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: type === 'INCOME' ? '#34d399' : 'var(--text-muted)',
              border: `1px solid ${type === 'INCOME' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
            }}
          >
            + Inflow (Income)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setCategory('Operations & Banking');
            }}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: type === 'EXPENSE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: type === 'EXPENSE' ? '#fb7185' : 'var(--text-muted)',
              border: `1px solid ${type === 'EXPENSE' ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
            }}
          >
            - Outflow (Expense)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Description / Source / Recipient</label>
            <input
              type="text"
              required
              placeholder={type === 'INCOME' ? 'e.g. Upwork Wire Transfer' : 'e.g. AWS Cloud Hosting'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Amount (BDT)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {type === 'INCOME' ? (
                  <>
                    <option value="Client Retainer">Client Retainer</option>
                    <option value="Freelance Escrow">Freelance Escrow</option>
                    <option value="Bonus & Tips">Bonus &amp; Tips</option>
                    <option value="Project Milestone">Project Milestone</option>
                    <option value="Retained Fund">Retained Fund</option>
                    <option value="Other Income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Operations & Banking">Operations &amp; Banking</option>
                    <option value="Software & SaaS">Software &amp; SaaS</option>
                    <option value="Profit Share">Profit Share</option>
                    <option value="Capital Assets">Capital Assets</option>
                    <option value="Debt Settlement">Debt Settlement</option>
                    <option value="Team Advances">Team Advances</option>
                    <option value="Marketing & Growth">Marketing &amp; Growth</option>
                    <option value="Office & Food">Office &amp; Food</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {type === 'INCOME' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label className="input-label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'BDT' | 'USD' | 'GBP')}
                  className="input-field"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {currency !== 'BDT' && (
                <div>
                  <label className="input-label">Original Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`e.g. 500 ${currency}`}
                    value={foreignAmount}
                    onChange={(e) => setForeignAmount(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}
            </div>
          )}

          {type === 'EXPENSE' && (
            <div>
              <label className="input-label">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="Bank Transfer">Bank Transfer (Online/BEFTN/NPSB)</option>
                <option value="Card Auto-Debit">Card / Virtual Visa</option>
                <option value="Cash / Mobile Banking">Cash / Mobile Banking</option>
                <option value="Vendor Direct">Vendor Direct</option>
              </select>
            </div>
          )}

          <div>
            <label className="input-label">Notes / Reference</label>
            <input
              type="text"
              placeholder="e.g. Transaction slip or memo"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                flex: 1,
                background: type === 'INCOME' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              }}
            >
              Confirm Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
