// Authentication Logic for The Rewire Engine
import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');
const loader = document.getElementById('loader');

// Tab Switching
loginTab.addEventListener('click', () => {
    switchTab('login');
});

registerTab.addEventListener('click', () => {
    switchTab('register');
});

function switchTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('bg-white', 'text-blue-600', 'shadow');
        loginTab.classList.remove('text-gray-600');
        registerTab.classList.remove('bg-white', 'text-blue-600', 'shadow');
        registerTab.classList.add('text-gray-600');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('bg-white', 'text-blue-600', 'shadow');
        registerTab.classList.remove('text-gray-600');
        loginTab.classList.remove('bg-white', 'text-blue-600', 'shadow');
        loginTab.classList.add('text-gray-600');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
    hideError();
}

// Login with Email/Password
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoader();
    hideError();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user);
        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        hideLoader();
        showError(getErrorMessage(error.code));
    }
});

// Register with Email/Password
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (password.length < 6) {
        showError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
    }

    showLoader();
    hideError();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(userCredential.user, {
            displayName: name
        });
        console.log('Registration successful:', userCredential.user);
        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        hideLoader();
        showError(getErrorMessage(error.code));
    }
});

// Google Login
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    showLoader();
    hideError();

    try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google login successful:', result.user);
        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        hideLoader();
        if (error.code !== 'auth/popup-closed-by-user') {
            showError(getErrorMessage(error.code));
        }
    }
});

// Helper Functions
function showLoader() {
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/operation-not-allowed': 'การดำเนินการนี้ไม่ได้รับอนุญาต',
        'auth/weak-password': 'รหัสผ่านไม่ปลอดภัยเพียงพอ',
        'auth/user-disabled': 'บัญชีนี้ถูกปิดการใช้งาน',
        'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
        'auth/too-many-requests': 'คำขอมากเกินไป กรุณาลองใหม่ภายหลัง',
        'auth/network-request-failed': 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'auth/popup-blocked': 'Popup ถูกบล็อก กรุณาอนุญาต Popup ในเบราว์เซอร์',
        'auth/cancelled-popup-request': 'คำขอถูกยกเลิก',
    };
    return errorMessages[errorCode] || 'เกิดข้อผิดพลาด: ' + errorCode;
}

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to main app
        console.log('User already logged in:', user);
        window.location.href = 'index.html';
    }
});
