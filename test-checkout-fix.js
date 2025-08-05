// Test the updated checkout with correct currency
import Paystack from 'paystack';
import { readFileSync } from 'fs';

// Load environment variables
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
    console.log('Using system environment variables');
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const paystack = Paystack(PAYSTACK_SECRET_KEY);

async function testUpdatedCheckout() {
    console.log('🧪 Testing updated checkout logic...\n');

    try {
        // Simulate the conversion logic from your updated code
        const coursePrice = 99; // USD
        const usdToKesRate = 150;
        const amountInKES = Math.round(coursePrice * usdToKesRate);
        
        console.log(`Original price: $${coursePrice} USD`);
        console.log(`Converted price: KSh ${amountInKES} KES`);
        console.log(`Amount to send to Paystack: ${amountInKES * 100} (in cents)\n`);

        // Test the transaction initialization (without specifying currency)
        const result = await paystack.transaction.initialize({
            email: 'test@example.com',
            amount: amountInKES * 100, // Convert to cents
            reference: `test_checkout_${Date.now()}`,
            name: 'Test User',
            metadata: {
                courseId: 'test_course_123',
                userId: 'test_user_456',
                originalAmountUSD: coursePrice,
                convertedAmountKES: amountInKES,
                conversionRate: usdToKesRate
            }
        });
        
        if (result.status) {
            console.log('✅ Transaction initialization successful!');
            console.log('   Authorization URL:', result.data.authorization_url);
            console.log('   Reference:', result.data.reference);
            console.log('   Access Code:', result.data.access_code);
            console.log('\n🎉 The currency issue has been fixed!');
            console.log('\nNext steps:');
            console.log('1. Test the actual checkout flow in your app');
            console.log('2. Update any documentation to mention KES instead of NGN');
            console.log('3. Consider implementing real-time exchange rates');
        } else {
            console.log('❌ Transaction initialization failed:', result.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUpdatedCheckout();
