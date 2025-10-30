import express from 'express';
import {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  addComment,
  updateDiscussion,
  deleteDiscussion,
  markCommentAsSolution,
  addReaction
} from '../controllers/discussionController.js';
import { protect, projectMember } from '../middleware/auth.js';

const router = express.Router();

// Create a new discussion
router.post('/', protect, createDiscussion);

// Get discussions for a project (route is mounted under /api/projects/:projectId/discussions)
router.get('/', getDiscussions);

// Get discussion by ID
router.get('/:id', getDiscussionById);

// Add comment to discussion
router.post('/:id/comments', protect, addComment);

// Update discussion
router.put('/:id', protect, updateDiscussion);

// Delete discussion
router.delete('/:id', protect, deleteDiscussion);

// Mark comment as solution
router.put('/:id/comments/:commentId/solution', protect, markCommentAsSolution);

// Add reaction to comment
router.post('/:id/comments/:commentId/reactions', protect, addReaction);

export default router;
