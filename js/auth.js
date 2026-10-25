window.sendRegisterCode = function() {
    const name = document.getElementById('regName').value.trim();
    const telegram = document.getElementById('regTelegram').value.trim();
    const role = document.getElementById('regRole').value;
    const rate = document.getElementById('regRate').value;

    if (!name || !telegram) {
        alert("দয়া করে আপনার নাম এবং টেলিগ্রাম ইউজারনেম দিন।");
        return;
    }

    const formattedTelegram = telegram.startsWith('@') ? telegram : `@${telegram}`;
    window.appState.generatedOtp = Math.floor(1000 + Math.random() * 9000);
    
    window.appState.pendingUserData = {
        telegram_id: Date.now(),
        name,
        username: formattedTelegram,
        role,
        rate: role === 'creator' ? parseInt(rate) : 0,
        balance: 100,
        status: role === 'creator' ? 'pending' : 'approved',
        is_verified: false,
        is_admin: false
    };

    alert(`[Telegram Bot Simulation]\nরেজিস্ট্রেশন কোডটি হলো: ${window.appState.generatedOtp}`);
    document.getElementById('registerFormStep1').classList.add('hidden');
    document.getElementById('registerFormStep2').classList.remove('hidden');
}

window.verifyAndRegister = async function() {
    const enteredCode = document.getElementById('regOtpCode').value.trim();

    if (parseInt(enteredCode) === window.appState.generatedOtp) {
        const { error } = await supabase.from('users').insert([window.appState.pendingUserData]);

        if (error) {
            alert("রেজিস্ট্রেশনে সমস্যা হয়েছে: " + error.message);
            return;
        }

        window.appState.currentUser = window.appState.pendingUserData;
        window.appState.currentBalance = window.appState.currentUser.balance;
        
        localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
        localStorage.setItem('callpay_balance', window.appState.currentBalance);
        
        alert("অভিনন্দন! সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে।");
        document.getElementById('registerFormStep1').classList.remove('hidden');
        document.getElementById('registerFormStep2').classList.add('hidden');
        
        window.updateUIState();
        window.showPage('indexPage');
    } else {
        alert("ভুল কোড! সঠিক কোডটি দিন।");
    }
}

window.sendLoginCode = function() {
    const telegramInput = document.getElementById('loginUsername').value.trim();
    if (!telegramInput) {
        alert("দয়া করে টেলিগ্রাম ইউজারনেম দিন।");
        return;
    }

    window.appState.generatedOtp = Math.floor(1000 + Math.random() * 9000);
    alert(`[Telegram Bot Simulation]\nলগইন কোডটি হলো: ${window.appState.generatedOtp}`);

    document.getElementById('loginFormStep1').classList.add('hidden');
    document.getElementById('loginFormStep2').classList.remove('hidden');
}

window.verifyAndLogin = async function() {
    const enteredCode = document.getElementById('loginOtpCode').value.trim();
    const telegramInput = document.getElementById('loginUsername').value.trim();
    const formattedTelegram = telegramInput.startsWith('@') ? telegramInput : `@${telegramInput}`;

    if (parseInt(enteredCode) === window.appState.generatedOtp) {
        const { data, error } = await supabase
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
        
        alert("সফলভাবে লগইন হয়েছে!");
        document.getElementById('loginFormStep1').classList.remove('hidden');
        document.getElementById('loginFormStep2').classList.add('hidden');

        window.updateUIState();
        window.showPage('indexPage');
    } else {
        alert("ভুল কোড!");
    }
}

window.logout = function() {
    localStorage.clear();
    window.appState.currentUser = null;
    alert("লগআউট করা হয়েছে।");
    window.updateUIState();
    window.showPage('indexPage');
}
