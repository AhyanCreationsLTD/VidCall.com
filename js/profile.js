window.populateProfileData = function() {
    if (window.appState.currentUser) {
        document.getElementById('profileNameDisplay').innerHTML = `${window.appState.currentUser.name} ${window.appState.currentUser.is_verified ? '<span class="text-blue-400">✓</span>' : ''}`;
        document.getElementById('profileTelegramDisplay').innerText = window.appState.currentUser.username;
        document.getElementById('profileAvatarText').innerText = window.appState.currentUser.name[0].toUpperCase();
        document.getElementById('profileRoleBadge').innerText = window.appState.currentUser.role === 'creator' ? 'ক্রিয়েটর / হোস্ট' : 'সাধারণ ইউজার';
    }
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

    const { error } = await supabase.from('users').update(updateData).eq('telegram_id', window.appState.currentUser.telegram_id);
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
