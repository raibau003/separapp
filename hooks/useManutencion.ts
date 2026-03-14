import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { scheduleLocalNotification } from '@/lib/notifications';

interface ManutencionPayment {
  id: string;
  family_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_by?: string;
  paid_at?: string;
  recurrence: 'monthly' | 'biweekly' | 'weekly';
  created_at: string;
}

interface ManutencionStats {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

/**
 * Hook para gestionar pagos de manutención
 * Incluye alertas automáticas y ciclos de pago recurrentes
 */
export function useManutencion(familyId: string) {
  const [payments, setPayments] = useState<ManutencionPayment[]>([]);
  const [stats, setStats] = useState<ManutencionStats>({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [loading, setLoading] = useState(true);

  /**
   * Cargar pagos de manutención
   */
  const loadPayments = useCallback(async () => {
    if (!familyId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('manutencion_payments')
        .select('*')
        .eq('family_id', familyId)
        .order('due_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Actualizar estado de pagos vencidos
      const updatedPayments = data?.map((payment) => {
        const dueDate = new Date(payment.due_date);
        const now = new Date();

        if (payment.status === 'pending' && dueDate < now) {
          return { ...payment, status: 'overdue' as const };
        }
        return payment;
      }) || [];

      setPayments(updatedPayments);

      // Calcular estadísticas
      calculateStats(updatedPayments);

      // Actualizar en BD los pagos vencidos
      const overdueIds = updatedPayments
        .filter((p) => p.status === 'overdue')
        .map((p) => p.id);

      if (overdueIds.length > 0) {
        await supabase
          .from('manutencion_payments')
          .update({ status: 'overdue' })
          .in('id', overdueIds);
      }
    } catch (error) {
      console.error('Error loading manutencion payments:', error);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  /**
   * Calcular estadísticas
   */
  const calculateStats = (payments: ManutencionPayment[]) => {
    const totalPaid = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPending = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalOverdue = payments
      .filter((p) => p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Próximo pago
    const nextPayment = payments
      .filter((p) => p.status === 'pending')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

    setStats({
      totalPaid,
      totalPending,
      totalOverdue,
      nextPaymentDate: nextPayment?.due_date,
      nextPaymentAmount: nextPayment?.amount,
    });
  };

  /**
   * Marcar pago como pagado
   */
  const markAsPaid = async (paymentId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('manutencion_payments')
        .update({
          status: 'paid',
          paid_by: userId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;

      await loadPayments();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  };

  /**
   * Crear próximo pago recurrente
   */
  const createNextPayment = async (
    amount: number,
    recurrence: 'monthly' | 'biweekly' | 'weekly'
  ) => {
    try {
      // Calcular próxima fecha de vencimiento
      const now = new Date();
      let nextDueDate = new Date(now);

      switch (recurrence) {
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'biweekly':
          nextDueDate.setDate(nextDueDate.getDate() + 14);
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
      }

      const { error } = await supabase.from('manutencion_payments').insert({
        family_id: familyId,
        amount,
        due_date: nextDueDate.toISOString(),
        status: 'pending',
        recurrence,
      });

      if (error) throw error;

      await loadPayments();
      await schedulePaymentAlerts(nextDueDate, amount);
    } catch (error) {
      console.error('Error creating next payment:', error);
      throw error;
    }
  };

  /**
   * Programar alertas para un pago
   * - 3 días antes
   * - El día del vencimiento
   * - 1 día después (si está vencido)
   */
  const schedulePaymentAlerts = async (dueDate: Date, amount: number) => {
    try {
      const now = new Date();

      // Alerta 3 días antes
      const threeDaysBefore = new Date(dueDate);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      threeDaysBefore.setHours(9, 0, 0, 0); // 9 AM

      if (threeDaysBefore > now) {
        await scheduleLocalNotification({
          title: '💰 Recordatorio de Manutención',
          body: `El pago de manutención de $${amount.toLocaleString(
            'es-CL'
          )} vence en 3 días`,
          data: { type: 'manutencion_reminder', days_until: 3 },
          trigger: threeDaysBefore,
        });
      }

      // Alerta el día del vencimiento
      const onDueDate = new Date(dueDate);
      onDueDate.setHours(9, 0, 0, 0); // 9 AM

      if (onDueDate > now) {
        await scheduleLocalNotification({
          title: '⚠️ Manutención Vence Hoy',
          body: `El pago de manutención de $${amount.toLocaleString('es-CL')} vence hoy`,
          data: { type: 'manutencion_due', days_until: 0 },
          trigger: onDueDate,
        });
      }

      // Alerta 1 día después (vencido)
      const oneDayAfter = new Date(dueDate);
      oneDayAfter.setDate(oneDayAfter.getDate() + 1);
      oneDayAfter.setHours(9, 0, 0, 0); // 9 AM

      if (oneDayAfter > now) {
        await scheduleLocalNotification({
          title: '🚨 Manutención Vencida',
          body: `El pago de manutención de $${amount.toLocaleString(
            'es-CL'
          )} está vencido`,
          data: { type: 'manutencion_overdue', days_overdue: 1 },
          trigger: oneDayAfter,
        });
      }

      console.log('✅ Alertas de manutención programadas');
    } catch (error) {
      console.error('Error scheduling payment alerts:', error);
    }
  };

  /**
   * Configurar ciclo automático de pagos
   */
  const setupRecurringPayments = async (
    amount: number,
    recurrence: 'monthly' | 'biweekly' | 'weekly'
  ) => {
    try {
      // Crear primer pago
      await createNextPayment(amount, recurrence);

      console.log(`✅ Ciclo de pagos ${recurrence} configurado`);
    } catch (error) {
      console.error('Error setting up recurring payments:', error);
      throw error;
    }
  };

  /**
   * Verificar si hay pagos próximos a vencer
   */
  const checkUpcomingPayments = useCallback(async () => {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const upcomingPayments = payments.filter((payment) => {
      const dueDate = new Date(payment.due_date);
      return (
        payment.status === 'pending' &&
        dueDate >= now &&
        dueDate <= threeDaysLater
      );
    });

    return upcomingPayments;
  }, [payments]);

  /**
   * Cargar pagos al montar el componente
   */
  useEffect(() => {
    loadPayments();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('manutencion_payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manutencion_payments',
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          loadPayments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [familyId, loadPayments]);

  return {
    payments,
    stats,
    loading,
    markAsPaid,
    createNextPayment,
    setupRecurringPayments,
    schedulePaymentAlerts,
    checkUpcomingPayments,
    refresh: loadPayments,
  };
}
