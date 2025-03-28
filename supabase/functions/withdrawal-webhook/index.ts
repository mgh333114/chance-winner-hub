
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    // Create a Supabase client to update the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.0');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get pending withdrawal requests that are ready to be processed
    const { data: pendingWithdrawals, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    // In a real-world scenario, here you'd integrate with your payment processor 
    // (bank, PayPal, Stripe, etc.) to actually send the money to users
    
    // For this example, we'll just simulate processing by updating the status
    const processedWithdrawals = [];
    
    for (const withdrawal of pendingWithdrawals) {
      // Simulate processing (in real world, this would be an API call to payment processor)
      const isSuccessful = Math.random() > 0.1; // 90% success rate for simulation
      
      if (isSuccessful) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', withdrawal.id);
          
        if (!updateError) {
          processedWithdrawals.push({
            id: withdrawal.id,
            status: 'completed',
            amount: withdrawal.amount
          });
        }
      } else {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            details: JSON.stringify({
              ...JSON.parse(withdrawal.details || '{}'),
              failure_reason: 'Payment processor error (simulated)'
            })
          })
          .eq('id', withdrawal.id);
          
        if (!updateError) {
          processedWithdrawals.push({
            id: withdrawal.id,
            status: 'failed',
            amount: withdrawal.amount
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: processedWithdrawals.length,
        withdrawals: processedWithdrawals 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing withdrawals:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
