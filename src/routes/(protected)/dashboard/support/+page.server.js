import { pb } from '$lib/pocketbase.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    try {
        // Fetch support messages for the current user
        const supportMessages = await pb.collection('support_messages').getFullList({
            filter: `sender = "${locals.user.id}"`,
            sort: '-created',
            requestKey: null
        });

        return {
            user: locals.user,
            supportMessages: supportMessages
        };
    } catch (err) {
        console.error('Error fetching support messages:', err);
        throw error(500, 'Failed to load support messages');
    }
}

export const actions = {
    createMessage: async ({ request, locals }) => {
        if (!locals.user) {
            throw redirect(302, '/login');
        }

        try {
            const data = await request.formData();
            const message = data.get('message');

            if (!message || message.trim().length === 0) {
                return {
                    success: false,
                    error: 'Message cannot be empty'
                };
            }

            if (message.trim().length > 1000) {
                return {
                    success: false,
                    error: 'Message is too long (max 1000 characters)'
                };
            }

            // Create support message
            const supportMessage = await pb.collection('support_messages').create({
                sender: locals.user.id,
                message: message.trim(),
                status: 'pending',
                adminReply: ''
            });

            return {
                success: true,
                message: 'Support message sent successfully!'
            };
        } catch (err) {
            console.error('Error creating support message:', err);
            return {
                success: false,
                error: 'Failed to send message. Please try again.'
            };
        }
    }
};
