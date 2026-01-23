
import React, { useState } from 'react';
import { authService } from '../services/auth';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (username: string) => void;
}

type Mode = 'signin' | 'register' | 'reset';

export function SignInModal({ isOpen, onClose, onLoginSuccess }: SignInModalProps) {
    const [mode, setMode] = useState<Mode>('signin');
    const [resetStep, setResetStep] = useState<'email' | 'verification'>('email');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);


        if (mode === 'signin') {
            if (!username.trim() || !password.trim()) {
                setError('Username or Email and password are required.');
                return;
            }
            const success = await authService.login(username.trim(), password.trim());
            if (success) {
                onLoginSuccess(username.trim());
                resetForm();
            } else {
                setError('Invalid username or password.');
            }
        } else if (mode === 'register') {
            if (!username.trim() || !password.trim()) {
                setError('Username and password are required.');
                return;
            }
            const success = await authService.register(username.trim(), password.trim(), email.trim() || undefined);
            if (success) {
                onLoginSuccess(username.trim());
                resetForm();
            } else {
                setError('Username already taken.');
            }
        } else if (mode === 'reset') {
            if (resetStep === 'email') {
                if (!email.trim()) {
                    setError('Email is required.');
                    return;
                }
                const result = await authService.sendVerificationCode(email.trim());
                if (result.success) {
                    setResetStep('verification');
                    setError(null);
                } else {
                    setError(result.message || 'Failed to send verification code.');
                }
            } else {
                // Verification step
                if (!verificationCode.trim() || !password.trim()) {
                    setError('Verification code and new password are required.');
                    return;
                }

                const result = await authService.resetPassword(email.trim(), verificationCode.trim(), password.trim());
                if (result.success) {
                    alert('Password updated successfully. Please sign in with your new password.');
                    setMode('signin');
                    setUsername('');
                    setPassword('');
                    setEmail('');
                    setVerificationCode('');
                    setResetStep('email');
                    setError(null);
                } else {
                    setError(result.message || 'Failed to reset password.');
                }
            }
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setVerificationCode('');
        setResetStep('email');
        setError(null);
        setMode('signin');
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'register' : 'signin');
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm border border-white/20 transform transition-all p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {mode === 'signin' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                    {mode === 'signin'
                        ? 'Enter your credentials to access your travels.'
                        : mode === 'register'
                            ? 'Register to start tracking your journey.'
                            : resetStep === 'email' ? 'Enter your email to receive a verification code.' : 'Enter the code sent to your email.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Username Field - Only for Sign In and Register */}
                    {mode !== 'reset' && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                placeholder="Username or Email"
                                autoFocus
                                required
                            />
                        </div>
                    )}

                    {/* Email Field - Register and Reset (Step 1) */}
                    {(mode === 'register' || (mode === 'reset' && resetStep === 'email')) && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                {mode === 'reset' ? 'Email' : 'Email'} <span className="text-gray-400 font-normal">{mode === 'reset' ? '(Required)' : '(Optional)'}</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                placeholder={mode === 'reset' ? "Associated email address" : "For password reset"}
                                required={mode === 'reset'}
                            />
                        </div>
                    )}

                    {/* Verification Code Field - Reset (Step 2) */}
                    {mode === 'reset' && resetStep === 'verification' && (
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                id="code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50 tracking-widest text-center font-mono text-lg"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Password Field - Sign In, Register, and Reset (Step 2) */}
                    {(mode !== 'reset' || resetStep === 'verification') && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {mode === 'reset' ? 'New Password' : 'Password'}
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                placeholder={mode === 'reset' ? "New Password" : "Password"}
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                        >
                            {mode === 'signin' ? 'Log In' : mode === 'register' ? 'Register' : resetStep === 'email' ? 'Send Code' : 'Reset Password'}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        {mode === 'signin'
                            ? "Don't have an account? Register"
                            : mode === 'register'
                                ? "Already have an account? Sign In"
                                : "Back to Sign In"}
                    </button>
                    {mode === 'signin' && (
                        <button
                            type="button"
                            onClick={() => {
                                setMode('reset');
                                setResetStep('email');
                                setError(null);
                            }}
                            className="block w-full mt-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
