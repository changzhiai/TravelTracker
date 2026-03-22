
import React, { useState } from 'react';
import { authService } from '../services/auth';
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (username: string) => void;
    initialMode?: Mode;
}

type Mode = 'signin' | 'register' | 'reset';

export function SignInModal({ isOpen, onClose, onLoginSuccess, initialMode = 'signin' }: SignInModalProps) {
    const [mode, setMode] = useState<Mode>(initialMode);

    // Sync mode when initialMode prop changes (e.g. from URL navigation)
    React.useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setResetStep('email');
            setError(null);
        }
    }, [isOpen, initialMode]);

    const [resetStep, setResetStep] = useState<'email' | 'verification'>('email');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse: any) => {
            console.log('Google login success response:', tokenResponse);
            if (tokenResponse.access_token) {
                const result = await authService.googleLogin(tokenResponse.access_token, true);
                if (result.user) {
                    onLoginSuccess(result.user.username);
                    resetForm();
                } else {
                    console.error('Google verification failed on server:', result.error);
                    setError(result.error || 'Google login failed');
                }
            } else {
                console.warn('Google login success but no access_token found');
                setError('Google Login failed: No access token');
            }
        },
        onError: (error) => {
            console.error('Google Login Error callback:', error);
            setError('Google Login Failed');
        },
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);


        if (mode === 'signin') {
            if (!username.trim() || !password.trim()) {
                setError('Username and password are required.');
                return;
            }
            const result = await authService.login(username.trim(), password.trim());
            if (result.user) {
                onLoginSuccess(result.user.username);
                resetForm();
            } else {
                setError(result.error || 'Invalid username or password.');
            }
        } else if (mode === 'register') {
            if (!username.trim() || !password.trim() || !email.trim()) {
                setError('Username, password, and email are required.');
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
        <div className="fixed inset-0 z-[60] flex justify-center p-4 pb-24 md:pb-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm border border-white/20 transform transition-all p-6 my-auto"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {mode === 'signin' ? 'Sign In' : mode === 'register' ? 'Register' : 'Reset Password'}
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
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                placeholder="Username"
                                autoFocus
                                required
                            />
                        </div>
                    )}

                    {/* Email Field - Register and Reset (Step 1) */}
                    {(mode === 'register' || (mode === 'reset' && resetStep === 'email')) && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                placeholder={mode === 'reset' ? "Associated email address" : "Email address"}
                                required
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

                {mode === 'signin' && (
                    <div className="mt-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-center flex-1">
                                <button
                                    onClick={() => loginWithGoogle()}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-[#747775] rounded-full hover:bg-gray-50 transition-all font-medium text-[#1f1f1f] text-sm"
                                    style={{ height: '40px', width: '270px' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                                        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H1.05545V12.9682C2.53636 15.9014 5.55136 18 9 18Z" fill="#34A853" />
                                        <path d="M5.03591 10.71C4.85591 10.17 4.75364 9.59318 4.75364 9C4.75364 8.40682 4.85591 7.83 5.03591 7.29V5.03182H1.05545C0.441818 6.255 0.09 7.63364 0.09 9C0.09 10.3664 0.441818 11.745 1.05545 12.9682L5.03591 10.71Z" fill="#FBBC05" />
                                        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.55136 0 2.53636 2.09864 1.05545 5.03182L5.03591 7.29C5.74364 5.16273 7.72773 3.57955 9 3.57955Z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>

                            <div className="flex justify-center flex-1">
                                <AppleSignin
                                    authOptions={{
                                        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.travel-tracker.client',
                                        scope: 'email name',
                                        redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI || 'https://travel-tracker.org/api/apple-callback',
                                        state: 'origin:web',
                                        nonce: 'nonce',
                                        usePopup: true,
                                    }}
                                    uiType="light"
                                    onSuccess={async (response: any) => {
                                        console.log('Apple login success:', response);
                                        if (response.authorization?.id_token) {
                                            const result = await authService.appleLogin(
                                                response.authorization.id_token,
                                                response.user
                                            );
                                            if (result.user) {
                                                onLoginSuccess(result.user.username);
                                                resetForm();
                                            } else {
                                                setError(result.error || 'Apple login failed');
                                            }
                                        }
                                    }}
                                    onError={(error: any) => {
                                        console.error('Apple login error:', error);
                                        setError('Apple Login Failed');
                                    }}
                                    render={(props: any) => (
                                        <button
                                            {...props}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#747775] rounded-full hover:bg-gray-50 transition-all font-medium text-[#1f1f1f] text-sm"
                                            style={{ height: '40px', width: '270px' }}
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 170 170" fill="currentColor">
                                                <path d="M150.37,130.25c-2.45,5.66-5.35,10.89-8.71,15.66c-8.58,12.13-17.52,21.41-26.83,27.85c-9.31,6.44-18.4,9.66-27.27,9.66 c-4.22,0-8.89-1.04-14-3.12c-5.11-2.08-10.3-3.12-15.58-3.12c-5.28,0-10.51,1.04-15.71,3.12c-5.2,2.08-9.83,3.12-13.88,3.12 c-9.15,0-18.73-3.46-28.71-10.38c-9.98-6.92-18.74-16.74-26.29-29.47C5.97,114.24,2,97.77,2,83.98c0-14.16,2.44-26.54,7.31-37.12 c4.87-10.58,11.51-18.89,19.92-24.96c8.41-6.07,17.76-9.11,28.05-9.11c4.54,0,9.97,1.21,16.28,3.63c6.31,2.42,11.39,3.63,15.25,3.63 c3.14,0,7.88-1.21,14.21-3.63c6.33-2.42,12.11-3.63,17.34-3.63c10,0,18.77,2.5,26.3,7.51c7.53,5.01,13.43,11.75,17.71,20.21 c-11.03,6.72-16.55,16.14-16.55,28.27c0,9.81,3.29,17.96,9.87,24.46c6.58,6.5,14.34,10.43,23.27,11.79 C157.06,114.07,154.54,121.75,150.37,130.25z M119.23,30.3c-5.46,6.6-11.95,10.03-19.47,10.28c-0.45-8.48,2.7-16.51,9.45-24.08 c6.76-7.57,14.31-11.64,22.66-12.2c0.75,8.87-4.11,18.06-9.4,24.36L119.23,30.3z" />
                                            </svg>
                                            Sign in with Apple
                                        </button>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center">
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
