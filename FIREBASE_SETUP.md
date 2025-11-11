# Firebase Setup Guide

## 🔥 ขั้นตอนการตั้งค่า Firebase Authentication

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" (เพิ่มโปรเจค)
3. ตั้งชื่อโปรเจค เช่น "rewire-engine"
4. ปิด Google Analytics (ไม่จำเป็น) หรือเปิดก็ได้
5. คลิก "Create project"

### 2. เปิดใช้งาน Authentication

1. ในเมนูซ้าย คลิก **"Authentication"**
2. คลิก **"Get started"**
3. เปิดใช้งาน Sign-in methods:

#### Email/Password:
- คลิกที่ "Email/Password"
- เปิดใช้งาน (Enable)
- คลิก "Save"

#### Google:
- คลิกที่ "Google"
- เปิดใช้งาน (Enable)
- เลือก Support email
- คลิก "Save"

### 3. สร้าง Web App และรับ Config

1. ไปที่ **Project Settings** (ไอคอนเฟือง)
2. scroll ลง มาที่ส่วน **"Your apps"**
3. คลิก **"Web"** (ไอคอน `</>`)
4. ตั้งชื่อ App: "rewire-web"
5. ✅ เลือก "Also set up Firebase Hosting" (ไม่จำเป็น สามารถข้ามได้)
6. คลิก "Register app"
7. **คัดลอก firebaseConfig** ที่แสดง

ตัวอย่าง:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyABC123...",
    authDomain: "rewire-engine.firebaseapp.com",
    projectId: "rewire-engine",
    storageBucket: "rewire-engine.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 4. ใส่ Config ใน Frontend

แก้ไขไฟล์ `frontend/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "ใส่ค่าที่ได้จาก Firebase",
    authDomain: "ใส่ค่าที่ได้จาก Firebase",
    projectId: "ใส่ค่าที่ได้จาก Firebase",
    storageBucket: "ใส่ค่าที่ได้จาก Firebase",
    messagingSenderId: "ใส่ค่าที่ได้จาก Firebase",
    appId: "ใส่ค่าที่ได้จาก Firebase"
};
```

### 5. (Optional) ตั้งค่า Backend Authentication

ถ้าต้องการให้ Backend verify token (แนะนำสำหรับความปลอดภัย):

#### A. สร้าง Service Account Key

1. ไปที่ **Project Settings** → **Service accounts**
2. คลิก **"Generate new private key"**
3. คลิก **"Generate key"**
4. ไฟล์ JSON จะถูกดาวน์โหลด

#### B. เก็บไฟล์ในโปรเจค

1. วางไฟล์ JSON ใน `backend/` folder
2. เปลี่ยนชื่อเป็น `firebase-service-account.json`
3. เพิ่มในไฟล์ `backend/.gitignore`:
   ```
   firebase-service-account.json
   ```

#### C. ติดตั้ง Firebase Admin SDK

```powershell
cd backend
npm install firebase-admin
```

#### D. แก้ไข backend/server.js

เพิ่ม code นี้ด้านบน (หลังจาก require dotenv):

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

เพิ่ม Middleware สำหรับตรวจสอบ token:

```javascript
// Authentication Middleware
async function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'ไม่พบ authentication token' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
```

ใช้ Middleware กับ API endpoints:

```javascript
app.post('/api/rewire', verifyToken, async (req, res) => {
    // ... existing code
});
```

---

## 🧪 ทดสอบ

### 1. ทดสอบ Frontend

1. เปิด `frontend/login.html` ในเบราว์เซอร์
2. ลอง Register ด้วย Email/Password
3. ลอง Login ด้วย Google
4. ตรวจสอบว่าถูก redirect ไป `index.html` หลัง login สำเร็จ

### 2. ตรวจสอบ Firebase Console

1. ไปที่ Firebase Console → Authentication → Users
2. ควรเห็น User ที่สมัครใหม่

### 3. ทดสอบ Logout

1. คลิกปุ่ม "ออกจากระบบ" ใน `index.html`
2. ควรถูก redirect กลับไปหน้า login

---

## 🔒 ความปลอดภัย

### ตั้งค่า Authorized Domains

1. ไปที่ Firebase Console → Authentication → Settings
2. ที่ส่วน "Authorized domains"
3. เพิ่ม domain ที่ deploy:
   - `localhost` (สำหรับ local development)
   - `your-netlify-domain.netlify.app`
   - Domain ของคุณ (ถ้ามี)

### Email Verification (Optional)

ถ้าต้องการให้ผู้ใช้ยืนยันอีเมล:

1. ไปที่ Authentication → Templates
2. ปรับแต่ง "Email address verification"
3. เพิ่ม code ใน `auth.js`:

```javascript
await sendEmailVerification(user);
alert('กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี');
```

---

## 💡 Tips

- **Firebase ฟรี**: 10,000 users, 50,000 reads/วัน
- **Google Login**: ง่ายที่สุด แนะนำให้ใช้
- **Security Rules**: Firebase จะจัดการให้อัตโนมัติ
- **Password Reset**: Firebase มี built-in function

---

## 📞 ปัญหาที่พบบ่อย

### ปัญหา: "Firebase: Error (auth/unauthorized-domain)"
**วิธีแก้**: เพิ่ม domain ใน Authorized domains (ดูด้านบน)

### ปัญหา: "Firebase: Error (auth/popup-blocked)"
**วิธีแก้**: อนุญาต popup ในเบราว์เซอร์

### ปัญหา: Config ไม่ทำงาน
**วิธีแก้**: 
1. ตรวจสอบว่าคัดลอก config ครบทุกค่า
2. ตรวจสอบว่าไม่มี syntax error
3. ลอง refresh หน้าเว็บ (Ctrl+F5)

---

## ✅ Checklist

- [ ] สร้าง Firebase Project
- [ ] เปิดใช้งาน Email/Password Authentication
- [ ] เปิดใช้งาน Google Authentication
- [ ] คัดลอก firebaseConfig
- [ ] แก้ไข `frontend/firebase-config.js`
- [ ] ทดสอบ Register
- [ ] ทดสอบ Login ด้วย Google
- [ ] ทดสอบ Logout
- [ ] (Optional) ตั้งค่า Backend verification
- [ ] Deploy frontend และเพิ่ม domain ใน Authorized domains
