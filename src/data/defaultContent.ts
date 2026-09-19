import { Project, SiteSettings, Article, ServiceItem } from '../types';

export const defaultSiteSettings: SiteSettings = {
  name: "Ash Wickramasinghe",
  title: "Graphic Designer, Social Media Manager & Content Editor",
  bio: "Crafting minimalist visual identities, editorial brand systems, high-retention social content, and refined digital experiences with aesthetic precision.",
  aboutBio: "I am Ash Wickramasinghe, a graphic designer, social media manager, and creative content editor based in Colombo, Sri Lanka, collaborating with clients worldwide. My focus is centered on editorial brand identity, high-conversion social media visual assets, meticulous publication and layout design, and modern digital creative direction. I combine visual restraint with strategic engagement to create brands that endure.",
  careerTrajectory: "With a disciplined focus on graphic design, content editing, and social media strategy, I work with independent brands, creators, and creative agencies to craft timeless design collateral, viral carousel content, and cohesive visual identities.",
  statusText: "Available for select freelance commissions & brand retainers",
  avatarUrl: "/ash_cyber_portrait.jpg",
  cvUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  email: "kushanashvika216@gmail.com",
  location: "Colombo, Sri Lanka — Available Globally",
  github: "https://github.com/ash-wickramasinghe",
  linkedin: "https://linkedin.com/in/ash-wickramasinghe",
  telegram: "https://t.me/ash_wickramasinghe",
  instagram: "https://instagram.com/ash_wickramasinghe",
  availabilityStatus: "available",
  accentColor: "#c59b63", // Elegant editorial warm copper/gold
  defaultTheme: "dark",
  metaTitle: "Ash Wickramasinghe — Graphic Designer, Social Media Manager & Content Editor",
  metaDescription: "The official personal portfolio of Ash Wickramasinghe. Specializing in graphic design, social media management, brand identity, and creative content editing.",
  keywords: "Ash Wickramasinghe, Graphic Design, Social Media Management, Content Editing, Brand Identity, Editorial Design, Colombo Sri Lanka",
  metrics: [
    { label: "Completed Projects", value: "85+", subtext: "Brand & Visual Collateral" },
    { label: "Social Media Campaigns", value: "45+", subtext: "Organic Growth & Reach" },
    { label: "Design Assets Produced", value: "400+", subtext: "Posters, Carousels & Layouts" },
    { label: "Years of Experience", value: "5+", subtext: "Design & Creative Direction" }
  ],
  skills: [
    { name: "Graphic Design & Typography", level: 96, category: "Design & Branding" },
    { name: "Logo & Brand Identity Systems", level: 95, category: "Design & Branding" },
    { name: "Social Media Post & Carousel Design", level: 95, category: "Social & Growth" },
    { name: "Poster, Certificate & Invitation Design", level: 92, category: "Design & Branding" },
    { name: "Content Editing & Video Assembly", level: 90, category: "Content & Video" },
    { name: "Photo Editing & Color Grading", level: 91, category: "Content & Video" },
    { name: "Editorial Layout & Tute / CV Design", level: 94, category: "Design & Branding" },
    { name: "Social Media Strategy & Planning", level: 92, category: "Social & Growth" },
    { name: "Adobe Photoshop & Illustrator", level: 96, category: "Design & Branding" },
    { name: "Figma & Canva Pro Systems", level: 94, category: "Design & Branding" },
    { name: "Creative Direction & Copywriting", level: 88, category: "Content & Video" },
    { name: "Web & Digital Interface Design", level: 86, category: "Web & Digital" }
  ],
  timeline: [
    {
      id: "exp-1",
      period: "2023 — PRESENT",
      role: "Lead Graphic Designer & Social Media Strategist",
      organization: "Independent Practice & Creative Retainers",
      description: "Directing end-to-end brand identities, social media visual packages, editorial publication layouts, and high-retention reel content for international and regional clients.",
      skills: ["Graphic Design", "Social Media Strategy", "Branding", "Content Editing"],
      type: "work"
    },
    {
      id: "exp-2",
      period: "2021 — 2023",
      role: "Senior Visual Designer & Content Manager",
      organization: "Creative Media Studio",
      description: "Developed multi-platform social media campaigns, promotional poster suites, certificate designs, and client presentation systems with measurable engagement growth.",
      skills: ["Adobe Illustrator", "Photoshop", "Social Media", "Poster Design"],
      type: "work"
    },
    {
      id: "exp-3",
      period: "2019 — 2021",
      role: "Graphic Designer & Digital Content Specialist",
      organization: "Brand Studio Agency",
      description: "Produced high-quality editorial layouts, marketing collateral, invitation suites, and educational tutorial designs.",
      skills: ["Editorial Design", "Layout", "Content Production", "Typography"],
      type: "work"
    },
    {
      id: "edu-1",
      period: "2016 — 2020",
      role: "B.Sc. in Creative Technologies & Digital Media",
      organization: "Faculty of Computing & Digital Arts",
      description: "Rigorous study in visual communication principles, editorial typography, digital publishing systems, and creative direction.",
      skills: ["Visual Communication", "Digital Media", "Typography", "Editorial Design"],
      type: "education"
    }
  ],
  services: [
    {
      id: "srv-graphic-design",
      slug: "graphic-design",
      title: "Graphic Design",
      badge: "CORE DISCIPLINE",
      description: "Comprehensive visual design solutions ranging from bespoke typography and vector illustration to print and digital marketing collateral.",
      deliverables: ["Print & Digital Collateral", "Vector Illustrations", "Typography Systems", "Marketing Graphics"],
      techStack: ["Adobe Photoshop", "Adobe Illustrator", "Figma"],
      featured: true,
      order: 1
    },
    {
      id: "srv-social-media",
      slug: "social-media-post-design",
      title: "Social Media Post Design",
      badge: "HIGH CONVERSION",
      description: "Bespoke social media post designs, carousel decks, story frames, and feed templates engineered for high engagement and aesthetic consistency.",
      deliverables: ["Carousel Deck Frameworks", "Daily Post Templates", "Story Highlights & Covers", "Grid Aesthetic Alignment"],
      techStack: ["Photoshop", "Illustrator", "Canva Pro", "Figma"],
      featured: true,
      order: 2
    },
    {
      id: "srv-branding",
      slug: "branding-and-identity",
      title: "Logo & Brand Identity Design",
      badge: "IDENTITY",
      description: "Memorable logo marks, custom typography, color palettes, and comprehensive brand guidelines that define your organization's voice.",
      deliverables: ["Primary & Secondary Logos", "Brand Style Guide Book", "Color & Typography Scales", "Stationery & Iconography"],
      techStack: ["Adobe Illustrator", "Figma", "Photoshop"],
      featured: true,
      order: 3
    },
    {
      id: "srv-poster-design",
      slug: "poster-design",
      title: "Poster Design",
      badge: "EDITORIAL",
      description: "Editorial, cinematic, and event posters designed with typographic tension, visual hierarchy, and commanding visual presence.",
      deliverables: ["Event & Conference Posters", "Cinematic Promo Graphics", "Typography & Art Prints", "High-Resolution Print Files"],
      techStack: ["Photoshop", "Illustrator", "InDesign"],
      featured: true,
      order: 4
    },
    {
      id: "srv-certificate-design",
      slug: "certificate-design",
      title: "Certificate Design",
      badge: "CREDENTIALS",
      description: "Formal, elegant, and secure certificate designs for academic institutions, corporate events, workshops, and recognition programs.",
      deliverables: ["Institutional Certification Templates", "Vector Guilloche & Seals", "Print-Ready Vectors", "Editable Name Fields"],
      techStack: ["Adobe Illustrator", "InDesign"],
      featured: false,
      order: 5
    },
    {
      id: "srv-invitation-design",
      slug: "invitation-design",
      title: "Invitation Design",
      badge: "OCCASIONS",
      description: "Refined digital and luxury print invitation suites for galas, weddings, product launches, VIP events, and ceremonies.",
      deliverables: ["Single & Multi-Card Suites", "Digital RSVP Assets", "Monogram & Wax Seal Art", "Print Specifications"],
      techStack: ["Adobe InDesign", "Illustrator", "Photoshop"],
      featured: false,
      order: 6
    },
    {
      id: "srv-tute-design",
      slug: "tute-design",
      title: "Tute & Educational Material Design",
      badge: "PUBLICATIONS",
      description: "Structured, legible, and engaging layout design for educational tutorials, student workbooks, course modules, and study guides.",
      deliverables: ["Workbook & Tute Page Layouts", "Diagrams & Infographics", "Cover Art & Chapter Breaks", "Digital PDF & Print Ready"],
      techStack: ["InDesign", "Illustrator", "Acrobat Pro"],
      featured: false,
      order: 7
    },
    {
      id: "srv-cv-design",
      slug: "cv-design",
      title: "CV & Executive Resume Design",
      badge: "CAREER ASSET",
      description: "Clean, ATS-conscious, and typographically sophisticated curriculum vitae and portfolio dossier designs that leave an impression.",
      deliverables: ["Modern Executive Resume Layout", "Cover Letter Template", "Interactive PDF Links", "Clean Minimalist Hierarchy"],
      techStack: ["InDesign", "Figma", "Illustrator"],
      featured: false,
      order: 8
    },
    {
      id: "srv-photo-editing",
      slug: "photo-editing",
      title: "Photo Editing & Retouching",
      badge: "COLOR & FORM",
      description: "Professional color grading, tonal balance, skin texture preservation, object cleanup, and product retouching for commercial use.",
      deliverables: ["Commercial Product Retouching", "Portrait Color Correction", "Background Cleanups", "High-End Mood Grading"],
      techStack: ["Adobe Photoshop", "Lightroom"],
      featured: false,
      order: 9
    },
    {
      id: "srv-content-writing",
      slug: "content-writing",
      title: "Content Writing & Creative Direction",
      badge: "EDITORIAL VOICE",
      description: "Compelling brand copy, social media captions, campaign slogans, and editorial articles that communicate with clarity and poise.",
      deliverables: ["Social Media Captions & Hooks", "Brand Manifestos & Bios", "Campaign Taglines", "Editorial Articles"],
      techStack: ["Editorial Research", "Copywriting", "SEO Strategy"],
      featured: false,
      order: 10
    },
    {
      id: "srv-web-management",
      slug: "web-management",
      title: "Web Management & Digital Content",
      badge: "DIGITAL PLATFORMS",
      description: "Curation, asset optimization, visual maintenance, and layout updates for personal portfolios and modern web platforms.",
      deliverables: ["Asset Optimization", "Content Architecture", "Frontend Layout Styling", "Performance Tuning"],
      techStack: ["Next.js", "React", "Tailwind CSS", "Firebase"],
      featured: false,
      order: 11
    }
  ],
  testimonials: [
    {
      id: "tst-1",
      clientName: "Chathura Senanayake",
      role: "Creative Director",
      company: "Aura Media Group",
      content: "Ash delivered an extraordinary brand identity that immediately elevated our market positioning. His typographic discipline and eye for editorial balance are world-class.",
      rating: 5,
      projectRef: "Brand Identity & Design System"
    },
    {
      id: "tst-2",
      clientName: "Dilshan Fernando",
      role: "Founder",
      company: "Verve Digital Studio",
      content: "The social media carousels and promotional posters designed by Ash brought an immediate 160% jump in organic engagement. Highly professional and dependable.",
      rating: 5,
      projectRef: "Social Media Post & Carousel Suite"
    },
    {
      id: "tst-3",
      clientName: "Sarah Jenkins",
      role: "Managing Editor",
      company: "Editorial Collective",
      content: "Ash has a rare gift for combining minimalist restraint with commanding visual presence. Every deliverable was meticulously crafted and delivered on schedule.",
      rating: 5,
      projectRef: "Publication Layout & Editorial Assets"
    }
  ]
};

export const defaultProjects: Project[] = [
  {
    id: "proj-brand-identity",
    slug: "luminar-brand-identity-system",
    title: "Luminar Brand Identity & Visual System",
    category: "Branding",
    description: "A refined, minimalist brand identity system developed with custom logomark, editorial typography pairing, color tokens, and corporate stationery.",
    detailedDescription: "Designed for a contemporary design consultancy, Luminar required a visual identity that radiated quiet confidence. The project included architectural logomark construction, an editorial typographic system based on a high-contrast serif and clean grotesque sans, and a modular corporate stationery suite.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Branding", "Logo Design", "Typography", "Stationery", "Style Guide"],
    tools: ["Adobe Illustrator", "InDesign", "Figma"],
    year: "2024",
    client: "Luminar Design Consultancy",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: true,
    visibility: "published",
    order: 1,
    architectureNotes: [
      "Golden ratio geometric logomark construction",
      "Duotone and monochrome color hierarchies for diverse print mediums",
      "Complete 48-page brand identity standards manual"
    ],
    createdAt: "2024-03-15T10:00:00Z"
  },
  {
    id: "proj-social-carousels",
    slug: "kinetic-editorial-social-carousels",
    title: "Editorial Social Media Carousel Series",
    category: "Social Media",
    description: "A cohesive series of high-engagement swipeable carousels engineered for creative education, brand storytelling, and thought leadership.",
    detailedDescription: "Conceived as an editorial print publication translated to mobile touchscreens, this carousel series established benchmark engagement rates. Utilizes disciplined grid alignment, rhythmic typographic scales, and compelling hook slides that encourage sharing and bookmarking.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Social Media", "Carousel Design", "Content Strategy", "Typography"],
    tools: ["Adobe Photoshop", "Illustrator", "Canva Pro"],
    year: "2024",
    client: "Creative Growth Media",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: true,
    visibility: "published",
    order: 2,
    architectureNotes: [
      "Multi-slide seamless edge-to-edge panoramic transitions",
      "Engineered visual hooks driving 2.4x higher bookmark rates",
      "Adaptable modular template kit for rapid content scheduling"
    ],
    createdAt: "2024-04-10T12:00:00Z"
  },
  {
    id: "proj-poster-series",
    slug: "monolith-typographic-poster-collection",
    title: "Monolith Typographic Poster Collection",
    category: "Posters",
    description: "A series of large-format cultural and architectural exhibition posters exploring brutalist geometry, negative space, and Swiss typographic heritage.",
    detailedDescription: "Exhibited as a celebration of modern editorial design, this collection explores typographic hierarchy pushed to sculptural limits. Strict mathematical baseline grids meet asymmetrical typography to produce prints that command visual space.",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Posters", "Swiss Style", "Typography", "Editorial Print"],
    tools: ["Adobe Illustrator", "InDesign", "Photoshop"],
    year: "2023",
    client: "Contemporary Design Gallery",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: true,
    visibility: "published",
    order: 3,
    architectureNotes: [
      "High-resolution vector typography prepared for B1 & A1 print runs",
      "Exploration of micro-typography alongside macro display glyphs",
      "Precision ink-bleed and matte cotton paper finish specifications"
    ],
    createdAt: "2023-11-20T14:30:00Z"
  },
  {
    id: "proj-certificate-invitation",
    slug: "aurum-certificate-invitation-suite",
    title: "Aurum Executive Certificate & Gala Suite",
    category: "Graphic Design",
    description: "Formal certification certificates and luxury gala invitation collateral with intricate vector borders, custom seals, and editorial typography.",
    detailedDescription: "Designed for an annual leadership forum, this collection features vector guilloche border artwork, hot-foil stamp simulation for digital proofs, and an elegant serif layout ensuring academic gravity and timeless prestige.",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80"
    ],
    tags: ["Certificate Design", "Invitation Design", "Vector Art", "Print Collateral"],
    tools: ["Adobe Illustrator", "InDesign"],
    year: "2024",
    client: "Asia Leadership Forum",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: true,
    visibility: "published",
    order: 4,
    architectureNotes: [
      "Anti-counterfeit vector micro-patterning and custom ornamental seals",
      "Standard A4 and US Letter dimensional scaling",
      "Dynamic data-merge compatibility for automated recipient names"
    ],
    createdAt: "2024-01-25T09:00:00Z"
  },
  {
    id: "proj-educational-tutes",
    slug: "nexus-educational-tutorial-workbooks",
    title: "Nexus Design Workbook & Tute Layouts",
    category: "Creative Projects",
    description: "Multi-chapter educational workbook and tutorial handout layout design optimized for readability, visual comprehension, and student retention.",
    detailedDescription: "Created for a digital design academy, this project transformed dense curriculum into an inviting, structured workbook. Features custom iconography, margin note callouts, step-by-step exercise worksheets, and clean typographic tables.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    tags: ["Tute Design", "Editorial Layout", "Educational", "InDesign"],
    tools: ["Adobe InDesign", "Illustrator"],
    year: "2023",
    client: "Nexus Learning Institute",
    liveUrl: "https://ash-wickramasinghe.site/projects",
    featured: false,
    visibility: "published",
    order: 5,
    architectureNotes: [
      "6-column flexible grid system designed for mixed text and diagram pages",
      "Interactive digital PDF bookmarks and clickable table of contents",
      "Tested for both digital tablet viewing and monochrome physical printing"
    ],
    createdAt: "2023-09-12T16:00:00Z"
  },
  {
    id: "proj-personal-site",
    slug: "ash-wickramasinghe-portfolio-platform",
    title: "Ash Wickramasinghe Portfolio & CMS",
    category: "Web Projects",
    description: "The bespoke digital portfolio and content management architecture powering this website, built with React, TypeScript, and Firebase Firestore.",
    detailedDescription: "A modern, editorial personal portfolio designed to reflect a minimalist aesthetic. Separates the public showcase completely from a private administration dashboard for real-time portfolio updates.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Firebase", "Web Design"],
    tools: ["React", "TypeScript", "Tailwind CSS", "Firebase Auth & Firestore"],
    year: "2025",
    client: "Ash Wickramasinghe",
    liveUrl: "https://ash-wickramasinghe.site",
    githubUrl: "https://github.com/ash-wickramasinghe/portfolio",
    featured: true,
    visibility: "published",
    order: 6,
    architectureNotes: [
      "Completely isolated administrative dashboard routing (/admin)",
      "Strict Firebase Authentication and Firestore security rules",
      "Fluid responsive typography with custom accent color tokens"
    ],
    createdAt: "2025-01-10T11:00:00Z"
  }
];

export const defaultArticles: Article[] = [
  {
    id: "art-1",
    slug: "editorial-restraint-in-modern-brand-systems",
    title: "The Discipline of Editorial Restraint in Modern Brand Systems",
    excerpt: "Why subtraction, generous negative space, and typographic rigor build longer-lasting brands than trend-driven noise.",
    content: `In an era defined by visual saturation, the most powerful design statement an organization can make is one of deliberate restraint. 

When every digital surface competes for attention with screaming neon gradients and chaotic motion, simplicity ceases to be a mere stylistic preference—it becomes an unmistakable badge of confidence and authority.

### The Tyranny of the Unnecessary

Amateur design often begins with the impulse of addition: adding another color, another decorative badge, an unnecessary drop shadow, or a secondary geometric pattern. 

True craft begins when we shift from addition to subtraction. The central question of editorial design is never *"what else can we put on this canvas?"* but rather *"what is the absolute minimum number of elements required to convey this message with maximum resonance?"*

### Typographic Gravity

Every visual identity requires an anchor. When you reduce visual clutter, typography takes on immense importance. A single high-contrast serif paired with a balanced, neutral sans-serif carries more emotional nuance than a dozen arbitrary illustrations.

When working with clients, our goal is to design assets that look just as commanding on newsprint or concrete signage as they do on a high-density OLED display. That versatility only arrives when the underlying structure is mathematically sound.`,
    author: "Ash Wickramasinghe",
    category: "Design Philosophy",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2024-11-14",
    readTime: "4 min read",
    published: true,
    tags: ["Editorial Design", "Typography", "Branding", "Minimalism"]
  },
  {
    id: "art-2",
    slug: "the-mechanics-of-high-retention-social-carousels",
    title: "The Mechanics of High-Retention Social Carousels: Design for Scannability",
    excerpt: "Deconstructing the cognitive flow, slide transitions, and typographic rhythm that turn casual scrollers into committed readers.",
    content: `The modern social media carousel is not just a digital photo album—it is a mini-magazine delivered directly to someone's palm. 

Designing a carousel that earns saves, shares, and complete slide-throughs requires an understanding of cognitive friction and pacing.

### 1. The Hook Slide: Visual Stopping Power

Your first slide has approximately 0.8 seconds to earn the viewer's attention. If your headline is crowded by decorative borders, unreadable script fonts, or generic stock graphics, the user will flick right past.

- Use large, crisp display type with tight tracking.
- Keep the headline under eight words.
- Use high-contrast foreground-to-background balance.
- Avoid placing logos or secondary credits at the top—prioritize the viewer's payoff.

### 2. Edge-to-Edge Visual Continuity

One of the most effective psychological cues for encouraging a swipe is an intentional visual spill. When a shape, line, or graphic element is cut off at the right edge of slide 2 and continues cleanly on slide 3, the brain instinctively wants to complete the puzzle.

### 3. Pacing and Information Density

Never place more than one core idea on a single slide. White space is not empty space—it is reading room. When text has room to breathe, the reader perceives the content as effortless to digest.

Treat every carousel as an editorial publication. Quality over quantity always wins the long-term algorithm.`,
    author: "Ash Wickramasinghe",
    category: "Social Strategy",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2024-12-02",
    readTime: "5 min read",
    published: true,
    tags: ["Social Media", "Carousel Design", "Content Editing", "Engagement"]
  },
  {
    id: "art-3",
    slug: "why-publication-layout-design-matters-for-digital-creators",
    title: "Why Publication & Layout Design Matters in a Mobile-First Era",
    excerpt: "Bringing the classical principles of editorial print into PDF workbooks, tutorial sheets, and executive resumes.",
    content: `Many designers believe print layout principles died with newspapers. In reality, the rules of Swiss grid architecture, baseline alignment, and typographic hierarchy have never been more urgent.

When an executive opens a CV, or when a student reads a workbook tutorial, they make an instantaneous assessment of credibility. A document with misaligned columns, haphazard font weights, and claustrophobic margins signals disorganized thinking.

### The Foundations of Clean Layouts

1. **Strict Baseline Grids**: Every heading, subhead, paragraph, and caption must align to a consistent vertical rhythm. This invisible cadence creates subconscious order.
2. **Hierarchy Without Yelling**: You do not need bold 48pt text, bright red underlines, and neon callouts to show what matters. Subtle weight shifts and generous leading achieve clarity without visual noise.
3. **Intentional Margin Math**: Outer container margins must always exceed the internal gutters between elements.

Whether designing an institution's graduation certificate, an executive's one-page resume, or a company's internal whitepaper, disciplined typography remains the highest form of professional respect for your reader.`,
    author: "Writer Ash",
    category: "Layout & Print",
    coverImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2025-01-18",
    readTime: "6 min read",
    published: true,
    tags: ["Editorial Design", "Workbooks", "CV Design", "Typography"]
  }
];
