import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

// =========================
// JWT Middleware
// =========================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token manquant" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token invalide" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
}

// =========================
// AUTH
// =========================

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstname, lastname, role = "user" } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        firstname,
        lastname,
        role
      },
    });

    return res.json({ message: "Utilisateur créé", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Utilisateur inconnu" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================
// INTERVENTIONS
// =========================

app.get("/interventions", auth, async (req, res) => {
  try {
    const list = await prisma.intervention.findMany({
      include: { technician: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/interventions/:id", auth, async (req, res) => {
  try {
    const intervention = await prisma.intervention.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        technician: true,
        messages: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!intervention) return res.status(404).json({ error: "Non trouvé" });

    res.json(intervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/interventions", auth, async (req, res) => {
  try {
    const { title, description, technicianId } = req.body;

    const created = await prisma.intervention.create({
      data: {
        title,
        description,
        technicianId: technicianId ? Number(technicianId) : null,
      },
    });

    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/interventions/:id", auth, async (req, res) => {
  try {
    const updated = await prisma.intervention.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// MESSAGES
// =========================

app.get("/messages/:interventionId", auth, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { interventionId: Number(req.params.interventionId) },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/messages", auth, async (req, res) => {
  try {
    const { content, interventionId } = req.body;

    const msg = await prisma.message.create({
      data: {
        content,
        interventionId: Number(interventionId),
        userId: req.user.id,
      },
      include: { user: true },
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

export default app;
