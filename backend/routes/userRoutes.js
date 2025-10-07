import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUser,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriendUser,
  getUserFriends,
  getFriendRequests,
  searchUsers
} from '../controllers/userController.js';
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

// Configure multer for profile image uploads
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User profile routes (protected)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile);
router.delete('/profile', protect, deleteUser);

// Friend routes (protected)
router.post('/friends/request', protect, sendFriendRequest);
router.put('/friends/accept/:requestId', protect, acceptFriendRequest);
router.put('/friends/reject/:requestId', protect, rejectFriendRequest);
router.delete('/friends/:friendId', protect, unfriendUser);
router.get('/friends', protect, getUserFriends);
router.get('/friends/requests', protect, getFriendRequests);

// Search and public user routes
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);

export default router;
