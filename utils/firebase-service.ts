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
import type { ContactMessage, Project, SiteSettings } from '@/lib/types';
import { defaultProjects, defaultSiteSettings } from '@/lib/defaultContent';

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

export async function getProjectById(id: string): Promise<Project | null> {
  const snapshot = await getDoc(doc(db, 'projects', id));
  return snapshot.exists() ? projectFromSnapshot(snapshot) : null;
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

export async function saveContactMessage(message: ContactMessage): Promise<string> {
  const snapshot = await addDoc(collection(db, 'contact_messages'), {
    name: message.name.trim(),
    email: message.email.trim().toLowerCase(),
    subject: message.subject.trim(),
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
