import activityService from '../services/activityService.js';

export const getGlobalActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await activityService.getGlobalActivity(limit);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLocalActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await activityService.getLocalActivity(req.user._id, limit);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await activityService.getUserActivity(req.params.userId, limit);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const searchActivity = async (req, res) => {
  try {
    const { q } = req.query;
    const activity = await activityService.searchActivity(q);
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
