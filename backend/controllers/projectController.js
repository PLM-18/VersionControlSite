import projectService from '../services/projectService.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.projectImage) {
        projectData.projectImage = `/uploads/${req.files.projectImage[0].filename}`;
      }

      if (req.files.files) {
        projectData.files = req.files.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/${file.filename}`,
          size: file.size
        }));
      }
    }

    // Parse hashtags if they come as string
    if (typeof projectData.hashtags === 'string') {
      projectData.hashtags = projectData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const project = await projectService.createProject(projectData, req.user._id);

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getAllProjects = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      projectType: req.query.projectType,
      hashtags: req.query.hashtags,
      owner: req.query.owner,
      limit: parseInt(req.query.limit) || 50
    };

    const projects = await projectService.getAllProjects(filters);
    res.json(projects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.projectImage = `/uploads/${req.file.filename}`;
    }

    // Parse hashtags if they come as string
    if (typeof updateData.hashtags === 'string') {
      updateData.hashtags = updateData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const project = await projectService.updateProject(
      req.params.id,
      req.user._id,
      updateData
    );

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Checkout project
// @route   POST /api/projects/:id/checkout
// @access  Private
export const checkoutProject = async (req, res) => {
  try {
    const project = await projectService.checkoutProject(req.params.id, req.user._id);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Checkin project
// @route   POST /api/projects/:id/checkin
// @access  Private
export const checkinProject = async (req, res) => {
  try {
    const checkinData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      checkinData.files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size
      }));
    }

    // Parse hashtags if they come as string
    if (typeof checkinData.hashtags === 'string') {
      checkinData.hashtags = checkinData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const checkin = await projectService.checkinProject(
      req.params.id,
      req.user._id,
      checkinData
    );

    res.status(201).json(checkin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
export const addProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await projectService.addMember(req.params.id, req.user._id, userId);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private
export const removeProjectMember = async (req, res) => {
  try {
    const project = await projectService.removeMember(
      req.params.id,
      req.user._id,
      req.params.memberId
    );
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get project checkins
// @route   GET /api/projects/:id/checkins
// @access  Public
export const getProjectCheckins = async (req, res) => {
  try {
    const checkins = await projectService.getProjectCheckins(req.params.id);
    res.json(checkins);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Public
export const searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    const projects = await projectService.searchProjects(q);
    res.json(projects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's projects
// @route   GET /api/users/:userId/projects
// @access  Private
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const projects = await projectService.getUserProjects(userId);
    res.json(projects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete file from project
// @route   DELETE /api/projects/:id/files/:fileId
// @access  Private
export const deleteFile = async (req, res) => {
  try {
    const project = await projectService.deleteFile(
      req.params.id,
      req.user._id,
      req.params.fileId
    );
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
