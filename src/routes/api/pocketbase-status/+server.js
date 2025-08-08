import { json } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase.js';

export async function GET() {
    try {
        // Try to get the health status from PocketBase
        const response = await fetch(`${pb.baseUrl}/api/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
        });
        
        if (response.ok) {
            const data = await response.json();
            return json({
                status: 'success',
                message: 'PocketBase is accessible',
                data
            });
        } else {
            return json({
                status: 'error',
                message: `PocketBase responded with status ${response.status}`,
                pocketbaseUrl: pb.baseUrl
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error connecting to PocketBase:', error);
        return json({
            status: 'error',
            message: 'Could not connect to PocketBase',
            error: error.message,
            pocketbaseUrl: pb.baseUrl
        }, { status: 500 });
    }
}
