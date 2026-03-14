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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-force-run',
};

/**
 * Edge Function ejecutada mensualmente (día 1 a las 00:00 UTC)
 * Calcula y cobra automáticamente las diferencias de gastos (división 50/50)
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 Starting monthly auto-charge...');

  try {
    // Verificar si es una ejecución forzada (para testing)
    const forceRun = req.headers.get('x-force-run') === 'true';

    // Calcular el mes anterior
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];

    console.log(`Processing settlements for month: ${lastMonthStr}`);

    // Obtener todas las familias activas
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('id, padre_a_id, padre_b_id');

    if (familiesError) throw familiesError;

    console.log(`Found ${families?.length || 0} families to process`);

    const results = [];

    for (const family of families || []) {
      try {
        console.log(`Processing family ${family.id}...`);

        // Verificar si ya existe una liquidación para este mes
        const { data: existingSettlement } = await supabase
          .from('monthly_settlements')
          .select('id, status')
          .eq('family_id', family.id)
          .eq('settlement_month', lastMonthStr)
          .single();

        if (existingSettlement && !forceRun) {
          console.log(`Settlement already exists for family ${family.id}, skipping...`);
          continue;
        }

        // Calcular gastos del mes anterior
        const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);

        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('amount, paid_by')
          .eq('family_id', family.id)
          .eq('status', 'approved')
          .gte('created_at', firstDay.toISOString())
          .lte('created_at', lastDay.toISOString());

        if (expensesError) throw expensesError;

        if (!expenses || expenses.length === 0) {
          console.log(`No approved expenses for family ${family.id}, skipping...`);
          results.push({
            familyId: family.id,
            status: 'skipped',
            reason: 'no_expenses',
          });
          continue;
        }

        // Calcular totales por padre
        let padreA_total = 0;
        let padreB_total = 0;

        expenses.forEach((expense: any) => {
          if (expense.paid_by === family.padre_a_id) {
            padreA_total += Number(expense.amount);
          } else if (expense.paid_by === family.padre_b_id) {
            padreB_total += Number(expense.amount);
          }
        });

        console.log(`Padre A total: ${padreA_total}, Padre B total: ${padreB_total}`);

        // Calcular diferencia (división 50/50)
        const totalExpenses = padreA_total + padreB_total;
        const halfTotal = totalExpenses / 2;

        // Si la diferencia es muy pequeña, ignorar
        if (Math.abs(padreA_total - padreB_total) < 1000) {
          console.log(`Difference too small for family ${family.id}, skipping...`);
          results.push({
            familyId: family.id,
            status: 'skipped',
            reason: 'difference_too_small',
          });
          continue;
        }

        // Determinar deudor y acreedor
        let debtorId: string;
        let creditorId: string;
        let difference: number;

        if (padreA_total > padreB_total) {
          creditorId = family.padre_a_id;
          debtorId = family.padre_b_id;
          difference = padreA_total - halfTotal;
        } else {
          creditorId = family.padre_b_id;
          debtorId = family.padre_a_id;
          difference = padreB_total - halfTotal;
        }

        difference = Math.round(difference);

        console.log(`Debtor: ${debtorId}, Creditor: ${creditorId}, Difference: ${difference}`);

        // Crear o actualizar el settlement
        let settlementId: string;

        if (existingSettlement) {
          settlementId = existingSettlement.id;
          await supabase
            .from('monthly_settlements')
            .update({
              padre_a_total: padreA_total,
              padre_b_total: padreB_total,
              difference,
              debtor_id: debtorId,
              creditor_id: creditorId,
              status: 'processing',
            })
            .eq('id', settlementId);
        } else {
          const { data: newSettlement, error: settlementError } = await supabase
            .from('monthly_settlements')
            .insert({
              family_id: family.id,
              settlement_month: lastMonthStr,
              padre_a_id: family.padre_a_id,
              padre_b_id: family.padre_b_id,
              padre_a_total: padreA_total,
              padre_b_total: padreB_total,
              difference,
              debtor_id: debtorId,
              creditor_id: creditorId,
              status: 'processing',
            })
            .select()
            .single();

          if (settlementError) throw settlementError;
          settlementId = newSettlement.id;
        }

        // Obtener método de pago del deudor
        const { data: paymentMethod } = await supabase
          .from('payment_methods')
          .select('stripe_payment_method_id')
          .eq('user_id', debtorId)
          .eq('is_default', true)
          .single();

        if (!paymentMethod) {
          console.log(`No payment method for debtor ${debtorId}, marking as failed...`);
          await supabase
            .from('monthly_settlements')
            .update({ status: 'failed', processed_at: new Date().toISOString() })
            .eq('id', settlementId);

          results.push({
            familyId: family.id,
            status: 'failed',
            reason: 'no_payment_method',
          });
          continue;
        }

        // Obtener perfil del deudor
        const { data: debtorProfile } = await supabase
          .from('profiles')
          .select('stripe_customer_id, full_name')
          .eq('id', debtorId)
          .single();

        if (!debtorProfile?.stripe_customer_id) {
          console.log(`No Stripe customer for debtor ${debtorId}, marking as failed...`);
          await supabase
            .from('monthly_settlements')
            .update({ status: 'failed', processed_at: new Date().toISOString() })
            .eq('id', settlementId);

          results.push({
            familyId: family.id,
            status: 'failed',
            reason: 'no_stripe_customer',
          });
          continue;
        }

        // Crear Payment Intent en Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(difference * 100),
          currency: 'clp',
          customer: debtorProfile.stripe_customer_id,
          payment_method: paymentMethod.stripe_payment_method_id,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          },
          metadata: {
            family_id: family.id,
            settlement_id: settlementId,
            from_user_id: debtorId,
            to_user_id: creditorId,
          },
          description: `Liquidación mensual - ${lastMonthStr}`,
        });

        // Crear transacción
        const { data: transaction } = await supabase
          .from('wallet_transactions')
          .insert({
            family_id: family.id,
            transaction_type: 'charge',
            from_user_id: debtorId,
            to_user_id: creditorId,
            amount: difference,
            currency: 'CLP',
            stripe_payment_intent_id: paymentIntent.id,
            status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
            description: `Liquidación mensual - ${lastMonthStr}`,
          })
          .select()
          .single();

        // Actualizar settlement con transacción
        await supabase
          .from('monthly_settlements')
          .update({
            transaction_id: transaction.id,
            status: paymentIntent.status === 'succeeded' ? 'completed' : 'processing',
            processed_at: new Date().toISOString(),
          })
          .eq('id', settlementId);

        console.log(`✅ Successfully processed family ${family.id}`);

        results.push({
          familyId: family.id,
          status: 'success',
          paymentIntentId: paymentIntent.id,
          amount: difference,
        });
      } catch (error) {
        console.error(`Error processing family ${family.id}:`, error);
        results.push({
          familyId: family.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        month: lastMonthStr,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Monthly auto-charge error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
