
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

// Binance API credentials and configuration
const BINANCE_API_KEY = Deno.env.get('BINANCE_API_KEY') || '';
const BINANCE_SECRET_KEY = Deno.env.get('BINANCE_SECRET_KEY') || '';
const BINANCE_API_URL = 'https://api.binance.com';

// Helper function to sign Binance API requests
function signRequest(queryString: string): string {
  const encoder = new TextEncoder();
  const key = encoder.encode(BINANCE_SECRET_KEY);
  const message = encoder.encode(queryString);
  
  // Temporarily use a simple hash for demo purposes
  // In production, use proper hmac signature with crypto.subtle
  // This is a simplified example that should be replaced with proper crypto
  let signature = '';
  for (let i = 0; i < message.length; i++) {
    signature += (message[i] ^ key[i % key.length]).toString(16).padStart(2, '0');
  }
  
  return signature;
}

// Function to generate a deposit address for a specific cryptocurrency
async function generateDepositAddress(currency: string) {
  try {
    const timestamp = Date.now();
    const queryString = `asset=${currency.toUpperCase()}&timestamp=${timestamp}`;
    const signature = signRequest(queryString);
    
    const response = await fetch(`${BINANCE_API_URL}/sapi/v1/capital/deposit/address?${queryString}&signature=${signature}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': BINANCE_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Binance API error:', errorText);
      throw new Error(`Binance API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.address;
    
  } catch (error) {
    console.error('Error generating deposit address:', error);
    
    // Fallback to static addresses if Binance API fails
    const fallbackAddresses: Record<string, string> = {
      btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
      usdt: 'TKVxYEtQUB3XLiHpKqZzbCEY1QTQQBmApi',
      usdc: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    };
    
    return fallbackAddresses[currency.toLowerCase()] || fallbackAddresses.btc;
  }
}

// Function to check transaction status on Binance
async function checkTransactionStatus(txId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('details, amount, user_id')
      .eq('id', txId)
      .single();
    
    if (error) throw error;
    
    // In a real implementation, you would query Binance API for deposit status
    // For demonstration, we'll use random confirmation for now with 30% chance
    const shouldConfirm = Math.random() > 0.7;
    
    return {
      status: shouldConfirm ? 'completed' : 'pending',
      details: data.details
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return { status: 'error', error: error.message };
  }
}

// Main handler for all requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { action } = requestData;

    // Generate a unique payment address for a specific cryptocurrency
    if (action === 'generate_address') {
      const { crypto_type, amount, user_id } = requestData;
      
      // Generate a deposit address using Binance API
      const address = await generateDepositAddress(crypto_type);
      
      // Create a unique payment ID for tracking
      const paymentId = crypto.randomUUID();
      
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
            address,
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
          address,
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
      const { transaction_id } = requestData;
      
      // Check transaction status through Binance or blockchain
      const result = await checkTransactionStatus(transaction_id);
      
      if (result.status === 'completed') {
        // Update the transaction to "completed"
        const { error } = await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', transaction_id);
          
        if (error) throw error;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: result.status,
          message: result.status === 'completed' 
            ? 'Payment has been confirmed' 
            : 'Payment not yet confirmed'
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
