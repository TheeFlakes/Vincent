# Payment Flow and Transaction Management

## Overview
This system implements a complete payment flow for courses using Stripe integration with transaction tracking in PocketBase. When a user attempts to access a paid course, they are redirected to Stripe checkout, and successful transactions are stored in the `transactions` collection.

## How It Works

### 1. Course Access Logic
- **Free Courses**: Users can enroll directly without payment
- **Paid Courses**: Users who aren't enrolled are redirected to `/dashboard/courses/{id}/checkout`

### 2. Payment Flow
1. User clicks "Purchase Course" button on a paid course
2. System redirects to `/dashboard/courses/{id}/checkout`
3. User selects payment plan and clicks purchase
4. System creates a Stripe checkout session via `/api/stripe/create-checkout-session`
5. A pending transaction record is created in PocketBase
6. User is redirected to Stripe for payment
7. After payment completion, Stripe webhook updates the transaction status
8. User is redirected back with success confirmation

### 3. Transaction Data Structure

The `transactions` collection stores the following data:

```javascript
{
    "user": "RELATION_RECORD_ID",        // Link to user record
    "course": "RELATION_RECORD_ID",      // Link to course record  
    "amount": 123,                       // Amount paid (in dollars)
    "currency": "usd",                   // Currency code
    "stripe_session_id": "cs_test_...",  // Stripe session ID
    "stripe_payment_intent": "pi_...",   // Stripe payment intent ID
    "status": "completed"                // Transaction status
}
```

### 4. Transaction Statuses

- **`pending`**: Transaction created, payment not yet completed
- **`completed`**: Payment successful, user enrolled in course
- **`failed`**: Payment failed
- **`expired`**: Checkout session expired without payment

## Files Modified

### 1. `/src/routes/api/stripe/create-checkout-session/+server.js`
- Added creation of pending transaction record when checkout session is created

### 2. `/src/routes/api/stripe/webhook/+server.js`
- Enhanced to handle transaction record creation/updates
- Added support for:
  - `checkout.session.completed`: Updates transaction to completed
  - `checkout.session.expired`: Updates transaction to expired  
  - `payment_intent.payment_failed`: Updates transaction to failed

### 3. `/src/lib/pocketbase-utils.js`
- Added utility functions for transaction management:
  - `getUserCourseTransaction(userId, courseId)`: Get transaction for specific course
  - `getUserTransactions(userId)`: Get all user transactions
  - `hasUserPurchasedCourse(userId, courseId)`: Check if user has purchased course

## Usage Examples

### Check if User Has Purchased Course
```javascript
import { hasUserPurchasedCourse } from '$lib/pocketbase-utils.js';

const hasPurchased = await hasUserPurchasedCourse(userId, courseId);
if (hasPurchased) {
    // Allow access to course
}
```

### Get User's Transaction History
```javascript
import { getUserTransactions } from '$lib/pocketbase-utils.js';

const transactions = await getUserTransactions(userId);
console.log('User transactions:', transactions);
```

### Manual Transaction Creation (if needed)
```javascript
import { pb } from '$lib/pocketbase.js';

const transactionData = {
    user: userId,
    course: courseId,
    amount: 99.99,
    currency: "usd", 
    stripe_session_id: sessionId,
    stripe_payment_intent: paymentIntentId,
    status: "completed"
};

const record = await pb.collection('transactions').create(transactionData);
```

## Database Setup

To use this system, ensure your PocketBase has a `transactions` collection with these fields:

- `user` (Relation to users collection)
- `course` (Relation to courses collection) 
- `amount` (Number)
- `currency` (Text)
- `stripe_session_id` (Text)
- `stripe_payment_intent` (Text) 
- `status` (Select: pending, completed, failed, expired)

## Security Notes

- All payment processing happens server-side
- Transaction records are created/updated only by server-side webhook handlers
- User authentication is required for all payment endpoints
- Stripe webhook signature verification ensures data integrity
