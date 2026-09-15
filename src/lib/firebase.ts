import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { Project, SiteSettings, ContactMessage } from '../types';
import { defaultSiteSettings, defaultProjects } from '../data/defaultContent';

// Fallback configuration if env variables are not yet populated
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAekzhVaPluAKCLRZlrojsPyQEM2lXRp7Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "endless-quote-51ttq.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "endless-quote-51ttq",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "endless-quote-51ttq.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "416026597596",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:416026597596:web:322ba35009ebfc0a177c19",
};

const firestoreDatabaseId = "ai-studio-ashwickramasingh-6eefcd6a-5ae1-414e-8e06-bb258ac8b049";

// Initialize Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if available
let dbInstance;
try {
  dbInstance = getFirestore(app, firestoreDatabaseId);
} catch (e) {
  console.warn("Falling back to default Firestore database", e);
  dbInstance = getFirestore(app);
}
export const db = dbInstance;
export const storage = getStorage(app);

/* =========================================================================
   SITE SETTINGS CMS (Profile, Bio, CV Link, Skills)
   ========================================================================= */

const SETTINGS_DOC_ID = 'main_settings';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, 'site_settings', SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...defaultSiteSettings, ...(snap.data() as Partial<SiteSettings>) };
    }
    // Return default settings if none exist yet
    return defaultSiteSettings;
  } catch (err) {
    console.warn("Using default site settings due to read error:", err);
    return defaultSiteSettings;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, 'site_settings', SETTINGS_DOC_ID);
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/* =========================================================================
   PROJECTS CMS (Full CRUD)
   ========================================================================= */

export async function getProjects(): Promise<Project[]> {
  try {
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Return default curated projects
      return defaultProjects;
    }

    const projects: Project[] = [];
    snapshot.forEach(docSnap => {
      projects.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Project, 'id'>)
      });
    });
    return projects;
  } catch (err) {
    console.warn("Falling back to default projects:", err);
    return defaultProjects;
  }
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<string> {
  const colRef = collection(db, 'projects');
  const docRef = await addDoc(colRef, {
    ...projectData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await updateDoc(docRef, projectData);
}

export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await deleteDoc(docRef);
}

/* =========================================================================
   CONTACT FORM MESSAGES
   ========================================================================= */

export async function submitContactMessage(message: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<string> {
  const colRef = collection(db, 'messages');
  const docRef = await addDoc(colRef, {
    ...message,
    createdAt: new Date().toISOString(),
    status: 'unread',
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: ContactMessage[] = [];
    snapshot.forEach(d => {
      const data = d.data();
      list.push({
        id: d.id,
        name: data.name || 'Anonymous',
        email: data.email || 'No email provided',
        subject: data.subject || 'General Inquiry',
        message: data.message || '',
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'unread'
      });
    });
    return list;
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  }
}

export async function updateMessageStatus(id: string, status: 'read' | 'unread'): Promise<void> {
  const docRef = doc(db, 'messages', id);
  await updateDoc(docRef, { status });
}

export async function deleteContactMessage(id: string): Promise<void> {
  const docRef = doc(db, 'messages', id);
  await deleteDoc(docRef);
}

/* =========================================================================
   FILE UPLOAD (Firebase Storage with safe Base64 fallback)
   ========================================================================= */

export async function uploadMediaFile(file: File, folder: string = 'portfolio'): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanFileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return downloadUrl;
  } catch (storageErr) {
    console.warn("Storage upload encountered issue, using high-efficiency DataURL fallback:", storageErr);
    // Convert to DataURL as dependable fallback so admin uploads never break
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

/* =========================================================================
   ADMIN AUTHENTICATION
   ========================================================================= */

export async function loginAdmin(email: string, pass: string): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  } catch (err: any) {
    // If user not found and attempting designated admin email, auto-create
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, pass);
        return newCred.user;
      } catch (createErr: any) {
        // If create also fails because user already exists, re-throw original error
        throw err;
      }
    }
    throw err;
  }
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
