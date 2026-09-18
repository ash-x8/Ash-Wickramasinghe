// Unified Firebase Client & Service re-export for Next.js App Router
export { auth, db, storage } from '@/config/firebase';
export {
  getSiteSettings,
  updateSiteSettings,
  getProjects,
  getFeaturedProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadFile,
  uploadMediaFile,
  deleteFile,
  saveContactMessage,
  saveContactMessage as submitContactMessage,
  getContactMessages,
  updateMessageStatus,
  updateMessageStatus as updateContactMessageStatus,
  deleteContactMessage
} from '@/utils/firebase-service';
export {
  loginWithEmail,
  loginWithGoogle,
  logout,
  onAuthStateChanged
} from '@/utils/firebase-auth';
