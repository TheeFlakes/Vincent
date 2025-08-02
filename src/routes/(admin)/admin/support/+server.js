import { replySupportMessage } from '$lib/admin-utils.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const { messageId, reply } = await request.json();
        
        const updatedMessage = await replySupportMessage(messageId, reply);
        return json({ success: true, message: updatedMessage });
    } catch (error) {
        console.error('Error replying to support message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ success: false, error: errorMessage }, { status: 500 });
    }
}
