// Firebase Configuration EXAMPLE
// คัดลอกไฟล์นี้และเปลี่ยนชื่อเป็น firebase-config.js
// แล้วใส่ค่าจริงจาก Firebase Console → Project Settings → Your apps

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// TODO: แทนที่ค่าเหล่านี้ด้วยค่าจาก Firebase Project ของคุณ
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export for use in other files
export { auth };
