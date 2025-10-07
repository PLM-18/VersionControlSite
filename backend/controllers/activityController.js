import activityService from '../services/activityService.js';

// @desc    Get global activity feed
// @route   GET /api/activity/global
// @access  Public
export const getGlobalActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await activityService.getGlobalActivity(limit);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get local activity feed (user and friends)
// @route   GET /api/activity/local
// @access  Private
export const getLocalActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await activityService.getLocalActivity(req.user._id, limit);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user activity
// @route   GET /api/activity/user/:userId
// @access  Public
export const getUserActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await activityService.getUserActivity(req.params.userId, limit);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search activity
// @route   GET /api/activity/search
// @access  Public
export const searchActivity = async (req, res) => {
  try {
    const { q } = req.query;
    const activity = await activityService.searchActivity(q);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
