window.loadAdminDashboardData = async function() {
    if (!window.appState.currentUser || !window.appState.currentUser.is_admin) {
        alert("আপনার এডমিন এক্সেস নেই!");
        window.showPage('indexPage');
        return;
    }

    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) {
        alert("ডেটা লোড করতে সমস্যা হয়েছে: " + error.message);
        return;
    }

    window.appState.allUsersData = data;
    renderAdminUserList(window.appState.allUsersData);
}

function renderAdminUserList(users) {
    const tbody = document.getElementById('adminUserTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-700/50 text-xs";
        tr.innerHTML = `
            <td class="py-3 px-2 font-semibold">
                ${user.name} ${user.is_verified ? '<span class="text-blue-400">✓</span>' : ''}
                <br><span class="text-slate-400 font-normal">${user.username}</span>
            </td>
            <td class="py-3 px-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] ${user.role === 'creator' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'}">${user.role}</span>
            </td>
            <td class="py-3 px-2 font-bold text-amber-400">৳${user.balance}</td>
            <td class="py-3 px-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] ${user.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : user.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}">${user.status}</span>
            </td>
            <td class="py-3 px-2 space-x-1">
                ${user.role === 'creator' && !user.is_verified ? `<button onclick="window.toggleVerifyUser(${user.telegram_id}, true)" class="bg-blue-600 px-2 py-1 rounded text-white text-[10px]">Approve</button>` : ''}
                ${user.status !== 'blocked' ? `<button onclick="window.updateUserStatus(${user.telegram_id}, 'blocked')" class="bg-amber-600 px-2 py-1 rounded text-white text-[10px]">Block</button>` : `<button onclick="window.updateUserStatus(${user.telegram_id}, 'approved')" class="bg-emerald-600 px-2 py-1 rounded text-white text-[10px]">Unblock</button>`}
                <button onclick="window.deleteUserAccount(${user.telegram_id})" class="bg-red-600 px-2 py-1 rounded text-white text-[10px]">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.filterAdminUsers = function() {
    const query = document.getElementById('adminUserSearch').value.toLowerCase();
    const filtered = window.appState.allUsersData.filter(u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query));
    renderAdminUserList(filtered);
}

window.toggleVerifyUser = async function(telegramId, verifyStatus) {
    const { error } = await supabase.from('users').update({ is_verified: verifyStatus, status: 'approved' }).eq('telegram_id', telegramId);
    if (!error) {
        alert("ইউজার সফলভাবে ভেরিফাইড ও এপ্রুভ করা হয়েছে!");
        window.loadAdminDashboardData();
    }
}

window.updateUserStatus = async function(telegramId, status) {
    const { error } = await supabase.from('users').update({ status }).eq('telegram_id', telegramId);
    if (!error) {
        alert(`স্ট্যাটাস '${status}' আপডেট করা হয়েছে!`);
        window.loadAdminDashboardData();
    }
}

window.deleteUserAccount = async function(telegramId) {
    if (confirm("আপনি কি নিশ্চিত এই অ্যাকাউন্টটি মুছে ফেলতে চান?")) {
        const { error } = await supabase.from('users').delete().eq('telegram_id', telegramId);
        if (!error) {
            alert("অ্যাকাউন্ট ডিলিট করা হয়েছে!");
            window.loadAdminDashboardData();
        }
    }
}

window.updateDynamicAdBanner = function() {
    const title = document.getElementById('adTitleInput').value.trim();
    const subtitle = document.getElementById('adSubtitleInput').value.trim();

    if (!title || !subtitle) {
        alert("বিজ্ঞাপনের বিষয়বস্তু লিখুন।");
        return;
    }

    document.getElementById('indexAdTitle').innerText = title;
    document.getElementById('indexAdSubtitle').innerText = subtitle;
    alert("হোম পেজের এডভারটাইজমেন্ট ব্যানার আপডেট করা হয়েছে!");
}
