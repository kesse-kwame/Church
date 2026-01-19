import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

const parseId = (value) => Number.parseInt(value, 10);

router.get("/donations", async (req, res) => {
  const { member_id, church_id } = req.query;
  const query = supabase
    .from("donations")
    .select("*, member:member_id(id, first_name, last_name)")
    .order("received_at", { ascending: false });

  if (member_id) query.eq("member_id", parseId(member_id));
  if (church_id) query.eq("church_id", parseId(church_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/donations", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from("donations").insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/expenses", async (req, res) => {
  const { church_id } = req.query;
  const query = supabase.from("expenses").select("*").order("paid_at", { ascending: false });
  if (church_id) query.eq("church_id", parseId(church_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/expenses", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from("expenses").insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
