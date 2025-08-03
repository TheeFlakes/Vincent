import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe.js';
import { pb } from '$lib/pocketbase.js';

export async function POST({ request, locals }) {
    try {
        if (!locals.user) {
            return json({ error: 'Authentication required' }, { status: 401 });
        }

        const { courseId, priceId, mode = 'payment' } = await request.json();

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

        // Create line items based on the course
        const lineItems = [];

        if (priceId) {
            // Use existing price ID from Stripe
            lineItems.push({
                price: priceId,
                quantity: 1
            });
        } else {
            // Create price data dynamically
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: course.title,
                        description: course.description || `Access to ${course.title}`,
                        images: course.thumbnail ? [pb.files.getUrl(course, course.thumbnail)] : []
                    },
                    unit_amount: Math.round(course.price * 100) // Convert to cents
                },
                quantity: 1
            });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: mode,
            success_url: `${request.headers.get('origin')}/dashboard/courses/${courseId}?session_id={CHECKOUT_SESSION_ID}&enrolled=true`,
            cancel_url: `${request.headers.get('origin')}/dashboard/courses/${courseId}?canceled=true`,
            customer_email: locals.user.email,
            metadata: {
                courseId: courseId,
                userId: locals.user.id,
                userEmail: locals.user.email
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            phone_number_collection: {
                enabled: true
            }
        });

        // Create a pending transaction record
        try {
            await pb.collection('transactions').create({
                user: locals.user.id,
                course: courseId,
                amount: Math.round(course.price * 100) / 100, // Ensure decimal precision
                currency: 'usd',
                stripe_session_id: session.id,
                stripe_payment_intent: null, // Will be updated when payment completes
                status: 'pending'
            });
        } catch (err) {
            console.error('Could not create pending transaction record:', err);
            // Don't fail the checkout creation if transaction record creation fails
        }

        return json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
        return json({ 
            error: errorMessage
        }, { status: 500 });
    }
}
