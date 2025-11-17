import prisma from "../../prisma/client.js";

export async function listInterventions(req, res) {
  const list = await prisma.intervention.findMany();
  res.json(list);
}

export async function createIntervention(req, res) {
  const data = req.body;
  const i = await prisma.intervention.create({ data });
  res.json(i);
}

export async function getIntervention(req, res) {
  const id = Number(req.params.id);
  const i = await prisma.intervention.findUnique({ where: { id }});
  res.json(i);
}

export async function updateIntervention(req, res) {
  const id = Number(req.params.id);
  const data = req.body;
  const i = await prisma.intervention.update({ where: { id }, data });
  res.json(i);
}
