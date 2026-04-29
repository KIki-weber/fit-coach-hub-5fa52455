import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  mode: "invite" | "create";
  email: string;
  password?: string;
  full_name?: string;
  phone_number?: string;
  exercise_plan?: string;
  gender?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Check caller is admin via JWT
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, serviceKey);
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) return json({ error: "Admin only" }, 403);

    const body: Body = await req.json();
    if (!body.email) return json({ error: "Email required" }, 400);

    if (body.mode === "invite") {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, {
        data: {
          full_name: body.full_name || "",
          phone_number: body.phone_number || "",
          exercise_plan: body.exercise_plan || "",
          gender: body.gender || "",
        },
      });
      if (error) return json({ error: error.message }, 400);
      return json({ success: true, user_id: data.user?.id, mode: "invite" });
    }

    // Direct create
    if (!body.password || body.password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name || "",
        phone_number: body.phone_number || "",
      },
    });
    if (cErr || !created.user) return json({ error: cErr?.message || "Create failed" }, 400);

    // Update profile with extras (handle_new_user trigger should have created baseline)
    await admin.from("profiles").update({
      full_name: body.full_name || "",
      phone_number: body.phone_number || "",
      exercise_plan: body.exercise_plan || null,
      gender: body.gender || null,
    } as any).eq("user_id", created.user.id);

    return json({ success: true, user_id: created.user.id, mode: "create" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
