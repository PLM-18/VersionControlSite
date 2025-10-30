import mongoose from 'mongoose';

const projectTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
// Note: name field already has unique: true which creates an index
projectTypeSchema.index({ isActive: 1 });

const ProjectType = mongoose.model('ProjectType', projectTypeSchema);

export default ProjectType;
