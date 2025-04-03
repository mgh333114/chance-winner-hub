
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the session or user object
    const authorization = req.headers.get('Authorization') || '';
    if (!authorization) {
      throw new Error('No authorization header');
    }

    // Create a Supabase client for authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.0');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user session
    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user session');
    }

    // Get request body
    const { amount, paymentMethod, currency = 'kes' } = await req.json();
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Handle different payment methods
    if (paymentMethod === 'mpesa') {
      // For M-Pesa, we would typically integrate with the M-Pesa API
      // This is just a placeholder for demo purposes
      return new Response(
        JSON.stringify({
          success: true,
          message: 'M-Pesa payment request initiated',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (paymentMethod === 'crypto') {
      // For crypto payments, return a crypto address
      // In a real implementation, this would integrate with a crypto payment processor
      return new Response(
        JSON.stringify({
          success: true,
          address: {
            btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
          },
          message: 'Please send crypto to the provided address',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Default to Stripe checkout for card payments
      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'Lottery Funds',
                description: 'Add funds to your lottery account',
              },
              unit_amount: amount * 100, // convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/profile?payment=success`,
        cancel_url: `${req.headers.get('origin')}/profile?payment=cancelled`,
        client_reference_id: user.id,
        customer_email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      // Return the session URL
      return new Response(
        JSON.stringify({
          url: session.url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
