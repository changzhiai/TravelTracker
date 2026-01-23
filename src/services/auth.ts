
// Auth service using Background Database (Express + SQLite)

const API_URL = 'http://localhost:3001/api';
const CURRENT_USER_KEY = 'travel_tracker_current_user';

export interface User {
    id?: number;
    username: string;
    email?: string;
}

export const authService = {
    getCurrentUser(): User | null {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        if (!stored) return null;
        try {
            const user = JSON.parse(stored);
            if (typeof user === 'object' && user.username) {
                return user;
            }
            return { username: stored }; // Fallback for plain string legacy
        } catch (e) {
            return { username: stored };
        }
    },

    async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                localStorage.setItem(CURRENT_USER_KEY, username);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    async register(username: string, password: string, email?: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });

            if (response.ok) {
                localStorage.setItem(CURRENT_USER_KEY, username);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    },

    async sendVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                return { success: true };
            }
            return { success: false, message: data.error || 'Failed to send code' };
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    },

    async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                return { success: true };
            }
            return { success: false, message: data.error || 'Failed to reset password' };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, message: 'Network connection error. Please try again.' };
        }
    },

    async getProfile(username: string): Promise<User | null> {
        try {
            const response = await fetch(`${API_URL}/user/${username}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    },

    async updateProfile(id: number, username: string, email: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/user/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email })
            });

            const data = await response.json();
            if (response.ok) {
                // Update local storage
                const currentUser = this.getCurrentUser();
                if (currentUser && currentUser.id === id) {
                    const updatedUser = { ...currentUser, username, email };
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
                }
                return { success: true };
            }
            return { success: false, message: data.error || 'Failed to update profile' };
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    },

    logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    async saveLocations(username: string, scope: string, locations: Set<string>): Promise<void> {
        try {
            const locationsArray = Array.from(locations);
            await fetch(`${API_URL}/visits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, scope, locations: locationsArray })
            });
        } catch (error) {
            console.error('Save locations error:', error);
        }
    },

    async loadLocations(username: string, scope: string): Promise<Set<string>> {
        try {
            const response = await fetch(`${API_URL}/visits/${username}/${scope}`);
            if (response.ok) {
                const data = await response.json();
                return new Set(data.locations);
            }
        } catch (error) {
            console.error('Load locations error:', error);
        }
        return new Set();
    }
};
