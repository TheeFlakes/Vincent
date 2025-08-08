import { error, json } from '@sveltejs/kit';

/**
 * Generic handler function to proxy requests to PocketBase
 * @param {Request} request - The original request
 * @param {string} path - The path to forward to PocketBase
 * @returns {Promise<Response>} The response from PocketBase
 */
async function handleRequest(request, path) {
    // The actual PocketBase URL
    const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://vin254.pockethost.io';
    
    // Special handling for login requests
    if (path === 'login') {
        path = 'api/collections/users/auth-with-password';
    }
    
    const url = `${POCKETBASE_URL}/${path}`;
    
    // Get query parameters and add them to the URL
    const requestUrl = new URL(request.url);
    const targetUrl = new URL(url);
    requestUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });
    
    console.log(`Proxying ${request.method} request to: ${targetUrl}`);
    
    try {
        // Clone the request headers
        const headers = new Headers();
        
        // Copy specific headers we want to forward
        for (const [key, value] of request.headers.entries()) {
            // Skip headers that should be set by the proxy
            if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
                headers.set(key, value);
            }
        }
        
        // Set origin to match our server
        headers.set('Origin', 'https://cashfluenced.org');
        headers.set('X-Requested-With', 'XMLHttpRequest');
        headers.set('Cache-Control', 'no-cache');
        
        // Get the request body for non-GET requests
        let body = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
            try {
                // Try to get the body as text first
                body = await request.text();
                
                // If the content type is JSON, parse and stringify it to ensure valid JSON
                const contentType = request.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const jsonBody = JSON.parse(body);
                        body = JSON.stringify(jsonBody);
                    } catch (e) {
                        console.warn('Failed to parse JSON body, using as-is:', e);
                    }
                }
            } catch (e) {
                console.warn('Failed to read request body:', e);
                // Fallback to blob if text parsing fails
                body = await request.clone().blob();
            }
        }
        
        // Forward the request to PocketBase
        const pbResponse = await fetch(targetUrl.toString(), {
            method: request.method,
            headers: headers,
            body: body,
            redirect: 'follow',
            mode: 'cors',
            credentials: 'include'
        });
        
        // Clone the response headers
        const responseHeaders = new Headers(pbResponse.headers);
        
        // Set CORS headers for our frontend
        const origin = request.headers.get('Origin');
        if (origin) {
            responseHeaders.set('Access-Control-Allow-Origin', origin);
        } else {
            responseHeaders.set('Access-Control-Allow-Origin', '*');
        }
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        responseHeaders.set('Access-Control-Allow-Credentials', 'true');
        
        // Return the response with the appropriate status code and headers
        return new Response(pbResponse.body, {
            status: pbResponse.status,
            statusText: pbResponse.statusText,
            headers: responseHeaders
        });
    } catch (err) {
        console.error('Proxy request failed:', err);
        throw error(500, 'Failed to proxy request to PocketBase: ' + 
            (err instanceof Error ? err.message : String(err)));
    }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS({ request, params }) {
    const origin = request.headers.get('Origin');
    const headers = new Headers({
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400' // 24 hours
    });
    
    if (origin) {
        headers.set('Access-Control-Allow-Origin', origin);
    } else {
        headers.set('Access-Control-Allow-Origin', '*');
    }
    
    return new Response(null, {
        status: 204,
        headers
    });
}

/**
 * Handle GET requests
 */
export async function GET({ request, params }) {
    return handleRequest(request, params.path);
}

/**
 * Handle POST requests
 */
export async function POST({ request, params }) {
    return handleRequest(request, params.path);
}

/**
 * Handle PUT requests
 */
export async function PUT({ request, params }) {
    return handleRequest(request, params.path);
}

/**
 * Handle PATCH requests
 */
export async function PATCH({ request, params }) {
    return handleRequest(request, params.path);
}

/**
 * Handle DELETE requests
 */
export async function DELETE({ request, params }) {
    return handleRequest(request, params.path);
}
