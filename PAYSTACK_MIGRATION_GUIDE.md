# Stripe to Paystack Migration Guide

## Overview
This document outlines the migration from Stripe to Paystack for payment processing in the Vincent application.

## What Changed

### 1. Payment Processing
- **Before**: Stripe Checkout Sessions
- **After**: Paystack Transaction Initialization
- **Currency**: Changed from USD to NGN (Nigerian Naira) with automatic conversion

### 2. New Files Added
- `src/lib/paystack.js` - Paystack server configuration
- `src/lib/paystack-client.js` - Paystack client functions
- `src/routes/api/paystack/create-checkout-session/+server.js` - Create Paystack transactions
- `src/routes/api/paystack/verify-transaction/+server.js` - Verify Paystack payments
- `src/routes/api/paystack/webhook/+server.js` - Handle Paystack webhooks

### 3. Updated Files
- `src/routes/(protected)/dashboard/courses/[id]/+page.svelte` - Updated checkout flow
- `src/routes/(protected)/dashboard/courses/[id]/+page.server.js` - Added Paystack reference support
- `src/routes/(admin)/admin/transactions/+page.svelte` - Display both Stripe and Paystack transactions

### 4. Database Changes
New fields added to the `transactions` collection:
- `paystack_reference` - Paystack transaction reference
- `paystack_access_code` - Paystack access code
- `paystack_charge_id` - Paystack charge ID
- `gateway_response` - Gateway response message
- `paid_at` - Payment completion timestamp

## Environment Variables Setup

Add these to your `.env` file:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here  
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret_here
```

## Currency Conversion

The system automatically converts USD prices to NGN using a fixed rate (1 USD = 1600 NGN). For production, consider:

1. Using a real-time currency conversion API
2. Allowing users to select their preferred currency
3. Storing original and converted amounts

## Testing

### Test Cards for Paystack
- **Successful payment**: 4084084084084081
- **Insufficient funds**: 4084084084084081 (amount > 300000)
- **Invalid card**: 4084084084084082

### Webhook Testing
Use Paystack's webhook testing tool or ngrok for local development:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 5173

# Use the HTTPS URL for webhook endpoint:
# https://your-ngrok-url.ngrok.io/api/paystack/webhook
```

## Migration Steps

1. **Update Environment Variables**
   - Add Paystack keys to your environment
   - Keep Stripe keys for transition period

2. **Update Database Schema**
   - Add new Paystack fields to transactions collection
   - Existing transactions remain unchanged

3. **Deploy Changes**
   - Deploy the updated application
   - Configure Paystack webhook endpoint

4. **Update Paystack Dashboard**
   - Set webhook URL: `https://yourdomain.com/api/paystack/webhook`
   - Enable these events: `charge.success`, `charge.failed`

5. **Test Payment Flow**
   - Test with Paystack test cards
   - Verify webhook delivery
   - Check transaction records

## Rollback Plan

If issues occur, the system supports both Stripe and Paystack:

1. **Immediate**: Update frontend to use Stripe checkout again
2. **Database**: Both payment systems store in same transactions table
3. **Gradual**: Process new payments with Stripe while fixing Paystack issues

## Support

### Paystack Resources
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Node.js SDK](https://github.com/PaystackOSS/paystack-node)
- [Paystack Dashboard](https://dashboard.paystack.com)

### Support Contacts
- Paystack Support: support@paystack.com
- Developer Documentation: https://paystack.com/docs

## Performance Notes

- Paystack transactions are faster than Stripe for Nigerian customers
- Local payment methods (bank transfers, USSD) are supported
- Better success rates for NGN transactions
- Lower transaction fees for local payments

## Security Considerations

- Webhook signature verification is implemented
- All sensitive operations happen server-side
- Paystack keys are properly secured in environment variables
- Transaction records include full audit trail
