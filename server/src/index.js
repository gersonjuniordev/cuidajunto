import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://cuidajunto.netlify.app",
  process.env.WEB_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
});

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---- AUTH (simples, baseado só em email) ----
app.get("/api/me", async (_req, res) => {
  const auth = _req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Usuário já existe" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, name, passwordHash } });
    const token = jwt.sign({}, JWT_SECRET, { subject: user.id, expiresIn: "30d" });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to register" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return res.status(401).json({ error: "Credenciais inválidas" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });
    const token = jwt.sign({}, JWT_SECRET, { subject: user.id, expiresIn: "30d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.status(204).end();
});

// ---- CHILDREN ----
app.get("/api/children", async (_req, res) => {
  try {
    const children = await prisma.child.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(children);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list children" });
  }
});

app.post("/api/children", async (req, res) => {
  try {
    const data = req.body;
    const child = await prisma.child.create({ data });
    res.status(201).json(child);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create child" });
  }
});

app.put("/api/children/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const child = await prisma.child.update({ where: { id }, data });
    res.json(child);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update child" });
  }
});

app.delete("/api/children/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.child.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete child" });
  }
});

// ---- TASKS ----
app.get("/api/tasks", async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const tasks = await prisma.task.findMany({
      take,
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const data = req.body;
    const task = await prisma.task.create({ data });
    res.status(201).json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const task = await prisma.task.update({ where: { id }, data });
    res.json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// ---- EVENTS ----
app.get("/api/events", async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const events = await prisma.event.findMany({
      take,
      orderBy: { date: "desc" },
    });
    res.json(events);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list events" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const data = req.body;
    const event = await prisma.event.create({ data });
    res.status(201).json(event);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create event" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// ---- MEDICATIONS ----
app.get("/api/medications", async (req, res) => {
  try {
    const { limit, active } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const where =
      active === "true"
        ? { active: true }
        : {};
    const meds = await prisma.medication.findMany({
      take,
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(meds);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list medications" });
  }
});

app.post("/api/medications", async (req, res) => {
  try {
    const data = req.body;
    const med = await prisma.medication.create({ data });
    res.status(201).json(med);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create medication" });
  }
});

app.delete("/api/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.medication.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete medication" });
  }
});

// ---- MEDICATION LOGS ----
app.get("/api/medication-logs", async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const logs = await prisma.medicationLog.findMany({
      take,
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list medication logs" });
  }
});

app.post("/api/medication-logs", async (req, res) => {
  try {
    const data = req.body;
    const log = await prisma.medicationLog.create({ data });
    res.status(201).json(log);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create medication log" });
  }
});

// ---- DOCUMENTS ----
app.get("/api/documents", async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const docs = await prisma.document.findMany({
      take,
      orderBy: { createdAt: "desc" },
    });
    res.json(docs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const data = req.body;
    const doc = await prisma.document.create({ data });
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create document" });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// ---- CONVERSATIONS ----
app.get("/api/conversations", async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const conversations = await prisma.conversation.findMany({
      take,
      orderBy: { lastMessageAt: "desc" },
    });
    res.json(conversations);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const data = req.body;
    const conv = await prisma.conversation.create({ data });
    res.status(201).json(conv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

app.put("/api/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const conv = await prisma.conversation.update({ where: { id }, data });
    res.json(conv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// ---- MESSAGES ----
app.get("/api/messages", async (req, res) => {
  try {
    const { conversationId, limit } = req.query;
    const take = limit ? parseInt(limit, 10) : undefined;
    const where = conversationId ? { conversationId } : {};
    const messages = await prisma.message.findMany({
      where,
      take,
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list messages" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const data = req.body;
    const msg = await prisma.message.create({ data });
    res.status(201).json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// ---- FILE UPLOAD ----
app.post("/api/files/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ file_url: fileUrl });
});

// ---- EMAIL (stub) ----
app.post("/api/send-email", (req, res) => {
  const { to, subject } = req.body;
  console.log("Pretend sending email to", to, "with subject", subject);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

