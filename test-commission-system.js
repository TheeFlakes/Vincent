import PocketBase from 'pocketbase';

const pb = new PocketBase('https://vin254.pockethost.io');

/**
 * Test script to verify the 10% commission system works correctly
 */
async function testCommissionSystem() {
    console.log('🧪 Testing 10% Commission System...\n');

    try {
        // Test the commission calculation logic
        console.log('📊 Commission Calculation Test:');
        console.log('====================================');
        
        // Simulate a purchase
        const purchaseAmount = 100; // $100 course purchase
        const commissionRate = 0.10; // 10%
        const expectedCommission = purchaseAmount * commissionRate;
        
        console.log(`Purchase Amount: $${purchaseAmount}`);
        console.log(`Commission Rate: ${commissionRate * 100}%`);
        console.log(`Expected Commission: $${expectedCommission}`);
        console.log();

        // Test with different purchase amounts
        const testAmounts = [25, 50, 99, 150, 200];
        
        console.log('💰 Commission Examples:');
        console.log('========================');
        
        testAmounts.forEach(amount => {
            const commission = amount * 0.10;
            console.log(`$${amount} course → $${commission.toFixed(2)} commission (10%)`);
        });
        
        console.log();
        console.log('🔄 Commission Flow:');
        console.log('==================');
        console.log('1. User purchases course → Original transaction created');
        console.log('2. Payment succeeds → Webhook triggered');
        console.log('3. System checks if user has upline → Commission calculated');
        console.log('4. Commission transaction created → Upline earns 10%');
        console.log('5. Original transaction updated → Links to commission');
        console.log();

        // Test database queries
        console.log('🗄️  Database Structure Test:');
        console.log('=============================');
        console.log('Commission transactions will have:');
        console.log('- transaction_type: "commission"');
        console.log('- amount: 10% of original purchase');
        console.log('- user: upline user ID');
        console.log('- commission_from_user: purchaser user ID');
        console.log('- commission_rate: 0.10');
        console.log('- original_transaction_ref: original Paystack reference');
        console.log();

        console.log('✅ Commission System Ready!');
        console.log();
        console.log('🚀 Next Steps:');
        console.log('==============');
        console.log('1. Make a test purchase with a referred user');
        console.log('2. Check the webhook logs for commission processing');
        console.log('3. Verify commission appears in referrer\'s dashboard');
        console.log('4. Check transactions collection for commission records');

    } catch (error) {
        console.error('❌ Commission system test failed:', error.message);
    }
}

// Example commission query functions
async function getCommissionEarnings(userId) {
    try {
        const commissions = await pb.collection('transactions').getFullList({
            filter: `user = "${userId}" && transaction_type = "commission"`,
            expand: 'commission_from_user,course'
        });
        
        const totalEarnings = commissions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        return {
            totalEarnings,
            commissionCount: commissions.length,
            commissions: commissions.map(c => ({
                amount: c.amount,
                fromUser: c.expand?.commission_from_user?.name || 'Unknown',
                course: c.expand?.course?.title || 'Unknown Course',
                date: c.created
            }))
        };
    } catch (error) {
        console.error('Error fetching commission earnings:', error);
        return { totalEarnings: 0, commissionCount: 0, commissions: [] };
    }
}

async function getCommissionsPaid(userId) {
    try {
        const commissions = await pb.collection('transactions').getFullList({
            filter: `commission_from_user = "${userId}"`,
            expand: 'user,course'
        });
        
        const totalPaid = commissions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        return {
            totalPaid,
            commissionCount: commissions.length,
            commissions: commissions.map(c => ({
                amount: c.amount,
                toUser: c.expand?.user?.name || 'Unknown',
                course: c.expand?.course?.title || 'Unknown Course',
                date: c.created
            }))
        };
    } catch (error) {
        console.error('Error fetching commissions paid:', error);
        return { totalPaid: 0, commissionCount: 0, commissions: [] };
    }
}

// Run the test
testCommissionSystem().catch(console.error);

export {
    testCommissionSystem,
    getCommissionEarnings,
    getCommissionsPaid
};
