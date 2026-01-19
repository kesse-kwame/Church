import { Router } from "express";
import { supabase, supabaseAuth } from "../supabaseClient.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { email, password, full_name, role = "member", admin_code } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (role === "admin") {
    const expected = process.env.ADMIN_INVITE_CODE;
    if (expected && admin_code !== expected) {
      return res.status(403).json({ error: "Invalid admin invite code" });
    }
  }

  const { data: userResult, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (createErr || !userResult?.user) {
    return res.status(400).json({ error: createErr?.message || "Unable to create user" });
  }

  const userId = userResult.user.id;
  const { error: profileErr } = await supabase.from("profiles").upsert(
    { id: userId, full_name, role },
    { onConflict: "id" },
  );

  if (profileErr) {
    return res.status(500).json({ error: profileErr.message });
  }

  res.status(201).json({
    user_id: userId,
    email: userResult.user.email,
    role: role || "member",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data: authData, error: signErr } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (signErr || !authData.session) {
    return res.status(401).json({ error: signErr?.message || "Invalid credentials" });
  }

  const userId = authData.session.user.id;
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();

  if (profileErr) {
    return res.status(500).json({ error: profileErr.message });
  }

  res.json({
    user_id: userId,
    email: authData.session.user.email,
    role: profile?.role || authData.session.user.user_metadata?.role || "member",
    full_name: profile?.full_name,
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token,
  });
});

export default router;
