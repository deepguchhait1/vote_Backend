import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getVoteStatus,
  getResults 
} from '../controllers/user.controller.js';
import { userProtection } from '../middleware/user.middleware.js';

const router = express.Router();

router.use(userProtection);

router.get('/me', getUserProfile);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/vote-status', getVoteStatus);
router.get('/results', getResults);

export default router;
