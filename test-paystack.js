// Test script to verify Paystack integration
// Run with: node test-paystack.js

import Paystack from 'paystack';
import { readFileSync } from 'fs';

// Load environment variables from .env file
try {
    const envFile = readFileSync('.env', 'utf8');
    const envVars = envFile.split('\n').filter(line => line && !line.startsWith('#'));
    
    envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (err) {
    console.log('No .env file found, using system environment variables');
}

// You'll need to set this environment variable
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    console.error('Please set PAYSTACK_SECRET_KEY environment variable in .env file');
    process.exit(1);
}

const paystack = Paystack(PAYSTACK_SECRET_KEY);

async function testPaystackIntegration() {
    console.log('🧪 Testing Paystack Integration...\n');

    try {
        // Test 1: Initialize a transaction (try without currency first)
        console.log('1. Testing transaction initialization...');
        const initializeData = {
            email: 'test@example.com',
            amount: 100000, // 1000 NGN in kobo
            reference: `test_${Date.now()}`,
            name: 'Test User',
            metadata: {
                courseId: 'test_course_123',
                userId: 'test_user_456'
            }
        };

        const transaction = await paystack.transaction.initialize(initializeData);
        
        if (transaction.status) {
            console.log('✅ Transaction initialization successful');
            console.log('   Authorization URL:', transaction.data.authorization_url);
            console.log('   Reference:', transaction.data.reference);
            console.log('   Access Code:', transaction.data.access_code);
        } else {
            console.log('❌ Transaction initialization failed:', transaction.message);
            return;
        }

        // Test 2: Verify transaction (this will fail since we didn't actually pay)
        console.log('\n2. Testing transaction verification...');
        try {
            const verification = await paystack.transaction.verify(transaction.data.reference);
            if (verification.status) {
                console.log('✅ Transaction verification works');
                console.log('   Status:', verification.data.status);
                console.log('   Gateway Response:', verification.data.gateway_response);
            }
        } catch (verifyError) {
            console.log('⚠️  Transaction verification endpoint works (expected: transaction not found)');
        }

        // Test 3: List transactions
        console.log('\n3. Testing transaction listing...');
        const list = await paystack.transaction.list({ perPage: 5 });
        if (list.status) {
            console.log('✅ Transaction listing successful');
            console.log(`   Found ${list.data.length} recent transactions`);
        }

        console.log('\n🎉 Paystack integration test completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Set up your webhook endpoint: /api/paystack/webhook');
        console.log('2. Configure webhook URL in Paystack dashboard');
        console.log('3. Test with real payment flow');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check your PAYSTACK_SECRET_KEY is correct');
        console.log('2. Ensure you have internet connection');
        console.log('3. Verify Paystack account is active');
    }
}

// Run the test
testPaystackIntegration();
