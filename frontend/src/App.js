import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.js';
import SignUpPage from './pages/SignUpPage.js';
import SignInPage from './pages/SignInPage.js';
import UsernameSetupPage from './pages/UsernameSetupPage.js';
import HomePage from './pages/HomePage.js';
import ProjectsPage from './pages/ProjectsPage.js';
import ProfilePage from './pages/ProfilePage.js';
import ProjectDetailPage from './pages/ProjectDetailsPage.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/setup-username" element={<UsernameSetupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/create-project" element={<ProjectsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;