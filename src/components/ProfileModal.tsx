import React, { useState, useEffect } from 'react';
import { authService, type User } from '../services/auth';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdateUser: (newUsername: string) => void;
    activeLocations: Record<string, Set<string>>;
    initialTab?: 'stats' | 'edit' | 'account';
    stats?: { key: string; label: string; total: number; count: number }[];
}

export function ProfileModal({ isOpen, onClose, user, onUpdateUser, activeLocations, initialTab = 'stats', stats: passedStats }: ProfileModalProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [hasPassword, setHasPassword] = useState<boolean | undefined>(user?.hasPassword);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'stats' | 'edit' | 'account'>(initialTab);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setShowDeleteConfirm(false);
            setDeletePassword('');
            setHasPassword(user?.hasPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen, initialTab, user]);

    const handleDeleteAccount = async () => {
        if (!user || !user.id) return;

        const result = await authService.deleteAccount(user.id, deletePassword);
        if (result.success) {
            window.location.reload(); // Logout and reload app
        } else {
            setMessage({ text: result.message || 'Failed to delete account', type: 'error' });
        }
    };

    const handleLogout = () => {
        authService.logout();
        localStorage.setItem('travel_tracker_logout_msg', 'true');
        window.location.reload();
    };


    useEffect(() => {
        if (isOpen && user) {
            setUsername(user.username);
            setEmail(user.email || '');
            setMessage(null);

            // Refresh profile data to get latest stats/email/hasPassword if needed
            authService.getProfile(user.username).then(updatedUser => {
                if (updatedUser) {
                    setEmail(updatedUser.email || '');
                    if (updatedUser.hasPassword !== undefined) {
                        setHasPassword(updatedUser.hasPassword);
                    }
                }
            });
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!user.id) {
            setMessage({ text: 'User ID not found. Please log in again.', type: 'error' });
            return;
        }

        const result = await authService.updateProfile(user.id, username, email);

        if (result.success) {
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            onUpdateUser(username);
        } else {
            setMessage({ text: result.message || 'Failed to update profile.', type: 'error' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!user || !user.id) return;

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }

        const result = await authService.updatePassword(user.id, hasPassword ? currentPassword : null, newPassword);

        if (result.success) {
            setMessage({ text: hasPassword ? 'Password updated successfully!' : 'Password set successfully!', type: 'success' });
            setHasPassword(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ text: result.message || 'Failed to update password.', type: 'error' });
        }
    };

    // Stats calculations
    const stats = passedStats || [
        { key: 'world', label: 'World', total: 176, count: activeLocations['world']?.size || 0 },
        { key: 'usa', label: 'USA', total: 50, count: activeLocations['usa']?.size || 0 },
        { key: 'usaParks', label: 'US National Parks', total: 63, count: activeLocations['usaParks']?.size || 0 },
        { key: 'europe', label: 'Europe', total: 51, count: activeLocations['europe']?.size || 0 },
        { key: 'china', label: 'China', total: 34, count: activeLocations['china']?.size || 0 },
        { key: 'india', label: 'India', total: 36, count: activeLocations['india']?.size || 0 },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex justify-center p-4 pb-24 md:pb-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 transform transition-all overflow-hidden my-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        My Profile
                    </h2>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={handleLogout}
                            className="lg:hidden text-[11px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Log Out
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-gray-100">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'stats' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Travel Stats
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('edit')}
                    >
                        Edit Profile
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'account' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('account')}
                    >
                        My Account
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'stats' && (
                        <div className="space-y-4">
                            {stats.map((stat) => {
                                const percentage = stat.total > 0 ? (stat.count / stat.total) * 100 : 0;
                                return (
                                    <div key={stat.key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{(stat as any).fullLabel || stat.label}</span>
                                            <span className="text-gray-500">{stat.count} / {stat.total} ({Number(percentage.toFixed(1))}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Used for password recovery and shared access.</p>
                            </div>

                            {message && activeTab === 'edit' && (
                                <div className={`text-sm font-medium px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                                >
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-8 animate-fade-in">
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wider">
                                    {hasPassword ? 'Change Password' : 'Set Password'}
                                </h3>

                                {hasPassword && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {hasPassword ? 'New Password' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm {hasPassword ? 'New ' : ''}Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
                                        required
                                    />
                                </div>

                                {message && activeTab === 'account' && (
                                    <div className={`text-sm font-medium px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                                    >
                                        {hasPassword ? 'Update Password' : 'Set Password'}
                                    </button>
                                </div>
                            </form>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Danger Actions</h3>
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors border border-red-200"
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-fade-in">
                                        <p className="text-sm text-red-800 mb-3 font-medium">
                                            Are you sure? This action cannot be undone. All your travels will be lost.
                                        </p>
                                        {hasPassword !== false && (
                                            <input
                                                type="password"
                                                placeholder="Confirm your password"
                                                className="w-full px-3 py-2 border border-red-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                            />
                                        )}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={hasPassword !== false && !deletePassword}
                                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Confirm Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDeleteConfirm(false);
                                                    setDeletePassword('');
                                                }}
                                                className="flex-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
