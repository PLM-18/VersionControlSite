import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|js|py|html|css|txt|md|json|xml/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('text/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const JWT_SECRET = 'your-secret-key-change-in-production';

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const FRIENDS_FILE = path.join(DATA_DIR, 'friends.json');
const DISCUSSIONS_FILE = path.join(DATA_DIR, 'discussions.json');
const PROJECT_TYPES_FILE = path.join(DATA_DIR, 'project_types.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readJSONFile = (filePath, defaultData = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultData;
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
};

// Initialize data files with default data
const initializeData = () => {
  // Users
  const users = readJSONFile(USERS_FILE, []);
  writeJSONFile(USERS_FILE, users);

  // Projects
  const projects = readJSONFile(PROJECTS_FILE, []);
  writeJSONFile(PROJECTS_FILE, projects);

  // Activity
  const activity = readJSONFile(ACTIVITY_FILE, []);
  writeJSONFile(ACTIVITY_FILE, activity);

  // Friends/Connections
  const friends = readJSONFile(FRIENDS_FILE, []);
  writeJSONFile(FRIENDS_FILE, friends);

  // Discussions
  const discussions = readJSONFile(DISCUSSIONS_FILE, []);
  writeJSONFile(DISCUSSIONS_FILE, discussions);

  // Project Types
  const projectTypes = readJSONFile(PROJECT_TYPES_FILE, [
    'Web Application',
    'Mobile Application',
    'Desktop Application',
    'Library',
    'Framework',
    'API',
    'Game',
    'Tool'
  ]);
  writeJSONFile(PROJECT_TYPES_FILE, projectTypes);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Utility functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const addActivity = (type, userId, projectId, message, data = {}) => {
  const activities = readJSONFile(ACTIVITY_FILE, []);
  const newActivity = {
    id: generateId(),
    type,
    userId,
    projectId,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);
  writeJSONFile(ACTIVITY_FILE, activities);
  return newActivity;
};

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Initialize data
initializeData();

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const users = readJSONFile(USERS_FILE, []);
    
    // Check if user exists
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: generateId(),
      username,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      profileImage: null,
      bio: '',
      location: '',
      website: '',
      birthday: '',
      isAdmin: false,
      isVerified: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    users.push(newUser);
    writeJSONFile(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ 
      message: 'Registration successful', 
      user: userWithoutPassword, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const users = readJSONFile(USERS_FILE, []);
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date().toISOString();
    writeJSONFile(USERS_FILE, users);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Login successful', 
      user: userWithoutPassword, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// USER ROUTES
app.get('/api/users/me', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/me', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const users = readJSONFile(USERS_FILE, []);
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = req.body;
    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    // Hash new password if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    writeJSONFile(USERS_FILE, users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if users are friends to determine what info to show
  const friends = readJSONFile(FRIENDS_FILE, []);
  const friendship = friends.find(f => 
    (f.senderId === req.user.id && f.receiverId === user.id && f.status === 'accepted') ||
    (f.receiverId === req.user.id && f.senderId === user.id && f.status === 'accepted')
  );

  let userToReturn;
  if (friendship || req.user.id === user.id) {
    const { password: _, ...userWithoutPassword } = user;
    userToReturn = userWithoutPassword;
  } else {
    userToReturn = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage
    };
  }

  res.json(userToReturn);
});

app.delete('/api/users/me', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const projects = readJSONFile(PROJECTS_FILE, []);
  
  // Remove user
  const updatedUsers = users.filter(u => u.id !== req.user.id);
  writeJSONFile(USERS_FILE, updatedUsers);
  
  // Remove user's projects
  const updatedProjects = projects.filter(p => p.ownerId !== req.user.id);
  writeJSONFile(PROJECTS_FILE, updatedProjects);
  
  // Add activity for deleted projects
  projects.filter(p => p.ownerId === req.user.id).forEach(project => {
    addActivity('project_deleted', req.user.id, project.id, `Project "${project.name}" was deleted`);
  });

  res.json({ message: 'Account deleted successfully' });
});

// FRIEND ROUTES
app.post('/api/friends/request', authenticateToken, (req, res) => {
  const { receiverId } = req.body;
  const friends = readJSONFile(FRIENDS_FILE, []);
  
  // Check if request already exists
  const existingRequest = friends.find(f => 
    (f.senderId === req.user.id && f.receiverId === receiverId) ||
    (f.senderId === receiverId && f.receiverId === req.user.id)
  );
  
  if (existingRequest) {
    return res.status(400).json({ message: 'Friend request already exists or users are already friends' });
  }

  const friendRequest = {
    id: generateId(),
    senderId: req.user.id,
    receiverId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  friends.push(friendRequest);
  writeJSONFile(FRIENDS_FILE, friends);

  res.json({ message: 'Friend request sent', request: friendRequest });
});

app.put('/api/friends/request/:id', authenticateToken, (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const friends = readJSONFile(FRIENDS_FILE, []);
  
  const requestIndex = friends.findIndex(f => f.id === req.params.id && f.receiverId === req.user.id);
  
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Friend request not found' });
  }

  friends[requestIndex].status = status;
  friends[requestIndex].updatedAt = new Date().toISOString();
  
  writeJSONFile(FRIENDS_FILE, friends);

  res.json({ message: `Friend request ${status}`, request: friends[requestIndex] });
});

app.get('/api/friends', authenticateToken, (req, res) => {
  const friends = readJSONFile(FRIENDS_FILE, []);
  const users = readJSONFile(USERS_FILE, []);
  
  const userFriends = friends
    .filter(f => 
      (f.senderId === req.user.id || f.receiverId === req.user.id) && 
      f.status === 'accepted'
    )
    .map(f => {
      const friendId = f.senderId === req.user.id ? f.receiverId : f.senderId;
      const friend = users.find(u => u.id === friendId);
      if (friend) {
        const { password: _, ...friendWithoutPassword } = friend;
        return friendWithoutPassword;
      }
      return null;
    })
    .filter(Boolean);

  res.json(userFriends);
});

app.delete('/api/friends/:friendId', authenticateToken, (req, res) => {
  const friends = readJSONFile(FRIENDS_FILE, []);
  
  const updatedFriends = friends.filter(f => 
    !((f.senderId === req.user.id && f.receiverId === req.params.friendId) ||
      (f.senderId === req.params.friendId && f.receiverId === req.user.id))
  );
  
  writeJSONFile(FRIENDS_FILE, updatedFriends);

  res.json({ message: 'Friend removed successfully' });
});

// PROJECT ROUTES
app.post('/api/projects', authenticateToken, upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'files', maxCount: 50 }
]), (req, res) => {
  try {
    const { name, description, hashtags, type, version = '1.0.0' } = req.body;
    
    const projects = readJSONFile(PROJECTS_FILE, []);
    
    const newProject = {
      id: generateId(),
      name,
      description,
      ownerId: req.user.id,
      members: [req.user.id],
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      type,
      version,
      status: 'checked_in',
      checkedOutBy: null,
      image: req.files?.projectImage ? `/uploads/${req.files.projectImage[0].filename}` : null,
      files: req.files?.files ? req.files.files.map(file => ({
        id: generateId(),
        name: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size,
        uploadedAt: new Date().toISOString()
      })) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);
    writeJSONFile(PROJECTS_FILE, projects);

    addActivity('project_created', req.user.id, newProject.id, `Created project "${name}"`);

    res.json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/projects', (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const users = readJSONFile(USERS_FILE, []);
  
  const projectsWithOwners = projects.map(project => {
    const owner = users.find(u => u.id === project.ownerId);
    return {
      ...project,
      owner: owner ? { id: owner.id, username: owner.username } : null
    };
  });

  res.json(projectsWithOwners);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const project = projects.find(p => p.id === req.params.id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const users = readJSONFile(USERS_FILE, []);
  const owner = users.find(u => u.id === project.ownerId);
  const members = users.filter(u => project.members.includes(u.id)).map(u => ({
    id: u.id,
    username: u.username,
    profileImage: u.profileImage
  }));

  res.json({
    ...project,
    owner: owner ? { id: owner.id, username: owner.username } : null,
    memberDetails: members
  });
});

app.put('/api/projects/:id', authenticateToken, upload.single('projectImage'), (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user is owner
  if (project.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Only project owner can edit project details' });
  }

  const updates = req.body;
  if (req.file) {
    updates.image = `/uploads/${req.file.filename}`;
  }

  projects[projectIndex] = { 
    ...project, 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  
  writeJSONFile(PROJECTS_FILE, projects);

  addActivity('project_updated', req.user.id, project.id, `Updated project "${project.name}"`);

  res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user is owner or admin
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (project.ownerId !== req.user.id && !user?.isAdmin) {
    return res.status(403).json({ message: 'Only project owner or admin can delete project' });
  }

  projects.splice(projectIndex, 1);
  writeJSONFile(PROJECTS_FILE, projects);

  addActivity('project_deleted', req.user.id, project.id, `Deleted project "${project.name}"`);

  res.json({ message: 'Project deleted successfully' });
});

// PROJECT MEMBER ROUTES
app.post('/api/projects/:id/members', authenticateToken, (req, res) => {
  const { memberId } = req.body;
  const projects = readJSONFile(PROJECTS_FILE, []);
  const friends = readJSONFile(FRIENDS_FILE, []);
  
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user is member of project
  if (!project.members.includes(req.user.id)) {
    return res.status(403).json({ message: 'Only project members can add new members' });
  }

  // Check if adding user is friend
  const isFriend = friends.some(f => 
    ((f.senderId === req.user.id && f.receiverId === memberId) ||
     (f.senderId === memberId && f.receiverId === req.user.id)) &&
    f.status === 'accepted'
  );

  if (!isFriend) {
    return res.status(403).json({ message: 'Can only add friends as project members' });
  }

  if (!project.members.includes(memberId)) {
    projects[projectIndex].members.push(memberId);
    writeJSONFile(PROJECTS_FILE, projects);

    const users = readJSONFile(USERS_FILE, []);
    const addedUser = users.find(u => u.id === memberId);
    
    addActivity('member_added', req.user.id, project.id, 
      `Added ${addedUser?.username} as project member`);
  }

  res.json({ message: 'Member added successfully' });
});

app.delete('/api/projects/:id/members/:memberId', authenticateToken, (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user is owner
  if (project.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Only project owner can remove members' });
  }

  projects[projectIndex].members = project.members.filter(id => id !== req.params.memberId);
  writeJSONFile(PROJECTS_FILE, projects);

  const users = readJSONFile(USERS_FILE, []);
  const removedUser = users.find(u => u.id === req.params.memberId);
  
  addActivity('member_removed', req.user.id, project.id, 
    `Removed ${removedUser?.username} from project`);

  res.json({ message: 'Member removed successfully' });
});

// CHECK-IN/CHECK-OUT ROUTES
app.post('/api/projects/:id/checkout', authenticateToken, (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user is member
  if (!project.members.includes(req.user.id)) {
    return res.status(403).json({ message: 'Only project members can check out' });
  }

  // Check if already checked out
  if (project.status === 'checked_out') {
    return res.status(400).json({ message: 'Project is already checked out' });
  }

  projects[projectIndex].status = 'checked_out';
  projects[projectIndex].checkedOutBy = req.user.id;
  projects[projectIndex].checkedOutAt = new Date().toISOString();
  
  writeJSONFile(PROJECTS_FILE, projects);

  addActivity('checkout', req.user.id, project.id, `Checked out project "${project.name}"`);

  res.json({ message: 'Project checked out successfully', project: projects[projectIndex] });
});

app.post('/api/projects/:id/checkin', authenticateToken, upload.array('files', 50), (req, res) => {
  const { message, version } = req.body;
  const projects = readJSONFile(PROJECTS_FILE, []);
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user checked it out
  if (project.checkedOutBy !== req.user.id) {
    return res.status(403).json({ message: 'Only the user who checked out can check in' });
  }

  // Add new files if any
  const newFiles = req.files ? req.files.map(file => ({
    id: generateId(),
    name: file.originalname,
    path: `/uploads/${file.filename}`,
    size: file.size,
    uploadedAt: new Date().toISOString()
  })) : [];

  projects[projectIndex].status = 'checked_in';
  projects[projectIndex].checkedOutBy = null;
  projects[projectIndex].checkedOutAt = null;
  projects[projectIndex].files = [...project.files, ...newFiles];
  projects[projectIndex].version = version || project.version;
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  writeJSONFile(PROJECTS_FILE, projects);

  addActivity('checkin', req.user.id, project.id, message || `Checked in project "${project.name}"`);

  res.json({ message: 'Project checked in successfully', project: projects[projectIndex] });
});

// ACTIVITY ROUTES
app.get('/api/activity', authenticateToken, (req, res) => {
  const { type = 'local' } = req.query; // 'local' or 'global'
  const activities = readJSONFile(ACTIVITY_FILE, []);
  const users = readJSONFile(USERS_FILE, []);
  const projects = readJSONFile(PROJECTS_FILE, []);
  
  let filteredActivities = activities;
  
  if (type === 'local') {
    // Get user's friends
    const friends = readJSONFile(FRIENDS_FILE, []);
    const friendIds = friends
      .filter(f => 
        (f.senderId === req.user.id || f.receiverId === req.user.id) && 
        f.status === 'accepted'
      )
      .map(f => f.senderId === req.user.id ? f.receiverId : f.senderId);
    
    // Include user's own activity and friends' activity
    const relevantUserIds = [req.user.id, ...friendIds];
    filteredActivities = activities.filter(a => relevantUserIds.includes(a.userId));
  }

  // Enrich activities with user and project data
  const enrichedActivities = filteredActivities.map(activity => {
    const user = users.find(u => u.id === activity.userId);
    const project = projects.find(p => p.id === activity.projectId);
    
    return {
      ...activity,
      user: user ? { 
        id: user.id, 
        username: user.username, 
        profileImage: user.profileImage 
      } : null,
      project: project ? { 
        id: project.id, 
        name: project.name, 
        image: project.image 
      } : null
    };
  });

  res.json(enrichedActivities);
});

// SEARCH ROUTES
app.get('/api/search', (req, res) => {
  const { q, type = 'all' } = req.query;
  
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const query = q.toLowerCase();
  let results = [];

  if (type === 'all' || type === 'users') {
    const users = readJSONFile(USERS_FILE, []);
    const userResults = users
      .filter(u => 
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
      )
      .map(u => ({
        type: 'user',
        id: u.id,
        title: u.username,
        subtitle: `${u.firstName} ${u.lastName}`,
        image: u.profileImage,
        data: { id: u.id, username: u.username, profileImage: u.profileImage }
      }));
    
    results.push(...userResults);
  }

  if (type === 'all' || type === 'projects') {
    const projects = readJSONFile(PROJECTS_FILE, []);
    const projectResults = projects
      .filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.hashtags.some(tag => tag.toLowerCase().includes(query)) ||
        p.type.toLowerCase().includes(query)
      )
      .map(p => ({
        type: 'project',
        id: p.id,
        title: p.name,
        subtitle: p.description,
        image: p.image,
        data: p
      }));
    
    results.push(...projectResults);
  }

  if (type === 'all' || type === 'activity') {
    const activities = readJSONFile(ACTIVITY_FILE, []);
    const activityResults = activities
      .filter(a => a.message.toLowerCase().includes(query))
      .map(a => ({
        type: 'activity',
        id: a.id,
        title: a.message,
        subtitle: a.type,
        image: null,
        data: a
      }));
    
    results.push(...activityResults);
  }

  res.json(results.slice(0, 50)); // Limit to 50 results
});

// DISCUSSION ROUTES
app.get('/api/projects/:id/discussions', (req, res) => {
  const discussions = readJSONFile(DISCUSSIONS_FILE, []);
  const users = readJSONFile(USERS_FILE, []);
  
  const projectDiscussions = discussions
    .filter(d => d.projectId === req.params.id)
    .map(d => {
      const user = users.find(u => u.id === d.userId);
      return {
        ...d,
        user: user ? { id: user.id, username: user.username, profileImage: user.profileImage } : null
      };
    });

  res.json(projectDiscussions);
});

app.post('/api/projects/:id/discussions', authenticateToken, (req, res) => {
  const { message } = req.body;
  const projects = readJSONFile(PROJECTS_FILE, []);
  
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Check if user is member
  if (!project.members.includes(req.user.id)) {
    return res.status(403).json({ message: 'Only project members can post discussions' });
  }

  const discussions = readJSONFile(DISCUSSIONS_FILE, []);
  
  const newDiscussion = {
    id: generateId(),
    projectId: req.params.id,
    userId: req.user.id,
    message,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  discussions.push(newDiscussion);
  writeJSONFile(DISCUSSIONS_FILE, discussions);

  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  res.json({
    ...newDiscussion,
    user: { id: user.id, username: user.username, profileImage: user.profileImage }
  });
});

app.put('/api/discussions/:id', authenticateToken, (req, res) => {
  const { message } = req.body;
  const discussions = readJSONFile(DISCUSSIONS_FILE, []);
  
  const discussionIndex = discussions.findIndex(d => d.id === req.params.id);
  if (discussionIndex === -1) {
    return res.status(404).json({ message: 'Discussion not found' });
  }

  const discussion = discussions[discussionIndex];
  
  // Check if user owns this discussion or is admin
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (discussion.userId !== req.user.id && !user?.isAdmin) {
    return res.status(403).json({ message: 'Can only edit your own discussions' });
  }

  discussions[discussionIndex].message = message;
  discussions[discussionIndex].updatedAt = new Date().toISOString();
  
  writeJSONFile(DISCUSSIONS_FILE, discussions);

  res.json(discussions[discussionIndex]);
});

app.delete('/api/discussions/:id', authenticateToken, (req, res) => {
  const discussions = readJSONFile(DISCUSSIONS_FILE, []);
  
  const discussionIndex = discussions.findIndex(d => d.id === req.params.id);
  if (discussionIndex === -1) {
    return res.status(404).json({ message: 'Discussion not found' });
  }

  const discussion = discussions[discussionIndex];
  
  // Check if user owns this discussion or is admin
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (discussion.userId !== req.user.id && !user?.isAdmin) {
    return res.status(403).json({ message: 'Can only delete your own discussions' });
  }

  discussions.splice(discussionIndex, 1);
  writeJSONFile(DISCUSSIONS_FILE, discussions);

  res.json({ message: 'Discussion deleted successfully' });
});

// PROJECT TYPES ROUTES
app.get('/api/project-types', (req, res) => {
  const projectTypes = readJSONFile(PROJECT_TYPES_FILE, []);
  res.json(projectTypes);
});

app.post('/api/project-types', authenticateToken, (req, res) => {
  const { type } = req.body;
  
  // Check if user is admin
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Only admins can add project types' });
  }

  const projectTypes = readJSONFile(PROJECT_TYPES_FILE, []);
  
  if (!projectTypes.includes(type)) {
    projectTypes.push(type);
    writeJSONFile(PROJECT_TYPES_FILE, projectTypes);
  }

  res.json({ message: 'Project type added successfully', types: projectTypes });
});

// ADMIN ROUTES
app.get('/api/admin/users', authenticateToken, (req, res) => {
  // Check if user is admin
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const usersWithoutPasswords = users.map(u => {
    const { password: _, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });

  res.json(usersWithoutPasswords);
});

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  // Check if user is admin
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  writeJSONFile(USERS_FILE, users);

  // Remove user's projects
  const projects = readJSONFile(PROJECTS_FILE, []);
  const updatedProjects = projects.filter(p => p.ownerId !== req.params.id);
  writeJSONFile(PROJECTS_FILE, updatedProjects);

  res.json({ message: 'User deleted successfully' });
});

app.get('/api/admin/projects', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const projects = readJSONFile(PROJECTS_FILE, []);
  const projectsWithOwners = projects.map(project => {
    const owner = users.find(u => u.id === project.ownerId);
    return {
      ...project,
      owner: owner ? { id: owner.id, username: owner.username } : null
    };
  });

  res.json(projectsWithOwners);
});

app.get('/api/admin/activity', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const activities = readJSONFile(ACTIVITY_FILE, []);
  const projects = readJSONFile(PROJECTS_FILE, []);
  
  const enrichedActivities = activities.map(activity => {
    const activityUser = users.find(u => u.id === activity.userId);
    const project = projects.find(p => p.id === activity.projectId);
    
    return {
      ...activity,
      user: activityUser ? { 
        id: activityUser.id, 
        username: activityUser.username 
      } : null,
      project: project ? { 
        id: project.id, 
        name: project.name 
      } : null
    };
  });

  res.json(enrichedActivities);
});

app.delete('/api/admin/activity/:id', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const user = users.find(u => u.id === req.user.id);
  
  if (!user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const activities = readJSONFile(ACTIVITY_FILE, []);
  const updatedActivities = activities.filter(a => a.id !== req.params.id);
  writeJSONFile(ACTIVITY_FILE, updatedActivities);

  res.json({ message: 'Activity deleted successfully' });
});

app.get('/api/projects/:id/download', (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const project = projects.find(p => p.id === req.params.id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // For demo purposes, return file list - in production would create zip
  res.json({
    projectName: project.name,
    files: project.files,
    downloadUrl: `/api/projects/${req.params.id}/files`
  });
});

app.get('/api/projects/:id/files', (req, res) => {
  const projects = readJSONFile(PROJECTS_FILE, []);
  const project = projects.find(p => p.id === req.params.id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project.files);
});

app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

app.get('/api/stats', authenticateToken, (req, res) => {
  const users = readJSONFile(USERS_FILE, []);
  const projects = readJSONFile(PROJECTS_FILE, []);
  const activities = readJSONFile(ACTIVITY_FILE, []);
  const friends = readJSONFile(FRIENDS_FILE, []);

  const stats = {
    totalUsers: users.length,
    totalProjects: projects.length,
    totalActivities: activities.length,
    totalConnections: friends.filter(f => f.status === 'accepted').length,
    userProjects: projects.filter(p => p.members.includes(req.user.id)).length,
    checkedOutProjects: projects.filter(p => p.checkedOutBy === req.user.id).length,
    recentActivity: activities
      .filter(a => a.userId === req.user.id)
      .slice(0, 5),
    projectsByType: projects.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {}),
    popularLanguages: projects
      .flatMap(p => p.hashtags)
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {})
  };

  res.json(stats);
});

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
});


app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});