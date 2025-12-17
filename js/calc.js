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
    
    if (totalCr > 0) {
        const sgpa = totalPts / totalCr;
        document.getElementById('live-sgpa').innerText = sgpa.toFixed(2);
        
        const prevHist = state.academicHistory[parseInt(state.currentSem)-1];
        const newTotalPts = (prevHist.cgpa * prevHist.credits) + totalPts;
        const newTotalCr = prevHist.credits + totalCr;
        const cgpa = newTotalPts / newTotalCr;
        document.getElementById('live-cgpa').innerText = cgpa.toFixed(2);
    }
}

export function solveWorstCase(targetPts) {
    const courseConfig = state.activeCourses.map(c => ({
        id: c.id, name: c.name, cr: c.cr,
        allowed: (state.userConstraints[c.id] || []).sort((a,b) => GRADES[a] - GRADES[b])
    }));

    let bestSolution = null;
    
    function backtrack(idx, currentPts, history) {
        if (bestSolution) return; 
        if (idx === courseConfig.length) {
            if (currentPts >= targetPts - 0.5) {
                bestSolution = { points: currentPts, history: history };
            }
            return;
        }
        const crs = courseConfig[idx];
        if (crs.allowed.length === 0) return;
        for (let g of crs.allowed) {
            backtrack(idx + 1, currentPts + (GRADES[g] * crs.cr), [...history, {name: crs.name, grade: g}]);
            if (bestSolution) return;
        }
    }
    
    backtrack(0, 0, []);
    return bestSolution;
}