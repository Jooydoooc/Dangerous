// No need to require node-fetch in Node.js 18+ as it's built-in

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, studentName, score, total } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Replace with your actual Telegram bot token and chat ID
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID';

        if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID') {
            console.log('Telegram credentials not configured, but test would work');
            return res.status(200).json({ 
                success: true, 
                message: 'Test mode: Results would be sent to Telegram with proper configuration',
                demo: true
            });
        }

        const telegramMessage = `
📝 *Passive Voice Test Result*

*Student:* ${studentName}
*Score:* ${score}/${total} (${((score/total)*100).toFixed(1)}%)

${message}
        `.trim();

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ 
                error: 'Failed to send message to Telegram',
                details: data.description 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Results sent to Telegram successfully' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};
