// ==========================================
// WALLET & CALL REQUEST LOGIC
// ==========================================

// ১. টেলিগ্রাম কল রিকোয়েস্ট এবং প্রতি মিনিটের রেট অনুযায়ী ব্যালেন্স কাটা
window.handleCallRequest = async function(creatorUsername, ratePerMinute) {
    if (!window.appState.currentUser) {
        alert("কল করতে হলে প্রথমে অ্যাকাউন্ট তৈরি ও লগইন করতে হবে।");
        window.showPage('registerPage');
        return;
    }

    // ডাটাবেজ থেকে লেটেস্ট ব্যালেন্স চেক করা
    const { data: userData, error: fetchError } = await window.supabase
        .from('users')
        .select('balance')
        .eq('telegram_id', window.appState.currentUser.telegram_id)
        .single();

    if (fetchError || !userData) {
        alert("ইউজার ডেটা ফেচ করতে সমস্যা হয়েছে।");
        return;
    }

    const currentBal = userData.balance || 0;

    if (currentBal < ratePerMinute) {
        alert("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।");
        window.location.href = 'payment/deposit.html';
        return;
    }

    const newBalance = currentBal - ratePerMinute;

    // Supabase-এ নতুন ব্যালেন্স আপডেট করা
    const { error: updateError } = await window.supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('telegram_id', window.appState.currentUser.telegram_id);

    if (updateError) {
        alert("ব্যালেন্স আপডেট করতে সমস্যা হয়েছে।");
        return;
    }

    // গ্লোবাল স্টেট এবং লোকালস্টোরেজ আপডেট
    window.appState.currentBalance = newBalance;
    window.appState.currentUser.balance = newBalance;
    localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
    localStorage.setItem('callpay_balance', window.appState.currentBalance);
    
    window.updateUIState();

    alert(`৳${ratePerMinute} কেটে নেওয়া হয়েছে। টেলিগ্রাম কল শুরু হচ্ছে...`);
    const cleanUsername = creatorUsername.replace('@', '');
    window.location.href = `https://t.me/${cleanUsername}`;
}

// ২. সিমুলেশন রিচার্জ বাদ দিয়ে সরাসরি ডিপোজিট পেজে রিডাইরেক্ট করা
window.addMoney = function() {
    if (!window.appState.currentUser) {
        alert("প্রথমে লগইন বা রেজিস্ট্রেশন করুন।");
        window.showPage('loginPage');
        return;
    }

    // ব্যবহারকারী সাধারণ ইউজার হলে সরাসরি ডিপোজিট পেজে নিয়ে যাবে
    window.location.href = 'payment/deposit.html';
}
