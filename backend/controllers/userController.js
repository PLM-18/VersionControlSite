import userService from '../services/userService.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      website: user.website,
      skills: user.skills,
      friends: user.friends,
      projects: user.projects,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      verificationRequestStatus: user.verificationRequestStatus,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await userService.updateUser(req.user._id, updateData);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      website: user.website,
      skills: user.skills,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      website: user.website,
      skills: user.skills,
      friends: user.friends,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.user._id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await userService.sendFriendRequest(req.user._id, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const result = await userService.acceptFriendRequest(req.user._id, req.params.requestId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const result = await userService.rejectFriendRequest(req.user._id, req.params.requestId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const unfriendUser = async (req, res) => {
  try {
    const result = await userService.unfriend(req.user._id, req.params.friendId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const friends = await userService.getFriends(req.user._id);
    res.json(friends);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const requests = await userService.getFriendRequests(req.user._id);
    res.json(requests);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await userService.searchUsers(q);
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
