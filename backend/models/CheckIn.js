import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
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
  changesDescription: {
    type: String,
    default: ''
  },
  hashtags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for search and sorting
checkInSchema.index({ project: 1, createdAt: -1 });
checkInSchema.index({ user: 1 });
checkInSchema.index({ message: 'text', hashtags: 'text' });

const CheckIn = mongoose.model('CheckIn', checkInSchema);

export default CheckIn;
