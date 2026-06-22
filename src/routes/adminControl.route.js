import express from "express";
import { adminProtection } from "../middleware/admin.middleware.js";
import { 
  getAdminProfile,
  updateAdminProfile,
  updateAgent,
  deleteAgent,
  getVotingResults,
  publishResults,
  getAllUsers
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes require admin authentication
router.use(adminProtection);

router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.put("/agent/:id", updateAgent);
router.delete("/agent/:id", deleteAgent);
router.get("/results", getVotingResults);
router.post("/results/publish", publishResults);
router.get("/users", getAllUsers);

export default router;
