import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      // Update last active time
      if (req.user) {
        req.user.lastActive = Date.now();
        await req.user.save();
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const projectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isMember || project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to access this project' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const projectAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAdmin = project.members.some(
      member => 
        member.user.toString() === req.user._id.toString() && 
        member.role === 'admin'
    );

    if (isAdmin || project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as project admin' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
