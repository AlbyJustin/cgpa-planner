import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db, auth } from './auth.js'; 

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

// --- LOCAL STORAGE ---
export function loadHistory() {
    const data = localStorage.getItem('nitt_v11_history');
    if(data) state.academicHistory = JSON.parse(data);
}

export function saveHistory() {
    localStorage.setItem('nitt_v11_history', JSON.stringify(state.academicHistory));
    syncToCloud(); 
}

// FIX: Save EVERYTHING (Courses + Grades + Constraints)
export function saveSemesterConfig() {
    const dataToSave = {
        courses: state.activeCourses,
        grades: state.actualGrades,
        constraints: state.userConstraints
    };
    localStorage.setItem('nitt_sem_data_' + state.currentSem, JSON.stringify(dataToSave));
}

export function loadSemesterConfig(sem) {
    return localStorage.getItem('nitt_sem_data_' + sem);
}

// --- CLOUD SYNC ---

// 1. PULL: Get data from Cloud (Call this on Login)
export async function syncFromCloud() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.academicHistory) {
                state.academicHistory = data.academicHistory;
                localStorage.setItem('nitt_v11_history', JSON.stringify(state.academicHistory));
                console.log("Data synced from cloud!");
                return true; 
            }
        }
    } catch (e) {
        console.error("Error pulling from cloud: ", e);
    }
    return false;
}

// 2. PUSH: Save data to Cloud (Call this on Save)
export async function syncToCloud() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await setDoc(doc(db, "users", user.uid), {
            academicHistory: state.academicHistory,
            lastUpdated: new Date()
        }, { merge: true });
        console.log("Data saved to cloud!");
    } catch (e) {
        console.error("Error saving to cloud: ", e);
    }
}