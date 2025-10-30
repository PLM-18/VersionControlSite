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
import User from '../models/User.js';
import Project from '../models/Project.js';
import VerificationRequest from '../models/VerificationRequest.js';
import CheckIn from '../models/CheckIn.js';

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

// Verification request routes
router.post('/verification-request', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('projects');

    // Check if user meets requirements
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

    if (accountAge < oneWeekInMs) {
      return res.status(400).json({
        message: 'Your account must be at least one week old to request verification'
      });
    }

    if (user.projects.length === 0) {
      return res.status(400).json({
        message: 'You must have at least one project to request verification'
      });
    }

    // Check if user has checked out at least one project
    const checkOuts = await CheckIn.countDocuments({ user: user._id });
    if (checkOuts === 0) {
      return res.status(400).json({
        message: 'You must have checked out at least one project to request verification'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Your account is already verified' });
    }

    // Check if request already exists
    const existingRequest = await VerificationRequest.findOne({ user: user._id });
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({
          message: 'You already have a pending verification request'
        });
      } else if (existingRequest.status === 'rejected') {
        // Allow resubmission after rejection
        existingRequest.status = 'pending';
        existingRequest.requestMessage = req.body.requestMessage || '';
        existingRequest.adminResponse = '';
        existingRequest.reviewedBy = null;
        existingRequest.reviewedAt = null;
        await existingRequest.save();

        user.verificationRequestStatus = 'pending';
        user.verificationRequestedAt = Date.now();
        await user.save();

        return res.json({
          message: 'Verification request resubmitted successfully',
          request: existingRequest
        });
      }
    }

    // Create new verification request
    const verificationRequest = await VerificationRequest.create({
      user: user._id,
      requestMessage: req.body.requestMessage || ''
    });

    user.verificationRequestStatus = 'pending';
    user.verificationRequestedAt = Date.now();
    await user.save();

    res.status(201).json({
      message: 'Verification request submitted successfully',
      request: verificationRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get user's verification request status
router.get('/verification-request/status', protect, async (req, res) => {
  try {
    const request = await VerificationRequest.findOne({ user: req.user._id })
      .populate('reviewedBy', 'username email');

    res.json({
      hasRequest: !!request,
      request: request || null,
      userStatus: {
        isVerified: req.user.isVerified,
        verificationRequestStatus: req.user.verificationRequestStatus,
        verificationRequestedAt: req.user.verificationRequestedAt,
        verifiedAt: req.user.verifiedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Check verification eligibility
router.get('/verification-request/eligibility', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('projects');

    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

    const checkOuts = await CheckIn.countDocuments({ user: user._id });

    const eligible = {
      accountOldEnough: accountAge >= oneWeekInMs,
      hasProject: user.projects.length > 0,
      hasCheckOut: checkOuts > 0,
      isVerified: user.isVerified,
      hasPendingRequest: user.verificationRequestStatus === 'pending'
    };

    eligible.canRequest =
      eligible.accountOldEnough &&
      eligible.hasProject &&
      eligible.hasCheckOut &&
      !eligible.isVerified &&
      !eligible.hasPendingRequest;

    res.json({
      eligible: eligible.canRequest,
      requirements: eligible,
      accountAge: Math.floor(accountAge / (24 * 60 * 60 * 1000)), // days
      projectCount: user.projects.length,
      checkOutCount: checkOuts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
