export type ProjectCategory = 'Full-Stack' | 'Web Apps' | 'Cyber/Tools' | 'Scripts' | 'Cloud & Systems' | 'web' | 'mobile' | 'fullstack' | 'other';

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  detailedDescription?: string;
  image: string;
  technologies?: string[];
  tags?: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  category: ProjectCategory;
  order?: number;
  architectureNotes?: string[];
  createdAt?: Date | string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  proficiency: number; // 1-100
  category: string;
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

export interface ExperienceItem {
  id: string;
  type: 'work' | 'education';
  title: string;
  organization: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: Date | string;
  read?: boolean;
  status?: 'unread' | 'read';
}
