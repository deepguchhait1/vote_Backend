import express from "express";
import { adminLogin, adminLogout, adminSign, addAgent, getAgents } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/signup", adminSign);
router.post("/logout", adminLogout);
router.post("/agent", addAgent);
router.get("/agents", getAgents);

export default router;
