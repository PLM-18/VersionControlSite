import express from 'express';
import { protect } from '../middleware/auth.js';
import ProjectType from '../models/ProjectType.js';

const router = express.Router();

// Get all active project types (public)
router.get('/', protect, async (req, res) => {
  try {
    const projectTypes = await ProjectType.find({ isActive: true })
      .select('name description icon color')
      .sort({ name: 1 });

    res.json({ projectTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
