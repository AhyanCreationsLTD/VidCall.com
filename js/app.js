window.onload = async function() {
    if (window.appState.currentUser && window.appState.currentUser.telegram_id) {
        await fetchUserDataFromSupabase(window.appState.currentUser.telegram_id);
    }
    window.updateUIState();
};

async function fetchUserDataFromSupabase(telegramId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

    if (data) {
        window.appState.currentUser = data;
        window.appState.currentBalance = data.balance;
        localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
        localStorage.setItem('callpay_balance', window.appState.currentBalance);
    }
}

window.updateUIState = function() {
    const navBalance = document.getElementById('navBalance');
    const dashBalanceDisplay = document.getElementById('dashBalanceDisplay');
    const navAvatar = document.getElementById('navAvatar');
    const creatorPanel = document.getElementById('creatorDashboardPanel');
    const adminNavBtn = document.getElementById('adminNavBtn');

    if (navBalance) navBalance.innerText = `৳${window.appState.currentBalance}`;
    if (dashBalanceDisplay) dashBalanceDisplay.innerText = `৳${window.appState.currentBalance}`;
    
    if (window.appState.currentUser) {
        if (navAvatar) navAvatar.innerText = window.appState.currentUser.name ? window.appState.currentUser.name[0].toUpperCase() : 'U';
        if (creatorPanel) {
            if (window.appState.currentUser.role === 'creator') {
                creatorPanel.classList.remove('hidden');
            } else {
                creatorPanel.classList.add('hidden');
            }
        }
        if (adminNavBtn) {
            if (window.appState.currentUser.is_admin) {
                adminNavBtn.classList.remove('hidden');
            } else {
                adminNavBtn.classList.add('hidden');
            }
        }
    }
}

window.showPage = function(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }
    if (pageId === 'adminPage') {
        window.loadAdminDashboardData();
    }
}

window.checkAuthAndRedirectProfile = function() {
    if (!window.appState.currentUser) {
        alert("প্রথমে লগইন বা রেজিস্ট্রেশন করুন।");
        window.showPage('loginPage');
    } else {
        window.populateProfileData();
        window.showPage('profilePage');
    }
}

window.toggleCreatorRateField = function() {
    const roleSelect = document.getElementById('regRole');
    const container = document.getElementById('rateFieldContainer');
    if (roleSelect && container) {
        if (roleSelect.value === 'creator') {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }
}
