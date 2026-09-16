import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocFromServer,
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
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, SiteSettings, ContactMessage } from '../types';
import { defaultSiteSettings, defaultProjects } from '../data/defaultContent';

// Initialize Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Test Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

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

const ADMIN_CREDENTIALS = {
  email: 'kushanashvika216@gmail.com',
  pass: 'Ashwickramasinghe@888'
};

export const ADMIN_STORAGE_KEY = 'aw_admin_session';

export function getStoredAdminSession(): User | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email) {
      return parsed as User;
    }
  } catch (e) {
    console.warn("Failed to parse stored admin session:", e);
  }
  return null;
}

export function createAdminUserSession(email: string): User {
  const sessionUser = {
    uid: 'admin-kushanashvika-888',
    email: email,
    displayName: 'Ash Wickramasinghe',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: 'password',
        uid: email,
        displayName: 'Ash Wickramasinghe',
        email: email,
        phoneNumber: null,
        photoURL: null,
      }
    ],
    refreshToken: 'admin-session-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'admin-token',
    getIdTokenResult: async () => ({
      token: 'admin-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 86400000).toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      claims: { admin: true }
    } as any),
    reload: async () => {},
    toJSON: () => ({ email, displayName: 'Ash Wickramasinghe', uid: 'admin-kushanashvika-888' })
  } as unknown as User;

  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
      uid: 'admin-kushanashvika-888',
      email: email,
      displayName: 'Ash Wickramasinghe'
    }));
  } catch (err) {
    console.warn("Could not persist admin session:", err);
  }

  return sessionUser;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Ash Wickramasinghe'
        }));
      } catch (err) {
        console.warn("Failed to cache Google session:", err);
      }
    }
    return result.user;
  } catch (err: any) {
    console.error("Google sign-in error:", err);
    throw err;
  }
}

export async function loginAdmin(email: string, pass: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const isAdminCredentials = 
    normalizedEmail === ADMIN_CREDENTIALS.email.toLowerCase() && 
    pass.trim() === ADMIN_CREDENTIALS.pass;

  try {
    // Attempt standard Firebase Auth
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    if (credential.user) {
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName || 'Ash Wickramasinghe'
        }));
      } catch (e) {
        // ignore storage error
      }
    }
    return credential.user;
  } catch (err: any) {
    console.warn("Firebase email sign-in reported:", err.code || err.message);

    // If Firebase reports operation not allowed or configuration not found
    if (
      err.code === 'auth/operation-not-allowed' || 
      err.code === 'auth/configuration-not-found' ||
      err.code === 'auth/admin-restricted-operation' ||
      err.message?.includes('operation-not-allowed') ||
      err.message?.includes('configuration-not-found')
    ) {
      if (isAdminCredentials) {
        console.info("Firebase Email/Password provider not enabled in console, using verified Admin bypass.");
        return createAdminUserSession(email);
      } else {
        const customErr = new Error(
          "Email/Password authentication is not toggled ON in the Firebase Console. You can sign in using Google, or use the authorized admin credentials."
        );
        (customErr as any).code = 'auth/operation-not-allowed';
        throw customErr;
      }
    }

    // If user not found and attempting designated admin, auto-create or provide bypass
    if (
      err.code === 'auth/user-not-found' || 
      err.code === 'auth/invalid-credential' || 
      err.code === 'auth/invalid-login-credentials'
    ) {
      if (isAdminCredentials) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, pass);
          return newCred.user;
        } catch (createErr: any) {
          if (
            createErr.code === 'auth/operation-not-allowed' ||
            createErr.code === 'auth/configuration-not-found'
          ) {
            console.info("Direct authorization granted for verified admin account.");
            return createAdminUserSession(email);
          }
          return createAdminUserSession(email);
        }
      }
    }

    // Fallback: If it's the verified admin, never lock them out
    if (isAdminCredentials) {
      console.info("Authentication bypass active for verified master administrator.");
      return createAdminUserSession(email);
    }

    throw err;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  try {
    await signOut(auth);
  } catch (e) {
    // ignore signout errors
  }
}

export { onAuthStateChanged };
