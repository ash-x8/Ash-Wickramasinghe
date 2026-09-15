export type ProjectCategory = 'Full-Stack' | 'Web Apps' | 'Cyber/Tools' | 'Scripts' | 'Cloud & Systems';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  detailedDescription?: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  order?: number;
  architectureNotes?: string[];
  createdAt?: string;
}

export interface SkillItem {
  name: string;
  level: number; // 0-100
  category: 'Frontend & UI' | 'Backend & APIs' | 'Cyber & Security' | 'Cloud & DevOps' | 'Databases & Tools';
  icon?: string;
}

export interface TimelineItem {
  id: string;
  period: string;
  role: string;
  organization: string;
  description: string;
  skills: string[];
  type: 'work' | 'education' | 'certification';
}

export interface SiteSettings {
  name: string;
  title: string;
  bio: string;
  aboutBio: string;
  careerTrajectory: string;
  statusText: string;
  clearanceLevel: string;
  avatarUrl: string;
  cvUrl: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  telegram: string;
  skills: SkillItem[];
  timeline: TimelineItem[];
  metrics: {
    label: string;
    value: string;
    subtext: string;
  }[];
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}
