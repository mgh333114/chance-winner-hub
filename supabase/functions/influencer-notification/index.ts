
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckInfluencerRequest {
  userId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { userId }: CheckInfluencerRequest = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking influencer status for user: ${userId}`);
    
    // Call the database function to check influencer status
    const { data, error } = await supabase.rpc("check_influencer_status", {
      user_id_input: userId
    });
    
    if (error) {
      console.error("Error calling check_influencer_status:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If user became an influencer, we need to send an email
    if (data === true) {
      console.log(`User ${userId} has become an influencer!`);
      
      // Get user's email from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
        
      if (profileError || !profileData?.email) {
        console.error("Error fetching user email:", profileError);
        // Continue even if we can't get the email - we'll just log it
      } else {
        console.log(`Would send influencer congratulations email to: ${profileData.email}`);
        // In a real implementation, you would integrate with an email service here
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, becameInfluencer: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in influencer-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
