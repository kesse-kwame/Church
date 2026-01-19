import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

const parseId = (value) => Number.parseInt(value, 10);

router.get("/", async (req, res) => {
  const { from, to, church_id } = req.query;
  const query = supabase.from("events").select("*").order("start_at", { ascending: true });

  if (from) query.gte("start_at", from);
  if (to) query.lte("start_at", to);
  if (church_id) query.eq("church_id", parseId(church_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from("events").insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const payload = req.body;
  const { data, error } = await supabase.from("events").update(payload).eq("id", id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
