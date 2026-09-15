import { db, storage } from '@/config/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Query,
  DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { Project, ContactMessage } from '@/lib/types';

// Projects
export async function getProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Project[];
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, 'projects', id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate(),
      } as Project;
    }
    return null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  try {
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Contact Messages
export async function saveContactMessage(message: ContactMessage): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'contact_messages'), {
      ...message,
      createdAt: new Date(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving contact message:', error);
    throw error;
  }
}
