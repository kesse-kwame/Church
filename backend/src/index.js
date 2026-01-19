import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import membersRouter from "./routes/members.js";
import eventsRouter from "./routes/events.js";
import attendanceRouter from "./routes/attendance.js";
import financeRouter from "./routes/finance.js";
import staffRouter from "./routes/staff.js";
import authRouter from "./routes/auth.js";
import { supabase } from "./supabaseClient.js";
import { requireAdmin } from "./middleware/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const logLevel = process.env.LOG_LEVEL || "dev";

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(logLevel));

app.get("/health", async (_req, res) => {
  const { error } = await supabase.from("members").select("id").limit(1);
  if (error) return res.status(500).json({ status: "error", detail: error.message });
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/events", requireAdmin, eventsRouter);
app.use("/attendance", requireAdmin, attendanceRouter);
app.use("/finance", requireAdmin, financeRouter);
app.use("/staff", requireAdmin, staffRouter);
app.use("/members", requireAdmin, membersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
