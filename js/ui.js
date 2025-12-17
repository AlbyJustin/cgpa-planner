import { state, saveSemesterConfig } from './store.js';
import { GRADES, PREDICT_FULL, CHECK_KEYS, PE_POOL_GEN, OE_POOL_GEN, CSPE_POOL_SEM3_4 } from './data.js';
import { calculateLiveStats } from './calc.js';

export function showToast(msg) {
    const t = document.getElementById("toast");
    t.className = "show"; t.innerText = msg;
    setTimeout(() => { t.className = t.className.replace("show", ""); }, 3000);
}

export function renderTabState() {
    for(let i=4; i<=8; i++) {
        const btn = document.getElementById(`tab-${i}`);
        if(state.academicHistory[i-1].completed) btn.classList.remove('locked');
        else btn.classList.add('locked');
    }
}

export function renderCourses() {
    const list = document.getElementById('course-list');
    list.innerHTML = "";

    state.activeCourses.forEach(c => {
        const div = document.createElement('div');
        div.className = 'course-item';

        // INFO
        let infoHtml = `<div><div style="margin-bottom:4px; display:flex; align-items:center;">
            <span class="badge">${c.type}</span>`;
        
        if(c.type === "PE/OE") {
            const isOE = c.currentType === "OE";
            infoHtml += `<button class="type-toggle ${isOE?'is-oe':''}" onclick="window.app.toggleCourseType('${c.id}')">⇄ ${c.currentType}</button>`;
        }
        infoHtml += `</div>`;

        if(c.type === "Extra") {
            infoHtml += `<input type="text" class="course-name-edit" value="${c.name}" onchange="window.app.updateCustomName('${c.id}', this.value)">`;
        } else if (c.opts) {
            infoHtml += `<select class="elective-select"><option>${c.name} (Select)</option>${c.opts.map(o => `<option>${o}</option>`).join('')}</select>`;
        } else {
            infoHtml += `<div class="course-name-fixed">${c.name}</div>`;
        }
        infoHtml += `</div>`;

        // CREDITS
        let crHtml = "";
        if(c.type === "Extra") {
             crHtml = `<input type="number" class="credits-edit" value="${c.cr}" onchange="window.app.updateCustomCredits('${c.id}', this.value)">`;
        } else {
             crHtml = `<div class="credits-box">${c.cr}</div>`;
        }

        // INPUTS
        let inputHtml = `<div>`;
        if (state.mode === 'check') {
            const val = state.actualGrades[c.id] || "";
            inputHtml += `<select id="grade-${c.id}" class="grade-select-actual" onchange="window.app.updateActual('${c.id}', this.value)">
                <option value="" disabled ${val===""?"selected":""}>Grade</option>
                ${CHECK_KEYS.map(g => `<option value="${g}" ${val===g?"selected":""}>${g} (${GRADES[g]})</option>`).join('')}
            </select>`;
        } else {
            inputHtml += `<div class="grade-options">`;
            PREDICT_FULL.forEach(g => {
                const active = state.userConstraints[c.id].includes(g) ? 'active' : 'inactive';
                inputHtml += `<div class="grade-chip ${active}" onclick="window.app.toggleConstraint('${c.id}', '${g}')">${g}</div>`;
            });
            inputHtml += `</div>`;
        }
        inputHtml += `</div>`;

        if(c.type === "Extra") {
            inputHtml += `<button class="delete-course-btn" onclick="window.app.deleteCustomCourse('${c.id}')">&times;</button>`;
        }

        div.innerHTML = infoHtml + crHtml + inputHtml;
        list.appendChild(div);
    });
    
    saveSemesterConfig();
}

export function handleToggleCourseType(id) {
    const course = state.activeCourses.find(c => c.id === id);
    const peTitle = course.peName || "Prog Elective";
    const oeTitle = course.oeName || "Open Elective";

    if(course.currentType === "PE") {
        course.currentType = "OE"; 
        course.opts = OE_POOL_GEN; 
        course.name = oeTitle;
    } else {
        course.currentType = "PE"; 
        course.opts = (state.currentSem === "4") ? CSPE_POOL_SEM3_4 : PE_POOL_GEN; 
        course.name = peTitle;
    }
    renderCourses();
}