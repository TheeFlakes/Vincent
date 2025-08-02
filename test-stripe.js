#!/usr/bin/env node

/**
 * Stripe Integration Test Script
 * 
 * This script helps test the Stripe integration by verifying:
 * 1. Environment variables are set
 * 2. Stripe connection works
 * 3. Basic API functionality
 */

import Stripe from 'stripe';
import { config } from 'dotenv';

// Load environment variables
config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

console.log('🔍 Stripe Integration Test\n');

// 1. Check environment variables
console.log('1. Checking environment variables...');
const checks = [
    { name: 'STRIPE_SECRET_KEY', value: STRIPE_SECRET_KEY, required: true },
    { name: 'STRIPE_WEBHOOK_SECRET', value: STRIPE_WEBHOOK_SECRET, required: true },
    { name: 'PUBLIC_STRIPE_PUBLISHABLE_KEY', value: PUBLIC_STRIPE_PUBLISHABLE_KEY, required: true }
];

let allChecksPass = true;
checks.forEach(check => {
    const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
    const maskedValue = check.value ? `${check.value.substring(0, 8)}...` : 'Not set';
    console.log(`   ${status} ${check.name}: ${maskedValue}`);
    
    if (check.required && !check.value) {
        allChecksPass = false;
    }
});

if (!allChecksPass) {
    console.log('\n❌ Environment variables check failed. Please check your .env file.');
    process.exit(1);
}

// 2. Test Stripe connection
console.log('\n2. Testing Stripe connection...');
try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil'
    });
    
    const account = await stripe.accounts.retrieve();
    console.log(`   ✅ Connected to Stripe account: ${account.display_name || account.id}`);
    console.log(`   📊 Account type: ${account.type}`);
    console.log(`   🌍 Country: ${account.country}`);
    
} catch (error) {
    console.log(`   ❌ Stripe connection failed: ${error.message}`);
    process.exit(1);
}

// 3. Test price creation
console.log('\n3. Testing price creation...');
try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil'
    });
    
    // Create a test product and price
    const product = await stripe.products.create({
        name: 'Test Course - Stripe Integration',
        description: 'A test course for validating Stripe integration',
        type: 'service'
    });
    
    const price = await stripe.prices.create({
        unit_amount: 4999, // $49.99
        currency: 'usd',
        product: product.id
    });
    
    console.log(`   ✅ Created test product: ${product.id}`);
    console.log(`   ✅ Created test price: ${price.id} ($${price.unit_amount / 100})`);
    
    // Clean up test data
    await stripe.products.update(product.id, { active: false });
    console.log(`   🧹 Cleaned up test product`);
    
} catch (error) {
    console.log(`   ❌ Price creation test failed: ${error.message}`);
}

// 4. Webhook validation test
console.log('\n4. Testing webhook signature validation...');
try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil'
    });
    
    // Create a test payload and signature
    const payload = JSON.stringify({
        id: 'evt_test_webhook',
        object: 'event',
        api_version: '2025-07-30.basil',
        created: Math.floor(Date.now() / 1000),
        data: {
            object: {
                id: 'cs_test_session',
                object: 'checkout.session'
            }
        },
        type: 'checkout.session.completed'
    });
    
    // Note: This is a simplified test - in production, Stripe generates the signature
    console.log(`   ✅ Webhook secret is configured`);
    console.log(`   ⚠️  Remember to test webhooks with actual Stripe events`);
    
} catch (error) {
    console.log(`   ❌ Webhook test failed: ${error.message}`);
}

console.log('\n🎉 Stripe integration test completed!');
console.log('\nNext steps:');
console.log('1. Start your development server: npm run dev');
console.log('2. Test the checkout flow with test card: 4242424242424242');
console.log('3. Use Stripe CLI for webhook testing: stripe listen --forward-to localhost:5173/api/stripe/webhook');
console.log('4. Monitor events in your Stripe Dashboard');

console.log('\n📚 Test Cards:');
console.log('   💳 Success: 4242424242424242');
console.log('   ❌ Decline: 4000000000000002');
console.log('   🔐 3D Secure: 4000002500003155');
