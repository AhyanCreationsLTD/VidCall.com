// ==========================================
// REAL TELEGRAM AUTHENTICATION & REGISTRATION
// ==========================================

// টেলিগ্রাম বট কনফিগারেশন
const TG_BOT_TOKEN = '8707996751:AAFTmG8-A4bTP2SOIfYr4xG04wSTjOJVe2U';
const TG_CHANNEL_ID = '-1003936338535';

// প্রাইভেট চ্যানেলে নোটিফিকেশন পাঠানোর ফাংশন
async function sendTelegramChannelNotification(user) {
    if (!TG_BOT_TOKEN) return;

    const message = `🔔 **নতুন ইউজার রেজিস্ট্রেশন সফল!**\n\n` +
                    `👤 **নাম:** ${user.name}\n` +
                    `💬 **টেলিগ্রাম:** ${user.username}\n` +
                    `🆔 **আইডি:** \`${user.telegram_id}\`\n` +
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

// ১. টেলিগ্রাম ওয়েব অ্যাপ থেকে সরাসরি নাম, আইডি, ইউজারনেম ও পিক লিংক নিয়ে রেজিস্ট্রেশন
window.sendRegisterCode = async function() {
    const tg = window.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    // যদি টেলিগ্রাম অ্যাপের বাইরে ওপেন করা হয়
    if (!tgUser || !tgUser.id) {
        alert("দয়া করে টেলিগ্রাম বট বা টেলিগ্রাম অ্যাপের ভেতর থেকে এই লিংকে প্রবেশ করুন, যাতে আপনার টেলিগ্রাম আইডি ও তথ্য স্বয়ংক্রিয়ভাবে নেওয়া যায়।");
        return;
    }

    const telegramId = tgUser.id;
    const firstName = tgUser.first_name || '';
    const lastName = tgUser.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Telegram User';
    const username = tgUser.username ? `@${tgUser.username}` : `@id_${telegramId}`;
    const picLink = tgUser.photo_url || ''; // টেলিগ্রাম প্রোফাইল পিকচার লিংক

    // ফর্ম থেকে রোল ও রেট নেওয়া (যদি ক্রিয়েটর বা সাধারণ ইউজার সিলেক্ট করার অপশন থাকে)
    const roleElement = document.getElementById('regRole');
    const rateElement = document.getElementById('regRate');
    const role = roleElement ? roleElement.value : 'user';
    const rate = rateElement ? rateElement.value : '0';

    // ইউজার ইতিমধ্যে ডাটাবেজে আছে কিনা টেলিগ্রাম আইডি দিয়ে চেক করা
    const { data: existingUser } = await window.supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_id', telegramId)
        .single();

    if (existingUser) {
        alert("এই টেলিগ্রাম অ্যাকাউন্ট দিয়ে ইতিমধ্যে রেজিস্ট্রেশন করা আছে। স্বয়ংক্রিয়ভাবে লগইন করা হচ্ছে...");
        await window.loginWithTelegramId(telegramId);
        return;
    }

    const newUserData = {
        telegram_id: telegramId,
        name: fullName,
        username: username,
        pic_link: picLink, // প্রোফাইল পিকচার লিংক ডাটাবেজে সেভ হবে
        role,
        rate: role === 'creator' ? parseInt(rate) : 0,
        balance: 0,
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

// টেলিগ্রাম আইডি দিয়ে লগইন করার সাব-ফাংশন
window.loginWithTelegramId = async function(telegramId) {
    const { data, error } = await window.supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

    if (error || !data) {
        alert("এই টেলিগ্রাম অ্যাকাউন্টে কোনো রেজিস্ট্রেশন পাওয়া যায়নি। আগে অ্যাকাউন্ট তৈরি করুন।");
        window.showPage('registerPage');
        return;
    }

    if (data.status === 'blocked' || data.status === 'banned') {
        alert("আপনার অ্যাকাউন্টটি ব্লক বা ব্যান করা হয়েছে।");
        return;
    }

    window.appState.currentUser = data;
    window.appState.currentBalance = data.balance;

    localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
    localStorage.setItem('callpay_balance', window.appState.currentBalance);
    
    window.updateUIState();

    if (data.is_admin === true) {
        alert("এডমিন লগইন সফল হয়েছে!");
        window.location.href = 'vondo/nothing/7a2d3.html';
    } else {
        alert("সফলভাবে লগইন হয়েছে!");
        window.showPage('indexPage');
    }
}

// ৩. টেলিগ্রাম অটো লগইন বা বাটন ক্লিক লগইন
window.sendLoginCode = async function() {
    const tg = window.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser && tgUser.id) {
        await window.loginWithTelegramId(tgUser.id);
    } else {
        // যদি ব্রাউজার থেকে ইউজারনেম দিয়ে লগইন করতে চায়
        const telegramInput = document.getElementById('loginUsername')?.value.trim();
        if (!telegramInput) {
            alert("দয়া করে টেলিগ্রাম অ্যাপের ভেতর থেকে প্রবেশ করুন অথবা ইউজারনেম দিন।");
            return;
        }

        const formattedTelegram = telegramInput.startsWith('@') ? telegramInput : `@${telegramInput}`;

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

        window.appState.currentUser = data;
        window.appState.currentBalance = data.balance;
        localStorage.setItem('callpay_user', JSON.stringify(data));
        localStorage.setItem('callpay_balance', data.balance);
        window.updateUIState();
        window.showPage('indexPage');
    }
}

window.verifyAndLogin = function() {
    window.sendLoginCode();
}

window.verifyAndRegister = function() {
    // ডাইরেক্ট টেলিগ্রাম ওয়েব অ্যাপ থেকে রেজিস্ট্রেশন হওয়ায় এটি ফাকা রাখা হয়েছে
}

// ৫. লগআউট সিস্টেম
window.logout = function() {
    localStorage.clear();
    window.appState.currentUser = null;
    alert("লগআউট করা হয়েছে।");
    window.updateUIState();
    window.showPage('indexPage');
    }
    
