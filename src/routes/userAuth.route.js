import express from "express";
import {
  userLogin,
  userLogout,
  userSignup,
  getAgentsForVoting,
  castVote,
} from "../controllers/user.controller.js";
import { userProtection } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/agents",userProtection, getAgentsForVoting);
router.post("/vote", userProtection, castVote);

router.get("/me", userProtection, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
