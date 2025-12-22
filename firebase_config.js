// ========================================
// Firebase Configuration
// ⚠️ هذا الملف يحتوي على مفاتيح حساسة
// يجب إضافته إلى .gitignore قبل رفعه على GitHub
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyA7B27LIH9FPZAsMKr5lvm2AIa3ZkZNOUo",
    authDomain: "vec-login-58dea.firebaseapp.com",
    projectId: "vec-login-58dea",
    storageBucket: "vec-login-58dea.firebasestorage.app",
    messagingSenderId: "651347381212",
    appId: "1:651347381212:web:dc7eba2bbf69532e13dd19",
    measurementId: "G-P9Q2KBSNQH"
};

// Export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
}
