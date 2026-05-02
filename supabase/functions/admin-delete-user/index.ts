import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, serviceKey);
    const { data: roles } = await admin
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roles) return json({ error: "Admin only" }, 403);

    const { target_user_id } = await req.json();
    if (!target_user_id) return json({ error: "target_user_id required" }, 400);
    if (target_user_id === user.id) return json({ error: "Cannot delete yourself" }, 400);

    // Delete dependent rows first (no cascade FKs configured)
    await admin.from("bookings").delete().eq("user_id", target_user_id);
    await admin.from("messages").delete().eq("user_id", target_user_id);
    await admin.from("nutrition").delete().eq("user_id", target_user_id);
    await admin.from("schedules").delete().eq("user_id", target_user_id);
    await admin.from("progress_tracking").delete().eq("user_id", target_user_id);
    await admin.from("user_roles").delete().eq("user_id", target_user_id);
    await admin.from("profiles").delete().eq("user_id", target_user_id);

    const { error: delErr } = await admin.auth.admin.deleteUser(target_user_id);
    if (delErr) return json({ error: delErr.message }, 400);

    return json({ success: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
