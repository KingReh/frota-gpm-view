const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    const expectedAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!authHeader || !expectedAnonKey || authHeader !== `Bearer ${expectedAnonKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const onesignalAppId = Deno.env.get("ONESIGNAL_APP_ID")!;
    const onesignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY")!;

    // Send notification to all subscribed users via OneSignal REST API
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${onesignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: onesignalAppId,
        included_segments: ["Subscribed Users"],
        headings: { en: "Aviso" },
        contents: { en: "Saldo de combustível atualizado pela GPM!" },
        chrome_web_icon: "/icons/icon-192.png",
        chrome_web_badge: "/icons/icon-192.png",
        web_push_topic: "fuel-balance-update",
        ttl: 86400,
        priority: 10,
      }),
    });

    const result = await response.json();
    console.log("OneSignal full response:", JSON.stringify(result));
    console.log("OneSignal response status:", response.status);

    if (!response.ok) {
      console.error("OneSignal API error:", result);
      return new Response(JSON.stringify({ error: "OneSignal API error", details: result }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update push log
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.1");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("push_notifications_log")
      .update({
        status: "sent",
        affected_rows: result.recipients || 0,
      })
      .eq("status", "pending")
      .order("triggered_at", { ascending: false })
      .limit(1);

    console.log(`OneSignal push sent: ${result.recipients || 0} recipients, id: ${result.id}`);

    return new Response(
      JSON.stringify({ success: true, recipients: result.recipients, onesignal_id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
