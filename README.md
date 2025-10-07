# IMY 220 - Version Control Software (SyncSphere)

## Content
- [x] [Demo 0](#deliverable-0)
- [x] [Demo 1](#deliverable-1)
- [x] [Demo 2](#deliverable-2)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```sh
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

For MongoDB Atlas, use your connection string. For local MongoDB:
```
MONGO_URI=mongodb://localhost:27017/syncsphere
```

3. Start development:
```sh
npm start
```

This will run both frontend (port 3000) and backend (port 5000).

Or run separately:
```sh
npm run start:backend  # Backend only
npm run start:frontend # Frontend only
```

4. Build for production:
```sh
npm run build
```

## Deliverable 0

[Wireframes](https://drive.google.com/file/d/1M_SR3mZfTFXrnkJ0yfXA4bXSXHs33IDx/view?usp=sharing)

## Deliverable 1

- Docker commands
```sh
docker build -t u23629810 .
docker run --name u23629810 -p 5000:5000 u23629810
```

## Deliverable 2

### MongoDB Connection String
The application uses MongoDB for data persistence. The connection string should be provided in the `.env` file or as an environment variable.

For testing, a default connection to `mongodb://localhost:27017/syncsphere` is used if no `MONGO_URI` is provided.

### API Endpoints

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

#### Users
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `GET /api/users/search?q=query` - Search users (protected)

#### Friends
- `POST /api/users/friends/request` - Send friend request (protected)
- `PUT /api/users/friends/accept/:requestId` - Accept friend request (protected)
- `PUT /api/users/friends/reject/:requestId` - Reject friend request (protected)
- `DELETE /api/users/friends/:friendId` - Unfriend user (protected)
- `GET /api/users/friends` - Get user's friends (protected)
- `GET /api/users/friends/requests` - Get pending friend requests (protected)

#### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get project by ID (public)
- `POST /api/projects` - Create new project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `GET /api/projects/search?q=query` - Search projects (public)
- `POST /api/projects/:id/checkout` - Checkout project (protected)
- `POST /api/projects/:id/checkin` - Checkin project with changes (protected)
- `GET /api/projects/:id/checkins` - Get project checkins (public)

#### Activity Feed
- `GET /api/activity/global` - Get global activity feed (public)
- `GET /api/activity/local` - Get local activity feed (friends only) (protected)
- `GET /api/activity/user/:userId` - Get user's activity (public)
- `GET /api/activity/search?q=query` - Search activity (public)

#### Notifications
- `GET /api/notifications` - Get user notifications (protected)
- `GET /api/notifications/unread-count` - Get unread count (protected)
- `PUT /api/notifications/:id/read` - Mark as read (protected)
- `PUT /api/notifications/read-all` - Mark all as read (protected)
- `DELETE /api/notifications/:id` - Delete notification (protected)
