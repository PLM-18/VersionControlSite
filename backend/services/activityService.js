import CheckIn from '../models/CheckIn.js';
import User from '../models/User.js';

class ActivityService {
  async getGlobalActivity(limit = 50) {
    const checkins = await CheckIn.find()
      .populate('user', 'username firstName lastName profileImage')
      .populate('project', 'title projectImage projectType hashtags')
      .sort({ createdAt: -1 })
      .limit(limit);

    return checkins;
  }

  async getLocalActivity(userId, limit = 50) {
    // Get user's friends
    const user = await User.findById(userId).select('friends');

    if (!user) {
      throw new Error('User not found');
    }

    // Get checkins from user and their friends
    const friendIds = [...user.friends, userId];

    const checkins = await CheckIn.find({ user: { $in: friendIds } })
      .populate('user', 'username firstName lastName profileImage')
      .populate('project', 'title projectImage projectType hashtags')
      .sort({ createdAt: -1 })
      .limit(limit);

    return checkins;
  }

  async getUserActivity(userId, limit = 50) {
    const checkins = await CheckIn.find({ user: userId })
      .populate('project', 'title projectImage projectType hashtags')
      .sort({ createdAt: -1 })
      .limit(limit);

    return checkins;
  }

  async searchActivity(query) {
    const checkins = await CheckIn.find({
      $or: [
        { message: { $regex: query, $options: 'i' } },
        { hashtags: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('user', 'username firstName lastName profileImage')
      .populate('project', 'title projectImage projectType hashtags')
      .sort({ createdAt: -1 })
      .limit(20);

    return checkins;
  }
}

export default new ActivityService();
