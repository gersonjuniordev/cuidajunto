import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const SMTP_SECURE =
  process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "yes";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.WEB_ORIGIN || "http://localhost:5173";

const BILLING_PLANS = {
  monthly: {
    id: "monthly",
    label: "Mensal",
    amount: 19.9,
    frequency: 1,
    frequencyType: "months",
  },
  quarterly: {
    id: "quarterly",
    label: "Trimestral",
    amount: 56.71,
    frequency: 3,
    frequencyType: "months",
  },
  yearly: {
    id: "yearly",
    label: "Anual",
    amount: 202.98,
    frequency: 12,
    frequencyType: "months",
  },
};

function requireSmtpConfig() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return false;
  return true;
}

async function sendEmailViaSmtp({ to, subject, text }) {
  if (!requireSmtpConfig()) {
    throw new Error("SMTP não configurado (adicione SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS no server).");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // true se porta 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const from = SMTP_FROM || SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    text: text || "",
  });
}

function requireMercadoPagoConfig() {
  return !!MP_ACCESS_TOKEN;
}

async function mercadoPagoRequest(endpoint, { method = "GET", body } = {}) {
  if (!requireMercadoPagoConfig()) {
    throw new Error("Mercado Pago não configurado (adicione MP_ACCESS_TOKEN no server).");
  }
  const res = await fetch(`https://api.mercadopago.com${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const err = new Error("Mercado Pago request failed");
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

const envOrigins = String(process.env.WEB_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://cuidajunto.netlify.app",
  ...envOrigins,
];

function normalizeOrigin(origin = "") {
  return String(origin).trim().replace(/\/$/, "").toLowerCase();
}

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  const exactMatch = allowedOrigins.some((candidate) => normalizeOrigin(candidate) === normalized);
  if (exactMatch) return true;

  // Permite previews/dominios de deploy do Netlify.
  if (normalized.endsWith(".netlify.app")) return true;

  return false;
}

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

function parseBearerToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function authUserFromRequest(req) {
  const token = parseBearerToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.sub) return null;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user || null;
  } catch {
    return null;
  }
}

function addDays(base, days) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonths(base, months) {
  const d = new Date(base);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function billingStateOut(user) {
  const now = new Date();
  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const subscriptionEndsAt = user?.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;

  const trialActive = !!trialEndsAt && trialEndsAt > now;
  const subscriptionActive = !!subscriptionEndsAt && subscriptionEndsAt > now;
  const accessActive = trialActive || subscriptionActive || user?.billingStatus === "active";

  const daysLeftTrial = trialActive ? Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)) : 0;

  return {
    status: user?.billingStatus || "trialing",
    plan: user?.billingPlan || "trial",
    trial_ends_at: trialEndsAt ? trialEndsAt.toISOString() : null,
    trial_active: trialActive,
    trial_days_left: daysLeftTrial,
    subscription_ends_at: subscriptionEndsAt ? subscriptionEndsAt.toISOString() : null,
    subscription_active: subscriptionActive,
    mercado_pago_status: user?.mercadoPagoStatus || null,
    access_active: accessActive,
  };
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

    // Convivência (pais separados)
    parentAName: body?.parent_a_name,
    parentADays: body?.parent_a_days,
    parentBName: body?.parent_b_name,
    parentBDays: body?.parent_b_days,
    custodyNotes: body?.custody_notes,
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

    // Convivência (pais separados)
    parent_a_name: c.parentAName,
    parent_a_days: c.parentADays || [],
    parent_b_name: c.parentBName,
    parent_b_days: c.parentBDays || [],
    custody_notes: c.custodyNotes,

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

function dailyReportIn(body) {
  return pickDefined({
    childId: body?.child_id,
    date: toDateOnly(body?.date),
    reportText: body?.report_text,
    mood: body?.mood,
  });
}

function dailyReportOut(r) {
  return {
    id: r.id,
    child_id: r.childId,
    date: r.date ? dateOnlyString(r.date) : undefined,
    report_text: r.reportText,
    mood: r.mood,
    created_at: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
    updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
  };
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use((err, _req, res, next) => {
  if (err?.message?.startsWith("CORS blocked origin:")) {
    return res.status(403).json({ error: "CORS origin blocked" });
  }
  return next(err);
});

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
});

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---- AUTH (simples, baseado só em email) ----
app.get("/api/me", async (_req, res) => {
  const user = await authUserFromRequest(_req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json({
    id: user.id,
    email: user.email,
    full_name: user.name,
    name: user.name,
    billing: billingStateOut(user),
  });
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
    const trialEndsAt = addDays(new Date(), 3);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        billingStatus: "trialing",
        billingPlan: "trial",
        trialEndsAt,
      },
    });
    const token = jwt.sign({}, JWT_SECRET, { subject: user.id, expiresIn: "30d" });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        name: user.name,
        billing: billingStateOut(user),
      },
    });
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
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        name: user.name,
        billing: billingStateOut(user),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.status(204).end();
});

// ---- BILLING (Mercado Pago + trial) ----
app.get("/api/billing/plans", (_req, res) => {
  const plans = Object.values(BILLING_PLANS).map((p) => ({
    id: p.id,
    label: p.label,
    amount: p.amount,
    frequency: p.frequency,
    frequency_type: p.frequencyType,
  }));
  res.json({
    trial_days: 3,
    plans,
  });
});

app.get("/api/billing/status", async (req, res) => {
  const user = await authUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json(billingStateOut(user));
});

app.post("/api/billing/create-subscription", async (req, res) => {
  try {
    const user = await authUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    const planId = String(req.body?.plan || "").trim().toLowerCase();
    const plan = BILLING_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ error: "Plano inválido. Use: monthly, quarterly ou yearly." });
    }

    const body = {
      reason: `CuidaJunto - ${plan.label}`,
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: plan.frequencyType,
        transaction_amount: plan.amount,
        currency_id: "BRL",
      },
      payer_email: user.email,
      external_reference: user.id,
      back_url: `${APP_BASE_URL}/Dashboard`,
      status: "pending",
    };

    const mpSub = await mercadoPagoRequest("/preapproval", {
      method: "POST",
      body,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        billingPlan: plan.id,
        billingStatus: "pending_payment",
        mercadoPagoPreapprovalId: mpSub?.id || null,
        mercadoPagoSubscriptionUrl: mpSub?.init_point || null,
        mercadoPagoStatus: mpSub?.status || "pending",
      },
    });

    res.status(201).json({
      plan: plan.id,
      subscription_id: mpSub?.id || null,
      checkout_url: mpSub?.init_point || null,
      sandbox_checkout_url: mpSub?.sandbox_init_point || null,
      status: mpSub?.status || null,
    });
  } catch (e) {
    console.error("create-subscription error:", e?.payload || e);
    res.status(500).json({ error: "Failed to create subscription", details: e?.payload || null });
  }
});

app.post("/api/billing/refresh", async (req, res) => {
  try {
    const user = await authUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (!user.mercadoPagoPreapprovalId) {
      return res.json({ refreshed: false, billing: billingStateOut(user) });
    }
    await syncUserFromPreapproval(user.mercadoPagoPreapprovalId);
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    return res.json({ refreshed: true, billing: billingStateOut(updated) });
  } catch (e) {
    console.error("billing refresh error:", e?.payload || e);
    return res.status(500).json({ error: "Failed to refresh billing" });
  }
});

async function syncUserFromPreapproval(preapprovalId) {
  if (!preapprovalId) return null;
  const sub = await mercadoPagoRequest(`/preapproval/${preapprovalId}`);
  const userId = sub?.external_reference || null;
  if (!userId) return sub;

  let billingStatus = "pending_payment";
  if (sub?.status === "authorized") billingStatus = "active";
  if (sub?.status === "cancelled") billingStatus = "cancelled";
  if (sub?.status === "paused") billingStatus = "paused";

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return sub;

  let subscriptionEndsAt = user.subscriptionEndsAt;
  if (sub?.next_payment_date) {
    subscriptionEndsAt = new Date(sub.next_payment_date);
  } else if (sub?.status === "authorized") {
    // fallback aproximado quando o MP não devolve next_payment_date
    const plan = BILLING_PLANS[user.billingPlan] || BILLING_PLANS.monthly;
    subscriptionEndsAt = addMonths(new Date(), plan.frequency);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      billingStatus,
      mercadoPagoStatus: sub?.status || null,
      mercadoPagoPreapprovalId: sub?.id || preapprovalId,
      mercadoPagoSubscriptionUrl: sub?.init_point || user.mercadoPagoSubscriptionUrl || null,
      subscriptionEndsAt,
    },
  });

  return sub;
}

app.post("/api/webhooks/mercadopago", async (req, res) => {
  try {
    const topic = req.query?.topic || req.body?.type;
    const dataId = req.query?.id || req.body?.data?.id;

    if (
      topic === "preapproval" ||
      topic === "subscription_preapproval" ||
      topic === "subscription_authorized_payment"
    ) {
      await syncUserFromPreapproval(String(dataId || ""));
    }

    res.status(204).end();
  } catch (e) {
    console.error("mercadopago webhook error:", e?.payload || e);
    res.status(200).json({ ok: false });
  }
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
    // Campos de lista (`String[]`) não podem ser deixados como undefined na criação.
    // Nas atualizações, a ausência desses campos preserva os valores existentes.
    if (data.caregiverEmails === undefined) data.caregiverEmails = [];
    if (data.parentADays === undefined) data.parentADays = [];
    if (data.parentBDays === undefined) data.parentBDays = [];
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

// ---- DAILY REPORTS ----
app.get("/api/daily-reports", async (req, res) => {
  try {
    const { child_id, date } = req.query || {};
    if (!child_id) return res.status(400).json({ error: "Campo 'child_id' é obrigatório" });
    if (!date) return res.status(400).json({ error: "Campo 'date' é obrigatório (yyyy-mm-dd)" });

    const day = toDateOnly(String(date));
    if (!day) return res.status(400).json({ error: "Campo 'date' inválido (yyyy-mm-dd)" });

    const report = await prisma.dailyReport.findUnique({
      where: {
        childId_date: { childId: String(child_id), date: day },
      },
    });

    res.json(report ? dailyReportOut(report) : null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get daily report" });
  }
});

app.post("/api/daily-reports/upsert", async (req, res) => {
  try {
    const { child_id, date, report_text, mood } = req.body || {};
    if (!child_id) return res.status(400).json({ error: "Campo 'child_id' é obrigatório" });
    if (!date) return res.status(400).json({ error: "Campo 'date' é obrigatório (yyyy-mm-dd)" });
    if (report_text === undefined) return res.status(400).json({ error: "Campo 'report_text' é obrigatório" });

    const day = toDateOnly(String(date));
    if (!day) return res.status(400).json({ error: "Campo 'date' inválido (yyyy-mm-dd)" });

    const report = await prisma.dailyReport.upsert({
      where: {
        childId_date: {
          childId: String(child_id),
          date: day,
        },
      },
      update: {
        reportText: String(report_text),
        mood: typeof mood === "string" && mood.trim() !== "" ? mood : null,
      },
      create: {
        childId: String(child_id),
        date: day,
        reportText: String(report_text),
        mood: typeof mood === "string" && mood.trim() !== "" ? mood : null,
      },
    });

    res.status(201).json(dailyReportOut(report));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to upsert daily report" });
  }
});

// ---- FILE UPLOAD ----
app.post("/api/files/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ file_url: fileUrl });
});

// ---- EMAIL via SMTP ----
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, body } = req.body || {};
    if (!to) return res.status(400).json({ error: "Campo 'to' é obrigatório" });
    if (!subject) return res.status(400).json({ error: "Campo 'subject' é obrigatório" });

    // O front envia `body` como texto puro.
    await sendEmailViaSmtp({ to, subject, text: body });
    res.status(204).end();
  } catch (e) {
    console.error("Failed to send email:", e?.message || e);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

