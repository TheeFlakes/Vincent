/**
 * Real-time Support Testing Script
 * 
 * This script demonstrates how to test the real-time support functionality
 * by simulating admin replies to support messages.
 * 
 * Usage:
 * 1. Run this script in a separate terminal
 * 2. Open the support page in your browser
 * 3. Create a new support message
 * 4. This script will automatically add a reply to test real-time updates
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://vin254.pockethost.io');

async function testRealTimeSupport() {
    try {
        console.log('🚀 Starting real-time support test...');
        
        // You'll need to authenticate as an admin or user with permissions
        // Replace with actual admin credentials
        console.log('⚠️  Note: You need to authenticate as admin first');
        console.log('⚠️  Update the credentials below with your admin account');
        
        // Uncomment and update these lines with admin credentials:
        // await pb.collection('users').authWithPassword('admin@example.com', 'admin_password');
        // console.log('✅ Authenticated as admin');
        
        // Subscribe to new support messages
        pb.collection('support_messages').subscribe('*', async function (e) {
            console.log('📨 Support message event:', e.action);
            
            if (e.action === 'create' && !e.record.adminReply) {
                console.log('👤 New message from user:', e.record.sender);
                console.log('💬 Message:', e.record.message);
                
                // Simulate admin reply after 2 seconds
                setTimeout(async () => {
                    try {
                        const replyText = `Thank you for contacting support! We received your message: "${e.record.message.substring(0, 50)}${e.record.message.length > 50 ? '...' : ''}" and will respond shortly. This is an automated test reply.`;
                        
                        await pb.collection('support_messages').update(e.record.id, {
                            adminReply: replyText,
                            status: 'replied'
                        });
                        
                        console.log('✅ Auto-reply sent to message ID:', e.record.id);
                    } catch (error) {
                        console.error('❌ Error sending auto-reply:', error);
                    }
                }, 2000);
            }
        });
        
        console.log('👂 Listening for new support messages...');
        console.log('💡 Create a new support message in the browser to test real-time updates');
        console.log('🔄 Press Ctrl+C to stop');
        
    } catch (error) {
        console.error('❌ Error setting up real-time test:', error);
        console.log('💡 Make sure to:');
        console.log('   1. Update admin credentials in this script');
        console.log('   2. Ensure PocketBase instance is running');
        console.log('   3. Check that support_messages collection exists');
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping real-time support test...');
    pb.collection('support_messages').unsubscribe('*');
    console.log('✅ Unsubscribed from support messages');
    process.exit(0);
});

// Start the test
testRealTimeSupport();
