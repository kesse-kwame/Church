import { supabaseAuth, supabase } from "../supabaseClient.js";

const parseBearer = (header) => {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = parseBearer(req.headers.authorization);
    if (!token) return res.status(401).json({ error: "Missing Authorization header" });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = userData.user.id;
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role, full_name, church_id, member_id")
      .eq("id", userId)
      .single();

    if (profileErr) {
      return res.status(500).json({ error: profileErr.message });
    }

    req.user = {
      id: userId,
      email: userData.user.email,
      role: profile?.role || userData.user.user_metadata?.role || "member",
      full_name: profile?.full_name,
      church_id: profile?.church_id,
      member_id: profile?.member_id,
      token,
    };
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Auth check failed" });
  }
};

export const requireAdmin = async (req, res, next) => {
  const ensureAuth = await new Promise((resolve) => {
    requireAuth(req, res, (result) => resolve(result ?? true));
  });
  if (ensureAuth !== true) return; // response already sent
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin role required" });
  }
  return next();
};
