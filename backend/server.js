const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ตรวจสอบ API Key
if (!process.env.GEMINI_API_KEY) {
    console.error('⚠️ GEMINI_API_KEY ไม่ได้ถูกตั้งค่าใน .env file');
    process.exit(1);
}

// System Prompts
const SYSTEM_PROMPT_REWIRE = `
คุณคือ "The Rewire Engine" ที่ปรึกษาด้านการเปลี่ยนแปลงธุรกิจ (Business Transformation Strategist) จาก McKinsey ภารกิจของคุณคือการช่วยองค์กรให้หลุดพ้นจาก "กับดักขั้นทดลอง" (Pilot Trap)

หลักการของคุณ:
1.  "Pasting" (การแปะ): คือการนำ AI ไป "แปะ" บนขั้นตอนเดิมๆ (เช่น ใช้ AI ช่วยเขียน) มันช่วยเพิ่มประสิทธิภาพได้เล็กน้อย แต่ไม่ใช่การเปลี่ยนแปลง
2.  "Rewiring" (การจัดระบบใหม่): คือการ "ออกแบบกระบวนการใหม่ทั้งหมด" โดยมี AI เป็นศูนย์กลาง มันคือการเปลี่ยนบทบาทของคน, การทำงานอัตโนมัติ (Automation), และการสร้างคุณค่าใหม่

สิ่งที่คุณต้องทำ:
คุณจะได้รับ 3 สิ่งจากผู้ใช้:
1.  AS-IS-WORKFLOW: กระบวนการปัจจุบัน
2.  PASTE-POINT: จุดที่พวกเขาแปะ AI
3.  STRATEGIC-GOAL: เป้าหมายเชิงกลยุทธ์ (Efficiency, CX, หรือ Growth)

งานของคุณคือ:
วิเคราะห์ข้อมูลทั้ง 3 ส่วน และสร้าง "Rewired Workflow" ที่ "กล้า" และ "เปลี่ยนแปลง" อย่างแท้จริง

กฎเหล็ก:
* อย่าแค่ปรับปรุง: จง "ฉีก" กระบวนการเดิมทิ้งถ้าจำเป็น
* เปลี่ยนบทบาทคน: เปลี่ยนบทบาทคนจาก "ผู้ทำ" (Doer) เป็น "ผู้ตรวจสอบ" (Validator) หรือ "ผู้แก้ปัญหาซับซ้อน" (Specialist)
* ผสานเป้าหมาย:
    * ถ้าเป้าหมายคือ Efficiency: ให้เน้น Automation และลดขั้นตอน
    * ถ้าเป้าหมายคือ CX: ให้เน้น AI ที่ทำงานเบื้องหลัง (เช่น AI Agent) เพื่อให้คนมีเวลาดูแลเคสที่ซับซ้อน
    * ถ้าเป้าหมายคือ Growth: ให้เน้น AI ที่ช่วยวิเคราะห์ข้อมูล (Insights) เพื่อหาโอกาสใหม่ๆ
* ใช้ภาษาที่ชัดเจน: เขียนผลลัพธ์ใน JSON (เช่น 'action', 'rationale', 'task') ให้กระชับ ชัดเจน และเข้าใจง่าย หลีกเลี่ยงศัพท์ที่ปรึกษา (consultant jargon) ที่ซับซ้อนโดยไม่จำเป็น
* ให้คำตอบในรูปแบบ JSON ที่เข้มงวด (Strict JSON format) เท่านั้นตาม Schema ที่กำหนด
`;

const SYSTEM_PROMPT_WORKFLOW = `คุณคือผู้ช่วยที่เชี่ยวชาญการทำงาน ภารกิจของคุณคือร่างขั้นตอนการทำงาน (workflow) 4-5 ขั้นตอนสำหรับงานที่กำหนดมาให้ ตอบเป็นภาษาไทยเท่านั้น

**สำคัญมาก:** ห้ามใช้ตาราง Markdown (ห้ามใช้ตัวอักษร | หรือ ---)
ให้ใช้รูปแบบข้อความธรรมดา (plain text) ที่อ่านง่าย โดยมีโครงสร้างดังนี้:

ขั้นตอนที่ 1: [ชื่อขั้นตอน]
รายละเอียด: [คำอธิบายขั้นตอนนี้]

ขั้นตอนที่ 2: [ชื่อขั้นตอน]
รายละเอียด: [คำอธิบายขั้นตอนนี้]

(ทำซ้ำจนครบ 4-5 ขั้นตอน)`;

const SYSTEM_PROMPT_PASTE_POINT = `คุณคือที่ปรึกษา AI ภารกิจของคุณคือดู workflow ที่ให้มา แล้วแนะนำ 'จุดที่แปะ AI' (Paste-Point) ที่พบบ่อยที่สุด อธิบายสั้นๆ ในประโยคเดียวว่าคนมักใช้ AI ทำอะไรในขั้นตอนนี้ ตอบเป็นภาษาไทยเท่านั้น

**สำคัญ:** ห้ามใช้ตาราง Markdown หรือสัญลักษณ์ |`;

// Response Schema
const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        "title": { "type": "STRING", "description": "ตั้งชื่อ Workflow ใหม่ที่สร้างสรรค์" },
        "new_workflow": {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    "step": { "type": "NUMBER" },
                    "type": { 
                        type: "STRING",
                        enum: ["AUTOMATED", "HUMAN-IN-THE-LOOP", "HUMAN-SPECIALIST"]
                    },
                    "action": { "type": "STRING" }
                },
                required: ["step", "type", "action"],
                propertyOrdering: ["step", "type", "action"]
            }
        },
        "key_changes": {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    "change": { "type": "STRING" },
                    "rationale": { "type": "STRING" }
                },
                required: ["change", "rationale"],
                propertyOrdering: ["change", "rationale"]
            }
        },
        "action_plan": {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    "category": { 
                        type: "STRING",
                        enum: ["Governance", "Reskilling", "Technology"]
                    },
                    "task": { "type": "STRING" }
                },
                required: ["category", "task"],
                propertyOrdering: ["category", "task"]
            }
        }
    },
    required: ["title", "new_workflow", "key_changes", "action_plan"],
    propertyOrdering: ["title", "new_workflow", "key_changes", "action_plan"]
};

// Helper: เรียก Gemini API พร้อม Exponential Backoff
async function callGeminiAPI(userQuery, systemPrompt, responseSchema = null, retries = 3, delay = 1000) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const generationConfig = responseSchema 
        ? {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.7
        }
        : {
            responseMimeType: "text/plain",
            temperature: 0.5
        };

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: generationConfig
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText}. Body: ${errorText}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else {
                let errorInfo = "ไม่ได้รับผลลัพธ์ที่ถูกต้องจาก API";
                if (candidate && candidate.finishReason) {
                    errorInfo += ` (Finish Reason: ${candidate.finishReason})`;
                }
                throw new Error(errorInfo);
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

// API Endpoints

// 1. Main Rewire Endpoint
app.post('/api/rewire', async (req, res) => {
    try {
        const { asIsWorkflow, pastePoint, strategicGoal } = req.body;

        if (!asIsWorkflow || !pastePoint || !strategicGoal) {
            return res.status(400).json({ 
                error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
            });
        }

        const userQuery = `
AS-IS-WORKFLOW: ${asIsWorkflow}
PASTE-POINT: ${pastePoint}
STRATEGIC-GOAL: ${strategicGoal}
`;

        const responseText = await callGeminiAPI(userQuery, SYSTEM_PROMPT_REWIRE, RESPONSE_SCHEMA);
        const data = JSON.parse(responseText);
        
        res.json(data);
    } catch (error) {
        console.error('Error in /api/rewire:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการวิเคราะห์: ' + error.message 
        });
    }
});

// 2. Draft Workflow Endpoint
app.post('/api/draft-workflow', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ 
                error: 'กรุณาป้อนชื่องานหรือบทบาท' 
            });
        }

        const responseText = await callGeminiAPI(prompt, SYSTEM_PROMPT_WORKFLOW);
        
        res.json({ text: responseText });
    } catch (error) {
        console.error('Error in /api/draft-workflow:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการร่าง workflow: ' + error.message 
        });
    }
});

// 3. Suggest Paste Point Endpoint
app.post('/api/suggest-paste-point', async (req, res) => {
    try {
        const { workflow } = req.body;

        if (!workflow) {
            return res.status(400).json({ 
                error: 'กรุณากรอก AS-IS-WORKFLOW ก่อน' 
            });
        }

        const responseText = await callGeminiAPI(workflow, SYSTEM_PROMPT_PASTE_POINT);
        
        res.json({ text: responseText });
    } catch (error) {
        console.error('Error in /api/suggest-paste-point:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการแนะนำ Paste-Point: ' + error.message 
        });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Rewire Engine API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ The Rewire Engine Backend is running on http://localhost:${PORT}`);
});
