import { db, storage } from '@/config/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { ContactMessage, Project, ServiceItem, SiteSettings, WritingArticle } from '@/lib/types';
import { defaultArticles, defaultProjects, defaultServices, defaultSiteSettings } from '@/lib/defaultContent';

function normalizeDate(value: unknown): Date | string | undefined {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return value as Date | string | undefined;
}

function projectFromSnapshot(snapshot: { id: string; data: () => Record<string, unknown> }): Project {
  const data = snapshot.data();
  return { id: snapshot.id, ...data, createdAt: normalizeDate(data.createdAt) } as Project;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const snapshot = await getDocs(query(collection(db, 'projects'), orderBy('order', 'asc')));
    return snapshot.empty ? defaultProjects : snapshot.docs.map(projectFromSnapshot);
  } catch (error) {
    console.warn('Using default projects fallback:', error);
    return defaultProjects;
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const snapshot = await getDocs(query(collection(db, 'projects'), where('featured', '==', true), orderBy('order', 'asc'), limit(3)));
    return snapshot.empty ? defaultProjects.filter((project) => project.featured).slice(0, 3) : snapshot.docs.map(projectFromSnapshot);
  } catch (error) {
    console.warn('Using default featured projects fallback:', error);
    return defaultProjects.filter((project) => project.featured).slice(0, 3);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const snapshot = await getDoc(doc(db, 'projects', id));
    if (snapshot.exists()) return projectFromSnapshot(snapshot);
    const fallback = defaultProjects.find((p) => p.id === id || p.slug === id);
    return fallback || null;
  } catch {
    const fallback = defaultProjects.find((p) => p.id === id || p.slug === id);
    return fallback || null;
  }
}

export async function getProjectBySlugOrId(slugOrId: string): Promise<Project | null> {
  try {
    const q = query(collection(db, 'projects'), where('slug', '==', slugOrId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return projectFromSnapshot(snapshot.docs[0]);
    }
    return getProjectById(slugOrId);
  } catch {
    const fallback = defaultProjects.find((p) => p.slug === slugOrId || p.id === slugOrId);
    return fallback || null;
  }
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  const snapshot = await addDoc(collection(db, 'projects'), { ...project, createdAt: new Date() });
  return snapshot.id;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  await updateDoc(doc(db, 'projects', id), updates);
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', id));
}

/* SERVICES */
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const snapshot = await getDocs(query(collection(db, 'services'), orderBy('order', 'asc')));
    return snapshot.empty ? defaultServices : snapshot.docs.map((s) => ({ id: s.id, ...s.data() }) as ServiceItem);
  } catch {
    return defaultServices;
  }
}

export async function createService(service: Omit<ServiceItem, 'id'>): Promise<string> {
  const snapshot = await addDoc(collection(db, 'services'), service);
  return snapshot.id;
}

export async function updateService(id: string, updates: Partial<ServiceItem>): Promise<void> {
  await updateDoc(doc(db, 'services', id), updates);
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, 'services', id));
}

/* ARTICLES / WRITING */
export async function getArticles(): Promise<WritingArticle[]> {
  try {
    const snapshot = await getDocs(query(collection(db, 'articles'), orderBy('date', 'desc')));
    return snapshot.empty ? defaultArticles : snapshot.docs.map((a) => ({ id: a.id, ...a.data() }) as WritingArticle);
  } catch {
    return defaultArticles;
  }
}

export async function getArticleBySlug(slug: string): Promise<WritingArticle | null> {
  try {
    const snapshot = await getDocs(query(collection(db, 'articles'), where('slug', '==', slug)));
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as WritingArticle;
    }
    return defaultArticles.find((a) => a.slug === slug || a.id === slug) || null;
  } catch {
    return defaultArticles.find((a) => a.slug === slug || a.id === slug) || null;
  }
}

export async function createArticle(article: Omit<WritingArticle, 'id'>): Promise<string> {
  const snapshot = await addDoc(collection(db, 'articles'), article);
  return snapshot.id;
}

export async function updateArticle(id: string, updates: Partial<WritingArticle>): Promise<void> {
  await updateDoc(doc(db, 'articles', id), updates);
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, 'articles', id));
}

/* SITE SETTINGS */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snapshot = await getDoc(doc(db, 'settings', 'site_config'));
    return snapshot.exists() ? { ...defaultSiteSettings, ...snapshot.data() } as SiteSettings : defaultSiteSettings;
  } catch (error) {
    console.warn('Using default site settings:', error);
    return defaultSiteSettings;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'site_config'), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
}

/* MEDIA FILES */
export async function uploadMediaFile(file: File, folder: string = 'portfolio'): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanFileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadResult.ref);
  } catch (storageErr) {
    console.warn("Firebase Storage upload encountered issue, using reliable DataURL fallback:", storageErr);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

export async function uploadFile(file: File, path: string): Promise<string> {
  return uploadMediaFile(file, path);
}

export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}

/* CONTACT MESSAGES */
export async function saveContactMessage(message: ContactMessage): Promise<string> {
  const snapshot = await addDoc(collection(db, 'contact_messages'), {
    name: message.name.trim(),
    email: message.email.trim().toLowerCase(),
    subject: message.subject ? message.subject.trim() : `Inquiry for ${message.service || 'Creative Services'}`,
    service: message.service || 'General Inquiries',
    message: message.message.trim(),
    createdAt: new Date(),
    status: 'unread',
    read: false,
  });
  return snapshot.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const snapshot = await getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data(), createdAt: normalizeDate(item.data().createdAt) }) as ContactMessage);
}

export async function updateMessageStatus(id: string, status: 'read' | 'unread'): Promise<void> {
  await updateDoc(doc(db, 'contact_messages', id), { status, read: status === 'read' });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contact_messages', id));
}
