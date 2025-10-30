import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    maxlength: 500,
    default: ''
  },
  adminResponse: {
    type: String,
    maxlength: 500,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
// Note: user field already has unique: true which creates an index
verificationRequestSchema.index({ status: 1, createdAt: -1 });

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

export default VerificationRequest;
