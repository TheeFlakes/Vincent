# Stripe Checkout Integration Setup Guide

This guide explains how to set up Stripe Checkout for course payments in your application.

## Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Stripe Dashboard Access**: You'll need access to your Stripe Dashboard

## Environment Variables Setup

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Getting Your Stripe Keys

1. **Log into Stripe Dashboard**: Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Get API Keys**:
   - Go to "Developers" → "API keys"
   - Copy your "Publishable key" (starts with `pk_test_`)
   - Copy your "Secret key" (starts with `sk_test_`)

3. **Set up Webhook Endpoint**:
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `checkout.session.expired`
   - Copy the webhook signing secret (starts with `whsec_`)

## How the Integration Works

### 1. Checkout Flow
- User selects a course and payment plan
- Frontend calls `/api/stripe/create-checkout-session`
- Server creates a Stripe Checkout Session
- User is redirected to Stripe's hosted checkout page
- User completes payment on Stripe
- User is redirected back to your site

### 2. Payment Fulfillment
- Stripe sends a webhook to `/api/stripe/webhook`
- Server verifies webhook signature
- On `checkout.session.completed`, server:
  - Creates user enrollment record
  - Optionally creates payment record
  - User gains access to the course

### 3. Payment Plans Supported
- **One-time Payment**: Full course access with single payment
- **Subscription**: Recurring payments (can be used for installments)

## Features Included

### Built-in Stripe Checkout Features
- ✅ Support for 40+ payment methods including:
  - Credit/Debit cards
  - Apple Pay & Google Pay
  - Link (saves payment methods)
  - Bank transfers (depending on region)
- ✅ Mobile-responsive design
- ✅ SCA (Strong Customer Authentication) compliance
- ✅ Automatic card validation
- ✅ Error handling and messaging
- ✅ PCI compliance (handled by Stripe)
- ✅ Fraud prevention
- ✅ Automatic tax calculation (if configured)
- ✅ Promotional codes support
- ✅ Custom branding options

### Custom Features Added
- ✅ Course-specific pricing
- ✅ Dynamic price calculation
- ✅ User enrollment automation
- ✅ Payment verification
- ✅ Progress tracking integration
- ✅ Success/failure handling

## File Structure

```
src/
├── lib/
│   ├── stripe.js                    # Server-side Stripe configuration
│   └── stripe-client.js             # Client-side Stripe utilities
├── routes/
│   ├── api/stripe/
│   │   ├── create-checkout-session/
│   │   │   └── +server.js           # Creates Stripe Checkout sessions
│   │   ├── webhook/
│   │   │   └── +server.js           # Handles Stripe webhooks
│   │   └── verify-session/
│   │       └── +server.js           # Verifies completed sessions
│   └── (protected)/dashboard/courses/[id]/
│       └── checkout/
│           ├── +page.server.js      # Checkout page server logic
│           └── +page.svelte         # Checkout page UI
```

## Testing the Integration

### 1. Test Cards
Use these test card numbers in development:

- **Successful payment**: `4242424242424242`
- **Declined payment**: `4000000000000002`
- **Authentication required**: `4000002500003155`

### 2. Test the Flow
1. Create a test course with a price
2. Navigate to the course page
3. Click "Purchase Course"
4. Use a test card to complete payment
5. Verify enrollment is created automatically

### 3. Test Webhooks
1. Use Stripe CLI to forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:5173/api/stripe/webhook
   ```
2. Complete a test payment
3. Check server logs for webhook processing

## Production Deployment

### 1. Switch to Live Mode
- Replace test keys with live keys (start with `pk_live_` and `sk_live_`)
- Update webhook endpoint to production URL
- Test with real payment methods

### 2. Security Considerations
- Keep secret keys secure (never expose in frontend)
- Verify webhook signatures
- Use HTTPS for all endpoints
- Validate user permissions

### 3. Monitoring
- Monitor webhooks in Stripe Dashboard
- Set up alerts for failed payments
- Track conversion rates and abandoned carts

## Customization Options

### 1. Branding
- Configure colors, fonts, and logos in Stripe Dashboard
- Use custom domains for checkout pages

### 2. Payment Methods
- Enable/disable specific payment methods
- Configure regional payment methods

### 3. Pricing
- Add promotional codes
- Set up dynamic pricing based on location
- Configure automatic tax collection

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check webhook URL is accessible
   - Verify SSL certificate is valid
   - Check webhook secret is correct

2. **Payment succeeds but enrollment fails**:
   - Check PocketBase connection
   - Verify user_progress collection exists
   - Check server logs for errors

3. **Redirect URL not working**:
   - Verify success_url and cancel_url are correct
   - Check domain matches registered domains

### Debug Tips
- Use Stripe Dashboard logs to see all events
- Enable detailed logging in webhook handler
- Test with Stripe CLI for local development

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available through Dashboard
- **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)
