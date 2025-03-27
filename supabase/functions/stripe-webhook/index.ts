
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Webhook signature missing', { status: 400 });
  }

  try {
    const text = await req.text();
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        text,
        signature,
        endpointSecret
      );
    } catch (err) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Create a Supabase client to update the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.0');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Record the transaction in the database
        if (session.payment_status === 'paid') {
          const userId = session.metadata.user_id;
          const amountPaid = session.amount_total / 100; // Convert from cents to dollars
          
          // Insert transaction record
          await supabase.from('transactions').insert({
            user_id: userId,
            amount: amountPaid,
            type: 'deposit',
            status: 'completed',
            payment_intent_id: session.payment_intent,
          });
          
          console.log(`Payment of $${amountPaid} for user ${userId} recorded successfully.`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
