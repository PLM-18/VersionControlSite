import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import ProjectType from '../models/ProjectType.js';
import VerificationRequest from '../models/VerificationRequest.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


router.get('/activities', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find()
      .populate('user', 'username email profileImage')
      .populate('project', 'title')
      .populate('targetUser', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments();

    res.json({
      activities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalActivities: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.put('/activities/:id', protect, admin, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const { type, data, isGlobal } = req.body;

    if (type) activity.type = type;
    if (data !== undefined) activity.data = data;
    if (isGlobal !== undefined) activity.isGlobal = isGlobal;

    await activity.save();

    res.json({ message: 'Activity updated successfully', activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.delete('/activities/:id', protect, admin, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activity.deleteOne();

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.get('/projects', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const projects = await Project.find()
      .populate('owner', 'username email profileImage')
      .populate('checkedOutBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments();

    res.json({
      projects,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProjects: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.put('/projects/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const allowedFields = [
      'title', 'description', 'projectType', 'hashtags', 'repositoryUrl',
      'technologies', 'isPublic', 'status', 'tags'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    project.lastActivity = Date.now();
    await project.save();

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.delete('/projects/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.projectImage) {
      const imagePath = path.join(__dirname, '..', project.projectImage);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting project image:', err);
      }
    }

    for (const file of project.files) {
      if (file.path) {
        const filePath = path.join(__dirname, '..', file.path);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    await User.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );

    await Activity.deleteMany({ project: project._id });

    await project.deleteOne();

    res.json({ message: 'Project and associated files deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.get('/users', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .populate('projects', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = [
      'username', 'email', 'firstName', 'lastName', 'bio', 'location',
      'website', 'skills', 'isAdmin', 'isVerified'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    if (user.profileImage) {
      const imagePath = path.join(__dirname, '..', user.profileImage);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting profile image:', err);
      }
    }

    const userProjects = await Project.find({ owner: user._id });
    for (const project of userProjects) {
      if (project.projectImage) {
        const imagePath = path.join(__dirname, '..', project.projectImage);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error('Error deleting project image:', err);
        }
      }

      for (const file of project.files) {
        if (file.path) {
          const filePath = path.join(__dirname, '..', file.path);
          try {
            await fs.unlink(filePath);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        }
      }
    }

    await Project.deleteMany({ owner: user._id });

    await Activity.deleteMany({ user: user._id });

    await User.updateMany(
      { friends: user._id },
      { $pull: { friends: user._id } }
    );

    await VerificationRequest.deleteOne({ user: user._id });

    await user.deleteOne();

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.get('/project-types', protect, admin, async (req, res) => {
  try {
    const projectTypes = await ProjectType.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({ projectTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.post('/project-types', protect, admin, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project type name is required' });
    }

    const existingType = await ProjectType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: 'Project type already exists' });
    }

    const projectType = await ProjectType.create({
      name,
      description,
      icon,
      color,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Project type created successfully',
      projectType
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.put('/project-types/:id', protect, admin, async (req, res) => {
  try {
    const projectType = await ProjectType.findById(req.params.id);

    if (!projectType) {
      return res.status(404).json({ message: 'Project type not found' });
    }

    const { name, description, icon, color, isActive } = req.body;

    if (name) projectType.name = name;
    if (description !== undefined) projectType.description = description;
    if (icon !== undefined) projectType.icon = icon;
    if (color) projectType.color = color;
    if (isActive !== undefined) projectType.isActive = isActive;

    await projectType.save();

    res.json({ message: 'Project type updated successfully', projectType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.delete('/project-types/:id', protect, admin, async (req, res) => {
  try {
    const projectType = await ProjectType.findById(req.params.id);

    if (!projectType) {
      return res.status(404).json({ message: 'Project type not found' });
    }

    await projectType.deleteOne();

    res.json({ message: 'Project type deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.get('/verification-requests', protect, admin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';

    const query = status === 'all' ? {} : { status };

    const requests = await VerificationRequest.find(query)
      .populate({
        path: 'user',
        select: 'username email profileImage createdAt projects',
        populate: { path: 'projects', select: 'title' }
      })
      .populate('reviewedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.post('/verification-requests/:id/approve', protect, admin, async (req, res) => {
  try {
    const verificationRequest = await VerificationRequest.findById(req.params.id)
      .populate('user');

    if (!verificationRequest) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    if (verificationRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    const { adminResponse } = req.body;

    verificationRequest.status = 'approved';
    verificationRequest.adminResponse = adminResponse || 'Verification approved';
    verificationRequest.reviewedBy = req.user._id;
    verificationRequest.reviewedAt = Date.now();
    await verificationRequest.save();

    const user = await User.findById(verificationRequest.user._id);
    user.isVerified = true;
    user.verificationRequestStatus = 'approved';
    user.verifiedAt = Date.now();
    await user.save();

    res.json({
      message: 'Verification request approved successfully',
      verificationRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.post('/verification-requests/:id/reject', protect, admin, async (req, res) => {
  try {
    const verificationRequest = await VerificationRequest.findById(req.params.id)
      .populate('user');

    if (!verificationRequest) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    if (verificationRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    const { adminResponse } = req.body;

    verificationRequest.status = 'rejected';
    verificationRequest.adminResponse = adminResponse || 'Verification rejected';
    verificationRequest.reviewedBy = req.user._id;
    verificationRequest.reviewedAt = Date.now();
    await verificationRequest.save();

    const user = await User.findById(verificationRequest.user._id);
    user.verificationRequestStatus = 'rejected';
    await user.save();

    res.json({
      message: 'Verification request rejected successfully',
      verificationRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
