// --- netlify/functions/license.js (Server Code) ---
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    // 🔑 The secret URL is fetched from Netlify Environment Variables (SECURE)
    const REMOTE_KEY_URL = process.env.SECRET_KEY_URL; 
    
    if (!REMOTE_KEY_URL) return { statusCode: 500, body: 'Configuration error: SECRET_KEY_URL missing.' };

    try {
        const { key, deviceID } = JSON.parse(event.body);
        
        // Fetch the key list from the hidden URL
        const keyResponse = await fetch(REMOTE_KEY_URL);
        const keyList = await keyResponse.text();
        const validKeys = keyList.split('\n').map(k => k.trim().toUpperCase()).filter(Boolean);

        if (validKeys.includes(key)) {
            return {
                statusCode: 200,
                body: JSON.stringify({ valid: true, message: "License approved." }),
            };
        } else {
            return { statusCode: 200, body: JSON.stringify({ valid: false, message: "Invalid key." }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ valid: false, message: 'Server error during validation.' }) };
    }
};
