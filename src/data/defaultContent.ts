import { Project, SiteSettings, Article, ServiceItem } from '../types';

export const defaultSiteSettings: SiteSettings = {
  name: "Ash Wickramasinghe",
  fullName: "Kushan A Wickramasinghe",
  preferredName: "Kushan A Wickramasinghe",
  creativeName: "Ash Wickramasinghe",
  title: "Graphic Designer • Social Media Manager • Author",
  bio: "Kushan A Wickramasinghe is a creative professional specializing in graphic design, social media management, digital content and creative writing. His work combines visual design, purposeful communication and creative storytelling to produce engaging content for personal, educational, organizational and digital projects.",
  aboutBio: "Kushan A Wickramasinghe is a multidisciplinary creative professional working across graphic design, social media management, digital content, creative writing, and visual communication. His work focuses on creating clean, purposeful, modern and engaging visual content for individuals, schools, organizations, brands, social media platforms and creative projects. His creative areas include graphic design, social media content creation and management, branding, poster and promotional design, digital content, digital media editing, content writing, creative writing and web-related creative projects.",
  personalStatement: "Design with purpose. Create with intention. Write with meaning.",
  careerTrajectory: "Design with purpose. Create with intention. Write with meaning.",
  workAvailability: "Remote / Available for selected creative projects and collaborations",
  statusText: "Available for selected creative projects and collaborations",
  avatarUrl: "",
  profileImage: "",
  profileImageEffect: "grayscale",
  logoMonogramUrl: "/ash-logo-monogram.jpg",
  logoFullUrl: "/ash-logo-full.jpg",
  cvUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  cvSource: "upload",
  cvFileUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  cvFileName: "Ash_Wickramasinghe_CV.pdf",
  cvFileSize: "1.2 MB",
  cvFileType: "pdf",
  cvPublished: true,
  cvLastUpdated: "2025-02-15",
  email: "Kushanashvika216@gmail.com",
  emailSecondary: "kushan.creative@gmail.com",
  phone: "+94 75 226 9410",
  phoneSecondary: "+94 74 085 8041",
  whatsapp: "https://wa.me/94752269410",
  location: "Sri Lanka",
  github: "https://github.com/ash-wickramasinghe",
  linkedin: "https://www.linkedin.com/in/kushan-a-wickramasinghe-28b1aa2a0",
  telegram: "https://t.me/kawickramasinghe",
  youtube: "https://www.youtube.com/@Ash-x8",
  facebook: "https://www.facebook.com/share/1UeTQSvLik/",
  tiktok: "https://vm.tiktok.com/ZS9Ypfen3rcYL-KiVCP/",
  socialLinks: [
    { id: "soc-yt", platform: "youtube", label: "YouTube", url: "https://www.youtube.com/@Ash-x8", enabled: true, order: 1 },
    { id: "soc-fb", platform: "facebook", label: "Facebook", url: "https://www.facebook.com/share/1UeTQSvLik/", enabled: true, order: 2 },
    { id: "soc-li", platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/kushan-a-wickramasinghe-28b1aa2a0", enabled: true, order: 3 },
    { id: "soc-tt", platform: "tiktok", label: "TikTok", url: "https://vm.tiktok.com/ZS9Ypfen3rcYL-KiVCP/", enabled: true, order: 4 },
    { id: "soc-tg", platform: "telegram", label: "Telegram", url: "https://t.me/kawickramasinghe", enabled: true, order: 5 },
    { id: "soc-wa", platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/94752269410", enabled: true, order: 6 },
    { id: "soc-gh", platform: "github", label: "GitHub", url: "https://github.com/ash-wickramasinghe", enabled: true, order: 7 }
  ],
  authorNames: ["Writer Ash", "Writer Tizzy", "Tizzy"],
  availabilityStatus: "available",
  accentColor: "#C59B63",
  defaultTheme: "dark",
  metaTitle: "Ash Wickramasinghe — Graphic Designer • Social Media Manager • Author",
  metaDescription: "Official portfolio of Kushan A Wickramasinghe (Ash Wickramasinghe) — Graphic Designer, Social Media Manager, and Author based in Sri Lanka.",
  keywords: "Ash Wickramasinghe, Kushan A Wickramasinghe, Graphic Design, Social Media Management, Creative Writer, Author, Sri Lanka",
  metrics: [],
  skills: [
    { name: "Graphic Design & Typography", level: 95, category: "Design & Branding" },
    { name: "Social Media Post & Carousel Design", level: 95, category: "Social & Growth" },
    { name: "Social Media Management & Strategy", level: 92, category: "Social & Growth" },
    { name: "Logo Design & Branding", level: 93, category: "Design & Branding" },
    { name: "Poster, Certificate & Invitation Design", level: 92, category: "Design & Branding" },
    { name: "Tute & Educational Material Design", level: 90, category: "Design & Branding" },
    { name: "CV & Resume Design", level: 91, category: "Design & Branding" },
    { name: "Digital Promotional Materials", level: 92, category: "Design & Branding" },
    { name: "Digital Media Editing & Visual Assets", level: 90, category: "Content & Video" },
    { name: "Content Writing & Creative Writing", level: 94, category: "Content & Video" },
    { name: "Digital Content Creation & Visual Communication", level: 93, category: "Social & Growth" },
    { name: "Web & Digital Creative Work", level: 86, category: "Web & Digital" }
  ],
  timeline: [],
  services: [
    {
      id: "srv-graphic-design",
      slug: "graphic-design",
      title: "Graphic Design",
      badge: "CORE DISCIPLINE",
      description: "Clean, purposeful, modern visual design solutions across print and digital media with typographic precision.",
      deliverables: ["Print & Digital Collateral", "Vector Layouts", "Typography Systems", "Promotional Artwork"],
      techStack: ["Adobe Photoshop", "Adobe Illustrator"],
      featured: true,
      order: 1
    },
    {
      id: "srv-social-media-posts",
      slug: "social-media-post-design",
      title: "Social Media Post Design",
      badge: "HIGH ENGAGEMENT",
      description: "Custom social media posts, carousel decks, story frames, and feed templates engineered for visual appeal and strong engagement.",
      deliverables: ["Carousel Frameworks", "Daily Post Graphics", "Story Designs", "Aesthetic Grid Alignment"],
      techStack: ["Photoshop", "Illustrator", "Canva Pro"],
      featured: true,
      order: 2
    },
    {
      id: "srv-social-media-management",
      slug: "social-media-management",
      title: "Social Media Management",
      badge: "STRATEGY & GROWTH",
      description: "End-to-end management of social media channels, content scheduling, audience engagement, and brand consistency.",
      deliverables: ["Content Calendar & Planning", "Audience Engagement", "Performance Review", "Brand Voice Alignment"],
      techStack: ["Meta Business Suite", "Content Scheduling", "Analytics"],
      featured: true,
      order: 3
    },
    {
      id: "srv-logo-branding",
      slug: "logo-design-and-branding",
      title: "Logo Design & Branding",
      badge: "BRAND IDENTITY",
      description: "Distinctive logo marks, color systems, typography pairings, and coherent visual identity assets.",
      deliverables: ["Primary & Secondary Marks", "Color & Typography Guide", "Brand Assets Kit", "Vector Source Files"],
      techStack: ["Adobe Illustrator", "Photoshop"],
      featured: true,
      order: 4
    },
    {
      id: "srv-poster-design",
      slug: "poster-design",
      title: "Poster Design",
      badge: "VISUAL IMPACT",
      description: "Striking event, promotional, educational, and cultural posters created with strong visual hierarchy and clear focal points.",
      deliverables: ["Event & Conference Posters", "Digital Promo Posters", "High-Resolution Print Files"],
      techStack: ["Photoshop", "Illustrator"],
      featured: true,
      order: 5
    },
    {
      id: "srv-certificate-design",
      slug: "certificate-design",
      title: "Certificate Design",
      badge: "ACADEMIC & CORPORATE",
      description: "Formal and elegant certificate layouts for educational programs, corporate recognition, workshops, and organizations.",
      deliverables: ["Institutional Certificate Layouts", "Security Guilloche Borders", "Print-Ready Vector PDFs"],
      techStack: ["Adobe Illustrator", "InDesign"],
      featured: false,
      order: 6
    },
    {
      id: "srv-invitation-design",
      slug: "invitation-design",
      title: "Invitation Design",
      badge: "SPECIAL OCCASIONS",
      description: "Refined digital and print invitation suites for events, ceremonies, gatherings, and special occasions.",
      deliverables: ["Digital Invitations", "Print Invitation Suites", "Typography & Decorative Detail"],
      techStack: ["Photoshop", "Illustrator"],
      featured: false,
      order: 7
    },
    {
      id: "srv-tute-design",
      slug: "tute-design",
      title: "Tute & Educational Material Design",
      badge: "EDUCATIONAL ASSETS",
      description: "Structured, clean, and legible layout design for study guides, tutorials, worksheets, and educational materials.",
      deliverables: ["Tutorial Page Layouts", "Diagrams & Callouts", "Structured Worksheets", "Print-Ready PDFs"],
      techStack: ["Illustrator", "Photoshop", "InDesign"],
      featured: false,
      order: 8
    },
    {
      id: "srv-cv-design",
      slug: "cv-design",
      title: "CV & Resume Design",
      badge: "PROFESSIONAL PROFILE",
      description: "Clean, structured, and modern curriculum vitae layouts that present professional history with dignity and clarity.",
      deliverables: ["Modern Resume Layout", "Clean Typographic Hierarchy", "Exported High-Res PDF"],
      techStack: ["Illustrator", "InDesign"],
      featured: false,
      order: 9
    },
    {
      id: "srv-digital-promotions",
      slug: "digital-promotional-materials",
      title: "Digital Promotional Materials",
      badge: "MARKETING ASSETS",
      description: "Engaging digital flyers, website promotional graphics, banners, and digital marketing materials.",
      deliverables: ["Web & Social Banners", "Digital Flyers", "Event Promotional Graphics"],
      techStack: ["Photoshop", "Illustrator"],
      featured: false,
      order: 10
    },
    {
      id: "srv-content-editing",
      slug: "content-and-digital-media-editing",
      title: "Content & Digital Media Editing",
      badge: "VISUAL FINISH",
      description: "High-grade digital media enhancement, asset optimization, visual asset preparation, and media post-production.",
      deliverables: ["Asset Optimization & Preparation", "Visual Media Production", "Digital Asset Balancing"],
      techStack: ["Adobe Photoshop", "Lightroom"],
      featured: false,
      order: 11
    },
    {
      id: "srv-writing",
      slug: "content-and-creative-writing",
      title: "Content & Creative Writing",
      badge: "AUTHOR & WRITER",
      description: "Meaningful creative writing, storytelling, articles, reflective pieces, and clear content writing.",
      deliverables: ["Creative Writing & Essays", "Social Media Copy", "Articles & Reflections"],
      techStack: ["Creative Writing", "Editorial Editing"],
      featured: false,
      order: 12
    },
    {
      id: "srv-web-creative",
      slug: "web-and-digital-creative-work",
      title: "Web & Digital Creative Work",
      badge: "DIGITAL PRESENCE",
      description: "Creative web direction, digital content management, interface presentation, and creative technology projects.",
      deliverables: ["Web Content Curation", "UI Visual Consistency", "Digital Experience Design"],
      techStack: ["React", "Tailwind CSS", "Web Platforms"],
      featured: false,
      order: 13
    }
  ],
  testimonials: []
};

export const defaultProjects: Project[] = [
  {
    id: "proj-personal-portfolio",
    slug: "personal-portfolio-website",
    title: "Personal Portfolio Website",
    category: "Web Projects",
    description: "A personal professional portfolio showcasing graphic design, social media work, creative projects, writing and digital work.",
    detailedDescription: "Designed and engineered as a central digital archive and professional hub. Showcases graphic design disciplines, social media content, creative writing, and digital projects with an editorial minimalist aesthetic and a dynamic content management system.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Portfolio", "CMS"],
    tools: ["React", "TypeScript", "Tailwind CSS", "Firebase"],
    liveUrl: "https://ash-wickramasinghe.site",
    featured: true,
    visibility: "published",
    order: 1,
    architectureNotes: [
      "Custom responsive design with modern minimalist typography",
      "Dynamic admin management dashboard for live content updates",
      "Integrated analytics and contact communication portal"
    ]
  },
  {
    id: "proj-personal-diary",
    slug: "personal-diary-journal-platform",
    title: "Personal Diary / Journal Web Project",
    category: "Creative Projects",
    description: "A personal digital diary and reflective writing platform designed around private journaling, writing and personal reflection.",
    detailedDescription: "Created to facilitate calm, distraction-free writing, personal reflection, and private documentation. Centers on typographic warmth, private entry organisation, and thoughtful creative expression.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    tags: ["Journaling", "Creative Writing", "Reflective Design", "Web Application"],
    tools: ["React", "TypeScript", "Markdown", "Tailwind CSS"],
    featured: true,
    visibility: "published",
    order: 2,
    architectureNotes: [
      "Distraction-free editorial reading and journaling view",
      "Categorized entries by mood, reflection, and creative topic",
      "Warm neutral color balance optimized for prolonged writing sessions"
    ]
  },
  {
    id: "proj-cinexus",
    slug: "cinexus-creative-digital-project",
    title: "CINEXUS",
    category: "Creative Projects",
    description: "A creative digital and web project presented as a dedicated portfolio case study in visual media and interactive presentation.",
    detailedDescription: "CINEXUS explores visual storytelling, cinematic presentation, and modern digital media curation. Combines dynamic visual layouts with structured media categorization to deliver an engaging digital experience.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    tags: ["Media Curation", "Digital Experience", "UI Design", "Creative Technology"],
    tools: ["Web Platforms", "Graphic Design", "Media Editing"],
    liveUrl: "https://cinexus-nine.vercel.app/",
    featured: true,
    visibility: "published",
    order: 3,
    architectureNotes: [
      "Cinematic visual tone with dark aesthetic accents",
      "Modular presentation cards and media showcases",
      "Responsive layout engineered for both desktop and mobile discovery"
    ]
  },
  {
    id: "proj-web-digital",
    slug: "web-and-digital-creative-projects",
    title: "Web and Digital Creative Projects",
    category: "Web Projects",
    description: "Various website, digital content, interface and creative technology projects associated with the portfolio.",
    detailedDescription: "A curated collection of web layouts, digital interfaces, and interactive experiments reflecting clean visual structure, user-centered hierarchy, and modern web best practices.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    tags: ["Web Design", "Interface Design", "Digital Media", "Creative Coding"],
    tools: ["HTML5", "CSS3 / Tailwind", "TypeScript", "Figma"],
    featured: true,
    visibility: "published",
    order: 4,
    architectureNotes: [
      "Focus on clean spacing, accessibility, and high contrast legibility",
      "Scalable responsive component layouts"
    ]
  },
  {
    id: "proj-social-media-suite",
    slug: "social-media-content-and-management-suite",
    title: "Social Media Post & Carousel Design Suite",
    category: "Social Media",
    description: "High-engagement social media posts, multi-slide carousels, and visual templates crafted for educational and brand reach.",
    detailedDescription: "Showcase of swipeable carousels, typographic hook layouts, and social media feed packages designed to communicate information with clarity and retention.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tags: ["Social Media", "Carousel Design", "Content Creation", "Visual Growth"],
    tools: ["Adobe Photoshop", "Canva Pro", "Illustrator"],
    featured: true,
    visibility: "published",
    order: 5,
    architectureNotes: [
      "Optimized for high retention and seamless swipe transitions",
      "Cohesive typographic rhythm across slides"
    ]
  },
  {
    id: "proj-editorial-posters-collateral",
    slug: "graphic-design-posters-and-certificates",
    title: "Graphic Design, Posters & Certificate Collateral",
    category: "Graphic Design",
    description: "Promotional event posters, academic certificates, invitation suites, tute materials, and modern CV designs.",
    detailedDescription: "A comprehensive showcase of print and digital collateral demonstrating disciplined typography, balanced negative space, and formal visual communication.",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
    tags: ["Poster Design", "Certificates", "Invitations", "Tute Design", "CV Design"],
    tools: ["Adobe Illustrator", "InDesign", "Photoshop"],
    featured: true,
    visibility: "published",
    order: 6,
    architectureNotes: [
      "High-precision vector layouts prepared for both print and digital distribution",
      "Disciplined Swiss grid structure and typographic restraint"
    ]
  }
];

export const defaultArticles: Article[] = [
  {
    id: "art-1",
    slug: "design-with-purpose-create-with-intention-write-with-meaning",
    title: "Design with Purpose. Create with Intention. Write with Meaning.",
    excerpt: "Exploring the guiding philosophy behind visual design, deliberate communication, and authentic creative storytelling.",
    content: `Creative work achieves its highest power when every line, space, and word serves a clear purpose.

### 1. Design with Purpose
Design is never merely decoration. In graphic design, social media content, and visual communication, every element must contribute to clarity. When we remove unnecessary ornament and focus on clean layout, intentional hierarchy, and readable typography, the message connects immediately with its audience.

### 2. Create with Intention
Whether designing a social media carousel, an educational workbook, a promotional poster, or an institutional certificate, intention dictates outcome. Knowing who the audience is, what they need to understand, and how they interact with the medium allows us to craft assets that respect their time and attention.

### 3. Write with Meaning
Writing gives design its voice. From reflective journaling to concise social copy and in-depth articles, words anchor our thoughts. When visual craft and thoughtful writing unite, digital communication becomes enduring rather than ephemeral.`,
    author: "Ash Wickramasinghe",
    category: "Creative Philosophy",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-01-15",
    readTime: "3 min read",
    published: true,
    tags: ["Design Philosophy", "Creative Writing", "Visual Communication"]
  },
  {
    id: "art-2",
    slug: "the-craft-of-high-retention-social-media-content",
    title: "The Craft of High-Retention Social Media Content & Carousel Design",
    excerpt: "How structured visual rhythm, readable typography, and intentional hook pacing transform casual scrollers into engaged readers.",
    content: `In an environment flooded with fast-moving content, thoughtful presentation is what creates genuine retention.

### Visual Hierarchy on Touchscreens
A viewer browsing on a smartphone processes images and text in fractions of a second. If a graphic is overloaded with competing colors and cramped text, the eye tires and moves on.

- **Clear Focal Point**: Give the eye one primary element to land on first.
- **Readable Contrast**: Text must stand out cleanly against its background without strain.
- **Generous Spacing**: Margins are breathing room that allow ideas to be understood.

### Multi-Slide Storytelling
Carousels function like miniature digital booklets. When each slide advances one clear idea with a seamless visual link to the next, readers are naturally motivated to slide through to the conclusion.

Deliberate craft and consistent quality always build deeper audience trust over time.`,
    author: "Writer Ash",
    category: "Social Media",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-02-01",
    readTime: "4 min read",
    published: true,
    tags: ["Social Media", "Carousel Design", "Visual Content"]
  },
  {
    id: "art-3",
    slug: "reflections-on-creative-writing-and-personal-journaling",
    title: "Reflections on Creative Writing and the Digital Journal",
    excerpt: "The value of quiet reflection, personal journaling, and authentic creative expression in a fast-paced digital age.",
    content: `Journaling and creative writing provide a sanctuary for the mind. Amidst daily demands, putting thoughts into written form creates clarity and perspective.

### The Digital Diary as a Creative Space
A personal digital diary is not about public performance—it is a space of honesty. It allows one to document lessons, explore ideas without pressure, and trace personal growth over time.

### The Writer's Craft
Whether writing under the identity of Writer Ash or Writer Tizzy, the goal remains the same: to articulate human feelings, observations, and stories with authenticity. True creative writing connects because it comes from genuine reflection.`,
    author: "Writer Tizzy",
    category: "Reflections",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-02-14",
    readTime: "4 min read",
    published: true,
    tags: ["Creative Writing", "Journaling", "Personal Reflections"]
  }
];

export const defaultMessages: import('../types').ContactMessage[] = [
  {
    id: "msg-101",
    name: "Nuwan Fernando",
    email: "nuwan.fernando@pulsecolombo.lk",
    service: "Brand Identity & Social Media Revamp",
    subject: "Creative Branding & Carousel Retainer",
    message: "Hi Ash, We loved your clean typography and visual identity designs. We are looking for a complete brand refresh for our creative studio in Colombo, along with 20 carousel post templates for Instagram and LinkedIn. Are you available for a project starting this month?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    status: "unread"
  },
  {
    id: "msg-102",
    name: "Samantha Silva",
    email: "samantha.s@sarasavi-press.com",
    service: "Book Cover & Editorial Typography",
    subject: "Cover Design for Sci-Fi Novel",
    message: "Hello Ash Wickramasinghe, We are preparing the release of an upcoming sci-fi fiction collection and need a striking jacket illustration and interior layout. Given your background as an author and graphic artist, your style matches our vision.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "unread"
  },
  {
    id: "msg-103",
    name: "Dr. K. Jayawardena",
    email: "jayawardena.academic@gmail.com",
    service: "Educational Material & Tute Layouts",
    subject: "Secondary Education Handbook Typesetting",
    message: "Greetings Kushan. We require professional layout design and diagram typesetting for our secondary educational biology handbook. Looking forward to your quote.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    status: "read"
  }
];

