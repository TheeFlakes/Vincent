import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// Initialize PocketBase client
export const pb = new PocketBase('https://vin254.pockethost.io');

// Reactive store for current user
export const currentUser = writable(pb.authStore.model);

// Update the store when auth state changes
pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model);
});
