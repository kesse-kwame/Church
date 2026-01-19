import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

const parseId = (value) => Number.parseInt(value, 10);

router.get("/positions", async (req, res) => {
  const { church_id } = req.query;
  const query = supabase.from("staff_positions").select("*").order("title", { ascending: true });
  if (church_id) query.eq("church_id", parseId(church_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/positions", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from("staff_positions").insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/assignments", async (req, res) => {
  const { church_id } = req.query;
  const query = supabase
    .from("staff_assignments")
    .select("*, member:member_id(id, first_name, last_name), position:position_id(id, title)")
    .order("start_date", { ascending: false });

  if (church_id) query.eq("church_id", parseId(church_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/assignments", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from("staff_assignments").insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/assignments/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const payload = req.body;
  const { data, error } = await supabase.from("staff_assignments").update(payload).eq("id", id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete("/assignments/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { error } = await supabase.from("staff_assignments").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
