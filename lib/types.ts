export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  technologies: string[];
  liveUrl: string;
  githubUrl?: string;
  featured: boolean;
  category: 'web' | 'mobile' | 'fullstack' | 'other';
  createdAt: Date;
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
  createdAt?: Date;
  read?: boolean;
}
