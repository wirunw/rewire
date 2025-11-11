// ⚠️ ตั้งค่า Backend URL ตามที่คุณ deploy
const API_BASE_URL = 'http://localhost:3000'; // เปลี่ยนตามที่ backend ของคุณทำงาน

// --- DOM Elements ---
const button = document.getElementById('rewire-button');
const outputSection = document.getElementById('output-section');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('results-container');

const asIsWorkflow = document.getElementById('as-is-workflow');
const pastePoint = document.getElementById('paste-point');

// Helper Feature DOM Elements
const workflowHelperPrompt = document.getElementById('workflow-helper-prompt');
const draftWorkflowButton = document.getElementById('draft-workflow-button');
const suggestPastePointButton = document.getElementById('suggest-paste-point-button');

// Strategic Goal Button Logic
const goalButtons = document.querySelectorAll('.strategic-goal-button');
let selectedStrategicGoal = 'Efficiency'; // Default value

// CSS Classes for button states
const activeGoalClasses = ['bg-blue-600', 'text-white', 'shadow-lg', 'scale-105', 'border-blue-700'];
const inactiveGoalClasses = ['bg-white', 'text-gray-700', 'border-gray-300', 'hover:bg-gray-50'];

function setGoalButtonState() {
    goalButtons.forEach(btn => {
        const value = btn.getAttribute('data-value');
        if (value === selectedStrategicGoal) {
            btn.classList.remove(...inactiveGoalClasses);
            btn.classList.add(...activeGoalClasses);
        } else {
            btn.classList.remove(...activeGoalClasses);
            btn.classList.add(...inactiveGoalClasses);
        }
    });
}

// Initialize button state on load
setGoalButtonState();

goalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedStrategicGoal = btn.getAttribute('data-value');
        setGoalButtonState();
    });
});

// --- Event Listeners ---
button.addEventListener('click', handleRewireClick);
draftWorkflowButton.addEventListener('click', handleDraftWorkflowClick);
suggestPastePointButton.addEventListener('click', handleSuggestPastePointClick);

// --- Main Function: Handle Click ---
async function handleRewireClick() {
    // 1. รับค่า Input
    const asIs = asIsWorkflow.value;
    const paste = pastePoint.value;
    const goal = selectedStrategicGoal;

    // 2. ตรวจสอบ Input
    if (!asIs || !paste) {
        showError("กรุณากรอกข้อมูล 'AS-IS-WORKFLOW' และ 'PASTE-POINT' ให้ครบถ้วน");
        return;
    }

    // 3. เตรียม UI
    outputSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    errorMessage.style.display = 'none';
    loader.style.display = 'block';
    button.disabled = true;
    button.textContent = 'กำลังวิเคราะห์...';

    try {
        // 4. เรียก Backend API
        const response = await fetch(`${API_BASE_URL}/api/rewire`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asIsWorkflow: asIs,
                pastePoint: paste,
                strategicGoal: goal
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error("Error calling API:", error);
        showError(`เกิดข้อผิดพลาดในการวิเคราะห์: ${error.message}`);
    } finally {
        // 5. คืนค่า UI
        loader.style.display = 'none';
        button.disabled = false;
        button.textContent = 'วิเคราะห์และจัดระบบใหม่ (Rewire)';
    }
}

// --- Function: Handle Draft Workflow ---
async function handleDraftWorkflowClick(e) {
    e.preventDefault();
    const prompt = workflowHelperPrompt.value;
    if (!prompt) {
        showError("กรุณาป้อนชื่องานหรือบทบาทในช่อง 'ร่าง Workflow' ก่อนครับ");
        return;
    }

    draftWorkflowButton.disabled = true;
    draftWorkflowButton.textContent = '...';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/api/draft-workflow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        asIsWorkflow.value = data.text;
        workflowHelperPrompt.value = "";
    } catch (error) {
        console.error("Error drafting workflow:", error);
        showError("เกิดข้อผิดพลาดในการร่าง workflow: " + error.message);
    } finally {
        draftWorkflowButton.disabled = false;
        draftWorkflowButton.textContent = '✨ ร่าง Workflow';
    }
}

// --- Function: Handle Suggest Paste Point ---
async function handleSuggestPastePointClick(e) {
    e.preventDefault();
    const workflow = asIsWorkflow.value;
    if (!workflow) {
        showError("กรุณากรอก AS-IS-WORKFLOW ก่อนครับ AI จึงจะแนะนำ Paste-Point ได้");
        return;
    }

    suggestPastePointButton.disabled = true;
    suggestPastePointButton.textContent = 'กำลังคิด...';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/api/suggest-paste-point`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflow })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        pastePoint.value = data.text;
    } catch (error) {
        console.error("Error suggesting paste point:", error);
        showError("เกิดข้อผิดพลาดในการแนะนำ Paste-Point: " + error.message);
    } finally {
        suggestPastePointButton.disabled = false;
        suggestPastePointButton.textContent = "✨ ให้ AI แนะนำ \"Paste-Point\" ที่พบบ่อย (จาก Workflow ด้านบน)";
    }
}

// --- Helper: Display Results ---
function displayResults(data) {
    resultsContainer.innerHTML = '';

    // 1. Title
    const title = document.createElement('h2');
    title.className = 'text-3xl font-bold text-blue-800 mb-6';
    title.textContent = data.title;
    resultsContainer.appendChild(title);

    // 2. New Workflow
    const workflowSection = document.createElement('div');
    workflowSection.className = 'mb-8';
    workflowSection.innerHTML = `<h3 class="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">New Workflow</h3>`;

    const table = document.createElement('table');
    table.className = 'w-full min-w-full divide-y divide-gray-200 border rounded-lg shadow-sm';
    table.innerHTML = `
        <thead class="bg-gray-100">
            <tr>
                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Step</th>
                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Type</th>
                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8/12">Action</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200"></tbody>
    `;
    const tbody = table.querySelector('tbody');

    data.new_workflow.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-3 text-sm font-medium text-gray-900">${item.step}</td>
            <td class="p-3 text-sm text-gray-700">${getTypeBadge(item.type)}</td>
            <td class="p-3 text-sm text-gray-700">${item.action}</td>
        `;
        tbody.appendChild(tr);
    });
    workflowSection.appendChild(table);
    resultsContainer.appendChild(workflowSection);

    // 3. Key Changes
    const changesSection = document.createElement('div');
    changesSection.className = 'mb-8';
    changesSection.innerHTML = `<h3 class="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">Key Changes</h3>`;

    data.key_changes.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-blue-50 border border-blue-200 p-4 rounded-lg mb-3 shadow-sm';
        card.innerHTML = `
            <p class="font-semibold text-blue-800">${item.change}</p>
            <p class="text-gray-700 mt-1">${item.rationale}</p>
        `;
        changesSection.appendChild(card);
    });
    resultsContainer.appendChild(changesSection);

    // 4. Action Plan
    const planSection = document.createElement('div');
    planSection.className = 'mb-8';
    planSection.innerHTML = `<h3 class="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">Action Plan</h3>`;

    // จัดกลุ่มตาม Category
    const categories = {
        "Governance": [],
        "Reskilling": [],
        "Technology": []
    };

    data.action_plan.forEach(item => {
        if (categories[item.category]) {
            categories[item.category].push(item.task);
        }
    });

    Object.keys(categories).forEach(category => {
        if (categories[category].length > 0) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-4';
            categoryDiv.innerHTML = `<h4 class="text-lg font-semibold text-gray-700">${category}</h4>`;
            const ul = document.createElement('ul');
            ul.className = 'list-disc list-inside mt-2 text-gray-600 space-y-1';
            categories[category].forEach(task => {
                const li = document.createElement('li');
                li.textContent = task;
                ul.appendChild(li);
            });
            categoryDiv.appendChild(ul);
            planSection.appendChild(categoryDiv);
        }
    });
    resultsContainer.appendChild(planSection);
}

// --- Helper: Get Type Badge (Styling) ---
function getTypeBadge(type) {
    let bgColor, textColor, text;
    switch (type) {
        case 'AUTOMATED':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            text = 'Automated';
            break;
        case 'HUMAN-IN-THE-LOOP':
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            text = 'Human-in-the-Loop';
            break;
        case 'HUMAN-SPECIALIST':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            text = 'Human Specialist';
            break;
        default:
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
            text = type;
    }
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}">${text}</span>`;
}

// --- Helper: Show Error ---
function showError(message) {
    outputSection.style.display = 'block';
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
    loader.style.display = 'none';
}
