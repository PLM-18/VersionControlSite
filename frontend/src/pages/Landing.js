import React, { useState } from "react";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import FeatureCard from "../components/FeatureCard.js";

import {
  Users,
  FolderOpen,
  Share,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import syncsphereLogo from '../../public/assets/syncsphere-logo.png';

const Landing = () => {
    const [signupData, setSignupData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        console.log("Signup Data:", signupData);
    };

    return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <img 
            src={syncsphereLogo} 
            alt="SyncSphere Logo" 
            className="w-10 h-10 rounded-lg bg-white/10 p-2"
          />
          <span className="text-2xl font-bold text-primary">SyncSphere</span>
        </div>
        <Link to="/login">
          <Button variant="primary" size="sm">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            {/* Hero Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="hero-gradient">Version Control</span>
                <br />
                <span className="text-blue-400">Reimagined</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Collaborate seamlessly, track changes effortlessly, and deploy with 
                confidence. The next generation of version control built for modern 
                development teams.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <FeatureCard
                title="Collaborate and Add friends"
                icon={<Users />}
                color="red"
              />
              <FeatureCard
                title="View Other Projects"
                icon={<FolderOpen />}
                color="pink"
              />
              <FeatureCard
                title="Share and Create Projects"
                icon={<Share />}
                color="green"
              />
              <FeatureCard
                title="Update and Share Project files"
                icon={<RefreshCw />}
                color="blue"
              />
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="form-container rounded-2xl p-8 space-y-6">
                {/* Form Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Join SyncSphere
                  </h2>
                  <p className="text-muted-foreground">
                    Start collaborating with your team today
                  </p>
                </div>

                {/* Quick Signup Form */}
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full">
                    Create Account
                  </Button>
                </form>

                {/* Alternative Signup Link */}
                <div className="text-center">
                  <Link 
                    to="/signup" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    Need more options? Full signup form
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Landing;