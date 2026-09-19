export type ProjectCategory = 
  | 'Graphic Design' 
  | 'Branding' 
  | 'Social Media' 
  | 'Posters' 
  | 'Creative Projects' 
  | 'Web Projects' 
  | 'Writing' 
  | 'Other'
  | string;

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  detailedDescription?: string;
  image: string;
  gallery?: string[];
  tags: string[];
  tools?: string[];
  year?: string;
  client?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  visibility?: 'published' | 'draft';
  order?: number;
  architectureNotes?: string[];
  createdAt?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: 'Ash Wickramasinghe' | 'Writer Ash' | 'Writer Tizzy' | 'Tizzy' | string;
  category: string;
  coverImage?: string;
  publishedAt: string;
  readTime: string;
  published: boolean;
  tags: string[];
}

export interface ServiceItem {
  id: string;
  slug?: string;
  title: string;
  badge?: string;
  description: string;
  deliverables: string[];
  techStack?: string[];
  iconName?: string;
  featured?: boolean;
  order?: number;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
  rating: number; // 1-5
  projectRef?: string;
}

export interface SkillItem {
  name: string;
  level: number; // 0-100
  category: 'Design & Branding' | 'Social & Growth' | 'Content & Video' | 'Web & Digital' | string;
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
  avatarUrl: string;
  cvUrl: string;
  email: string;
  location: string;
  phone?: string;
  whatsapp?: string;
  github: string;
  linkedin: string;
  telegram: string;
  behance?: string;
  instagram?: string;
  availabilityStatus?: 'available' | 'busy' | 'selective';
  // Theme & Appearance
  accentColor: string; // e.g. '#c59b63' or '#38bdf8' or '#e07a5f'
  defaultTheme: 'dark' | 'light';
  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  keywords?: string;
  // Collections
  skills: SkillItem[];
  timeline: TimelineItem[];
  services?: ServiceItem[];
  testimonials?: TestimonialItem[];
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
  service?: string;
  subject?: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
  uploadedAt: string;
}
