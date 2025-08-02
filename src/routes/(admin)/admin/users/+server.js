import { updateUserRole, deleteUser } from '$lib/admin-utils.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const { action, userId, role } = await request.json();
        
        if (action === 'updateRole') {
            const updatedUser = await updateUserRole(userId, role);
            return json({ success: true, user: updatedUser });
        } else if (action === 'deleteUser') {
            await deleteUser(userId);
            return json({ success: true });
        }
        
        return json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in user action:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ success: false, error: errorMessage }, { status: 500 });
    }
}
