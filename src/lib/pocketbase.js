import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// PocketBase URL with fallback
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://vin254.pockethost.io';

// Initialize PocketBase client with error handling
/** @type {PocketBase} */
let pb;

try {
    pb = new PocketBase(POCKETBASE_URL);
    // Set timeout for requests
    pb.beforeSend = function (url, options) {
        if (!options.signal) {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 10000); // 10 second timeout
            options.signal = controller.signal;
        }
        return { url, options };
    };
} catch (error) {
    console.error('Failed to initialize PocketBase:', error);
    // Create a mock PocketBase instance for fallback
    pb = /** @type {any} */ ({
        authStore: { 
            model: null, 
            isValid: false,
            onChange: () => {},
            clear: () => {},
            loadFromCookie: () => {},
            exportToCookie: () => ''
        },
        collection: () => ({
            getOne: () => Promise.reject(new Error('PocketBase unavailable')),
            getList: () => Promise.reject(new Error('PocketBase unavailable')),
            create: () => Promise.reject(new Error('PocketBase unavailable')),
            update: () => Promise.reject(new Error('PocketBase unavailable')),
            authWithPassword: () => Promise.reject(new Error('PocketBase unavailable'))
        })
    });
}

export { pb };

// Reactive store for current user
export const currentUser = writable(pb.authStore.model);

// Update the store when auth state changes
if (pb.authStore && typeof pb.authStore.onChange === 'function') {
    pb.authStore.onChange((auth) => {
        currentUser.set(pb.authStore.model);
    });
}

// Helper function to create a server-side PocketBase instance
export function createServerPB() {
    try {
        const serverPB = new PocketBase(POCKETBASE_URL);
        // Set timeout for server requests
        serverPB.beforeSend = function (url, options) {
            if (!options.signal) {
                const controller = new AbortController();
                setTimeout(() => controller.abort(), 15000); // 15 second timeout for server
                options.signal = controller.signal;
            }
            return { url, options };
        };
        return serverPB;
    } catch (error) {
        console.error('Failed to create server PocketBase instance:', error);
        return pb; // Return fallback instance
    }
}
