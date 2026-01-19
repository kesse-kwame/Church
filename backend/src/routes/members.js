import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

const parseId = (value) => Number.parseInt(value, 10);

router.get("/", async (req, res) => {
  const { status, church_id } = req.query;
  const query = supabase.from("members").select("*").order("last_name", { ascending: true });

  if (status) query.eq("status", status);
  if (church_id) query.eq("church_id", parseId(church_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { data, error } = await supabase.from("members").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

router.post("/", async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from("members").insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const payload = req.body;
  const { data, error } = await supabase.from("members").update(payload).eq("id", id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
