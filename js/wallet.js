window.handleCallRequest = async function(creatorUsername, ratePerMinute) {
    if (!window.appState.currentUser) {
        alert("কল করতে হলে প্রথমে অ্যাকাউন্ট তৈরি ও লগইন করতে হবে।");
        window.showPage('registerPage');
        return;
    }

    if (window.appState.currentBalance < ratePerMinute) {
        alert("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! রিচার্জ করুন।");
        window.showPage('dashboardPage');
        return;
    }

    window.appState.currentBalance -= ratePerMinute;
    const { error } = await supabase.from('users').update({ balance: window.appState.currentBalance }).eq('telegram_id', window.appState.currentUser.telegram_id);
    if (error) {
        alert("ব্যালেন্স আপডেট করতে সমস্যা হয়েছে।");
        return;
    }

    localStorage.setItem('callpay_balance', window.appState.currentBalance);
    window.updateUIState();
    alert(`৳${ratePerMinute} কেটে নেওয়া হয়েছে। টেলিগ্রাম কল শুরু হচ্ছে...`);
    const cleanUsername = creatorUsername.replace('@', '');
    window.location.href = `https://t.me/${cleanUsername}`;
}

window.addMoney = async function() {
    window.appState.currentBalance += 100;
    if (window.appState.currentUser) {
        await supabase.from('users').update({ balance: window.appState.currentBalance }).eq('telegram_id', window.appState.currentUser.telegram_id);
    }
    localStorage.setItem('callpay_balance', window.appState.currentBalance);
    window.updateUIState();
    alert("সফলভাবে ৳১০০ রিচার্জ করা হয়েছে!");
}
