import Project from '../models/Project.js';
import User from '../models/User.js';
import CheckIn from '../models/CheckIn.js';
import Notification from '../models/Notification.js';

class ProjectService {
  async createProject(projectData, ownerId) {
    const { title, description, projectType, hashtags, projectImage, files } = projectData;

    const project = await Project.create({
      title,
      description,
      projectType,
      hashtags,
      projectImage,
      files: files || [],
      owner: ownerId,
      members: [{
        user: ownerId,
        role: 'owner'
      }]
    });

    // Add project to user's projects
    await User.findByIdAndUpdate(ownerId, {
      $push: { projects: project._id }
    });

    return project;
  }

  async getProjectById(projectId) {
    const project = await Project.findById(projectId)
      .populate('owner', 'username firstName lastName profileImage')
      .populate('members.user', 'username firstName lastName profileImage')
      .populate('checkedOutBy', 'username firstName lastName profileImage');

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async getAllProjects(filters = {}) {
    const query = {};

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.projectType) {
      query.projectType = filters.projectType;
    }

    if (filters.hashtags) {
      query.hashtags = { $in: Array.isArray(filters.hashtags) ? filters.hashtags : [filters.hashtags] };
    }

    if (filters.owner) {
      query.owner = filters.owner;
    }

    const projects = await Project.find(query)
      .populate('owner', 'username firstName lastName profileImage')
      .sort({ lastActivity: -1 })
      .limit(filters.limit || 50);

    return projects;
  }

  async updateProject(projectId, userId, updateData) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
      throw new Error('Only project owner can update the project');
    }

    Object.assign(project, updateData);
    project.lastActivity = new Date();

    await project.save();

    return project;
  }

  async deleteProject(projectId, userId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
      throw new Error('Only project owner can delete the project');
    }

    await Project.findByIdAndDelete(projectId);

    // Remove project from user's projects
    await User.findByIdAndUpdate(userId, {
      $pull: { projects: projectId }
    });

    // Delete all checkins for this project
    await CheckIn.deleteMany({ project: projectId });

    return { message: 'Project deleted successfully' };
  }

  async checkoutProject(projectId, userId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if already checked out
    if (project.checkedOutBy) {
      if (project.checkedOutBy.toString() === userId.toString()) {
        throw new Error('You have already checked out this project');
      }
      throw new Error('Project is currently checked out by another user');
    }

    // Check if user is a member
    const isMember = project.members.some(
      member => member.user.toString() === userId.toString()
    );

    if (!isMember && project.owner.toString() !== userId.toString()) {
      throw new Error('You must be a project member to check it out');
    }

    project.checkedOutBy = userId;
    project.checkedOutAt = new Date();
    project.lastActivity = new Date();

    await project.save();

    return project;
  }

  async checkinProject(projectId, userId, checkinData) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has checked out the project
    if (!project.checkedOutBy || project.checkedOutBy.toString() !== userId.toString()) {
      throw new Error('You must check out the project before checking it in');
    }

    const { message, files, changesDescription, hashtags } = checkinData;

    // Create checkin record
    const checkin = await CheckIn.create({
      project: projectId,
      user: userId,
      message,
      files: files || [],
      changesDescription,
      hashtags: hashtags || []
    });

    // Update project files if new files provided
    if (files && files.length > 0) {
      project.files.push(...files);
    }

    // Release checkout
    project.checkedOutBy = null;
    project.checkedOutAt = null;
    project.lastActivity = new Date();

    await project.save();

    // Notify project members
    const user = await User.findById(userId);
    const notificationPromises = project.members
      .filter(member => member.user.toString() !== userId.toString())
      .map(member =>
        Notification.create({
          recipient: member.user,
          sender: userId,
          type: 'check_in',
          message: `${user.username} checked in changes to ${project.title}`,
          relatedProject: projectId,
          relatedCheckIn: checkin._id
        })
      );

    await Promise.all(notificationPromises);

    return checkin;
  }

  async addMember(projectId, userId, memberUserId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
      throw new Error('Only project owner can add members');
    }

    // Check if already a member
    const isMember = project.members.some(
      member => member.user.toString() === memberUserId.toString()
    );

    if (isMember) {
      throw new Error('User is already a member of this project');
    }

    project.members.push({
      user: memberUserId,
      role: 'member'
    });

    project.lastActivity = new Date();

    await project.save();

    // Notify the new member
    const owner = await User.findById(userId);
    await Notification.create({
      recipient: memberUserId,
      sender: userId,
      type: 'project_invite',
      message: `${owner.username} added you to the project ${project.title}`,
      relatedProject: projectId
    });

    return project;
  }

  async removeMember(projectId, userId, memberUserId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is owner
    if (project.owner.toString() !== userId.toString()) {
      throw new Error('Only project owner can remove members');
    }

    // Cannot remove owner
    if (project.owner.toString() === memberUserId.toString()) {
      throw new Error('Cannot remove project owner');
    }

    project.members = project.members.filter(
      member => member.user.toString() !== memberUserId.toString()
    );

    project.lastActivity = new Date();

    await project.save();

    return project;
  }

  async getProjectCheckins(projectId) {
    const checkins = await CheckIn.find({ project: projectId })
      .populate('user', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });

    return checkins;
  }

  async searchProjects(query) {
    const projects = await Project.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { hashtags: { $regex: query, $options: 'i' } },
        { projectType: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('owner', 'username firstName lastName profileImage')
      .sort({ lastActivity: -1 })
      .limit(20);

    return projects;
  }

  async getUserProjects(userId) {
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
      .populate('owner', 'username firstName lastName profileImage')
      .sort({ lastActivity: -1 });

    return projects;
  }

  async deleteFile(projectId, userId, fileId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is owner or admin
    const member = project.members.find(m => m.user.toString() === userId.toString());
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Only project owner or admin can delete files');
    }

    // Remove file from array
    project.files = project.files.filter(f => f._id.toString() !== fileId);
    await project.save();

    return project;
  }
}

export default new ProjectService();
