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
    const { userId, paymentMethodId, isDefault = false } = await req.json();

    if (!userId || !paymentMethodId) {
      throw new Error('Missing required fields: userId and paymentMethodId');
    }

    // Obtener el perfil del usuario para conseguir el stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile?.stripe_customer_id) {
      throw new Error('User does not have a Stripe customer ID. Create customer first.');
    }

    const customerId = profile.stripe_customer_id;

    // Adjuntar el payment method al customer en Stripe
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Obtener detalles del payment method
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Si es el método predeterminado, actualizar el customer default
    if (isDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Marcar todos los otros métodos como no predeterminados
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Guardar el payment method en la base de datos
    const { data: savedMethod, error: saveError } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        stripe_payment_method_id: paymentMethodId,
        stripe_customer_id: customerId,
        card_brand: paymentMethod.card?.brand || null,
        card_last4: paymentMethod.card?.last4 || null,
        card_exp_month: paymentMethod.card?.exp_month || null,
        card_exp_year: paymentMethod.card?.exp_year || null,
        is_default: isDefault,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(
      JSON.stringify({
        success: true,
        paymentMethod: savedMethod,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error attaching payment method:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
