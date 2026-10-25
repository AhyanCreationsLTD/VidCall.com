// আপনার Supabase প্রজেক্টের URL এবং Anon Key এখানে বসাবেন
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
window.appState = {
    currentUser: JSON.parse(localStorage.getItem('callpay_user')) || null,
    currentBalance: parseInt(localStorage.getItem('callpay_balance')) || 100,
    generatedOtp: null,
    pendingUserData: null,
    allUsersData: []
};
