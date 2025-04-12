
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { current_jsonb, new_jsonb } = await req.json();
    
    // Parse the input JSON safely
    let currentObject = {};
    let newObject = {};
    
    try {
      // Handle case where current_jsonb might be null, undefined, or not valid JSON
      if (current_jsonb) {
        if (typeof current_jsonb === 'object') {
          currentObject = current_jsonb;
        } else {
          currentObject = JSON.parse(current_jsonb);
        }
      }
      
      // Handle case where new_jsonb might be null, undefined, or not valid JSON
      if (new_jsonb) {
        if (typeof new_jsonb === 'object') {
          newObject = new_jsonb;
        } else {
          newObject = JSON.parse(new_jsonb);
        }
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON format",
        details: parseError.message 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Merge the two JSON objects
    const mergedJsonb = { ...currentObject, ...newObject };
    
    return new Response(JSON.stringify(mergedJsonb), {
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
