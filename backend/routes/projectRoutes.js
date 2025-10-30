import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  checkoutProject,
  checkinProject,
  addProjectMember,
  removeProjectMember,
  getProjectCheckins,
  searchProjects,
  getUserProjects,
  deleteFile
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|js|py|html|css|txt|md|json|xml|zip|cpp|java|c|cs|jsx|tsx|h|ts/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('text/') || file.mimetype === 'application/zip';

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Public routes
router.get('/', getAllProjects);
router.get('/search', searchProjects);
router.get('/user/:userId', getUserProjects);
router.get('/:id', getProjectById);
router.get('/:id/checkins', getProjectCheckins);

// Protected routes
router.post('/', protect, upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'files', maxCount: 10 }
]), createProject);
router.put('/:id', protect, upload.single('projectImage'), updateProject);
router.delete('/:id', protect, deleteProject);

// Checkout/Checkin routes
router.post('/:id/checkout', protect, checkoutProject);
router.post('/:id/checkin', protect, upload.array('files', 10), checkinProject);

// Member routes
router.post('/:id/members', protect, addProjectMember);
router.delete('/:id/members/:memberId', protect, removeProjectMember);

// File routes
router.delete('/:id/files/:fileId', protect, deleteFile);

export default router;
