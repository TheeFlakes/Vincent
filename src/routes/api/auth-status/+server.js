import { json } from '@sveltejs/kit';
import { createServerPB } from '$lib/pocketbase.js';

export async function GET({ cookies }) {
    const pb = createServerPB();
    
    try {
        // Check if we have an auth cookie
        const authCookie = cookies.get('pb_auth');
        
        if (!authCookie) {
            return json({ 
                authenticated: false, 
                message: 'No auth cookie found' 
            });
        }
        
        // Try to load the auth from cookie
        pb.authStore.loadFromCookie(`pb_auth=${authCookie}`);
        
        if (!pb.authStore.isValid) {
            return json({ 
                authenticated: false, 
                message: 'Invalid auth token' 
            });
        }
        
        // Try to refresh auth to verify it's still valid
        await pb.collection('users').authRefresh();
        
        return json({ 
            authenticated: true, 
            user: {
                id: pb.authStore.model?.id,
                email: pb.authStore.model?.email,
                name: pb.authStore.model?.name
            },
            message: 'Successfully authenticated' 
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return json({ 
            authenticated: false, 
            message: `Auth check failed: ${errorMessage}` 
        });
    }
}
