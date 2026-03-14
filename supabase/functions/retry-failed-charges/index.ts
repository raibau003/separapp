import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRY_DAYS = 7;

/**
 * Edge Function ejecutada diariamente
 * Reintenta cobros fallidos de los últimos 7 días
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🔄 Starting retry failed charges...');

  try {
    // Calcular fecha límite (7 días atrás)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_RETRY_DAYS);

    // Obtener liquidaciones fallidas de los últimos 7 días
    const { data: failedSettlements, error: settlementsError } = await supabase
      .from('monthly_settlements')
      .select(`
        *,
        transaction:transaction_id(*)
      `)
      .eq('status', 'failed')
      .gte('created_at', cutoffDate.toISOString());

    if (settlementsError) throw settlementsError;

    console.log(`Found ${failedSettlements?.length || 0} failed settlements to retry`);

    if (!failedSettlements || failedSettlements.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No failed settlements to retry',
          retried: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const results = [];

    for (const settlement of failedSettlements) {
      try {
        console.log(`Retrying settlement ${settlement.id}...`);

        // Obtener método de pago del deudor
        const { data: paymentMethod } = await supabase
          .from('payment_methods')
          .select('stripe_payment_method_id')
          .eq('user_id', settlement.debtor_id)
          .eq('is_default', true)
          .single();

        if (!paymentMethod) {
          console.log(`No payment method for debtor ${settlement.debtor_id}, skipping...`);
          results.push({
            settlementId: settlement.id,
            status: 'skipped',
            reason: 'no_payment_method',
          });
          continue;
        }

        // Obtener perfil del deudor
        const { data: debtorProfile } = await supabase
          .from('profiles')
          .select('stripe_customer_id, full_name')
          .eq('id', settlement.debtor_id)
          .single();

        if (!debtorProfile?.stripe_customer_id) {
          console.log(`No Stripe customer for debtor ${settlement.debtor_id}, skipping...`);
          results.push({
            settlementId: settlement.id,
            status: 'skipped',
            reason: 'no_stripe_customer',
          });
          continue;
        }

        // Crear nuevo Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(settlement.difference * 100),
          currency: 'clp',
          customer: debtorProfile.stripe_customer_id,
          payment_method: paymentMethod.stripe_payment_method_id,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          },
          metadata: {
            family_id: settlement.family_id,
            settlement_id: settlement.id,
            from_user_id: settlement.debtor_id,
            to_user_id: settlement.creditor_id,
            retry: 'true',
          },
          description: `Reintento - Liquidación ${settlement.settlement_month}`,
        });

        // Actualizar o crear transacción
        if (settlement.transaction_id) {
          // Actualizar transacción existente
          await supabase
            .from('wallet_transactions')
            .update({
              stripe_payment_intent_id: paymentIntent.id,
              status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
            })
            .eq('id', settlement.transaction_id);
        } else {
          // Crear nueva transacción
          const { data: transaction } = await supabase
            .from('wallet_transactions')
            .insert({
              family_id: settlement.family_id,
              transaction_type: 'charge',
              from_user_id: settlement.debtor_id,
              to_user_id: settlement.creditor_id,
              amount: settlement.difference,
              currency: 'CLP',
              stripe_payment_intent_id: paymentIntent.id,
              status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
              description: `Reintento - Liquidación ${settlement.settlement_month}`,
            })
            .select()
            .single();

          // Vincular transacción al settlement
          await supabase
            .from('monthly_settlements')
            .update({ transaction_id: transaction.id })
            .eq('id', settlement.id);
        }

        // Actualizar estado del settlement
        const newStatus = paymentIntent.status === 'succeeded' ? 'completed' : 'processing';

        await supabase
          .from('monthly_settlements')
          .update({
            status: newStatus,
            processed_at: new Date().toISOString(),
          })
          .eq('id', settlement.id);

        console.log(`✅ Successfully retried settlement ${settlement.id}`);

        results.push({
          settlementId: settlement.id,
          status: 'success',
          paymentIntentId: paymentIntent.id,
          newStatus,
        });
      } catch (error) {
        console.error(`Error retrying settlement ${settlement.id}:`, error);

        // Si el error es permanente (tarjeta declinada sin posibilidad de reintento),
        // verificar si ya pasaron los 7 días
        const settlementAge = new Date().getTime() - new Date(settlement.created_at).getTime();
        const daysOld = settlementAge / (1000 * 60 * 60 * 24);

        if (daysOld >= MAX_RETRY_DAYS) {
          console.log(`Settlement ${settlement.id} is older than ${MAX_RETRY_DAYS} days, giving up...`);
          // Aquí se podría enviar una notificación al usuario
        }

        results.push({
          settlementId: settlement.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        retried: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Retry failed charges error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
