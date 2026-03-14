import { supabase } from './supabase';

/**
 * Lógica de cálculo de liquidaciones mensuales (50/50)
 * Calcula quién debe a quién y cuánto
 */

export interface MonthlyExpense {
  id: string;
  amount: number;
  paid_by: string;
  approved_by?: string;
  status: string;
}

export interface SettlementResult {
  padreA_total: number;
  padreB_total: number;
  difference: number;
  debtorId: string;
  creditorId: string;
  debtorName: string;
  creditorName: string;
}

/**
 * Calcula la liquidación mensual para una familia
 * División 50/50: cada padre debe pagar la mitad del total
 */
export async function calculateMonthlySettlement(
  familyId: string,
  month: Date
): Promise<SettlementResult | null> {
  try {
    // Obtener la familia para identificar a los padres
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select(`
        id,
        padre_a_id,
        padre_b_id,
        padre_a:padre_a_id(id, full_name),
        padre_b:padre_b_id(id, full_name)
      `)
      .eq('id', familyId)
      .single();

    if (familyError) throw familyError;
    if (!family) return null;

    // Calcular primer y último día del mes
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

    // Obtener gastos aprobados del mes
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('id, amount, paid_by, approved_by, status')
      .eq('family_id', familyId)
      .eq('status', 'approved')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (expensesError) throw expensesError;
    if (!expenses || expenses.length === 0) {
      console.log('No approved expenses for this month');
      return null;
    }

    // Calcular totales por padre
    let padreA_total = 0;
    let padreB_total = 0;

    expenses.forEach((expense: MonthlyExpense) => {
      if (expense.paid_by === family.padre_a_id) {
        padreA_total += Number(expense.amount);
      } else if (expense.paid_by === family.padre_b_id) {
        padreB_total += Number(expense.amount);
      }
    });

    // Calcular la diferencia (división 50/50)
    const totalExpenses = padreA_total + padreB_total;
    const halfTotal = totalExpenses / 2;

    // Determinar deudor y acreedor
    let debtorId: string;
    let creditorId: string;
    let debtorName: string;
    let creditorName: string;
    let difference: number;

    if (padreA_total > padreB_total) {
      // Padre A pagó más, Padre B le debe
      creditorId = family.padre_a_id;
      debtorId = family.padre_b_id;
      creditorName = family.padre_a.full_name;
      debtorName = family.padre_b.full_name;
      difference = padreA_total - halfTotal;
    } else {
      // Padre B pagó más, Padre A le debe
      creditorId = family.padre_b_id;
      debtorId = family.padre_a_id;
      creditorName = family.padre_b.full_name;
      debtorName = family.padre_a.full_name;
      difference = padreB_total - halfTotal;
    }

    return {
      padreA_total,
      padreB_total,
      difference: Math.round(difference), // Redondear para evitar centavos
      debtorId,
      creditorId,
      debtorName,
      creditorName,
    };
  } catch (error) {
    console.error('Error calculating monthly settlement:', error);
    throw error;
  }
}

/**
 * Crea un registro de liquidación mensual en la base de datos
 */
export async function createMonthlySettlement(
  familyId: string,
  month: Date,
  settlement: SettlementResult
) {
  try {
    const { data, error } = await supabase
      .from('monthly_settlements')
      .insert({
        family_id: familyId,
        settlement_month: month.toISOString().split('T')[0], // YYYY-MM-DD
        padre_a_id: settlement.debtorId,
        padre_b_id: settlement.creditorId,
        padre_a_total: settlement.padreA_total,
        padre_b_total: settlement.padreB_total,
        difference: settlement.difference,
        debtor_id: settlement.debtorId,
        creditor_id: settlement.creditorId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating monthly settlement:', error);
    throw error;
  }
}

/**
 * Obtiene liquidaciones de una familia
 */
export async function getSettlements(familyId: string, limit: number = 12) {
  try {
    const { data, error } = await supabase
      .from('monthly_settlements')
      .select(`
        *,
        debtor:debtor_id(id, full_name),
        creditor:creditor_id(id, full_name),
        transaction:transaction_id(*)
      `)
      .eq('family_id', familyId)
      .order('settlement_month', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching settlements:', error);
    throw error;
  }
}

/**
 * Obtiene la liquidación del mes actual
 */
export async function getCurrentMonthSettlement(familyId: string) {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('monthly_settlements')
      .select(`
        *,
        debtor:debtor_id(id, full_name),
        creditor:creditor_id(id, full_name),
        transaction:transaction_id(*)
      `)
      .eq('family_id', familyId)
      .eq('settlement_month', currentMonth)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  } catch (error) {
    console.error('Error fetching current month settlement:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una liquidación
 */
export async function updateSettlementStatus(
  settlementId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  transactionId?: string
) {
  try {
    const updateData: any = {
      status,
    };

    if (status === 'completed' || status === 'failed') {
      updateData.processed_at = new Date().toISOString();
    }

    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    const { data, error } = await supabase
      .from('monthly_settlements')
      .update(updateData)
      .eq('id', settlementId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating settlement status:', error);
    throw error;
  }
}
