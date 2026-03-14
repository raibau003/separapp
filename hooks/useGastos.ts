import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useGastosStore } from '@/store/gastosStore';
import { Expense } from '@/types/app';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para manejar gastos
 */
export function useGastos(familyId?: string) {
  const { expenses, setExpenses, addExpense, updateExpense, loading, setLoading } = useGastosStore();
  const { user } = useAuth();

  useEffect(() => {
    if (familyId) {
      fetchExpenses();
    }
  }, [familyId]);

  const fetchExpenses = async () => {
    if (!familyId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses(data as Expense[]);
    }
    setLoading(false);
  };

  const createExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }

    addExpense(data as Expense);
    return data;
  };

  const approveExpense = async (expenseId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      console.error('Error approving expense:', error);
      throw error;
    }

    updateExpense(expenseId, data);
    return data;
  };

  const rejectExpense = async (expenseId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }

    updateExpense(expenseId, data);
    return data;
  };

  return {
    expenses,
    loading,
    createExpense,
    approveExpense,
    rejectExpense,
    refreshExpenses: fetchExpenses,
  };
}
