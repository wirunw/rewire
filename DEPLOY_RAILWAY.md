# Railway Deployment Guide

## ขั้นตอน Deploy Backend บน Railway

### 1. สมัคร Railway
- ไปที่ https://railway.app
- Sign up ด้วย GitHub account

### 2. Deploy Backend
1. คลิก "New Project"
2. เลือก "Deploy from GitHub repo"
3. เลือก repository: `wirunw/rewire`
4. Railway จะตรวจจับ Node.js โดยอัตโนมัติ

### 3. ตั้งค่า Environment Variables
1. ไปที่ "Variables" tab
2. เพิ่ม:
   - `GEMINI_API_KEY` = ใส่ API Key ของคุณ
   - `PORT` = 3000 (Railway จะตั้งให้อัตโนมัติ)

### 4. ตั้งค่า Root Directory
1. ไปที่ Settings → Service
2. ตั้ง "Root Directory" = `backend`
3. ตั้ง "Start Command" = `npm start`

### 5. Deploy
- Railway จะ deploy อัตโนมัติ
- คุณจะได้ URL เช่น: `https://rewire-production.up.railway.app`

---

## Deploy Frontend บน Netlify

### 1. สมัคร Netlify
- ไปที่ https://netlify.com
- Sign up ด้วย GitHub account

### 2. Deploy Frontend
1. คลิก "Add new site" → "Import an existing project"
2. เลือก GitHub → เลือก repository: `wirunw/rewire`
3. ตั้งค่า:
   - **Base directory**: `frontend`
   - **Publish directory**: `frontend`
   - ไม่ต้องตั้ง Build command (เพราะเป็น static HTML)

### 3. แก้ไข Frontend ให้เชื่อมกับ Backend
- แก้ไขไฟล์ `frontend/app.js`
- เปลี่ยน `API_BASE_URL` เป็น URL ของ Railway
- Commit และ push ขึ้น GitHub

```javascript
const API_BASE_URL = 'https://rewire-production.up.railway.app';
```

### 4. Deploy
- Netlify จะ deploy อัตโนมัติ
- คุณจะได้ URL เช่น: `https://rewire-app.netlify.app`

---

## 📝 สรุป
- Backend: Railway (ฟรี 500 ชม./เดือน)
- Frontend: Netlify (ฟรีไม่จำกัด)
- Auto-deploy เมื่อ push GitHub
