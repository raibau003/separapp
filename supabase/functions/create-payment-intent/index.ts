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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      amount,
      currency = 'CLP',
      familyId,
      fromUserId,
      toUserId,
      description,
    } = await req.json();

    if (!amount || !familyId || !fromUserId || !toUserId) {
      throw new Error('Missing required fields');
    }

    // Obtener el perfil del deudor (fromUserId) para conseguir su Stripe customer
    const { data: debtorProfile, error: debtorError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', fromUserId)
      .single();

    if (debtorError) throw debtorError;
    if (!debtorProfile?.stripe_customer_id) {
      throw new Error('Debtor does not have a Stripe customer ID');
    }

    // Obtener el método de pago predeterminado del deudor
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('user_id', fromUserId)
      .eq('is_default', true)
      .single();

    if (pmError || !paymentMethod) {
      throw new Error('Debtor does not have a default payment method');
    }

    // Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: currency.toLowerCase(),
      customer: debtorProfile.stripe_customer_id,
      payment_method: paymentMethod.stripe_payment_method_id,
      confirm: true, // Confirmar automáticamente
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        family_id: familyId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
      description: description || `Liquidación mensual - ${debtorProfile.full_name}`,
    });

    // Crear el registro de transacción en la base de datos
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        family_id: familyId,
        transaction_type: 'charge',
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        currency,
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
        description,
      })
      .select()
      .single();

    if (txError) throw txError;

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        },
        transaction,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
