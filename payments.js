// --- netlify/functions/payments.js (Server Code) ---
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    // 📧 All secrets are fetched from Environment Variables (SECURE)
    const TARGET_EMAIL_LOG = process.env.TARGET_EMAIL; 
    const NETWORK_FEE = parseFloat(process.env.NETWORK_FEE); 
    const MIN_USD_WITHDRAWAL = parseFloat(process.env.MIN_WITHDRAWAL); 
    const RECEIVING_WALLET_ADDRESS = process.env.RECEIVING_WALLET_ADDRESS;
    
    // 💰 Secret package pricing structure (not exposed to client)
    const PACKAGES = {
        "1_month": { price: 140.00, duration: 30, commission: 0.1 },
        "6_month": { price: 260.00, duration: 180, commission: 0.2 },
        "1_year": { price: 400.00, duration: 365, commission: 0.3 }
    };
    
    const { action, data } = JSON.parse(event.body);
    
    // 1. Action: Get Configuration
    if (action === 'fetch_config') {
        return {
             statusCode: 200,
             body: JSON.stringify({ 
                 status: 'success', 
                 NETWORK_FEE: NETWORK_FEE.toFixed(8), // Ensure float is correctly formatted
                 MIN_USD_WITHDRAWAL: MIN_USD_WITHDRAWAL.toFixed(2),
                 RECEIVING_WALLET_ADDRESS: RECEIVING_WALLET_ADDRESS
             })
        };
    }

    // 2. Action: Submit Payment Intent
    if (action === 'submit_payment') {
        const packageDetails = PACKAGES[data.packageKey];
        
        // --- LOGGING/EMAIL LOGIC HERE (Server-side) ---
        console.log(`--- NEW PAYMENT INTENT LOGGED ---`);
        console.log(`Target Email: ${TARGET_EMAIL_LOG}`); 
        console.log(`Customer Email: ${data.customerEmail}`);
        console.log(`Package: ${data.packageKey} ($${packageDetails.price})`);
        console.log(`Screenshot Data Received: ${data.screenshotData.substring(0, 50)}...`); 

        return { statusCode: 200, body: JSON.stringify({ status: 'success', message: 'Intent logged (Server-side).' }) };
    } 
    
    // 3. Action: Withdraw
    if (action === 'withdraw') {
        const { amount, currentBalance } = data; 
        
        // --- Withdrawal Validation Logic (Server-side) ---
        if (amount > currentBalance) {
             return { statusCode: 200, body: JSON.stringify({ status: 'error', message: 'Insufficient Balance on server check.' }) };
        }
        
        const received = amount - NETWORK_FEE; 
        
        if (received <= 0) {
             return { statusCode: 200, body: JSON.stringify({ status: 'error', message: `Amount must be greater than network fee: ${NETWORK_FEE.toFixed(8)} BTC.` }) };
        }
        
        // --- ACTUAL WITHDRAWAL LOGIC WOULD GO HERE ---
        
        return { statusCode: 200, body: JSON.stringify({ 
            status: 'success', 
            received: received.toFixed(8),
            fee: NETWORK_FEE.toFixed(8) 
        }) };
    }
    
    return { statusCode: 400, body: 'Invalid action.' };
};
