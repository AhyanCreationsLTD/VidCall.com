// ==========================================
// ADMIN PANEL LOGIC & MANAGEMENT
// ==========================================

// ১. এডমিন ড্যাশবোর্ডের সমস্ত ইউজার ডাটা লোড করা
window.loadAdminDashboardData = async function() {
    // বর্তমান ইউজার এডমিন কিনা চেক করা
    if (!window.appState.currentUser || !window.appState.currentUser.is_admin) {
        alert("আপনার এডমিন প্যানেল এক্সেস করার অনুমতি নেই!");
        window.location.href = '../../index.html'; // বা সঠিক হোম পেজ পাথ
        return;
    }

    const { data, error } = await window.supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert("ডেটা লোড করতে সমস্যা হয়েছে: " + error.message);
        return;
    }

    window.appState.allUsersData = data;
    renderAdminUserList(window.appState.allUsersData);
}

// ২. এডমিন টেবিলের ইউজারদের রেন্ডার করা (ডিপোজিট ইনপুট সহ)
function renderAdminUserList(users) {
    const tbody = document.getElementById('adminUserTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-700/50 text-xs";
        tr.innerHTML = `
            <td class="py-3 px-2 font-semibold text-slate-200">
                ${user.name} ${user.is_verified ? '<span class="text-blue-400">✓</span>' : ''}
                <br><span class="text-slate-400 font-normal">${user.username}</span>
                <br><span class="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded">${user.role}</span>
            </td>
            <td class="py-3 px-2 font-bold text-amber-400">৳${user.balance}</td>
            <td class="py-3 px-2">
                <div class="flex items-center space-x-1">
                    <input type="number" id="deposit-input-${user.telegram_id}" placeholder="টাকা" class="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500">
                    <button onclick="window.addUserBalanceByAdmin(${user.telegram_id})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold shadow">Add</button>
                </div>
            </td>
            <td class="py-3 px-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] ${user.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : user.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}">${user.status}</span>
            </td>
            <td class="py-3 px-2 space-y-1">
                ${user.role === 'creator' && !user.is_verified ? `<button onclick="window.toggleVerifyUser(${user.telegram_id}, true)" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white text-[10px] block w-full text-center">Verify</button>` : ''}
                ${user.status !== 'blocked' ? `<button onclick="window.updateUserStatus(${user.telegram_id}, 'blocked')" class="bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded text-white text-[10px] block w-full text-center">Block</button>` : `<button onclick="window.updateUserStatus(${user.telegram_id}, 'approved')" class="bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded text-white text-[10px] block w-full text-center">Unblock</button>`}
                <button onclick="window.deleteUserAccount(${user.telegram_id})" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-[10px] block w-full text-center">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ৩. এডমিন প্যানেল থেকে ইউজারের অ্যাকাউন্টে ব্যালেন্স ডিপোজিট বা যোগ করা
window.addUserBalanceByAdmin = async function(telegramId) {
    const inputField = document.getElementById(`deposit-input-${telegramId}`);
    const amountToAdd = parseInt(inputField.value);

    if (!amountToAdd || amountToAdd <= 0) {
        alert("দয়া করে সঠিক টাকার পরিমাণ লিখুন।");
        return;
    }

    // ডাটাবেজ থেকে ইউজারের বর্তমান ব্যালেন্স চেক করা
    const { data: userData, error: fetchError } = await window.supabase
        .from('users')
        .select('balance, name')
        .eq('telegram_id', telegramId)
        .single();

    if (fetchError || !userData) {
        alert("ইউজার খুঁজে পাওয়া যায়নি!");
        return;
    }

    const newBalance = (userData.balance || 0) + amountToAdd;

    // Supabase-এ ব্যালেন্স আপডেট করা
    const { error: updateError } = await window.supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('telegram_id', telegramId);

    if (updateError) {
        alert("ব্যালেন্স আপডেট করতে সমস্যা হয়েছে: " + updateError.message);
    } else {
        alert(`সফলভাবে ${userData.name}-এর অ্যাকাউন্টে ৳${amountToAdd} যোগ করা হয়েছে! নতুন মোট ব্যালেন্স: ৳${newBalance}`);
        inputField.value = '';
        window.loadAdminDashboardData(); // টেবিল রিফ্রেশ করা
    }
}

// ৪. ইউজার সার্চ বা ফিল্টার করার ফাংশন
window.filterAdminUsers = function() {
    const query = document.getElementById('adminUserSearch').value.toLowerCase();
    const filtered = window.appState.allUsersData.filter(u => 
        u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
    );
    renderAdminUserList(filtered);
}

// ৫. ক্রিয়েটর ভেরিফিকেশন ব্যাজ অনুমোদন করা
window.toggleVerifyUser = async function(telegramId, verifyStatus) {
    const { error } = await window.supabase
        .from('users')
        .update({ is_verified: verifyStatus, status: 'approved' })
        .eq('telegram_id', telegramId);

    if (!error) {
        alert("ইউজার সফলভাবে ভেরিফাইড ও এপ্রুভ করা হয়েছে!");
        window.loadAdminDashboardData();
    } else {
        alert("সমস্যা হয়েছে: " + error.message);
    }
}

// ৬. ইউজার স্ট্যাটাস পরিবর্তন (Block / Unblock / Approve)
window.updateUserStatus = async function(telegramId, status) {
    const { error } = await window.supabase
        .from('users')
        .update({ status })
        .eq('telegram_id', telegramId);

    if (!error) {
        alert(`স্ট্যাটাস সফলভাবে '${status}' আপডেট করা হয়েছে!`);
        window.loadAdminDashboardData();
    } else {
        alert("সমস্যা হয়েছে: " + error.message);
    }
}

// ৭. ইউজার অ্যাকাউন্ট ডিলিট করা
window.deleteUserAccount = async function(telegramId) {
    if (confirm("আপনি কি নিশ্চিত এই অ্যাকাউন্টটি সম্পূর্ণ মুছে ফেলতে চান?")) {
        const { error } = await window.supabase
            .from('users')
            .delete()
            .eq('telegram_id', telegramId);

        if (!error) {
            alert("অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে!");
            window.loadAdminDashboardData();
        } else {
            alert("ডিলিট করতে সমস্যা হয়েছে: " + error.message);
        }
    }
}

// ৮. ডাইনামিক অ্যাড/ব্যানার আপডেট
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
    
