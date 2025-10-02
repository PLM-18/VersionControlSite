import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isSolution: {
      type: Boolean,
      default: false
    },
    reactions: [{
      type: String,
      enum: ['thumbsup', 'heart', 'hooray', 'rocket', 'eyes']
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search and sorting
discussionSchema.index({ project: 1, isPinned: -1, createdAt: -1 });
discussionSchema.index({ 'author': 1 });
discussionSchema.index({ 'tags': 1 });

// Virtual for comment count
discussionSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
