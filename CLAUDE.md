# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncSphere (Version Control Software) - A collaborative project management platform built with React frontend and Express backend. This is an IMY 220 university project focused on version control and collaboration features.

## Development Commands

### Local Development
```bash
npm start                    # Run both frontend and backend concurrently
npm run start:frontend       # Run webpack dev server on port 3000
npm run start:backend        # Run Express backend on port 5000
npm run build               # Build production bundle to frontend/public/
```

### Docker Development
```bash
docker build -t u23629810 .
docker run --name u23629810 -p 5000:5000 u23629810
```

Note: Docker runs both frontend build and backend server. The backend serves the built frontend from `frontend/public/`.

## Architecture

### Monorepo Structure
- **Root**: Shared build configuration (webpack, tailwind, babel)
- **frontend/**: React application (SPA with React Router)
- **backend/**: Express REST API with file-based JSON storage

### Backend Architecture

The backend follows an MVC-inspired pattern but currently consolidates logic in `backend/server.js` (1147 lines). The codebase is transitioning to a modular structure with the following directories being added:

- `backend/models/`: Mongoose schemas (User, Project, Discussion, Activity)
- `backend/controllers/`: Business logic handlers
- `backend/routes/`: Route definitions
- `backend/middleware/`: Auth middleware (`protect` function)
- `backend/config/`: Database configuration
- `backend/utils/`: Helper functions (e.g., `generateToken.js`)
- `backend/validators/`: Input validation logic
- `backend/services/`: Business logic services
- `backend/data/`: JSON data files (users.json, projects.json, discussions.json, activity.json, friends.json, project_types.json)

**Important**: `server.js` currently contains most route handlers directly. When modifying API endpoints, check `server.js` first before the modular structure. The codebase appears to be mid-migration from monolithic to modular architecture.

### Data Storage

Currently uses file-based JSON storage in `backend/data/`. However, Mongoose models suggest planned MongoDB migration. Environment variable `MONGO_URI` is referenced in `config/db.js` but may not be active yet.

### Authentication

- JWT-based authentication
- Token stored in localStorage on frontend
- `authenticateToken` middleware verifies JWT on protected routes
- JWT_SECRET: Configured in server.js (change in production)

### API Structure

All API routes are prefixed with `/api/`:

**User routes**: `/api/register`, `/api/login`, `/api/users/me`, `/api/users/:id`
**Friend routes**: `/api/friends/request`, `/api/friends`, `/api/friends/:friendId`
**Project routes**: `/api/projects`, `/api/projects/:id`, `/api/projects/:id/members`
**Activity routes**: `/api/activity`, `/api/activity/:id`
**Discussion routes**: `/api/discussions`, `/api/discussions/:id`, `/api/discussions/:id/comments`
**Notifications routes**: `/api/notifications`
**Project types**: `/api/project-types`

### Frontend Architecture

- **React 19** with React Router v7
- **Styling**: TailwindCSS with custom theme (dark mode colors, animations)
- **Entry point**: `frontend/src/index.js`
- **Main app**: `frontend/src/App.js` (routing configuration)
- **Pages**: HomePage, LandingPage, SignInPage, SignUpPage, ProfilePage, ProjectsPage, ProjectDetailsPage, NotificationsPage, UsernameSetupPage
- **Components**: Modular components (Sidebar, SearchBar, ProjectCard, ActivityFeed, etc.)

### File Upload Handling

Multer configured for:
- Profile images: Stored in `backend/uploads/`
- Project files: 5MB limit, allowed types: images, code files (js, py, html, css, txt, md, json, xml)
- Served via `/uploads` static route

### Webpack Configuration

- **Dev server**: Port 3000 with proxy to backend (port 5000)
- **Build output**: `frontend/public/bundle.js`
- **Loaders**: babel-loader (JSX), file-loader (images), css-loader + postcss-loader (Tailwind)

## Development Notes

### Port Configuration
- Frontend dev server: 3000
- Backend API: 5000 (configurable via PORT env var)
- Docker exposes: 5000

### Environment Variables
- `PORT`: Backend port (default 5000)
- `JWT_SECRET`: For token signing (currently hardcoded, should use env)
- `MONGO_URI`: MongoDB connection (referenced but may not be used yet)

### Data Persistence
The app currently uses JSON files in `backend/data/` for persistence. No database setup required for local development.

### Admin Features
Some routes check `user.isAdmin` flag for administrative actions (e.g., adding project types, certain deletions).

### Testing
No test suite currently configured. `npm test` returns error.
