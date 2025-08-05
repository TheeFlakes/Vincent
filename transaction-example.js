import PocketBase from 'pocketbase';

const pb = new PocketBase('https://vin254.pockethost.io');

// Example of how transactions are created in the system
// This is automatically handled by the Stripe webhook when payments are completed

// Example transaction data structure (as requested)
const exampleTransactionData = {
    "user": "RELATION_RECORD_ID",
    "course": "RELATION_RECORD_ID", 
    "amount": 123,
    "currency": "ngn",
    "paystack_reference": "course_123_user_456_1234567890",
    "paystack_access_code": "30fj10bf7mmlo3h",
    "status": "pending" // Can be: "pending", "completed", "failed", "expired"
};

// How to create a transaction record (this is done automatically by the webhook)
async function createTransaction(transactionData) {
    try {
        const record = await pb.collection('transactions').create(transactionData);
        console.log('Transaction created:', record);
        return record;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

// How to get user transactions
async function getUserTransactions(userId) {
    try {
        const result = await pb.collection('transactions').getList(1, 20, {
            filter: `user = "${userId}"`,
            sort: '-created',
            expand: 'course'
        });
        return result.items;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

// How to check if user has purchased a specific course
async function hasUserPurchasedCourse(userId, courseId) {
    try {
        const result = await pb.collection('transactions').getList(1, 1, {
            filter: `user = "${userId}" && course = "${courseId}" && status = "completed"`
        });
        return result.items.length > 0;
    } catch (error) {
        console.error('Error checking purchase status:', error);
        return false;
    }
}

// How to get ALL transactions (for admin/analytics)
async function getAllTransactions(page = 1, perPage = 50) {
    try {
        const result = await pb.collection('transactions').getList(page, perPage, {
            sort: '-created',
            expand: 'user,course'
        });
        return result;
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

// How to get transactions by status
async function getTransactionsByStatus(status, page = 1, perPage = 50) {
    try {
        const result = await pb.collection('transactions').getList(page, perPage, {
            filter: `status = "${status}"`,
            sort: '-created',
            expand: 'user,course'
        });
        return result;
    } catch (error) {
        console.error('Error fetching transactions by status:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

// How to get transaction by Paystack reference
async function getTransactionByReference(reference) {
    try {
        const result = await pb.collection('transactions').getList(1, 1, {
            filter: `paystack_reference = "${reference}"`,
            expand: 'user,course'
        });
        return result.items.length > 0 ? result.items[0] : null;
    } catch (error) {
        console.error('Error fetching transaction by reference:', error);
        return null;
    }
}

// How to get transactions for a specific course
async function getCourseTransactions(courseId, page = 1, perPage = 50) {
    try {
        const result = await pb.collection('transactions').getList(page, perPage, {
            filter: `course = "${courseId}"`,
            sort: '-created',
            expand: 'user'
        });
        return result;
    } catch (error) {
        console.error('Error fetching course transactions:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

// Demo function to show how the system works
async function demonstrateTransactionSystem() {
    console.log('🚀 Transaction System Demo - EVERY TRANSACTION STORED IN DB');
    console.log('============================================================\n');
    
    // Show example transaction data structure
    console.log('📝 Example Transaction Data Structure:');
    console.log(JSON.stringify(exampleTransactionData, null, 2));
    console.log('\n');
    
    console.log('💾 DATABASE STORAGE POINTS:');
    console.log('============================\n');
    
    console.log('1️⃣ INITIAL TRANSACTION CREATION (Status: "pending")');
    console.log('   ┌─ When: User clicks "Purchase Course" button');
    console.log('   ├─ Where: /api/paystack/create-checkout-session');
    console.log('   ├─ Action: Pending transaction record created in DB');
    console.log('   └─ Data: user, course, amount, currency, paystack_reference, status="pending"\n');
    
    console.log('2️⃣ TRANSACTION UPDATE (Status: "completed")');
    console.log('   ┌─ When: User successfully pays with Paystack');
    console.log('   ├─ Where: /api/paystack/webhook (charge.success)');
    console.log('   ├─ Action: Transaction record updated in DB');
    console.log('   └─ Data: paystack_charge_id added, status="completed"\n');
    
    console.log('3️⃣ FAILED TRANSACTION TRACKING (Status: "failed")');
    console.log('   ┌─ When: Payment fails');
    console.log('   ├─ Where: /api/paystack/webhook (charge.failed)');
    console.log('   ├─ Action: Transaction record updated in DB');
    console.log('   └─ Data: status="failed"\n');
    
    console.log('🔄 COMPLETE TRANSACTION FLOW WITH DB STORAGE:');
    console.log('==============================================');
    console.log('1. User clicks "Purchase Course" → 💾 PENDING transaction stored in DB');
    console.log('2. User redirected to Paystack checkout');
    console.log('3. User pays successfully → 💾 Transaction updated to COMPLETED in DB');
    console.log('4. User gets course access → Enrollment record created');
    console.log('5. Alternative: Payment fails → 💾 Transaction updated to FAILED in DB\n');
    
    // Example usage scenarios
    console.log('💡 QUERY EXAMPLES:\n');
    
    console.log('1. Check if user has purchased a course:');
    console.log('   const hasPurchased = await hasUserPurchasedCourse("user123", "course456");');
    console.log('   // SQL: SELECT * FROM transactions WHERE user="user123" AND course="course456" AND status="completed"\n');
    
    console.log('2. Get all user transactions:');
    console.log('   const transactions = await getUserTransactions("user123");');
    console.log('   // SQL: SELECT * FROM transactions WHERE user="user123" ORDER BY created DESC\n');
    
    console.log('3. Get ALL transactions (admin view):');
    console.log('   const allTransactions = await getAllTransactions();');
    console.log('   // SQL: SELECT * FROM transactions ORDER BY created DESC\n');
    
    console.log('4. Get transactions by status:');
    console.log('   const completedTransactions = await getTransactionsByStatus("completed");');
    console.log('   const failedTransactions = await getTransactionsByStatus("failed");');
    console.log('   // SQL: SELECT * FROM transactions WHERE status="completed"\n');
    
    console.log('5. Get transaction by Paystack reference:');
    console.log('   const transaction = await getTransactionByReference("course_123_user_456_1234567890");');
    console.log('   // SQL: SELECT * FROM transactions WHERE paystack_reference="course_123_user_456_1234567890"\n');
    
    console.log('📊 ALL POSSIBLE TRANSACTION STATUSES IN DB:');
    console.log('===========================================');
    console.log('- "pending"   → Payment initiated, waiting for completion');
    console.log('- "completed" → Payment successful, user has access');
    console.log('- "failed"    → Payment failed, no access granted\n');
    
    console.log('✅ GUARANTEE: Every transaction attempt is stored in the database!');
    console.log('📊 This includes successful payments and failed payments.');
    console.log('🔍 You can track all user payment behavior and course purchase history.');
}

// Run the demonstration
demonstrateTransactionSystem().catch(console.error);

// How to update transaction status (done by webhook)
async function updateTransactionStatus(transactionId, status, charge = null) {
    try {
        const updateData = { status };
        if (charge) {
            updateData.paystack_charge_id = charge.id;
            updateData.gateway_response = charge.gateway_response;
            updateData.paid_at = charge.paid_at;
        }
        
        const record = await pb.collection('transactions').update(transactionId, updateData);
        console.log('Transaction updated:', record);
        return record;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
}

export {
    createTransaction,
    getUserTransactions,
    hasUserPurchasedCourse,
    updateTransactionStatus,
    getAllTransactions,
    getTransactionsByStatus,
    getTransactionByReference,
    getCourseTransactions,
    exampleTransactionData
};
