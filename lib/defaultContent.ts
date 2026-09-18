import { Project, SiteSettings } from './types';

export const defaultSiteSettings: SiteSettings = {
  name: "Ash Wickramasinghe",
  title: "Graphic Designer, Social Media Manager & Creative Digital Specialist",
  bio: "Crafting distinctive visual identities, high-impact social media creative, digital marketing assets, and modern web experiences with aesthetic precision.",
  aboutBio: "I am a versatile Graphic Designer, Social Media Manager, and Creative Digital Specialist dedicated to building cohesive visual narratives and engaging digital brand experiences. With extensive expertise across visual design, creative content editing, social campaign strategy, and modern web platforms, I bridge artistic vision with digital execution to elevate brands and captivate audiences.",
  careerTrajectory: "Over the past 5+ years, my work has focused on brand identity development, social media growth campaigns, high-retention content editing, and modern digital portfolio and web design for brands, creators, and digital businesses.",
  statusText: "AVAILABLE FOR PROJECTS & COLLABORATIONS",
  clearanceLevel: "CREATIVE_DOSSIER // VERIFIED PORTFOLIO",
  avatarUrl: "/ash_cyber_portrait.jpg",
  cvUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  email: "kushanashvika216@gmail.com",
  location: "Colombo, Sri Lanka // Remote Worldwide",
  github: "https://github.com/ash-wickramasinghe",
  linkedin: "https://linkedin.com/in/ash-wickramasinghe",
  telegram: "https://t.me/ash_wickramasinghe",
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

export const defaultProjects: Project[] = [
  {
    id: "personal-portfolio-site",
    title: "Personal Digital Portfolio",
    category: "Full-Stack",
    description: "Modern, high-performance creative portfolio built with Next.js App Router, TypeScript, and Tailwind CSS featuring a dynamic Firebase CMS and futuristic cyber aesthetic.",
    detailedDescription: "A bespoke digital portfolio designed to showcase graphic design craftsmanship, social media management achievements, content editing, and modern web development. Features real-time Firestore content updates, interactive CV dossier inspection, and responsive layouts.",
    image: "/ash_cyber_portrait.jpg",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Graphic Design", "Portfolio"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase"],
    githubUrl: "https://github.com/ash-wickramasinghe/personal-portfolio",
    liveUrl: "https://ash-wickramasinghe.site",
    featured: true,
    order: 1,
    architectureNotes: [
      "Dynamic CMS synchronized via Firebase Firestore",
      "Responsive image rendering with verified local portrait asset",
      "Interactive CV viewer with keyboard print protection"
    ]
  },
  {
    id: "personal-diary-app",
    title: "Personal Diary App",
    category: "Web Apps",
    description: "Private, secure personal journaling and diary application with instant search, mood tracking, rich-text reflection entries, and cloud persistence.",
    detailedDescription: "A minimalist, distraction-free journaling sanctuary engineered for personal mindfulness and daily retrospectives. Includes client-side encryption options, mood tags, chronological tagging, full-text search, and seamless cross-device synchronization.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vercel", "Local State", "Productivity"],
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/ash-wickramasinghe/personal-diary",
    liveUrl: "https://ash-s-personal-diary.vercel.app/",
    featured: true,
    order: 2,
    architectureNotes: [
      "Distraction-free rich text editor with markdown formatting support",
      "Instant client-side filter and chronological timeline indexing",
      "Local-first state with seamless cloud backup synchronizers"
    ]
  },
  {
    id: "cinexus-hd-project",
    title: "Cinexus HD",
    category: "Web Apps",
    description: "High-definition cinema streaming discovery platform with responsive search, movie metadata intelligence, seamless playback flows, and dynamic backdrops.",
    detailedDescription: "Cinexus HD delivers a cinematic discovery experience for streaming enthusiasts. Features real-time movie and TV series queries, trending charts, trailer embeds, curated genre collections, and fluid responsive animations.",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Movie API", "Vercel"],
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/ash-wickramasinghe/cinexus-hd",
    liveUrl: "https://cinexus-hd.vercel.app/",
    featured: true,
    order: 3,
    architectureNotes: [
      "Optimistic UI rendering with debounced search query pipelines",
      "Dynamic HD backdrop poster aspect ratio rendering with shimmer fallbacks",
      "Interactive movie details modal with full cast metadata and trailers"
    ]
  },
  {
    id: "brand-identity-campaign",
    title: "OmniBrand Visual Identity & Social Kit",
    category: "Cyber/Tools",
    description: "Comprehensive visual branding, vector iconography, social media template design system, and multi-platform marketing asset package.",
    detailedDescription: "Developed a bold, unified brand identity including logo guidelines, color hierarchies, social media carousel layouts, promotional banners, and marketing materials optimized for high click-through rates.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Graphic Design", "Branding", "Social Media", "Illustrator", "Photoshop"],
    technologies: ["Photoshop", "Illustrator", "Figma"],
    githubUrl: "https://github.com/ash-wickramasinghe/brand-identity-campaign",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: true,
    order: 4,
    architectureNotes: [
      "Multi-channel design token system for Instagram, LinkedIn, and YouTube",
      "Vector asset exports in SVG, EPS, and high-res print formats",
      "Modular social media carousel templates engineered for engagement"
    ]
  },
  {
    id: "social-media-growth-suite",
    title: "ViralPulse Social Media Suite",
    category: "Full-Stack",
    description: "Content scheduling, visual asset generator, and engagement analytics dashboard for multi-account social media management.",
    detailedDescription: "A creative analytics and workflow dashboard that helps creators plan weekly content calendars, preview post layouts in grid view, and evaluate organic reach metrics across platforms.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    tags: ["Social Media Management", "Analytics", "React", "TypeScript", "Firebase"],
    technologies: ["React", "TypeScript", "Firebase"],
    githubUrl: "https://github.com/ash-wickramasinghe/social-media-suite",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: false,
    order: 5,
    architectureNotes: [
      "Live preview simulator for Instagram, X, and LinkedIn feeds",
      "Automated asset aspect ratio cropping (1:1, 4:5, 9:16, 16:9)",
      "Analytics synchronization via Firestore collections"
    ]
  },
  {
    id: "content-motion-reel-kit",
    title: "Kinetic Motion & Content Reel Kit",
    category: "Cloud & Systems",
    description: "Curated motion design and video editing asset toolkit featuring kinetic typography, sound design, and viral short-form transition presets.",
    detailedDescription: "A specialized digital production asset collection for short-form video editors. Includes custom title templates, lower thirds, smooth zoom transitions, and color grading LUTs built for Premiere Pro and After Effects.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    tags: ["Content Editing", "Motion Graphics", "Video Production", "Premiere Pro"],
    technologies: ["After Effects", "Premiere Pro", "Motion Design"],
    githubUrl: "https://github.com/ash-wickramasinghe/motion-reel-kit",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: false,
    order: 6,
    architectureNotes: [
      "Optimized 60fps render profiles for TikTok, Reels, and Shorts",
      "Dynamic typography sync curves for high viewer retention",
      "LUT color profiles tailored for modern high-contrast lighting"
    ]
  }
];
