export const state = {
    currentSem: "3",
    mode: "check",
    activeCourses: [],
    userConstraints: {},
    actualGrades: {},
    academicHistory: {
        "2": { completed: true, cgpa: 8.5, credits: 40 },
        "3": { completed: false, cgpa: 0, credits: 0 },
        "4": { completed: false, cgpa: 0, credits: 0 },
        "5": { completed: false, cgpa: 0, credits: 0 },
        "6": { completed: false, cgpa: 0, credits: 0 },
        "7": { completed: false, cgpa: 0, credits: 0 },
        "8": { completed: false, cgpa: 0, credits: 0 }
    }
};

export function loadHistory() {
    const data = localStorage.getItem('nitt_history');
    if(data) state.academicHistory = JSON.parse(data);
}

export function saveHistory() {
    localStorage.setItem('nitt_history', JSON.stringify(state.academicHistory));
}

export function saveSemesterConfig() {
    sessionStorage.setItem('nitt_sem_config_'+state.currentSem, JSON.stringify(state.activeCourses));
}

export function loadSemesterConfig(sem) {
    return sessionStorage.getItem('nitt_sem_config_'+sem);
}