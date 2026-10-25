// ==========================================
// REAL AUTHENTICATION & REGISTRATION LOGIC
// ==========================================

// টেলিগ্রাম বট কনফিগারেশন (আপনার বটের টোকেন এবং চ্যানেল আইডি এখানে বসাবেন)
const TG_BOT_TOKEN = '8707996751:AAFTmG8-A4bTP2SOIfYr4xG04wSTjOJVe2U';
const TG_CHANNEL_ID = '-1003936338535'; // যেমন: -100xxxxxxxxxx অথবা @channelusername

// প্রাইভেট চ্যানেলে নোটিফিকেশন পাঠানোর ফাংশন
async function sendTelegramChannelNotification(user) {
    if (!TG_BOT_TOKEN || TG_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') return;

    const message = `🔔 **নতুন ইউজার রেজিস্ট্রেশন সফল!**\n\n` +
                    `👤 **নাম:** ${user.name}\n` +
                    `💬 **টেলিগ্রাম:** ${user.username}\n` +
                    `📌 **রোল:** ${user.role === 'creator' ? 'ক্রিয়েটর / হোস্ট' : 'সাধারণ ইউজার'}\n` +
                    (user.role === 'creator' ? `💰 **রেট:** ৳${user.rate}/মিনিট\n` : '') +
                    `💳 **ব্যালেন্স:** ৳${user.balance}\n` +
                    `⏰ **সময়:** ${new Date().toLocaleString()}`;

    try {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHANNEL_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    } catch (err) {
        console.error("Telegram Notification Error:", err);
    }
}

// ১. সরাসরি রিয়েল রেজিস্ট্রেশন এবং টেলিগ্রাম চ্যানেলে পোস্ট
window.sendRegisterCode = async function() {
    const name = document.getElementById('regName').value.trim();
    const telegram = document.getElementById('regTelegram').value.trim();
    const role = document.getElementById('regRole').value;
    const rate = document.getElementById('regRate').value;

    if (!name || !telegram) {
        alert("দয়া করে আপনার নাম এবং টেলিগ্রাম ইউজারনেম দিন।");
        return;
    }

    const formattedTelegram = telegram.startsWith('@') ? telegram : `@${telegram}`;

    // ইউজার ইতিমধ্যে আছে কিনা চেক করা
    const { data: existingUser } = await window.supabase
        .from('users')
        .select('username')
        .eq('username', formattedTelegram)
        .single();

    if (existingUser) {
        alert("এই টেলিগ্রাম ইউজারনেম দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।");
        window.showPage('loginPage');
        return;
    }

    const newUserData = {
        telegram_id: Date.now(),
        name,
        username: formattedTelegram,
        role,
        rate: role === 'creator' ? parseInt(rate) : 0,
        balance: 0, // নতুন অ্যাকাউন্টের ব্যালেন্স ০
        status: role === 'creator' ? 'pending' : 'approved',
        is_verified: false,
        is_admin: false
    };

    const { error } = await window.supabase.from('users').insert([newUserData]);

    if (error) {
        alert("রেজিস্ট্রেশনে সমস্যা হয়েছে: " + error.message);
        return;
    }

    // সফলভাবে রেজিস্টার হওয়ার পর টেলিগ্রাম চ্যানেলে নোটিফিকেশন পাঠানো
    await sendTelegramChannelNotification(newUserData);

    window.appState.currentUser = newUserData;
    window.appState.currentBalance = newUserData.balance;
    
    localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
    localStorage.setItem('callpay_balance', window.appState.currentBalance);
    
    alert("অভিনন্দন! সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে।");
    
    window.updateUIState();
    window.showPage('indexPage');
}

window.verifyAndRegister = async function() {
    // ডাইরেক্ট রেজিস্ট্রেশন হয়ে যাওয়ায় এটি খালি রাখা হলো
}

window.sendLoginCode = function() {
    window.verifyAndLogin();
}

// ২. রিয়েল লগইন এবং এডমিন রিডাইরেক্ট সিস্টেম
window.verifyAndLogin = async function() {
    const telegramInput = document.getElementById('loginUsername').value.trim();
    if (!telegramInput) {
        alert("দয়া করে টেলিগ্রাম ইউজারনেম দিন।");
        return;
    }

    const formattedTelegram = telegramInput.startsWith('@') ? telegramInput : `@${telegramInput}`;

    // Supabase থেকে ইউজার ডেটা ফেচ করা
    const { data, error } = await window.supabase
        .from('users')
        .select('*')
        .eq('username', formattedTelegram)
        .single();

    if (error || !data) {
        alert("কোনো অ্যাকাউন্ট পাওয়া যায়নি। আগে রেজিস্ট্রেশন করুন।");
        window.showPage('registerPage');
        return;
    }

    if (data.status === 'blocked' || data.status === 'banned') {
        alert("আপনার অ্যাকাউন্টটি ব্লক/ব্যান করা হয়েছে।");
        return;
    }

    window.appState.currentUser = data;
    window.appState.currentBalance = data.balance;

    localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
    localStorage.setItem('callpay_balance', window.appState.currentBalance);
    
    window.updateUIState();

    // ৩. এডমিন নাকি সাধারণ ইউজার চেক করে রিডাইরেক্ট করা
    if (data.is_admin === true) {
        alert("এডমিন লগইন সফল হয়েছে! এডমিন প্যানেলে নিয়ে যাওয়া হচ্ছে...");
        window.location.href = 'vondo/nothing/7a2d3.html';
    } else {
        alert("সফলভাবে লগইন হয়েছে!");
        window.showPage('indexPage');
    }
}

// ৪. লগআউট সিস্টেম
window.logout = function() {
    localStorage.clear();
    window.appState.currentUser = null;
    alert("লগআউট করা হয়েছে।");
    window.updateUIState();
    window.showPage('indexPage');
    }
