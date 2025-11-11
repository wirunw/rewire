# Render Deployment Guide (ทางเลือกที่ 2)

## ข้อดีของ Render

- ฟรี (750 ชั่วโมง/เดือน)
- Deploy ง่าย
- Auto-deploy จาก GitHub
- รองรับ Node.js โดยตรง

## ขั้นตอน Deploy Backend บน Render

### 1. สมัคร Render

- ไปที่ <https://render.com>
- Sign up ด้วย GitHub account

### 2. สร้าง Web Service

1. คลิก "New +" → "Web Service"
2. เชื่อมต่อ GitHub repository: `wirunw/rewire`
3. ตั้งค่า:
   - **Name**: `rewire-backend`
   - **Region**: Singapore (ใกล้ไทย)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. ตั้งค่า Environment Variables

1. scroll ลงมาที่ "Environment Variables"
2. คลิก "Add Environment Variable"
3. เพิ่ม:
   - Key: `GEMINI_API_KEY`
   - Value: ใส่ API Key ของคุณ

### 4. Deploy

- คลิก "Create Web Service"
- รอ 2-3 นาที
- คุณจะได้ URL เช่น: `https://rewire-backend.onrender.com`

### 5. แก้ไข Frontend

แก้ไขไฟล์ `frontend/app.js`:

```javascript
const API_BASE_URL = 'https://rewire-backend.onrender.com';
```

### 6. Deploy Frontend บน Netlify

- ทำตาม DEPLOY_RAILWAY.md (ส่วน Deploy Frontend)

---

## ⚠️ ข้อควรทราบ Render Free Plan

- Service จะ "หลับ" หลังไม่มีใช้งาน 15 นาที
- ครั้งแรกที่เข้าใช้จะช้า 30-60 วินาที (เพราะต้องปลุก)
- เหมาะสำหรับ demo/prototype
