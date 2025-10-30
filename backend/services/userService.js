import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Notification from '../models/Notification.js';

class UserService {
  async createUser(userData) {
    const { username, email, password, firstName, lastName } = userData;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      throw new Error('User already exists with this email or username');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    return user;
  }

  async authenticateUser(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  async getUserById(userId, includePassword = false) {
    const query = User.findById(userId);
    if (includePassword) {
      query.select('+password');
    }
    const user = await query.populate('friends', 'username firstName lastName profileImage');
    return user;
  }

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return user;
  }

  async deleteUser(userId) {
    await User.findByIdAndDelete(userId);
  }

  async sendFriendRequest(fromUserId, toUserId) {
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    if (fromUser.friends.includes(toUserId)) {
      throw new Error('Already friends with this user');
    }

    const existingRequest = toUser.friendRequests.find(
      req => req.from.toString() === fromUserId.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    toUser.friendRequests.push({
      from: fromUserId,
      status: 'pending'
    });

    fromUser.sentFriendRequests.push({
      to: toUserId,
      status: 'pending'
    });

    await Promise.all([toUser.save(), fromUser.save()]);

    await Notification.create({
      recipient: toUserId,
      sender: fromUserId,
      type: 'friend_request',
      message: `${fromUser.username} sent you a friend request`
    });

    return { message: 'Friend request sent' };
  }

  async acceptFriendRequest(userId, requestId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const request = user.friendRequests.id(requestId);

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    const fromUser = await User.findById(request.from);

    if (!fromUser) {
      throw new Error('Requester not found');
    }

    request.status = 'accepted';

    const sentRequest = fromUser.sentFriendRequests.find(
      req => req.to.toString() === userId.toString() && req.status === 'pending'
    );
    if (sentRequest) {
      sentRequest.status = 'accepted';
    }

    user.friends.push(request.from);
    fromUser.friends.push(userId);

    await Promise.all([user.save(), fromUser.save()]);

    await Notification.create({
      recipient: request.from,
      sender: userId,
      type: 'friend_accept',
      message: `${user.username} accepted your friend request`
    });

    return { message: 'Friend request accepted' };
  }

  async rejectFriendRequest(userId, requestId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const request = user.friendRequests.id(requestId);

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    const fromUser = await User.findById(request.from);

    if (fromUser) {
      const sentRequest = fromUser.sentFriendRequests.find(
        req => req.to.toString() === userId.toString() && req.status === 'pending'
      );
      if (sentRequest) {
        sentRequest.status = 'rejected';
      }
      await fromUser.save();
    }

    request.status = 'rejected';
    await user.save();

    return { message: 'Friend request rejected' };
  }

  async unfriend(userId, friendId) {
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);

    if (!user || !friend) {
      throw new Error('User not found');
    }

    user.friends = user.friends.filter(id => id.toString() !== friendId.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== userId.toString());

    await Promise.all([user.save(), friend.save()]);

    return { message: 'Unfriended successfully' };
  }

  async getFriends(userId) {
    const user = await User.findById(userId).populate(
      'friends',
      'username firstName lastName profileImage bio'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user.friends;
  }

  async getFriendRequests(userId) {
    const user = await User.findById(userId).populate(
      'friendRequests.from',
      'username firstName lastName profileImage'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user.friendRequests.filter(req => req.status === 'pending');
  }

  async searchUsers(query) {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username firstName lastName profileImage bio').limit(20);

    return users;
  }
}

export default new UserService();
