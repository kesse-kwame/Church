import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

const parseId = (value) => Number.parseInt(value, 10);

router.get("/", async (req, res) => {
  const { event_id, member_id } = req.query;
  const query = supabase
    .from("attendance_records")
    .select("*, members:member_id(id, first_name, last_name), events:event_id(id, title, start_at)")
    .order("checked_in_at", { ascending: false });

  if (event_id) query.eq("event_id", parseId(event_id));
  if (member_id) query.eq("member_id", parseId(member_id));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/", async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const { data, error } = await supabase.from("attendance_records").upsert(payload).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const payload = req.body;
  const { data, error } = await supabase.from("attendance_records").update(payload).eq("id", id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { error } = await supabase.from("attendance_records").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
