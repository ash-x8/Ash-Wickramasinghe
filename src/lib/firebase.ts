import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
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
  where,
  onSnapshot,
  getDocFromServer,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, SiteSettings, ContactMessage, Article, ServiceItem, MediaItem } from '../types';
import { defaultSiteSettings, defaultProjects, defaultArticles } from '../data/defaultContent';

// Initialize Firebase instances
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export const AUTHORIZED_ADMIN_EMAIL = 'kushanashvika216@gmail.com';

/* =========================================================================
   FIRESTORE ERROR HANDLER & CONNECTION TEST (Standardized)
   ========================================================================= */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Validation connection test
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'site_settings', 'main_settings'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client offline or connection unreachable.");
    }
  }
}
testConnection();

/* =========================================================================
   SITE SETTINGS (Profile, Bio, Theme, Accent, SEO)
   ========================================================================= */

const SETTINGS_DOC_ID = 'main_settings';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, 'site_settings', SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...defaultSiteSettings, ...(snap.data() as Partial<SiteSettings>) };
    }
    return defaultSiteSettings;
  } catch (err) {
    console.warn("Falling back to default site settings:", err);
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

export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void): () => void {
  const docRef = doc(db, 'site_settings', SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...defaultSiteSettings, ...(snap.data() as Partial<SiteSettings>) });
      } else {
        callback(defaultSiteSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `site_settings/${SETTINGS_DOC_ID}`);
      callback(defaultSiteSettings);
    }
  );
}

/* =========================================================================
   PROJECTS CMS (Full CRUD)
   ========================================================================= */

export async function getProjects(): Promise<Project[]> {
  try {
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return defaultProjects;
    }

    const list: Project[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        slug: data.slug || docSnap.id,
        title: data.title || 'Untitled Project',
        category: data.category || 'Other',
        description: data.description || '',
        detailedDescription: data.detailedDescription || '',
        image: data.image || '',
        gallery: data.gallery || [],
        tags: data.tags || [],
        tools: data.tools || [],
        year: data.year || '',
        client: data.client || '',
        liveUrl: data.liveUrl || '',
        githubUrl: data.githubUrl || '',
        featured: data.featured ?? false,
        visibility: data.visibility || 'published',
        order: data.order ?? 99,
        architectureNotes: data.architectureNotes || [],
        createdAt: data.createdAt || ''
      });
    });
    return list;
  } catch (err) {
    console.warn("Falling back to default projects:", err);
    return defaultProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(p => p.slug === slug || p.id === slug) || null;
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<string> {
  const colRef = collection(db, 'projects');
  const docRef = await addDoc(colRef, {
    ...projectData,
    slug: projectData.slug || projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
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

export function subscribeToProjects(callback: (projects: Project[]) => void): () => void {
  const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(defaultProjects);
        return;
      }
      const list: Project[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          title: data.title || 'Untitled Project',
          category: data.category || 'Other',
          description: data.description || '',
          detailedDescription: data.detailedDescription || '',
          image: data.image || '',
          gallery: data.gallery || [],
          tags: data.tags || [],
          tools: data.tools || [],
          year: data.year || '',
          client: data.client || '',
          liveUrl: data.liveUrl || '',
          githubUrl: data.githubUrl || '',
          featured: data.featured ?? false,
          visibility: data.visibility || 'published',
          order: data.order ?? 99,
          architectureNotes: data.architectureNotes || [],
          createdAt: data.createdAt || ''
        });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
      callback(defaultProjects);
    }
  );
}

/* =========================================================================
   WRITING / ARTICLES CMS (Full CRUD)
   ========================================================================= */

export async function getArticles(): Promise<Article[]> {
  try {
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return defaultArticles;
    }
    const list: Article[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        slug: data.slug || docSnap.id,
        title: data.title || 'Untitled Article',
        excerpt: data.excerpt || '',
        content: data.content || '',
        author: data.author || 'Ash Wickramasinghe',
        category: data.category || 'General',
        coverImage: data.coverImage || '',
        publishedAt: data.publishedAt || new Date().toISOString().slice(0, 10),
        readTime: data.readTime || '4 min read',
        published: data.published ?? true,
        tags: data.tags || []
      });
    });
    return list;
  } catch (err) {
    console.warn("Falling back to default articles:", err);
    return defaultArticles;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find(a => a.slug === slug || a.id === slug) || null;
}

export async function createArticle(articleData: Omit<Article, 'id'>): Promise<string> {
  const colRef = collection(db, 'articles');
  const docRef = await addDoc(colRef, {
    ...articleData,
    slug: articleData.slug || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateArticle(id: string, articleData: Partial<Article>): Promise<void> {
  const docRef = doc(db, 'articles', id);
  await updateDoc(docRef, articleData);
}

export async function deleteArticle(id: string): Promise<void> {
  const docRef = doc(db, 'articles', id);
  await deleteDoc(docRef);
}

export function subscribeToArticles(callback: (articles: Article[]) => void): () => void {
  const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(defaultArticles);
        return;
      }
      const list: Article[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          title: data.title || 'Untitled Article',
          excerpt: data.excerpt || '',
          content: data.content || '',
          author: data.author || 'Ash Wickramasinghe',
          category: data.category || 'General',
          coverImage: data.coverImage || '',
          publishedAt: data.publishedAt || new Date().toISOString().slice(0, 10),
          readTime: data.readTime || '4 min read',
          published: data.published ?? true,
          tags: data.tags || []
        });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'articles');
      callback(defaultArticles);
    }
  );
}

/* =========================================================================
   SERVICES CMS (Dynamic service management)
   ========================================================================= */

export async function getServices(): Promise<ServiceItem[]> {
  const settings = await getSiteSettings();
  if (settings.services && settings.services.length > 0) {
    return settings.services;
  }
  return defaultSiteSettings.services || [];
}

export async function saveServices(services: ServiceItem[]): Promise<void> {
  await updateSiteSettings({ services });
}

/* =========================================================================
   CONTACT INQUIRIES / MESSAGES
   ========================================================================= */

export async function submitContactMessage(message: {
  name: string;
  email: string;
  service?: string;
  subject?: string;
  message: string;
}): Promise<string> {
  const colRef = collection(db, 'contact_messages');
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
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: ContactMessage[] = [];
    snapshot.forEach(d => {
      const data = d.data();
      list.push({
        id: d.id,
        name: data.name || 'Anonymous',
        email: data.email || 'No email provided',
        service: data.service || 'General Inquiry',
        subject: data.subject || data.service || 'Inquiry',
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

export function subscribeToServices(callback: (services: ServiceItem[]) => void): () => void {
  return subscribeToSiteSettings((settings) => {
    callback(settings.services && settings.services.length > 0 ? settings.services : (defaultSiteSettings.services || []));
  });
}

export function subscribeToContactMessages(callback: (messages: ContactMessage[]) => void): () => void {
  const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name || 'Anonymous',
          email: data.email || 'No email provided',
          service: data.service || 'General Inquiry',
          subject: data.subject || data.service || 'Inquiry',
          message: data.message || '',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'unread'
        });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'contact_messages');
      callback([]);
    }
  );
}

export async function updateMessageStatus(id: string, status: 'read' | 'unread'): Promise<void> {
  const docRef = doc(db, 'contact_messages', id);
  await updateDoc(docRef, { status });
}

export async function deleteContactMessage(id: string): Promise<void> {
  const docRef = doc(db, 'contact_messages', id);
  await deleteDoc(docRef);
}

/* =========================================================================
   MEDIA STORAGE (Firebase Storage with reliable fallback)
   ========================================================================= */

export async function uploadMediaFile(file: File, folder: string = 'media'): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanFileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return downloadUrl;
  } catch (storageErr) {
    console.warn("Storage upload fallback to DataURL:", storageErr);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

export async function deleteMediaFile(fileUrl: string): Promise<void> {
  try {
    if (fileUrl.startsWith('data:')) return; // nothing to delete in storage
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Error deleting media file from storage:", err);
  }
}

/* =========================================================================
   ADMIN AUTHENTICATION (Real Firebase Auth)
   ========================================================================= */

export async function loginAdmin(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
