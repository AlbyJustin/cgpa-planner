import { state } from './store.js';
import { GRADES } from './data.js';

export function calculateLiveStats() {
    let totalPts = 0, totalCr = 0;
    state.activeCourses.forEach(c => {
        const g = state.actualGrades[c.id];
        if (g && GRADES[g] !== undefined) {
            totalPts += GRADES[g] * c.cr;
            totalCr += c.cr;
        }
    });
    
    // Update DOM if valid
    if (totalCr > 0) {
        const sgpa = totalPts / totalCr;
        const elSgpa = document.getElementById('live-sgpa');
        if(elSgpa) elSgpa.innerText = sgpa.toFixed(2);
        
        const prevHist = state.academicHistory[parseInt(state.currentSem)-1];
        const newTotalPts = (prevHist.cgpa * prevHist.credits) + totalPts;
        const newTotalCr = prevHist.credits + totalCr;
        const cgpa = newTotalPts / newTotalCr;
        const elCgpa = document.getElementById('live-cgpa');
        if(elCgpa) elCgpa.innerText = cgpa.toFixed(2);
    }
}

export function solveWorstCase(targetPts) {
    const courses = state.activeCourses.map(c => {
        const allowed = (state.userConstraints[c.id] || []).slice();
        allowed.sort((a,b) => GRADES[a] - GRADES[b]);
        return {
            id: c.id,
            name: c.name,
            cr: c.cr,
            allowed: allowed,
            currentIdx: 0 
        };
    });

    if (courses.some(c => c.allowed.length === 0)) return null;

    while (true) {
        let currentPts = 0;
        let history = [];
        courses.forEach(c => {
            const grade = c.allowed[c.currentIdx];
            currentPts += GRADES[grade] * c.cr;
            history.push({ name: c.name, grade: grade });
        });

        if (currentPts >= targetPts - 0.01) {
            return { points: currentPts, history: history };
        }

        let bestCourse = null;
        let bestUpgradeVal = 999;
        let bestUpgradeCr = -1;

        for (let c of courses) {
            if (c.currentIdx < c.allowed.length - 1) {
                const nextGrade = c.allowed[c.currentIdx + 1];
                const nextVal = GRADES[nextGrade];

                if (nextVal < bestUpgradeVal || (nextVal === bestUpgradeVal && c.cr > bestUpgradeCr)) {
                    bestCourse = c;
                    bestUpgradeVal = nextVal;
                    bestUpgradeCr = c.cr;
                }
            }
        }

        if (!bestCourse) return null;

        bestCourse.currentIdx++;
    }
}