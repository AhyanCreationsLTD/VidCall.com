// ==========================================
// SUPABASE CONFIGURATION & GLOBAL SETUP
// ==========================================
const SUPABASE_URL = 'https://xvoarynvzrqpmkwuoqqi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2b2FyeW52enJxcG1rd3VvcXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NTY0NDQsImV4cCI6MjEwODUzMjQ0NH0.DDQz6Eo4gBW13_MqTBBpLVcnnUSo7U8A-QdQf7LFhwY';

// গ্লোবাল স্কোপে সুপাবেজ ক্লায়েন্ট সেট করা হলো যাতে অন্য সব .js ফাইল থেকে এক্সেস করা যায়
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
window.appState = {
    currentUser: JSON.parse(localStorage.getItem('callpay_user')) || null,
    currentBalance: parseInt(localStorage.getItem('callpay_balance')) || 100,
    generatedOtp: null,
    pendingUserData: null,
    allUsersData: []
};
