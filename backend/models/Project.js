import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  projectImage: {
    type: String,
    default: ''
  },
  projectType: {
    type: String,
    default: 'Other'
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  files: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  checkedOutAt: {
    type: Date,
    default: null
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  repositoryUrl: {
    type: String,
    default: ''
  },
  technologies: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  stars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  forks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  parentProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for search and sorting
projectSchema.index({ title: 'text', description: 'text', tags: 'text', hashtags: 'text', projectType: 'text' });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ lastActivity: -1 });
projectSchema.index({ hashtags: 1 });
projectSchema.index({ projectType: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
