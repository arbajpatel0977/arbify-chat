import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
const firebaseConfig = {
    apiKey: "AIzaSyC2TCgGHSmKrPuSe2LBFcMSWeLc7S-smYg",
    authDomain: "arbifychat.firebaseapp.com",
    projectId: "arbifychat",
    storageBucket: "arbifychat.firebasestorage.app",
    messagingSenderId: "852209627179",
    appId: "1:852209627179:web:196a245d25c86f45deba6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const db = getFirestore(app)

const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey , There i am using Arbify chat",
            lastSeen: Date.now()
        })
        await setDoc(doc(db, "chats", user.uid), {
            chatData: []
        })
    } catch (error) {
        console.log("error Firebase", error);
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
        console.log(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.log(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
}

const resetPass = async (email) => {
    if (!email) {
        toast.error("Please enter your email address");
        return null;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where('email', "==", email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent! Please check your inbox.");
        }
        else {
            toast.error("Email address not found.");
        }
    } catch (error) {
        console.log(error)
        toast.error("Failed to send password reset email. Please try again.", error.message);
    }
}

const googleSignIn = async () => {
    try {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists
        const userRef = collection(db, 'users');
        const q = query(userRef, where('email', "==", user.email));
        const querySnap = await getDocs(q);

        // If user doesn't exist, create user profile
        if (querySnap.empty) {
            await setDoc(doc(db, "users", user.uid), {
                id: user.uid,
                username: user.displayName?.toLowerCase() || user.email.split('@')[0],
                email: user.email,
                name: user.displayName || "",
                avatar: user.photoURL || "",
                bio: "Hey, There i am using Arbify chat",
                lastSeen: Date.now()
            })
            await setDoc(doc(db, "chats", user.uid), {
                chatData: []
            })
        }
        toast.success("Logged in successfully!");
    } catch (error) {
        console.log("Google Sign-In Error:", error);
        toast.error(error.message || "Failed to sign in with Google");
    }
}

export { signup, login, logout, auth, db, resetPass, googleSignIn };