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

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'No signature found' }),
      { status: 400 }
    );
  }

  try {
    const body = await req.text();

    // Verificar la firma del webhook
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event received:', event.type);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Actualizar la transacción en la base de datos
        const { error } = await supabase
          .from('wallet_transactions')
          .update({ status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating transaction:', error);
        } else {
          console.log(`Transaction ${paymentIntent.id} marked as succeeded`);

          // Enviar notificación push a ambos usuarios
          const { data: transaction } = await supabase
            .from('wallet_transactions')
            .select('family_id, from_user_id, to_user_id, amount')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single();

          if (transaction) {
            // Obtener tokens de notificación
            const { data: users } = await supabase
              .from('profiles')
              .select('id, push_token, full_name')
              .in('id', [transaction.from_user_id, transaction.to_user_id]);

            // Aquí se enviarían las notificaciones push
            // Por ahora solo lo logueamos
            console.log('Would send notifications to:', users);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Actualizar la transacción como fallida
        const { error } = await supabase
          .from('wallet_transactions')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating transaction:', error);
        } else {
          console.log(`Transaction ${paymentIntent.id} marked as failed`);

          // Actualizar el settlement relacionado
          const { data: transaction } = await supabase
            .from('wallet_transactions')
            .select('id, family_id')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single();

          if (transaction) {
            await supabase
              .from('monthly_settlements')
              .update({ status: 'failed' })
              .eq('transaction_id', transaction.id);
          }
        }
        break;
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer ${customer.id} updated`);
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log(`Payment method ${paymentMethod.id} attached`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
