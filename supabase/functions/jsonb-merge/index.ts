
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { current_jsonb, new_jsonb } = await req.json();
    
    // Merge the two JSON objects
    const mergedJsonb = { 
      ...JSON.parse(current_jsonb || '{}'), 
      ...JSON.parse(new_jsonb || '{}') 
    };
    
    return new Response(JSON.stringify(mergedJsonb), {
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
