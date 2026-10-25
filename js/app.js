// ==========================================
// MAIN APP LOGIC & ROUTING
// ==========================================

window.onload = async function() {
    if (window.appState.currentUser && window.appState.currentUser.telegram_id) {
        await fetchUserDataFromSupabase(window.appState.currentUser.telegram_id);
    }
    window.updateUIState();
    await fetchAndRenderCreators(); // হোম পেজে রিয়েল ক্রিয়েটর লোড করা
};

async function fetchUserDataFromSupabase(telegramId) {
    try {
        const { data, error } = await window.supabase
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
    } catch (err) {
        console.error("User fetch error:", err);
    }
}

// Supabase থেকে এপ্রুভড ক্রিয়েটরদের তালিকা ফেচ করে হোম পেজে রেন্ডার করা
async function fetchAndRenderCreators() {
    const creatorListContainer = document.getElementById('creatorList');
    if (!creatorListContainer) return;

    const { data: creators, error } = await window.supabase
        .from('users')
        .select('*')
        .eq('role', 'creator')
        .eq('status', 'approved');

    if (error) {
        console.error("Error fetching creators:", error);
        return;
    }

    if (!creators || creators.length === 0) {
        creatorListContainer.innerHTML = `<div class="glass-card rounded-2xl p-6 text-center text-xs text-slate-400">এই মুহূর্তে কোনো ক্রিয়েটর অনলাইন নেই।</div>`;
        return;
    }

    creatorListContainer.innerHTML = '';
    creators.forEach(creator => {
        const card = document.createElement('div');
        card.className = "glass-card rounded-2xl p-4 flex justify-between items-center";
        card.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow">
                        ${creator.name ? creator.name[0].toUpperCase() : 'C'}
                    </div>
                    <span class="w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full absolute bottom-0 right-0"></span>
                </div>
                <div>
                    <h4 class="font-bold text-slate-200 text-sm">${creator.name} ${creator.is_verified ? '<span class="text-blue-400">✓</span>' : ''}</h4>
                    <p class="text-xs text-slate-400">${creator.username}</p>
                    <span class="text-xs font-semibold text-emerald-400 mt-1 block">৳${creator.rate || 30} / মিনিট</span>
                </div>
            </div>
            <button onclick="window.handleCallRequest('${creator.username}', ${creator.rate || 30})" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-md">
                <i class="fa-solid fa-phone"></i>
                <span>কল দিন</span>
            </button>
        `;
        creatorListContainer.appendChild(card);
    });
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
        if (navAvatar) {
            navAvatar.innerText = window.appState.currentUser.name ? window.appState.currentUser.name[0].toUpperCase() : 'U';
        }
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
        if (typeof window.loadAdminDashboardData === 'function') {
            window.loadAdminDashboardData();
        }
    }
    if (pageId === 'indexPage') {
        fetchAndRenderCreators(); // হোম পেজে আসলে লিস্ট রিফ্রেশ হবে
    }
}

window.checkAuthAndRedirectProfile = function() {
    if (!window.appState.currentUser) {
        alert("প্রথমে লগইন বা রেজিস্ট্রেশন করুন।");
        window.showPage('loginPage');
    } else {
        if (typeof window.populateProfileData === 'function') {
            window.populateProfileData();
        }
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
