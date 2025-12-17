import { state, loadHistory, saveHistory, loadSemesterConfig, syncFromCloud } from './store.js';
import { onAuthStateChanged } from './auth.js';
import { TEMPLATES, PREDICT_DEFAULT } from './data.js';
import { renderCourses, renderTabState, showToast, handleToggleCourseType } from './ui.js';
import { calculateLiveStats, solveWorstCase } from './calc.js';
import { login } from './auth.js';

// --- MAIN LOGIC FUNCTIONS ---

function loadSemester(sem) {
    state.currentSem = sem;
    document.getElementById('semTitle').innerText = `Semester ${sem} Courses`;
    
    // Disable inputs check
    const disableStart = (sem !== "3");
    document.getElementById('currCGPA').disabled = disableStart;
    document.getElementById('currCredits').disabled = disableStart;

    // LOAD DATA
    const savedJSON = loadSemesterConfig(sem);
    
    if (savedJSON) {
        // If we have saved data, parse the bundle
        const data = JSON.parse(savedJSON);
        
        // Handle legacy data (if user only had course list saved previously)
        if (Array.isArray(data)) {
            state.activeCourses = data; 
            state.actualGrades = {};
            state.userConstraints = {};
        } else {
            // New format (Bundle)
            state.activeCourses = data.courses || [];
            state.actualGrades = data.grades || {};
            state.userConstraints = data.constraints || {};
        }
    } else {
        // Load Template if no save exists
        state.activeCourses = JSON.parse(JSON.stringify(TEMPLATES[sem]));
        state.actualGrades = {};
        state.userConstraints = {};
    }

    // Ensure defaults exist for any missing constraints
    state.activeCourses.forEach(c => {
        if(!state.userConstraints[c.id]) state.userConstraints[c.id] = [...PREDICT_DEFAULT];
        if(state.actualGrades[c.id] === undefined) state.actualGrades[c.id] = "";
    });

    renderCourses();
    
    // Recalculate stats immediately to show the SGPA/CGPA
    if (state.mode === 'check') {
        calculateLiveStats();
    }
}

function switchTab(sem) {
    const semInt = parseInt(sem);
    const prevInt = semInt - 1;
    if (semInt > 3 && !state.academicHistory[prevInt].completed) {
        showToast(`Complete Semester ${prevInt} first!`);
        return;
    }
    document.querySelectorAll('.sem-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${sem}`).classList.add('active');
    
    const prevHist = state.academicHistory[prevInt];
    document.getElementById('currCGPA').value = prevHist.cgpa.toFixed(2);
    document.getElementById('currCredits').value = prevHist.credits;
    
    loadSemester(sem);
}

function switchMode(newMode) {
    state.mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`mode-${newMode}`).classList.add('active');
    document.getElementById('panel-check').style.display = newMode === 'check' ? 'block' : 'none';
    document.getElementById('panel-predict').style.display = newMode === 'predict' ? 'block' : 'none';
    renderCourses();
}

// ... Actions (Add/Delete/Update) ...
function updateActual(id, val) {
    state.actualGrades[id] = val;
    document.getElementById(`grade-${id}`).classList.remove('error');
    calculateLiveStats();
}

function toggleConstraint(id, grade) {
    const arr = state.userConstraints[id];
    const idx = arr.indexOf(grade);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(grade);
    renderCourses();
}

function addCustomCourse() {
    const newId = `custom_${Date.now()}`;
    state.activeCourses.push({id: newId, name: "New Course", cr: 3, type: "Extra"});
    state.userConstraints[newId] = [...PREDICT_DEFAULT];
    state.actualGrades[newId] = "";
    renderCourses();
}

function deleteCustomCourse(id) {
    state.activeCourses = state.activeCourses.filter(c => c.id !== id);
    delete state.userConstraints[id];
    delete state.actualGrades[id];
    renderCourses();
}

function updateCustomName(id, val) {
    const c = state.activeCourses.find(x => x.id === id);
    if(c) c.name = val;
}

function updateCustomCredits(id, val) {
    const c = state.activeCourses.find(x => x.id === id);
    if(c) c.cr = parseFloat(val) || 0;
}

function updateStartData() {
    if(state.currentSem === "3") {
        const newCGPA = parseFloat(document.getElementById('currCGPA').value) || 0;
        const newCredits = parseFloat(document.getElementById('currCredits').value) || 0;
        state.academicHistory["2"].cgpa = newCGPA;
        state.academicHistory["2"].credits = newCredits;
        saveHistory();
        calculateLiveStats();
    }
}

function saveAndUnlock() {
    let missing = false;
    state.activeCourses.forEach(c => {
        if(!state.actualGrades[c.id]) {
            missing = true;
            const el = document.getElementById(`grade-${c.id}`);
            if(el) el.classList.add('error');
        }
    });

    if (missing) { showToast("Cannot Save! Fill all grades."); return; }

    const currentLiveCGPA = parseFloat(document.getElementById('live-cgpa').innerText);
    const prevHist = state.academicHistory[parseInt(state.currentSem)-1];
    let semCredits = state.activeCourses.reduce((sum, c) => sum + c.cr, 0);
    
    state.academicHistory[state.currentSem] = { completed: true, cgpa: currentLiveCGPA, credits: prevHist.credits + semCredits };
    saveHistory();
    renderTabState();
    showToast(`Semester ${state.currentSem} Saved Successfully!`);
}

function calculateWorstCase() {
    const startCGPA = parseFloat(document.getElementById('currCGPA').value);
    const startCredits = parseFloat(document.getElementById('currCredits').value);
    const targetCGPA = parseFloat(document.getElementById('targetCGPA').value);
    let semCredits = state.activeCourses.reduce((acc, c) => acc + c.cr, 0);
    let totalCredits = startCredits + semCredits;
    let requiredTotalPts = targetCGPA * totalCredits;
    let currentPts = startCGPA * startCredits;
    let targetSemPts = requiredTotalPts - currentPts;
    
    document.getElementById('points-needed').innerText = Math.max(0, targetSemPts).toFixed(1);
    
    const result = solveWorstCase(targetSemPts);
    const resDiv = document.getElementById('prediction-result');
    resDiv.innerHTML = "";
    
    if (!result) {
        resDiv.innerHTML = "<div style='color:#ef4444; text-align:center;'>Impossible to reach target without using prohibited grades.</div>";
        return;
    }
    
    const finalCGPA = ((currentPts + result.points) / totalCredits).toFixed(2);
    const sgpa = (result.points / semCredits).toFixed(2);
    
    let html = `<div class="result-card"><div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Lowest Sufficient Grades</div>
        <div class="result-main-stat">${finalCGPA} CGPA</div><div class="result-sub">Needs ${sgpa} SGPA</div><div class="mini-grade-grid">`;
    result.history.forEach(h => {
        let name = h.name.split('-')[1] || h.name; 
        name = name.length > 15 ? name.substring(0,12)+"..." : name;
        html += `<div class="mg-name">${name}</div><div class="mg-val">${h.grade}</div>`;
    });
    html += `</div></div>`;
    resDiv.innerHTML = html;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();

    const startHistory = state.academicHistory["2"];
    if (startHistory) {
        const cgpaInput = document.getElementById('currCGPA');
        const creditsInput = document.getElementById('currCredits');
        
        if (cgpaInput) cgpaInput.value = startHistory.cgpa;
        if (creditsInput) creditsInput.value = startHistory.credits;
    }

    renderTabState();
    loadSemester("3");

    // Listen for Login
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            document.querySelector('.google-btn').innerText = `Synced: ${user.displayName.split(' ')[0]}`;
            // When user logs in, pull their data
            const updated = await syncFromCloud();
            if (updated) {
                // If we got new data, refresh the UI
                renderTabState();
                
                // If on Sem 3, update the inputs to match new history
                const hist = state.academicHistory["2"];
                if(state.currentSem === "3" && hist) {
                   document.getElementById('currCGPA').value = hist.cgpa;
                   document.getElementById('currCredits').value = hist.credits;
                }
                
                showToast("Data downloaded from Cloud!");
            }
        }
    });
});

window.app = {
    switchTab,
    switchMode,
    toggleCourseType: handleToggleCourseType,
    updateActual,
    toggleConstraint,
    addCustomCourse,
    deleteCustomCourse,
    updateCustomName,
    updateCustomCredits,
    updateStartData,
    saveAndUnlock,
    calculateWorstCase,
    login
};