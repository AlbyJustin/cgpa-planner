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

export function saveSemesterConfig() {
    const dataToSave = {
        courses: state.activeCourses,
        grades: state.actualGrades,
        constraints: state.userConstraints
    };
    localStorage.setItem('nitt_sem_data_' + state.currentSem, JSON.stringify(dataToSave));
    syncToCloud(); // Auto-sync when grades change
}

export function loadSemesterConfig(sem) {
    return localStorage.getItem('nitt_sem_data_' + sem);
}

// --- CLOUD SYNC (NOW SAVES EVERYTHING) ---

// 1. PULL: Get ALL data from Cloud
export async function syncFromCloud() {
    const user = auth.currentUser;
    if (!user) return false;

    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 1. Restore History
            if (data.academicHistory) {
                state.academicHistory = data.academicHistory;
                localStorage.setItem('nitt_v11_history', JSON.stringify(state.academicHistory));
            }

            // 2. Restore Current Semester Data if available
            const semKey = 'sem_' + state.currentSem;
            if (data[semKey]) {
                const semData = data[semKey];
                state.activeCourses = semData.courses || [];
                state.actualGrades = semData.grades || {};
                state.userConstraints = semData.constraints || {};
                
                // Update Local Storage
                localStorage.setItem('nitt_sem_data_' + state.currentSem, JSON.stringify(semData));
            }

            console.log("Full data synced from cloud!");
            return true; 
        }
    } catch (e) {
        console.error("Error pulling from cloud: ", e);
    }
    return false;
}

// 2. PUSH: Save ALL data to Cloud
export async function syncToCloud() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Prepare the payload
        const payload = {
            academicHistory: state.academicHistory,
            lastUpdated: new Date()
        };

        // Add the current semester's data to the payload
        payload['sem_' + state.currentSem] = {
            courses: state.activeCourses,
            grades: state.actualGrades,
            constraints: state.userConstraints
        };

        await setDoc(doc(db, "users", user.uid), payload, { merge: true });
        console.log("Data saved to cloud!");
    } catch (e) {
        console.error("Error saving to cloud: ", e);
    }
}