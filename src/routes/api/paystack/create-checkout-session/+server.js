import { json } from '@sveltejs/kit';
import { paystack } from '$lib/paystack.js';
import { pb } from '$lib/pocketbase.js';

export async function POST({ request, locals }) {
    try {
        if (!locals.user) {
            return json({ error: 'Authentication required' }, { status: 401 });
        }

        const { courseId, amount, email } = await request.json();

        if (!courseId) {
            return json({ error: 'Course ID is required' }, { status: 400 });
        }

        // Fetch the course
        const course = await pb.collection('courses').getOne(courseId);

        if (!course) {
            return json({ error: 'Course not found' }, { status: 404 });
        }

        if (course.isFree) {
            return json({ error: 'This course is free' }, { status: 400 });
        }

        // Check if user is already enrolled
        try {
            const enrollmentResult = await pb.collection('user_progress').getList(1, 1, {
                filter: `user = "${locals.user.id}" && course = "${courseId}"`
            });
            
            if (enrollmentResult.items.length > 0) {
                return json({ error: 'Already enrolled in this course' }, { status: 400 });
            }
        } catch (err) {
            // No enrollment found, continue
        }

        // Convert USD to NGN for Paystack (which supports NGN)
        let finalAmount = amount || course.price;
        
        // Ensure we have a valid amount
        if (!finalAmount || finalAmount <= 0) {
            return json({ error: 'Invalid course price' }, { status: 400 });
        }

        // Convert USD to NGN (1 USD ≈ 1600 NGN as of current rates)
        const usdToNgnRate = 1600;
        const amountInNGN = Math.round(finalAmount * usdToNgnRate);

        // Generate unique reference
        const reference = `course_${courseId}_${locals.user.id}_${Date.now()}`;

        // Initialize Paystack transaction with NGN currency
        const initializeData = {
            email: email || locals.user.email,
            amount: amountInNGN * 100, // Convert to kobo for Paystack (NGN * 100)
            reference: reference,
            currency: 'NGN', // Use NGN currency which is supported
            name: locals.user.name || locals.user.email || 'Course Student',
            callback_url: `${request.headers.get('origin')}/dashboard/courses/${courseId}?payment_reference=${reference}&enrolled=true`,
            metadata: {
                courseId: courseId,
                userId: locals.user.id,
                userEmail: locals.user.email || email,
                courseName: course.title,
                originalAmountUSD: finalAmount, // Store original USD amount
                convertedAmountNGN: amountInNGN, // Store converted NGN amount
                conversionRate: usdToNgnRate,
                custom_fields: [
                    {
                        display_name: "Course",
                        variable_name: "course_id",
                        value: courseId
                    },
                    {
                        display_name: "User ID",
                        variable_name: "user_id", 
                        value: locals.user.id
                    },
                    {
                        display_name: "Original Price (USD)",
                        variable_name: "original_usd",
                        value: finalAmount.toString()
                    }
                ]
            }
        };

        const transaction = await paystack.transaction.initialize(initializeData);

        if (!transaction.status) {
            throw new Error(transaction.message || 'Failed to initialize transaction');
        }

        // Create a pending transaction record with proper Paystack fields
        try {
            await pb.collection('transactions').create({
                user: locals.user.id,
                course: courseId,
                amount: finalAmount, // Store original amount in USD
                currency: 'USD', // Store as USD for display purposes
                paystack_reference: reference,
                paystack_access_code: transaction.data.access_code,
                paystack_amount_ngn: amountInNGN, // Store converted NGN amount
                paystack_currency: 'NGN', // Actual Paystack currency
                status: 'pending',
                // Map Paystack fields to your schema
                stripe_session_id: transaction.data.access_code, // Use access_code as session identifier
                stripe_payment_intent: reference, // Use reference as payment intent
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            });
        } catch (err) {
            console.error('Could not create pending transaction record:', err);
            // Don't fail the checkout creation if transaction record creation fails
        }

        return json({
            reference: reference,
            authorization_url: transaction.data.authorization_url,
            access_code: transaction.data.access_code
        });

    } catch (error) {
        console.error('Paystack checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
        return json({ 
            error: errorMessage
        }, { status: 500 });
    }
}
