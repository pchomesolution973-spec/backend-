import { Router } from "express";
import { login } from "./controllers/auth.js";
import {
  createIntervention,
  listInterventions,
  getIntervention,
  updateIntervention
} from "./controllers/interventions.js";
import { sendMessage } from "./controllers/messages.js";
import auth from "./middleware/auth.js";

const r = Router();

r.post("/login", login);

r.get("/interventions", auth, listInterventions);
r.post("/interventions", auth, createIntervention);
r.get("/interventions/:id", auth, getIntervention);
r.patch("/interventions/:id", auth, updateIntervention);
r.post("/interventions/:id/message", auth, sendMessage);

export default r;
