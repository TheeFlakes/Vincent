import { pb } from './pocketbase.js';

/**
 * Generate a unique referral code based on email
 * @param {string} email - User's email address
 * @returns {string} Generated referral code
 */
function generateReferralCode(email) {
    // Create a simple referral code based on email and timestamp
    const emailPrefix = email.split('@')[0].toUpperCase().substring(0, 3);
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${emailPrefix}${randomSuffix}`;
}

/**
 * Login user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} User record
 */
export async function login(email, password) {
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        return { success: true, user: authData.record };
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific PocketBase errors
        if (error && typeof error === 'object' && 'status' in error) {
            if (error.status === 400) {
                return { success: false, error: 'Invalid email or password' };
            }
            
            if (error.status === 0) {
                return { success: false, error: 'Unable to connect to server. Please make sure PocketBase is running.' };
            }
        }
        
        // Handle network errors
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes('fetch')) {
            return { success: false, error: 'Unable to connect to server. Please make sure PocketBase is running.' };
        }
        
        const errorMessage = error && typeof error === 'object' && 'message' in error ? 
            error.message : 'Login failed';
        return { success: false, error: errorMessage };
    }
}

/**
 * Register new user
 * @param {object} userData 
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.passwordConfirm
 * @param {string} userData.referralCode
 * @returns {Promise<object>} User record
 */
export async function signup(userData) {
    try {
        // Validate referral code first
        if (!userData.referralCode || userData.referralCode.trim().length === 0) {
            return { success: false, error: 'Referral code is required' };
        }

        // Find the referring user by their referral code
        let referringUser = null;
        try {
            const referringUsers = await pb.collection('users').getList(1, 1, {
                filter: `referralCode = "${userData.referralCode.trim()}"`,
                requestKey: null
            });
            
            if (referringUsers.items.length === 0) {
                return { success: false, error: 'Invalid referral code. Please check with the person who referred you.' };
            }
            
            referringUser = referringUsers.items[0];
        } catch (referralError) {
            console.error('Error validating referral code:', referralError);
            return { success: false, error: 'Unable to validate referral code. Please try again.' };
        }

        // Generate a unique referral code for the new user
        const newUserReferralCode = generateReferralCode(userData.email);

        // Prepare data according to your user schema
        const data = {
            password: userData.password,
            passwordConfirm: userData.passwordConfirm,
            email: userData.email,
            emailVisibility: true,
            verified: false, // Will be set to true after email verification
            username: userData.email, // Using email as username, you can modify this
            name: userData.name, // Adding the name field
            role: "user", // Default role
            referralCode: newUserReferralCode, // Generate unique referral code for new user
            walletBalance: 0, // Starting balance
            commissionsEarned: 0, // Starting commissions
            referredBy: referringUser.id // Set the referring user's ID
        };

        const record = await pb.collection('users').create(data);
        
        // Send email verification request
        try {
            await pb.collection('users').requestVerification(userData.email);
        } catch (verificationError) {
            console.warn('Email verification request failed:', verificationError);
            // Continue even if email verification fails
        }
        
        // Optionally auto-login after signup
        if ('email' in userData && 'password' in userData && userData.email && userData.password) {
            const authData = await pb.collection('users').authWithPassword(
                userData.email.toString(), 
                userData.password.toString()
            );
            return { success: true, user: authData.record };
        }
        return { success: true, user: record };
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle specific PocketBase errors
        if (error && typeof error === 'object' && 'status' in error) {
            if (error.status === 400) {
                // Check if it's a validation error
                if (error && 'data' in error && error.data && typeof error.data === 'object' && 'data' in error.data) {
                    const validationErrors = /** @type {any} */ (error.data).data;
                    if (validationErrors.email) {
                        return { success: false, error: 'Email is already registered or invalid' };
                    }
                    if (validationErrors.username) {
                        return { success: false, error: 'Username is already taken' };
                    }
                }
                return { success: false, error: 'Invalid user data or user already exists' };
            }
            
            if (error.status === 0) {
                return { success: false, error: 'Unable to connect to server. Please make sure PocketBase is running.' };
            }
        }
        
        // Handle network errors
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes('fetch')) {
            return { success: false, error: 'Unable to connect to server. Please make sure PocketBase is running.' };
        }
        
        const errorMessage = error && typeof error === 'object' && 'message' in error ? 
            error.message : 'Signup failed';
        return { success: false, error: errorMessage };
    }
}

/**
 * Logout current user
 */
export function logout() {
    // Clear PocketBase auth store
    pb.authStore.clear();
    
    // Also clear any browser storage that might be persisting auth
    if (typeof window !== 'undefined') {
        // Clear localStorage and sessionStorage
        try {
            localStorage.removeItem('pocketbase_auth');
            sessionStorage.removeItem('pocketbase_auth');
            // Clear all items that start with 'pb_' or 'pocketbase'
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('pb_') || key.startsWith('pocketbase'))) {
                    localStorage.removeItem(key);
                }
            }
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
                const key = sessionStorage.key(i);
                if (key && (key.startsWith('pb_') || key.startsWith('pocketbase'))) {
                    sessionStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.warn('Error clearing storage:', error);
        }
        
        // Clear auth cookies
        try {
            document.cookie = 'pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
            // Also try with domain
            const domain = window.location.hostname;
            document.cookie = `pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=Lax`;
        } catch (error) {
            console.warn('Error clearing cookies:', error);
        }
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return pb.authStore.isValid;
}

/**
 * Get current user
 * @returns {object|null}
 */
export function getCurrentUser() {
    return pb.authStore.model;
}
