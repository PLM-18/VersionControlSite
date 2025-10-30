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

router.post('/', protect, createDiscussion);

router.get('/', getDiscussions);

router.get('/:id', getDiscussionById);

router.post('/:id/comments', protect, addComment);

router.put('/:id', protect, updateDiscussion);

router.delete('/:id', protect, deleteDiscussion);

router.put('/:id/comments/:commentId/solution', protect, markCommentAsSolution);

router.post('/:id/comments/:commentId/reactions', protect, addReaction);

export default router;
