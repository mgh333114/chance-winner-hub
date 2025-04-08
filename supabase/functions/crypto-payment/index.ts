
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Connect to Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Main handler for all requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    // Generate a unique payment address for a specific cryptocurrency
    if (action === 'generate_address') {
      const { crypto_type, amount, user_id } = await req.json();
      
      // In a real implementation, you would integrate with a crypto payment processor
      // or exchange API to generate a unique deposit address
      
      // For now, we'll use static addresses with unique payment IDs
      const paymentId = crypto.randomUUID();
      
      // Static addresses - in a real implementation, these would be generated dynamically
      // through integration with exchanges like Binance, Coinbase, etc.
      const addresses = {
        btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
        usdt: 'TKVxYEtQUB3XLiHpKqZzbCEY1QTQQBmApi',
        usdc: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
      };
      
      // Create a pending transaction in the database
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id,
          amount,
          type: 'deposit',
          status: 'pending',
          is_demo: false,
          details: { 
            method: 'crypto',
            crypto_type,
            address: addresses[crypto_type],
            payment_id: paymentId,
            requested_at: new Date().toISOString()
          }
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          address: addresses[crypto_type],
          payment_id: paymentId,
          transaction_id: data.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Verify if a payment has been received
    if (action === 'check_payment') {
      const { transaction_id } = await req.json();
      
      // In a real implementation, you would check with your crypto payment processor
      // or scan the blockchain directly to verify if the payment was received
      
      // For demo purposes, we'll randomly "confirm" some transactions
      const shouldConfirm = Math.random() > 0.7; // 30% chance of confirmation
      
      if (shouldConfirm) {
        // Update the transaction to "completed"
        const { error } = await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', transaction_id);
          
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            status: 'completed',
            message: 'Payment has been confirmed'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'pending',
          message: 'Payment not yet confirmed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
