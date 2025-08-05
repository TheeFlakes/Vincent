// Test different currencies with Paystack
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

async function testCurrencies() {
    console.log('🧪 Testing different currencies with Paystack...\n');

    const currencies = ['NGN', 'USD', 'GHS', 'ZAR', 'KES'];
    
    for (const currency of currencies) {
        try {
            console.log(`Testing ${currency}...`);
            const result = await paystack.transaction.initialize({
                email: 'test@example.com',
                amount: currency === 'NGN' ? 100000 : (currency === 'USD' ? 10000 : 100000), // Adjust amounts
                reference: `test_${currency}_${Date.now()}`,
                currency: currency,
                name: 'Test User'
            });
            
            if (result.status) {
                console.log(`✅ ${currency} - SUPPORTED`);
            } else {
                console.log(`❌ ${currency} - NOT SUPPORTED: ${result.message}`);
            }
        } catch (error) {
            console.log(`❌ ${currency} - ERROR: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test without currency (should use account default)
    try {
        console.log('\nTesting without currency (account default)...');
        const result = await paystack.transaction.initialize({
            email: 'test@example.com',
            amount: 100000,
            reference: `test_default_${Date.now()}`,
            name: 'Test User'
        });
        
        if (result.status) {
            console.log(`✅ Default currency - SUPPORTED`);
            console.log(`   Currency used: ${result.data.currency || 'Not specified'}`);
        } else {
            console.log(`❌ Default currency - NOT SUPPORTED: ${result.message}`);
        }
    } catch (error) {
        console.log(`❌ Default currency - ERROR: ${error.message}`);
    }
}

testCurrencies();
