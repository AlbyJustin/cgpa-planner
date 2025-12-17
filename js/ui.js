import { state } from './store.js'; // REMOVED saveSemesterConfig import
import { GRADES, PREDICT_FULL, CHECK_KEYS, PE_POOL_GEN, OE_POOL_GEN, CSPE_POOL_SEM3_4 } from './data.js';

export function showToast(msg) {
    const t = document.getElementById("toast");
    t.className = "show"; t.innerText = msg;
    setTimeout(() => { t.className = t.className.replace("show", ""); }, 3000);
}

// ... renderTabState remains same ...
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

        // 1. BADGE COLUMN
        let badgeHtml = `<div>`;
        if (c.type === "PE/OE") {
            const isOE = c.currentType === "OE";
            badgeHtml += `<button class="type-toggle ${isOE?'is-oe':''}" onclick="window.app.toggleCourseType('${c.id}')">⇄ ${c.currentType}</button>`;
        } else {
            badgeHtml += `<span class="badge">${c.type}</span>`;
        }
        badgeHtml += `</div>`;

        // 2. NAME COLUMN
        let nameHtml = `<div>`;
        if(c.type === "Extra") {
            nameHtml += `<input type="text" class="course-name-edit" value="${c.name}" onchange="window.app.updateCustomName('${c.id}', this.value)" placeholder="Course Name">`;
        } else if (c.opts) {
            // ELECTIVE DROPDOWN LOGIC
            nameHtml += `<select class="elective-select" onchange="window.app.updateElectiveChoice('${c.id}', this.value)">`;
            if (!c.opts.includes(c.name)) {
                nameHtml += `<option value="" disabled selected>${c.name} (Select)</option>`;
            }

            c.opts.forEach(opt => {
                const isSel = (opt === c.name) ? 'selected' : '';
                nameHtml += `<option value="${opt}" ${isSel}>${opt}</option>`;
            });
            
            nameHtml += `</select>`;
        } else {
            nameHtml += `<div class="course-name-fixed">${c.name}</div>`;
        }
        nameHtml += `</div>`;

        // 3. CREDITS COLUMN
        let crHtml = `<div>`;
        if(c.type === "Extra") {
             crHtml += `<input type="number" class="credits-edit" value="${c.cr}" onchange="window.app.updateCustomCredits('${c.id}', this.value)">`;
        } else {
             crHtml += `<div class="credits-box">${c.cr}</div>`;
        }
        crHtml += `</div>`;

        // 4. GRADE COLUMN
        let gradeHtml = `<div>`;
        if (state.mode === 'check') {
            const val = state.actualGrades[c.id] || "";
            gradeHtml += `<select id="grade-${c.id}" class="grade-select-actual" onchange="window.app.updateActual('${c.id}', this.value)">
                <option value="" disabled ${val===""?"selected":""}>Grade</option>
                ${CHECK_KEYS.map(g => `<option value="${g}" ${val===g?"selected":""}>${g} (${GRADES[g]})</option>`).join('')}
            </select>`;
        } else {
            gradeHtml += `<div class="grade-options">`;
            PREDICT_FULL.forEach(g => {
                const active = state.userConstraints[c.id].includes(g) ? 'active' : 'inactive';
                gradeHtml += `<div class="grade-chip ${active}" onclick="window.app.toggleConstraint('${c.id}', '${g}')">${g}</div>`;
            });
            gradeHtml += `</div>`;
        }
        gradeHtml += `</div>`;

        // 5. ACTION COLUMN
        let actionHtml = `<div>`;
        if(c.type === "Extra") {
            actionHtml += `<button class="delete-course-btn" onclick="window.app.deleteCustomCourse('${c.id}')">&times;</button>`;
        }
        actionHtml += `</div>`;

        div.innerHTML = badgeHtml + nameHtml + crHtml + gradeHtml + actionHtml;
        list.appendChild(div);
    });
    
    // REMOVED: saveSemesterConfig(); <-- THIS WAS CAUSING DATA LOSS
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
    import('./store.js').then(mod => mod.saveSemesterConfig());
}