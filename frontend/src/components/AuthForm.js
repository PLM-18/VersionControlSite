
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button.js';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { Label } from './ui/label.js';
import { Input } from './ui/input.js';
import syncsphereLogo from '../../public/assets/syncsphere-logo.png';

function AuthForm({ type, onSubmit, className }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className={cn("min-h-screen bg-background flex flex-col", className)}>
            {/* Back to Home Button */}
            <div className="p-6">
                <Link to="/">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>

            {/* Main Form Container */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Form Card */}
                    <div className="form-container rounded-2xl p-8 space-y-6">
                        {/* Logo - only show on login page */}
                        {type === 'login' && (
                            <div className="flex justify-center mb-6">
                                <img 
                                    src={syncsphereLogo} 
                                    alt="SyncSphere Logo" 
                                    className="w-20 h-20 rounded-xl bg-white/10 p-3"
                                />
                            </div>
                        )}

                        {/* Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Join SyncSphere
                            </h1>
                            <p className="text-muted-foreground">
                                {type === 'login' 
                                    ? 'Sign in to your account' 
                                    : 'Create your account to start collaborating'
                                }
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {type === 'signup' && (
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    {type === 'login' ? 'Username or Email Address' : 'Email Address'}
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={type === 'login' ? 'Enter your password' : 'Create a password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {type === 'signup' && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-full">
                                {type === 'login' ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Footer Link */}
                        <div className="text-center text-sm text-muted-foreground">
                            {type === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-primary hover:underline font-medium">
                                        Sign up
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary hover:underline font-medium">
                                        Sign in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo in bottom right - only on signup page */}
            {type === 'signup' && (
                <div className="fixed bottom-6 right-6">
                    <img 
                        src={syncsphereLogo} 
                        alt="SyncSphere Logo" 
                        className="w-16 h-16 rounded-xl bg-white/10 p-2"
                    />
                </div>
            )}
        </div>
    );
}

export default AuthForm;