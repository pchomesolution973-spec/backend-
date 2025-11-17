import prisma from "../../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(404).json({ error: "Utilisateur inconnu" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Mot de passe incorrect" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

  res.json({ token });
}
