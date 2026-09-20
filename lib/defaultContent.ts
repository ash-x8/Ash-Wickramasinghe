import { Project, SiteSettings, ServiceItem, WritingArticle } from './types';

export const defaultSiteSettings: SiteSettings = {
  name: "Ash Wickramasinghe",
  title: "Graphic Designer, Social Media Manager & Creative Digital Specialist",
  bio: "Crafting distinctive visual identities, high-impact social media creative, digital marketing assets, and modern web experiences with aesthetic precision.",
  aboutBio: "I am a versatile Graphic Designer, Social Media Manager, and Creative Digital Specialist dedicated to building cohesive visual narratives and engaging digital brand experiences. With extensive expertise across visual design, creative content editing, social campaign strategy, and modern web platforms, I bridge artistic vision with digital execution to elevate brands and captivate audiences.",
  careerTrajectory: "Over the past 5+ years, my work has focused on brand identity development, social media growth campaigns, high-retention content editing, and modern digital portfolio and web design for brands, creators, and digital businesses.",
  statusText: "AVAILABLE FOR SELECT PROJECTS",
  clearanceLevel: "CREATIVE_DOSSIER // VERIFIED PORTFOLIO",
  avatarUrl: "/ash_cyber_portrait.jpg",
  cvUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  email: "kushanashvika216@gmail.com",
  location: "Colombo, Sri Lanka // Remote Worldwide",
  github: "https://github.com/ash-wickramasinghe",
  linkedin: "https://linkedin.com/in/ash-wickramasinghe",
  telegram: "https://t.me/ash_wickramasinghe",
  accentColor: "#06B6D4",
  themeMode: "dark",
  metrics: [
    { label: "Creative Projects Delivered", value: "65+", subtext: "Brand & Digital Assets" },
    { label: "Social Media Campaigns", value: "40+", subtext: "Audience Growth & Engagement" },
    { label: "Content Assets Produced", value: "250+", subtext: "Graphics, Video & Copy" },
    { label: "Years of Creative Work", value: "5+", subtext: "Design & Digital Media" }
  ],
  skills: [
    { name: "Graphic Design & Branding", level: 96, category: "Frontend & UI" },
    { name: "Social Media Strategy & Management", level: 94, category: "Frontend & UI" },
    { name: "Content Editing & Motion Graphics", level: 92, category: "Frontend & UI" },
    { name: "UI/UX Design & Prototyping", level: 90, category: "Frontend & UI" },
    { name: "Adobe Photoshop & Illustrator", level: 95, category: "Backend & APIs" },
    { name: "Canva & Figma Design Systems", level: 95, category: "Backend & APIs" },
    { name: "Video & Reel Editing (Premiere / CapCut)", level: 91, category: "Cyber & Security" },
    { name: "Social Media Analytics & Growth", level: 92, category: "Cyber & Security" },
    { name: "React, Next.js & Tailwind CSS", level: 88, category: "Cloud & DevOps" },
    { name: "Digital Campaign Optimization", level: 90, category: "Databases & Tools" }
  ],
  timeline: [
    {
      id: "exp-1",
      period: "2023 — PRESENT",
      role: "Lead Creative Designer & Social Media Strategist",
      organization: "Digital Creative Studio",
      description: "Directing end-to-end visual branding, social media marketing campaigns, and content editing workflows for international clients and digital agencies.",
      skills: ["Graphic Design", "Social Media Strategy", "Content Editing", "Branding"],
      type: "work"
    },
    {
      id: "exp-2",
      period: "2021 — 2023",
      role: "Digital Content Specialist & Graphic Designer",
      organization: "Brand Elevation Media",
      description: "Produced high-engagement social media graphics, promotional videos, and UI assets resulting in measurable audience growth across multiple client channels.",
      skills: ["Graphic Design", "Adobe Suite", "Figma", "Social Media Management"],
      type: "work"
    },
    {
      id: "exp-3",
      period: "2019 — 2021",
      role: "Creative Media Associate & Web Designer",
      organization: "Creative Innovations",
      description: "Designed marketing collateral, promotional digital graphics, and responsive web layouts while coordinating organic social media outreach.",
      skills: ["Visual Design", "Web Design", "Content Editing", "Digital Assets"],
      type: "work"
    },
    {
      id: "edu-1",
      period: "2016 — 2020",
      role: "B.Sc. in Creative Technologies & Digital Media",
      organization: "Faculty of Computing & Digital Arts",
      description: "Comprehensive coursework in Visual Communication, Digital Media Production, Web Technologies, and Interactive Design Systems.",
      skills: ["Visual Communication", "Digital Media", "Interactive Design", "Web Tech"],
      type: "education"
    }
  ]
};

export const defaultServices: ServiceItem[] = [
  {
    id: "graphic-design",
    title: "Graphic Design & Visual Identity",
    description: "Bespoke visual graphic design, vector assets, marketing collateral, and brand identity systems tailored to command attention across print and digital media.",
    category: "Design",
    tags: ["Photoshop", "Illustrator", "Brand Identity", "Vector"],
    featured: true,
    order: 1
  },
  {
    id: "social-media-post-design",
    title: "Social Media Post Design",
    description: "High-converting single posts, carousel layouts, story templates, and promotional banner graphics engineered for maximum engagement and brand consistency.",
    category: "Social Media",
    tags: ["Instagram", "LinkedIn", "Carousels", "Banners"],
    featured: true,
    order: 2
  },
  {
    id: "logo-design",
    title: "Logo & Brand Mark Design",
    description: "Distinctive, timeless vector logos, wordmarks, brand icons, and comprehensive style guides that articulate your brand's core purpose.",
    category: "Branding",
    tags: ["Vector Art", "Logo Marks", "Brand Guidelines"],
    featured: true,
    order: 3
  },
  {
    id: "poster-design",
    title: "Poster & Promotional Design",
    description: "Cinematic, eye-catching digital and printable poster graphics for events, brand activations, product launches, and digital campaigns.",
    category: "Design",
    tags: ["Print & Digital", "Typography", "Visual Layouts"],
    featured: true,
    order: 4
  },
  {
    id: "cv-design",
    title: "CV & Professional Dossier Design",
    description: "Polished, ATS-friendly executive resume and portfolio layouts designed to present career credentials with clear editorial hierarchy.",
    category: "Design",
    tags: ["PDF Layout", "Executive Resume", "Dossier"],
    featured: false,
    order: 5
  },
  {
    id: "certificate-invitation-design",
    title: "Certificate & Invitation Design",
    description: "Elegantly composed ceremonial certificates, digital event invitations, and VIP pass collateral with custom typography.",
    category: "Design",
    tags: ["Certificates", "Event Invitations", "Print Design"],
    featured: false,
    order: 6
  },
  {
    id: "photo-editing",
    title: "Photo Editing & Retouching",
    description: "High-end portrait color grading, background isolation, commercial retouching, and visual enhancements for marketing imagery.",
    category: "Editing",
    tags: ["Lightroom", "Photoshop", "Color Grading"],
    featured: false,
    order: 7
  },
  {
    id: "content-writing",
    title: "Content Writing & Digital Copy",
    description: "Compelling brand copy, social captions, editorial articles, scriptwriting for short videos, and web platform messaging.",
    category: "Writing",
    tags: ["Copywriting", "Social Captions", "Editorial"],
    featured: true,
    order: 8
  },
  {
    id: "web-management",
    title: "Web Management & Creative Direction",
    description: "Full oversight of modern portfolio platforms, content updates, responsive UI maintenance, and strategic creative direction.",
    category: "Digital",
    tags: ["Next.js", "Creative Direction", "CMS"],
    featured: true,
    order: 9
  }
];

export const defaultArticles: WritingArticle[] = [
  {
    id: "art-1",
    slug: "designing-high-converting-social-carousels",
    title: "Designing High-Converting Social Media Carousels: Visual Hierarchy & Hooks",
    summary: "An editorial exploration of visual pacing, typography contrast, and hook dynamics that drive organic audience retention on modern social channels.",
    content: "In digital marketing, the first slide of a social carousel is your headline; the remaining slides are your story. Achieving high organic reach requires balancing visual aesthetics with clear information design.\n\n### 1. The Power of the First Slide\nYour title slide must establish immediate clarity. Use high-contrast typography, bold layout hierarchy, and a clear benefit statement.\n\n### 2. Seamless Slide Transitions\nCreating continuous visual lines across slide boundaries encourages swipe behavior. Align graphic elements across frame splits so the reader feels guided into the next panel.\n\n### 3. Editorial Whitespace\nAvoid clutter. Give key quotes and statistics breathing room so the reader's eye naturally rests on the core message.",
    author: "Writer Ash",
    authorRole: "Lead Creative Designer",
    date: "2025-02-15",
    category: "Design Strategy",
    readTime: "4 min read",
    published: true,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "art-2",
    slug: "minimalist-brand-identity-essentials",
    title: "Minimalist Brand Identity: Why Less Equals More in Modern Design",
    summary: "How reduction and intentionality create timeless brand marks that adapt seamlessly from mobile screens to physical environmental graphics.",
    content: "Minimalism is not the absence of design; it is the discipline of removing unnecessary noise until only the core identity remains.\n\nWhen designing a modern brand mark, every line, curve, and kerning decision must serve a purpose. A minimalist identity easily scales down to a 32x32 favicon while remaining striking on a full-scale billboard.",
    author: "Writer Tizzy",
    authorRole: "Editorial & Content Specialist",
    date: "2025-01-28",
    category: "Branding",
    readTime: "5 min read",
    published: true,
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "art-3",
    slug: "short-form-video-pacing-and-retention",
    title: "Short-Form Video Pacing: Kinetic Typography & Visual Retention",
    summary: "Breaking down short-form video editing techniques that retain viewer attention past the crucial 3-second mark.",
    content: "Captivating short-form video content relies on audio-visual rhythm. Syncing text transitions, cuts, and kinetic typography with precise audio cues keeps viewers engaged through the end of the reel.",
    author: "Tizzy",
    authorRole: "Content & Video Specialist",
    date: "2024-12-10",
    category: "Content Editing",
    readTime: "3 min read",
    published: true,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
  }
];

export const defaultProjects: Project[] = [
  {
    id: "personal-portfolio-site",
    slug: "personal-portfolio-site",
    title: "Personal Digital Portfolio",
    category: "Graphic Design",
    description: "Modern, high-performance creative portfolio built with Next.js App Router, TypeScript, and Tailwind CSS featuring a dynamic Firebase CMS and futuristic cyber aesthetic.",
    detailedDescription: "A bespoke digital portfolio designed to showcase graphic design craftsmanship, social media management achievements, content editing, and modern web development. Features real-time Firestore content updates, interactive CV dossier inspection, and responsive layouts.",
    image: "/ash_cyber_portrait.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Graphic Design", "Portfolio"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase"],
    githubUrl: "https://github.com/ash-wickramasinghe/personal-portfolio",
    liveUrl: "https://ash-wickramasinghe.site",
    featured: true,
    order: 1,
    client: "Personal Project",
    year: "2025",
    tools: ["Next.js", "Tailwind CSS", "Framer Motion", "Firebase"],
    architectureNotes: [
      "Dynamic CMS synchronized via Firebase Firestore",
      "Responsive image rendering with verified local portrait asset",
      "Interactive CV viewer with keyboard print protection"
    ]
  },
  {
    id: "personal-diary-app",
    slug: "personal-diary-app",
    title: "Personal Diary App",
    category: "Web Projects",
    description: "Private, secure personal journaling and diary application with instant search, mood tracking, rich-text reflection entries, and cloud persistence.",
    detailedDescription: "A minimalist, distraction-free journaling sanctuary engineered for personal mindfulness and daily retrospectives. Includes client-side encryption options, mood tags, chronological tagging, full-text search, and seamless cross-device synchronization.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vercel", "Local State", "Productivity"],
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/ash-wickramasinghe/personal-diary",
    liveUrl: "https://ash-s-personal-diary.vercel.app/",
    featured: true,
    order: 2,
    client: "Productivity Suite",
    year: "2024",
    tools: ["React", "TypeScript", "Tailwind CSS"],
    architectureNotes: [
      "Distraction-free rich text editor with markdown formatting support",
      "Instant client-side filter and chronological timeline indexing",
      "Local-first state with seamless cloud backup synchronizers"
    ]
  },
  {
    id: "cinexus-hd-project",
    slug: "cinexus-hd-project",
    title: "Cinexus HD Discovery Platform",
    category: "Web Projects",
    description: "High-definition cinema streaming discovery platform with responsive search, movie metadata intelligence, seamless playback flows, and dynamic backdrops.",
    detailedDescription: "Cinexus HD delivers a cinematic discovery experience for streaming enthusiasts. Features real-time movie and TV series queries, trending charts, trailer embeds, curated genre collections, and fluid responsive animations.",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Movie API", "Vercel"],
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/ash-wickramasinghe/cinexus-hd",
    liveUrl: "https://cinexus-hd.vercel.app/",
    featured: true,
    order: 3,
    client: "Media Tech",
    year: "2024",
    tools: ["React", "TypeScript", "Tailwind CSS"],
    architectureNotes: [
      "Optimistic UI rendering with debounced search query pipelines",
      "Dynamic HD backdrop poster aspect ratio rendering with shimmer fallbacks",
      "Interactive movie details modal with full cast metadata and trailers"
    ]
  },
  {
    id: "brand-identity-campaign",
    slug: "brand-identity-campaign",
    title: "OmniBrand Visual Identity & Social Kit",
    category: "Branding",
    description: "Comprehensive visual branding, vector iconography, social media template design system, and multi-platform marketing asset package.",
    detailedDescription: "Developed a bold, unified brand identity including logo guidelines, color hierarchies, social media carousel layouts, promotional banners, and marketing materials optimized for high click-through rates.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Graphic Design", "Branding", "Social Media", "Illustrator", "Photoshop"],
    technologies: ["Photoshop", "Illustrator", "Figma"],
    githubUrl: "https://github.com/ash-wickramasinghe/brand-identity-campaign",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: true,
    order: 4,
    client: "Global Digital Agency",
    year: "2024",
    tools: ["Adobe Illustrator", "Photoshop", "Figma"],
    architectureNotes: [
      "Multi-channel design token system for Instagram, LinkedIn, and YouTube",
      "Vector asset exports in SVG, EPS, and high-res print formats",
      "Modular social media carousel templates engineered for engagement"
    ]
  },
  {
    id: "social-media-growth-suite",
    slug: "social-media-growth-suite",
    title: "ViralPulse Social Media Suite",
    category: "Social Media",
    description: "Content scheduling, visual asset generator, and engagement analytics dashboard for multi-account social media management.",
    detailedDescription: "A creative analytics and workflow dashboard that helps creators plan weekly content calendars, preview post layouts in grid view, and evaluate organic reach metrics across platforms.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    tags: ["Social Media Management", "Analytics", "React", "TypeScript", "Firebase"],
    technologies: ["React", "TypeScript", "Firebase"],
    githubUrl: "https://github.com/ash-wickramasinghe/social-media-suite",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: false,
    order: 5,
    client: "Creative Studio",
    year: "2023",
    tools: ["React", "TypeScript", "Firebase"],
    architectureNotes: [
      "Live preview simulator for Instagram, X, and LinkedIn feeds",
      "Automated asset aspect ratio cropping (1:1, 4:5, 9:16, 16:9)",
      "Analytics synchronization via Firestore collections"
    ]
  },
  {
    id: "content-motion-reel-kit",
    slug: "content-motion-reel-kit",
    title: "Kinetic Motion & Content Reel Kit",
    category: "Creative Projects",
    description: "Curated motion design and video editing asset toolkit featuring kinetic typography, sound design, and viral short-form transition presets.",
    detailedDescription: "A specialized digital production asset collection for short-form video editors. Includes custom title templates, lower thirds, smooth zoom transitions, and color grading LUTs built for Premiere Pro and After Effects.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    tags: ["Content Editing", "Motion Graphics", "Video Production", "Premiere Pro"],
    technologies: ["After Effects", "Premiere Pro", "Motion Design"],
    githubUrl: "https://github.com/ash-wickramasinghe/motion-reel-kit",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: false,
    order: 6,
    client: "Media Creators",
    year: "2023",
    tools: ["Adobe Premiere Pro", "After Effects"],
    architectureNotes: [
      "Optimized 60fps render profiles for TikTok, Reels, and Shorts",
      "Dynamic typography sync curves for high viewer retention",
      "LUT color profiles tailored for modern high-contrast lighting"
    ]
  }
];
