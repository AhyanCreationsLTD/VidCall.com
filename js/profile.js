// ==========================================
// PROFILE MANAGEMENT LOGIC
// ==========================================

window.populateProfileData = function() {
    if (!window.appState.currentUser) return;

    const user = window.appState.currentUser;
    
    // बेसिक ইনফো ডিসপ্লে
    document.getElementById('profileNameDisplay').innerHTML = `${user.name} ${user.is_verified ? '<span class="text-blue-400">✓</span>' : ''}`;
    document.getElementById('profileTelegramDisplay').innerText = user.username;
    document.getElementById('profileAvatarText').innerText = user.name[0].toUpperCase();
    document.getElementById('profileRoleBadge').innerText = user.role === 'creator' ? 'ক্রিয়েটর / হোস্ট' : 'সাধারণ ইউজার';

    // রোল অনুযায়ী ডাইনামিক বাটন রেন্ডারিং (Deposit / Cash Out / Get Verified)
    const roleActionContainer = document.getElementById('profileRoleActionButtons');
    if (roleActionContainer) {
        if (user.role === 'creator') {
            roleActionContainer.innerHTML = `
                <button onclick="window.goToCashOut()" class="w-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow">
                    <i class="fa-solid fa-money-bill-transfer"></i>
                    <span>Cash Out (টাকা তুলুন)</span>
                </button>
                ${!user.is_verified ? `
                <button onclick="window.goToVerify()" class="w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow">
                    <i class="fa-solid fa-certificate text-blue-400"></i>
                    <span>Get Verified Badge (ভেরিফাইড হন)</span>
                </button>` : ''}
            `;
        } else {
            roleActionContainer.innerHTML = `
                <button onclick="window.goToDeposit()" class="w-full bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow">
                    <i class="fa-solid fa-wallet text-amber-400"></i>
                    <span>Deposit Cash (ব্যালেন্স রিচার্জ)</span>
                </button>
            `;
        }
    }
}

// পেজ রিডাইরেক্ট ফাংশনসমূহ
window.goToDeposit = function() {
    window.location.href = 'payment/deposit.html';
}

window.goToCashOut = function() {
    window.location.href = 'payment/cash.html';
}

window.goToVerify = function() {
    window.location.href = 'verification/verify.html';
}

window.openEditProfile = function() {
    if (!window.appState.currentUser) return;
    document.getElementById('editName').value = window.appState.currentUser.name;
    document.getElementById('editTelegram').value = window.appState.currentUser.username;
    const editRateGroup = document.getElementById('editRateGroup');
    if (window.appState.currentUser.role === 'creator') {
        editRateGroup.classList.remove('hidden');
        document.getElementById('editRate').value = window.appState.currentUser.rate || 30;
    } else {
        editRateGroup.classList.add('hidden');
    }
    window.showPage('editProfilePage');
}

window.saveProfileChanges = async function() {
    const newName = document.getElementById('editName').value.trim();
    const newTelegram = document.getElementById('editTelegram').value.trim();
    const newRate = document.getElementById('editRate').value;

    if (!newName || !newTelegram) {
        alert("নাম এবং ইউজারনেম দিন।");
        return;
    }

    const formattedTelegram = newTelegram.startsWith('@') ? newTelegram : `@${newTelegram}`;
    let updateData = { name: newName, username: formattedTelegram };
    if (window.appState.currentUser.role === 'creator') updateData.rate = parseInt(newRate);

    const { error } = await window.supabase.from('users').update(updateData).eq('telegram_id', window.appState.currentUser.telegram_id);
    if (error) {
        alert("সমস্যা হয়েছে: " + error.message);
        return;
    }

    window.appState.currentUser.name = newName;
    window.appState.currentUser.username = formattedTelegram;
    if (window.appState.currentUser.role === 'creator') window.appState.currentUser.rate = parseInt(newRate);

    localStorage.setItem('callpay_user', JSON.stringify(window.appState.currentUser));
    alert("প্রোফাইল আপডেট হয়েছে!");
    window.checkAuthAndRedirectProfile();
                      }
