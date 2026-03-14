import { create } from 'zustand';
import { Expense } from '@/types/app';

interface GastosState {
  expenses: Expense[];
  loading: boolean;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  setLoading: (loading: boolean) => void;
}

export const useGastosStore = create<GastosState>((set) => ({
  expenses: [],
  loading: false,

  setExpenses: (expenses) => set({ expenses }),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [expense, ...state.expenses],
    })),

  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      ),
    })),

  setLoading: (loading) => set({ loading }),
}));
