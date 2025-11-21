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
        const { message, studentName, score, total, answers } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get Telegram credentials from environment variables
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // Check if credentials are configured
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.log('Telegram credentials not configured');
            return res.status(200).json({ 
                success: true, 
                message: 'Test completed (Telegram not configured)',
                demo: true
            });
        }

        // Format the message for Telegram
        const telegramMessage = `
📝 *Passive Voice Test Result*

*Student:* ${studentName}
*Score:* ${score}/${total} (${((score/total)*100).toFixed(1)}%)

*Detailed Results:*

${answers.map((answer, index) => {
    const status = answer.isCorrect ? '✅' : '❌';
    return `${status} *Q${index + 1}:* ${answer.tense}\n   Student: ${answer.selected}\n   Correct: ${answer.correct}`;
}).join('\n\n')}
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
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ 
                success: false,
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
            success: false,
            error: 'Internal server error',
            details: error.message 
        });
    }
};
