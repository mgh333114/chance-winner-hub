
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { transaction_id } = await req.json();
  
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.0');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the transaction details
    const { data, error } = await supabase
      .from('transactions')
      .select('details')
      .eq('id', transaction_id)
      .single();
      
    if (error) throw error;
    
    return new Response(JSON.stringify(data.details || {}), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
