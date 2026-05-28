import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ── DB row → app object transforms ──────────────────────────────────────────

const toExpense = (row) => ({
  id: row.id,
  paidBy: row.paid_by,
  amount: Number(row.amount),
  category: row.category,
  description: row.description ?? '',
  date: row.date,
  active: row.active,
  createdAt: row.created_at,
});

const toSettlement = (row) => ({
  id: row.id,
  from: row.from_person,
  to: row.to_person,
  amount: Number(row.amount),
  active: row.active,
  createdAt: row.created_at,
});

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData() {
  const [roommates, setRoommates]     = useState(null);
  const [expenses, setExpenses]       = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [rentData, setRentData]       = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // ── Initial load ────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [settingsRes, expensesRes, settlementsRes, rentRes] = await Promise.all([
        supabase.from('settings').select('*').eq('key', 'roommates').maybeSingle(),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('settlements').select('*').order('created_at', { ascending: false }),
        supabase.from('rent_data').select('*'),
      ]);

      if (settingsRes.error)    throw settingsRes.error;
      if (expensesRes.error)    throw expensesRes.error;
      if (settlementsRes.error) throw settlementsRes.error;
      if (rentRes.error)        throw rentRes.error;

      setRoommates(settingsRes.data?.value ?? null);
      setExpenses((expensesRes.data ?? []).map(toExpense));
      setSettlements((settlementsRes.data ?? []).map(toSettlement));

      const rentObj = {};
      (rentRes.data ?? []).forEach(row => {
        rentObj[row.month] = { amount: Number(row.amount), paid: row.paid ?? {} };
      });
      setRentData(rentObj);

    } catch (err) {
      console.error('Supabase load error:', err);
      setError('حدث خطأ في الاتصال بقاعدة البيانات. تحقق من اتصالك بالإنترنت وحاول مجدداً.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Real-time subscriptions ──────────────────────────────────────────────

  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel('db-changes')

      // expenses
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'expenses' }, ({ new: row }) => {
        setExpenses(prev =>
          prev.some(e => e.id === row.id) ? prev : [toExpense(row), ...prev]
        );
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'expenses' }, ({ new: row }) => {
        setExpenses(prev => prev.map(e => e.id === row.id ? toExpense(row) : e));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'expenses' }, ({ old: row }) => {
        setExpenses(prev => prev.filter(e => e.id !== row.id));
      })

      // settlements
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'settlements' }, ({ new: row }) => {
        setSettlements(prev =>
          prev.some(s => s.id === row.id) ? prev : [toSettlement(row), ...prev]
        );
      })

      // rent_data
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rent_data' }, ({ new: row }) => {
        if (!row) return;
        setRentData(prev => ({
          ...prev,
          [row.month]: { amount: Number(row.amount), paid: row.paid ?? {} },
        }));
      })

      // settings (roommates)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, ({ new: row }) => {
        if (row?.key === 'roommates') setRoommates(row.value);
      })

      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadAll]);

  // ── Write operations ────────────────────────────────────────────────────

  const setupRoommates = async (names) => {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'roommates', value: names, updated_at: new Date().toISOString() });
    if (error) throw error;
    setRoommates(names); // optimistic
  };

  const addExpense = async (expense) => {
    // Optimistic insert so the local user sees it immediately
    setExpenses(prev => [expense, ...prev]);
    const { error } = await supabase.from('expenses').insert({
      id:          expense.id,
      paid_by:     expense.paidBy,
      amount:      expense.amount,
      category:    expense.category,
      description: expense.description,
      date:        expense.date,
      active:      expense.active,
      created_at:  expense.createdAt,
    });
    if (error) {
      // Roll back optimistic update
      setExpenses(prev => prev.filter(e => e.id !== expense.id));
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    // Optimistic update
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, active: false } : e));
    const { error } = await supabase
      .from('expenses')
      .update({ active: false })
      .eq('id', id);
    if (error) {
      // Roll back
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, active: true } : e));
      throw error;
    }
  };

  const addSettlement = async (debt) => {
    const id  = Date.now().toString();
    const now = Date.now();
    const settlement = {
      id, from: debt.from, to: debt.to,
      amount: debt.amount, active: true, createdAt: now,
    };
    setSettlements(prev => [settlement, ...prev]); // optimistic
    const { error } = await supabase.from('settlements').insert({
      id,
      from_person: debt.from,
      to_person:   debt.to,
      amount:      debt.amount,
      active:      true,
      created_at:  now,
    });
    if (error) {
      setSettlements(prev => prev.filter(s => s.id !== id));
      throw error;
    }
  };

  const updateRentData = async (month, data) => {
    setRentData(prev => ({ ...prev, [month]: data })); // optimistic
    const { error } = await supabase
      .from('rent_data')
      .upsert({ month, amount: data.amount, paid: data.paid });
    if (error) throw error;
  };

  const reset = async () => {
    await Promise.all([
      supabase.from('settings').delete().eq('key', 'roommates'),
      supabase.from('expenses').delete().neq('id', ''),
      supabase.from('settlements').delete().neq('id', ''),
      supabase.from('rent_data').delete().neq('month', ''),
    ]);
    setRoommates(null);
    setExpenses([]);
    setSettlements([]);
    setRentData({});
  };

  return {
    roommates, expenses, settlements, rentData,
    loading, error,
    loadAll,
    setupRoommates, addExpense, deleteExpense,
    addSettlement, updateRentData, reset,
  };
}
