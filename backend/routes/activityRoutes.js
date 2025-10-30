import express from 'express';
import {
  getGlobalActivity,
  getLocalActivity,
  getUserActivity,
  searchActivity
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/global', getGlobalActivity);
router.get('/search', searchActivity);
router.get('/user/:userId', getUserActivity);

router.get('/local', protect, getLocalActivity);

export default router;
