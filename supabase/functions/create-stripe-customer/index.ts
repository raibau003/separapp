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
    const { userId, email, name } = await req.json();

    if (!userId || !email) {
      throw new Error('Missing required fields: userId and email');
    }

    // Verificar si el usuario ya tiene un Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Si ya tiene customer ID, retornarlo
    if (profile?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ customerId: profile.stripe_customer_id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Crear nuevo Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || email.split('@')[0],
      metadata: {
        supabase_user_id: userId,
      },
    });

    // Guardar el customer ID en el perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ customerId: customer.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
