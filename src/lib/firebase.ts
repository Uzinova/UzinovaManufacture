import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { mockFirestore } from './mockData';

const firebaseConfig = {
    apiKey: "AIzaSyCNHAuNsVisApnZynx08hT6YVx_r6KniTQ",
    authDomain: "uzistore-ce655.firebaseapp.com",
    projectId: "uzistore-ce655",
    storageBucket: "uzistore-ce655.firebasestorage.app",
    messagingSenderId: "116096193726",
    appId: "1:116096193726:web:47eae91162c511e3413aef",
    measurementId: "G-WFZQQNVFLT"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore and Storage
const actualDb = getFirestore(app);
const actualStorage = getStorage(app);

// Flag to track if Firebase connection failed
let isFirebaseFailing = false;

// Helper functions for authentication
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Exported Firestore functions with fallback to mock implementations
export const db = {
    // Collection reference wrapper
    collection: (path: string) => {
        if (isFirebaseFailing) {
            // For mock implementation, we just need to return an object with a path property
            return { 
                path,
                _path: { 
                    segments: [path] 
                }
            };
        }
        return collection(actualDb, path);
    },
    
    // Document reference wrapper
    doc: (db: any, collectionPath: string, docId: string) => {
        if (isFirebaseFailing) {
            return { 
                path: `${collectionPath}/${docId}` 
            };
        }
        return doc(actualDb, collectionPath, docId);
    },
    
    // Query wrapper
    query: (...args: any[]) => {
        if (isFirebaseFailing) {
            // First arg is the collection reference
            const collectionRef = args[0];
            // Other args are query constraints
            const constraints = args.slice(1);
            
            let orderByField = null;
            let orderDirection = 'asc';
            
            // Extract orderBy constraint if present
            constraints.forEach((constraint: any) => {
                if (constraint && constraint._type === 'orderBy') {
                    orderByField = constraint._field?.segments?.[0];
                    orderDirection = constraint._dir;
                }
            });
            
            return {
                _path: collectionRef._path,
                _query: {
                    orderBy: orderByField ? [{ field: { segments: [orderByField] }, dir: orderDirection }] : []
                }
            };
        }
        return query(...args);
    },
    
    // Get documents wrapper
    getDocs: async (query: any) => {
        try {
            // First try to use the real Firebase
            return await getDocs(query);
        } catch (error) {
            console.warn('Firebase connection failed, falling back to mock data', error);
            isFirebaseFailing = true;
            return mockFirestore.getDocs(query);
        }
    },
    
    // Add document wrapper
    addDoc: async (collectionRef: any, data: any) => {
        if (isFirebaseFailing) {
            return mockFirestore.addDoc(collectionRef, data);
        }
        
        try {
            return await addDoc(collectionRef, data);
        } catch (error) {
            console.warn('Firebase connection failed, falling back to mock data', error);
            isFirebaseFailing = true;
            return mockFirestore.addDoc(collectionRef, data);
        }
    },
    
    // Update document wrapper
    updateDoc: async (docRef: any, data: any) => {
        if (isFirebaseFailing) {
            return mockFirestore.updateDoc(docRef, data);
        }
        
        try {
            return await updateDoc(docRef, data);
        } catch (error) {
            console.warn('Firebase connection failed, falling back to mock data', error);
            isFirebaseFailing = true;
            return mockFirestore.updateDoc(docRef, data);
        }
    },
    
    // Delete document wrapper
    deleteDoc: async (docRef: any) => {
        if (isFirebaseFailing) {
            return mockFirestore.deleteDoc(docRef);
        }
        
        try {
            return await deleteDoc(docRef);
        } catch (error) {
            console.warn('Firebase connection failed, falling back to mock data', error);
            isFirebaseFailing = true;
            return mockFirestore.deleteDoc(docRef);
        }
    },
    
    // Re-export Firestore constraints
    orderBy,
    where
};

// Export storage reference
export const storage = actualStorage;
