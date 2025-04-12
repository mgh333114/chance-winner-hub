
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { transaction_id } = await req.json();
    
    if (!transaction_id) {
      return new Response(JSON.stringify({ 
        error: "Missing transaction_id parameter" 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
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
      
    if (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        details: "Failed to retrieve transaction details" 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    // Return the details as an object or empty object if null
    return new Response(JSON.stringify(data.details || {}), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
