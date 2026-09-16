import { Project, SiteSettings } from '../types';

export const defaultSiteSettings: SiteSettings = {
  name: "Ash Wickramasinghe",
  title: "Senior Full-Stack Web Developer & Cyber Systems Specialist",
  bio: "Architecting high-performance web applications, reactive cloud systems, and resilient cyber architectures. Blending crisp cyberpunk aesthetics with uncompromising engineering rigor.",
  aboutBio: "I am a Senior Full-Stack Web Developer, UI/UX Designer, and Cyber Systems Specialist dedicated to crafting mission-critical, ultra-responsive digital applications. With deep roots across modern TypeScript/React ecosystems, microservice architectures, defensive cybersecurity protocols, and distributed cloud computing, I build software designed to withstand scale and hostile environments while delivering unparalleled user experiences.",
  careerTrajectory: "Over the past 6+ years, my trajectory has evolved from crafting intuitive user interfaces and creative digital platforms to engineering end-to-end resilient full-stack systems, automating CI/CD pipelines, and auditing critical web application security vulnerabilities.",
  statusText: "AVAILABLE FOR CONTRACTS & FULL-TIME ROLES",
  clearanceLevel: "SYS_CLEARANCE: LEVEL 4 // ROOT ACCESS GRANTED",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  cvUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
  email: "kushanashvika216@gmail.com",
  location: "Colombo, Sri Lanka // Remote Worldwide",
  github: "https://github.com/ash-x8",
  linkedin: "https://linkedin.com/in/ash-wickramasinghe",
  telegram: "https://t.me/ash_wickramasinghe",
  metrics: [
    { label: "Production Deployments", value: "48+", subtext: "Zero Downtime Deployments" },
    { label: "System Uptime Avg", value: "99.98%", subtext: "High-Availability Clusters" },
    { label: "Security Audits Completed", value: "35+", subtext: "OWASP Top 10 Hardened" },
    { label: "Years of Active Engineering", value: "6+", subtext: "Continuous Evolution" }
  ],
  skills: [
    { name: "React / Next.js / TypeScript", level: 96, category: "Frontend & UI" },
    { name: "Tailwind CSS & Framer Motion", level: 94, category: "Frontend & UI" },
    { name: "Node.js / Express / Fastify", level: 92, category: "Backend & APIs" },
    { name: "Python / Go / Microservices", level: 88, category: "Backend & APIs" },
    { name: "Penetration Testing & Security Audits", level: 89, category: "Cyber & Security" },
    { name: "OAuth 2.0 / JWT / Zero-Trust Architecture", level: 95, category: "Cyber & Security" },
    { name: "Docker / Kubernetes / CI-CD", level: 90, category: "Cloud & DevOps" },
    { name: "Firebase (Auth, Firestore, Storage)", level: 94, category: "Cloud & DevOps" },
    { name: "PostgreSQL / MongoDB / Redis", level: 91, category: "Databases & Tools" },
    { name: "Linux Systems Administration & Bash", level: 93, category: "Databases & Tools" }
  ],
  timeline: [
    {
      id: "exp-1",
      period: "2023 — PRESENT",
      role: "Lead Full-Stack & Security Systems Engineer",
      organization: "Nexus Cyber Labs",
      description: "Spearheading modern web application architecture, defensive security posture audits, and real-time dashboard development. Leading the migration of legacy monoliths to microservices.",
      skills: ["React", "TypeScript", "Node.js", "Docker", "Zero-Trust", "PostgreSQL"],
      type: "work"
    },
    {
      id: "exp-2",
      period: "2021 — 2023",
      role: "Senior Frontend Engineer & UI/UX Architect",
      organization: "Vortex Digital Systems",
      description: "Designed and engineered enterprise-grade design systems and high-throughput web portals. Reduced client bundle sizes by 42% and implemented end-to-end encryption protocols.",
      skills: ["React", "TypeScript", "Framer Motion", "Tailwind CSS", "Firebase"],
      type: "work"
    },
    {
      id: "exp-3",
      period: "2019 — 2021",
      role: "Web Application Developer & Systems Integrator",
      organization: "CyberSphere Technologies",
      description: "Delivered customized web tools, REST APIs, cloud functions, and database schemas with strict adherence to ISO and OWASP security standards.",
      skills: ["JavaScript", "Node.js", "Express", "MongoDB", "Linux"],
      type: "work"
    },
    {
      id: "edu-1",
      period: "2015 — 2019",
      role: "B.Sc. in Computer Science & Information Technology",
      organization: "Faculty of Computing & Information Technology",
      description: "Focus on Computer Networks, Cryptography, Distributed Systems, Software Engineering, and Database Systems Architecture.",
      skills: ["Computer Networks", "Algorithms", "Network Security", "Operating Systems"],
      type: "education"
    }
  ]
};

export const defaultProjects: Project[] = [
  {
    id: "personal-portfolio-site",
    title: "Personal Developer Portfolio",
    category: "Full-Stack",
    description: "Modern, high-performance developer portfolio built with React, TypeScript, and Tailwind CSS featuring dynamic CMS integration and zero-trust security architecture.",
    detailedDescription: "A bespoke, ultra-responsive digital portfolio designed to showcase software engineering craftsmanship, full-stack systems architecture, and UI/UX design. Features real-time Firestore content updates, protected CV dossier inspection, and clean responsive layouts.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "TypeScript", "Tailwind CSS", "Firebase", "Vite", "Responsive Design"],
    githubUrl: "https://github.com/ash-x8/personal-portfolio",
    liveUrl: "https://ash-wickramasinghe.site",
    featured: true,
    order: 1,
    architectureNotes: [
      "Dynamic CMS synchronized via Firebase Firestore",
      "Client-side caching and responsive image shimmer skeleton loading",
      "Embedded read-only CV viewer with zero-download protection"
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
    githubUrl: "https://github.com/ash-x8/personal-diary",
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
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite", "Movie API", "Vercel"],
    githubUrl: "https://github.com/ash-x8/cinexus-hd",
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
    id: "cybersentry-siem",
    title: "CyberSentry SIEM & Telemetry Hub",
    category: "Cyber/Tools",
    description: "Real-time security telemetry dashboard with automated anomaly detection, packet inspection visualizer, and instant incident response alerting.",
    detailedDescription: "Designed for SOC teams, CyberSentry monitors incoming traffic streams, identifies SQL injection / brute-force patterns, and surfaces geo-located threat actors with interactive radar visualization.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    tags: ["TypeScript", "React", "Node.js", "WebSockets", "D3.js", "Cyber Defense"],
    githubUrl: "https://github.com/ash-x8/cybersentry",
    liveUrl: "https://github.com/ash-x8/cybersentry",
    featured: false,
    order: 4,
    architectureNotes: [
      "WebSocket streaming with buffer compression",
      "Automated threat scoring using behavioral heuristics",
      "Interactive topological network graph"
    ]
  },
  {
    id: "nexusvault-crypto",
    title: "NexusVault Zero-Knowledge Cryptography",
    category: "Full-Stack",
    description: "End-to-end client-side encrypted secret vault and credentials manager utilizing AES-GCM 256-bit encryption with zero-knowledge master derivation.",
    detailedDescription: "NexusVault guarantees that server administrators have zero insight into encrypted user payloads. Master keys are derived on the client using PBKDF2 with 310,000 rounds and authenticated with WebAuthn biometric security.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "Web Crypto API", "Node.js", "Firebase Firestore", "Zero-Knowledge"],
    githubUrl: "https://github.com/ash-x8/nexusvault",
    liveUrl: "https://github.com/ash-x8/nexusvault",
    featured: false,
    order: 5,
    architectureNotes: [
      "Client-side AES-256-GCM symmetric encryption",
      "PBKDF2 key derivation with unique cryptographic salts",
      "Time-based one-time password (TOTP) authenticator generator"
    ]
  },
  {
    id: "cloudops-orchestrator",
    title: "CloudOps Cluster Visualizer",
    category: "Cloud & Systems",
    description: "Microservice infrastructure orchestrator visualizing Docker containers, Kubernetes pods, CPU/Memory telemetry, and auto-scaling rules.",
    detailedDescription: "A comprehensive developer portal providing live container diagnostics, log tailing, container restart routines, and cluster resource quotas through a clean futuristic cyber HUD.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "Docker API", "Kubernetes", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/ash-x8/cloudops",
    liveUrl: "https://github.com/ash-x8/cloudops",
    featured: false,
    order: 6,
    architectureNotes: [
      "Polling fallback with SSE log tailing",
      "Direct container inspection & exec shell simulator",
      "Dynamic CPU and RAM thermal heatmaps"
    ]
  }
];
