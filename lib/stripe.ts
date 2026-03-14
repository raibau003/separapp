import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { supabase } from './supabase';

/**
 * Cliente Stripe para frontend
 * Maneja todas las operaciones de pago del lado del cliente
 */

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Crea un cliente Stripe para un usuario
 * Llama a Edge Function create-stripe-customer
 */
export async function createStripeCustomer(userId: string, email: string, name: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
      body: {
        userId,
        email,
        name,
      },
    });

    if (error) throw error;
    return data.customerId;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Guarda un método de pago (tarjeta) para un usuario
 * Llama a Edge Function attach-payment-method
 */
export async function attachPaymentMethod(
  userId: string,
  paymentMethodId: string,
  isDefault: boolean = false
) {
  try {
    const { data, error } = await supabase.functions.invoke('attach-payment-method', {
      body: {
        userId,
        paymentMethodId,
        isDefault,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw error;
  }
}

/**
 * Crea un Payment Intent para cobrar a un usuario
 * Llama a Edge Function create-payment-intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'CLP',
  familyId: string,
  fromUserId: string,
  toUserId: string,
  description: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount,
        currency,
        familyId,
        fromUserId,
        toUserId,
        description,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Obtiene los métodos de pago guardados de un usuario
 */
export async function getPaymentMethods(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}

/**
 * Marca un método de pago como predeterminado
 */
export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
  try {
    // Primero, quitar el default de todos los métodos del usuario
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Luego, marcar el seleccionado como default
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
}

/**
 * Elimina un método de pago
 */
export async function deletePaymentMethod(paymentMethodId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de transacciones de una familia
 */
export async function getWalletTransactions(familyId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select(`
        *,
        from_user:from_user_id(id, full_name, avatar_url),
        to_user:to_user_id(id, full_name, avatar_url)
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
}

/**
 * Exportar el publishable key para el StripeProvider
 */
export { STRIPE_PUBLISHABLE_KEY };
