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

function pickDefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function toDateOnly(v) {
  // Espera "yyyy-MM-dd" e devolve Date em UTC; '' vira null.
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return new Date(`${v}T00:00:00.000Z`);
}

function toDateTime(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return new Date(v);
}

function dateOnlyString(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

// ---- MAPPERS snake_case <-> camelCase ----

function childIn(body) {
  return pickDefined({
    name: body?.name,
    birthDate: toDateOnly(body?.birth_date),
    photoUrl: body?.photo_url,
    bloodType: body?.blood_type,
    allergies: body?.allergies,
    notes: body?.notes,
    inviteCode: body?.invite_code,
    ownerEmail: body?.owner_email,
    caregiverEmails: body?.caregiver_emails,
  });
}

function childOut(c) {
  return {
    id: c.id,
    name: c.name,
    birth_date: dateOnlyString(c.birthDate),
    photo_url: c.photoUrl,
    blood_type: c.bloodType,
    allergies: c.allergies,
    notes: c.notes,
    invite_code: c.inviteCode,
    owner_email: c.ownerEmail,
    caregiver_emails: c.caregiverEmails || [],
    created_at: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
    updated_at: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
  };
}

function taskIn(body) {
  return pickDefined({
    title: body?.title,
    description: body?.description,
    childId: body?.child_id,
    dueDate: toDateOnly(body?.due_date),
    status: body?.status,
    priority: body?.priority,
    assignedTo: body?.assigned_to,
  });
}

function taskOut(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    child_id: t.childId,
    due_date: dateOnlyString(t.dueDate),
    status: t.status,
    priority: t.priority,
    assigned_to: t.assignedTo,
    created_date: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
    updated_date: t.updatedAt ? new Date(t.updatedAt).toISOString() : undefined,
  };
}

function eventIn(body) {
  return pickDefined({
    title: body?.title,
    description: body?.description,
    childId: body?.child_id,
    date: toDateOnly(body?.date),
    time: body?.time,
    category: body?.category,
    location: body?.location,
    responsible: body?.responsible,
  });
}

function eventOut(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    child_id: e.childId,
    date: dateOnlyString(e.date),
    time: e.time,
    category: e.category,
    location: e.location,
    responsible: e.responsible,
    created_date: e.createdAt ? new Date(e.createdAt).toISOString() : undefined,
    updated_date: e.updatedAt ? new Date(e.updatedAt).toISOString() : undefined,
  };
}

function medicationIn(body) {
  return pickDefined({
    name: body?.name,
    childId: body?.child_id,
    dosage: body?.dosage,
    frequency: body?.frequency,
    startDate: toDateOnly(body?.start_date),
    endDate: toDateOnly(body?.end_date),
    instructions: body?.instructions,
    active: body?.active,
  });
}

function medicationOut(m) {
  return {
    id: m.id,
    name: m.name,
    child_id: m.childId,
    dosage: m.dosage,
    frequency: m.frequency,
    start_date: dateOnlyString(m.startDate),
    end_date: dateOnlyString(m.endDate),
    instructions: m.instructions,
    active: m.active,
    created_date: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
    updated_date: m.updatedAt ? new Date(m.updatedAt).toISOString() : undefined,
  };
}

function medicationLogIn(body) {
  return pickDefined({
    medicationId: body?.medication_id,
    childId: body?.child_id,
    administeredAt: toDateTime(body?.administered_at),
    administeredBy: body?.administered_by,
    notes: body?.notes,
  });
}

function medicationLogOut(l) {
  return {
    id: l.id,
    medication_id: l.medicationId,
    child_id: l.childId,
    administered_at: l.administeredAt ? new Date(l.administeredAt).toISOString() : null,
    administered_by: l.administeredBy,
    notes: l.notes,
    created_date: l.createdAt ? new Date(l.createdAt).toISOString() : undefined,
  };
}

function documentIn(body) {
  return pickDefined({
    title: body?.title,
    childId: body?.child_id,
    category: body?.category,
    fileUrl: body?.file_url,
    expiryDate: toDateOnly(body?.expiry_date),
    notes: body?.notes,
  });
}

function documentOut(d) {
  return {
    id: d.id,
    title: d.title,
    child_id: d.childId,
    category: d.category,
    file_url: d.fileUrl,
    expiry_date: dateOnlyString(d.expiryDate),
    notes: d.notes,
    created_date: d.createdAt ? new Date(d.createdAt).toISOString() : undefined,
    updated_date: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
  };
}

function conversationIn(body) {
  return pickDefined({
    title: body?.title,
    participants: body?.participants ?? [],
    childId: body?.child_id,
    lastMessage: body?.last_message,
    lastMessageAt: toDateTime(body?.last_message_at),
    lastMessageBy: body?.last_message_by,
  });
}

function conversationOut(c) {
  return {
    id: c.id,
    title: c.title,
    participants: c.participants,
    child_id: c.childId,
    last_message: c.lastMessage,
    last_message_at: c.lastMessageAt ? new Date(c.lastMessageAt).toISOString() : null,
    last_message_by: c.lastMessageBy,
    created_date: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
    updated_date: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
  };
}

function messageIn(body) {
  return pickDefined({
    conversationId: body?.conversation_id,
    text: body?.text,
    senderEmail: body?.sender_email,
    senderName: body?.sender_name,
    linkedTaskId: body?.linked_task_id,
    linkedEventId: body?.linked_event_id,
    childId: body?.child_id,
  });
}

function messageOut(m) {
  return {
    id: m.id,
    conversation_id: m.conversationId,
    text: m.text,
    sender_email: m.senderEmail,
    sender_name: m.senderName,
    linked_task_id: m.linkedTaskId,
    linked_event_id: m.linkedEventId,
    child_id: m.childId,
    created_date: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
  };
}

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
    res.json({ id: user.id, email: user.email, full_name: user.name, name: user.name });
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
    res.status(201).json({ token, user: { id: user.id, email: user.email, full_name: user.name, name: user.name } });
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
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.name, name: user.name } });
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
    res.json(children.map(childOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list children" });
  }
});

app.post("/api/children", async (req, res) => {
  try {
    const data = childIn(req.body);
    const child = await prisma.child.create({ data });
    res.status(201).json(childOut(child));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create child" });
  }
});

app.put("/api/children/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = childIn(req.body);
    const child = await prisma.child.update({ where: { id }, data });
    res.json(childOut(child));
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
    res.json(tasks.map(taskOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const data = taskIn(req.body);
    const task = await prisma.task.create({ data });
    res.status(201).json(taskOut(task));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = taskIn(req.body);
    const task = await prisma.task.update({ where: { id }, data });
    res.json(taskOut(task));
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
    res.json(events.map(eventOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list events" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const data = eventIn(req.body);
    const event = await prisma.event.create({ data });
    res.status(201).json(eventOut(event));
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
    res.json(meds.map(medicationOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list medications" });
  }
});

app.post("/api/medications", async (req, res) => {
  try {
    const data = medicationIn(req.body);
    const med = await prisma.medication.create({ data });
    res.status(201).json(medicationOut(med));
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
    res.json(logs.map(medicationLogOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list medication logs" });
  }
});

app.post("/api/medication-logs", async (req, res) => {
  try {
    const data = medicationLogIn(req.body);
    const log = await prisma.medicationLog.create({ data });
    res.status(201).json(medicationLogOut(log));
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
    res.json(docs.map(documentOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const data = documentIn(req.body);
    const doc = await prisma.document.create({ data });
    res.status(201).json(documentOut(doc));
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
    res.json(conversations.map(conversationOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const data = conversationIn(req.body);
    const conv = await prisma.conversation.create({ data });
    res.status(201).json(conversationOut(conv));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

app.put("/api/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = conversationIn(req.body);
    const conv = await prisma.conversation.update({ where: { id }, data });
    res.json(conversationOut(conv));
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
    res.json(messages.map(messageOut));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list messages" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const data = messageIn(req.body);
    const msg = await prisma.message.create({ data });
    res.status(201).json(messageOut(msg));
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

