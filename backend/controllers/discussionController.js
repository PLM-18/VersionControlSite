import asyncHandler from 'express-async-handler';
import Discussion from '../models/Discussion.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

export const createDiscussion = asyncHandler(async (req, res) => {
  const { projectId, title, content, tags } = req.body;

  const project = await Project.findById(projectId);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = project.members.some(
    member => member.user.toString() === req.user._id.toString()
  );
  const isOwner = project.owner.toString() === req.user._id.toString();

  if (!isOwner && !isMember) {
    res.status(403);
    throw new Error('Not authorized to create discussions in this project');
  }

  const discussion = new Discussion({
    project: projectId,
    title,
    content,
    author: req.user._id,
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim())
  });

  const createdDiscussion = await discussion.save();
  
  project.lastActivity = Date.now();
  await project.save();

  await Activity.create({
    user: req.user._id,
    project: project._id,
    type: 'discussion_created',
    data: {
      discussionId: createdDiscussion._id,
      discussionTitle: createdDiscussion.title
    },
    isGlobal: true
  });

  await createdDiscussion.populate('author', 'username profileImage');

  res.status(201).json(createdDiscussion);
});

export const getDiscussions = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt', tag } = req.query;
  const skip = (page - 1) * limit;

  const project = await Project.findById(projectId);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.isPublic) {
    const isMember = project.members.some(
      member => member.user.toString() === req.user?._id?.toString()
    );

    if (project.owner.toString() !== req.user?._id?.toString() && !isMember) {
      res.status(403);
      throw new Error('Not authorized to view discussions in this project');
    }
  }

  const query = { project: projectId };
  
  if (tag) {
    query.tags = tag;
  }

  const discussions = await Discussion.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'username profileImage')
    .populate('comments.author', 'username profileImage')
    .lean();

  const total = await Discussion.countDocuments(query);

  await Discussion.updateMany(
    { _id: { $in: discussions.map(d => d._id) } },
    { $inc: { views: 1 } }
  );

  res.json({
    discussions,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    total
  });
});

export const getDiscussionById = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id)
    .populate('author', 'username profileImage')
    .populate('comments.author', 'username profileImage')
    .populate('project', 'title isPublic');

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const project = await Project.findById(discussion.project._id);
  
  if (!project.isPublic) {
    const isMember = project.members.some(
      member => member.user.toString() === req.user?._id?.toString()
    );

    if (project.owner.toString() !== req.user?._id?.toString() && !isMember) {
      res.status(403);
      throw new Error('Not authorized to view this discussion');
    }
  }

  discussion.views += 1;
  await discussion.save();

  res.json(discussion);
});

export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  const discussion = await Discussion.findById(req.params.id)
    .populate('project', 'title isPublic');

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const project = await Project.findById(discussion.project._id);
  const isMember = project.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (project.owner.toString() !== req.user._id.toString() && !isMember) {
    res.status(403);
    throw new Error('Not authorized to comment on this discussion');
  }

  const mentionRegex = /@([\w-]+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    const user = await User.findOne({ username });
    if (user) {
      mentions.push(user._id);
    }
  }

  const comment = {
    content,
    author: req.user._id,
    mentions,
    reactions: []
  };

  discussion.comments.push(comment);
  discussion.updatedAt = new Date();
  
  const updatedDiscussion = await discussion.save();
  
  project.lastActivity = Date.now();
  await project.save();

  await Activity.create({
    user: req.user._id,
    project: project._id,
    type: 'discussion_comment',
    data: {
      discussionId: discussion._id,
      discussionTitle: discussion.title,
      commentId: updatedDiscussion.comments[updatedDiscussion.comments.length - 1]._id
    },
    isGlobal: false,
    targetUser: discussion.author._id.toString() !== req.user._id.toString() 
      ? discussion.author._id 
      : null
  });

  await updatedDiscussion.populate('comments.author', 'username profileImage');
  const newComment = updatedDiscussion.comments[updatedDiscussion.comments.length - 1];

  res.status(201).json(newComment);
});

export const updateDiscussion = asyncHandler(async (req, res) => {
  const { title, content, tags, isPinned, isLocked } = req.body;
  
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const project = await Project.findById(discussion.project);
  const isAdmin = project.members.some(
    member => 
      member.user.toString() === req.user._id.toString() && 
      (member.role === 'admin' || member.role === 'owner')
  );

  if (discussion.author.toString() !== req.user._id.toString() && 
      project.owner.toString() !== req.user._id.toString() && 
      !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this discussion');
  }

  if (isPinned !== undefined || isLocked !== undefined) {
    if (project.owner.toString() !== req.user._id.toString() && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to pin/lock discussions');
    }
  }

  if (title) discussion.title = title;
  if (content) discussion.content = content;
  if (tags) {
    discussion.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  }
  if (isPinned !== undefined) discussion.isPinned = isPinned;
  if (isLocked !== undefined) discussion.isLocked = isLocked;
  
  discussion.updatedAt = new Date();
  
  const updatedDiscussion = await discussion.save();
  
  project.lastActivity = Date.now();
  await project.save();

  res.json(updatedDiscussion);
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const project = await Project.findById(discussion.project);
  const isAdmin = project.members.some(
    member => 
      member.user.toString() === req.user._id.toString() && 
      (member.role === 'admin' || member.role === 'owner')
  );

  if (discussion.author.toString() !== req.user._id.toString() && 
      project.owner.toString() !== req.user._id.toString() && 
      !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this discussion');
  }

  await Discussion.findByIdAndDelete(discussion._id);

  project.lastActivity = Date.now();
  await project.save();

  res.json({ message: 'Discussion removed' });
});

export const markCommentAsSolution = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  if (discussion.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the discussion author can mark a solution');
  }

  const comment = discussion.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  discussion.comments.forEach(c => {
    c.isSolution = false;
  });

  comment.isSolution = true;
  
  discussion.isResolved = true;
  discussion.updatedAt = new Date();
  
  await discussion.save();
  
  const project = await Project.findById(discussion.project);
  project.lastActivity = Date.now();
  await project.save();

  await Activity.create({
    user: req.user._id,
    project: project._id,
    targetUser: comment.author,
    type: 'discussion_solved',
    data: {
      discussionId: discussion._id,
      discussionTitle: discussion.title,
      commentId: comment._id
    },
    isGlobal: true
  });

  res.json({ message: 'Comment marked as solution' });
});

export const addReaction = asyncHandler(async (req, res) => {
  const { reaction } = req.body;
  const { commentId } = req.params;
  
  const validReactions = ['thumbsup', 'heart', 'hooray', 'rocket', 'eyes'];
  
  if (!validReactions.includes(reaction)) {
    res.status(400);
    throw new Error('Invalid reaction');
  }

  const discussion = await Discussion.findById(req.params.id);
  
  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  const project = await Project.findById(discussion.project);
  const isMember = project.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (project.owner.toString() !== req.user._id.toString() && !isMember) {
    res.status(403);
    throw new Error('Not authorized to react to this comment');
  }

  const comment = discussion.comments.id(commentId);
  
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const existingReactionIndex = comment.reactions.findIndex(
    r => r.user.toString() === req.user._id.toString() && r.type === reaction
  );

  if (existingReactionIndex !== -1) {
    comment.reactions.splice(existingReactionIndex, 1);
  } else {
    comment.reactions.push({
      user: req.user._id,
      type: reaction
    });
  }

  await discussion.save();
  
  project.lastActivity = Date.now();
  await project.save();

  res.json(comment.reactions);
});
