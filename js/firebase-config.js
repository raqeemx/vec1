/**
 * ========================================
 * 🔥 Firebase Configuration
 * ========================================
 * Version: 3.0
 * 
 * ⚠️ IMPORTANT: For production, replace with your own Firebase credentials
 * ⚠️ Add this file to .gitignore to prevent exposing API keys
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase (if SDKs are loaded)
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization error:', error.message);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig };
}
