import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'project_created',
      'project_updated',
      'project_deleted',
      'project_starred',
      'project_forked',
      'commit',
      'pull_request',
      'issue',
      'comment',
      'follow',
      'join_project',
      'discussion_created',
      'discussion_comment',
      'discussion_solved'
    ]
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ isGlobal: 1, createdAt: -1 });

// Virtual for activity message
activitySchema.virtual('message').get(function() {
  const user = this.user?.username || 'Someone';
  const targetUser = this.targetUser?.username || 'someone';
  const project = this.project?.title || 'a project';
  
  const messages = {
    project_created: `${user} created project ${project}`,
    project_updated: `${user} updated project ${project}`,
    project_starred: `${user} starred project ${project}`,
    project_forked: `${user} forked project ${project}`,
    commit: `${user} pushed to ${project}`,
    pull_request: `${user} opened a pull request in ${project}`,
    issue: `${user} opened an issue in ${project}`,
    comment: `${user} commented on ${project}`,
    follow: `${user} started following ${targetUser}`,
    join_project: `${user} joined project ${project}`,
    discussion_created: `${user} started a discussion in ${project}`,
    discussion_comment: `${user} commented on a discussion in ${project}`,
    discussion_solved: `${user} marked a solution in ${project}`
  };
  
  return messages[this.type] || 'New activity';
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
