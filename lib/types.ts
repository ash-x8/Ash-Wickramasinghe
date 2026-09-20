export type ProjectCategory =
  | 'Graphic Design'
  | 'Branding'
  | 'Social Media'
  | 'Posters'
  | 'Creative Projects'
  | 'Web Projects'
  | 'Writing'
  | 'Full-Stack'
  | 'Web Apps'
  | 'Other';

export interface Project {
  id: string;
  slug?: string;
  title: string;
  description: string;
  longDescription?: string;
  detailedDescription?: string;
  image: string;
  gallery?: string[];
  technologies?: string[];
  tags?: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  category: ProjectCategory;
  order?: number;
  client?: string;
  year?: string;
  tools?: string[];
  architectureNotes?: string[];
  createdAt?: Date | string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  order?: number;
}

export interface WritingArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: 'Writer Ash' | 'Writer Tizzy' | 'Tizzy';
  authorRole?: string;
  date: string;
  category: string;
  readTime: string;
  published: boolean;
  coverImage?: string;
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
  accentColor?: string;
  themeMode?: 'dark' | 'light';
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
  service?: string;
  createdAt?: Date | string;
  read?: boolean;
  status?: 'unread' | 'read';
}
