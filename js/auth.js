import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCh3Wi_RRz71TjF0N6VS8b8pfxY63GSOyo",
    authDomain: "nitt-cgpa.firebaseapp.com",
    projectId: "nitt-cgpa",
    storageBucket: "nitt-cgpa.firebasestorage.app",
    messagingSenderId: "207174838364",
    appId: "1:207174838364:web:1a80f949b60678d2429e99",
    measurementId: "G-PHKHPVBY7F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function login() {
    try { 
        await signInWithPopup(auth, provider); 
    } catch (error) { 
        alert("Login failed: " + error.message); 
    }
}

onAuthStateChanged(auth, (user) => {
    if(user) document.querySelector('.google-btn').innerText = `Synced: ${user.displayName.split(' ')[0]}`;
});