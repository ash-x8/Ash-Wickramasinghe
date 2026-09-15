STEP 01 — Project foundation
මුලින් AI එකට:
“Start with Phase 1 only. Create the complete React + TypeScript + Vite project architecture and design system. Do not move to Phase 2 until Phase 1 is working and builds successfully.”
කියන්න.
ඊට පස්සේ:
STEP 02 — Firebase
“Now implement Phase 2. Configure Firebase Authentication, Firestore, Storage, environment variables, service layer, security-rule files and indexes. Do not use fake credentials. Create .env.example and explain exactly what values I need to add.”
STEP 03 — Frontend
ඊළඟට:
“Implement Phase 3 completely. Build the public website shell, navigation, hero, homepage sections, footer, responsive layouts, theme system and animation system. All content that belongs in CMS must use the Firebase data layer rather than hard-coded production content.”
STEP 04 — Portfolio systems
“Implement Phase 4 completely: Projects, Photography, Writing, Services, Skills, Experience and Testimonials. Build reusable components, Firestore schemas, public pages and detail pages. Do not invent personal data.”
STEP 05 — Admin
“Implement Phase 5 completely. Build the protected Admin Dashboard with Firebase Authentication, role-based authorization, responsive admin navigation and all CMS management screens.”
STEP 06 — Real CRUD
“Implement Phase 6 completely. Connect every Admin CRUD form to Firestore and Storage. Add validation, duplicate, publish/unpublish, feature, visibility, reorder, delete confirmation, loading, success, error and empty states. No mock functionality.”
STEP 07 — REAL-TIME
මේක අනිවාර්යයෙන්ම දාන්න:
“Implement Phase 7. Use Firestore real-time listeners where appropriate so changes made in Admin Dashboard appear on the public website automatically without rebuilding or redeploying the application. Verify this behavior for hero, services, projects, photography, writing, navigation, theme, social links and homepage section visibility/order.”
STEP 08 — Security
“Implement Phase 8. Audit and deploy-ready Firestore Security Rules, Firebase Storage Rules, indexes and role-based access control. Verify that public users cannot access admin-only data and cannot elevate their own role.”
STEP 09 — Performance + SEO
“Implement Phase 9. Optimize image loading, code splitting, responsive images, caching, Core Web Vitals, accessibility, metadata, Open Graph, sitemap, robots and structured data. Do not sacrifice image quality unnecessarily.”
STEP 10 — Final QA
අන්තිමට මේක දාන්න:
“Perform Phase 10 as a complete production QA audit. Do not only report problems. Inspect the entire codebase, find bugs and incomplete functionality, then fix them. Verify npm run build, all routes, authentication, Firestore CRUD, Storage, security rules, real-time updates, responsive behavior, accessibility, SEO, loading/error/empty states and Admin/Public synchronization.”


You are an expert senior full-stack engineer, UI/UX designer, creative director, database architect, Firebase engineer, security engineer, SEO specialist, accessibility specialist, and performance engineer.

Build a complete, production-ready, premium personal creative portfolio website using React.js.

This is NOT a simple template, landing page, mockup, demo, static HTML page, or partially functional prototype.

The final result must be a complete working application with:

- Premium public website
- React.js frontend
- Real backend architecture
- Firebase integration
- Firestore database
- Firebase Storage
- Firebase Authentication
- Secure Admin Dashboard
- Full CMS
- Real-time content updates
- Media management
- Project management
- Photography galleries
- Writing/author management
- Services management
- Testimonials
- Skills
- Experience
- Navigation management
- Footer management
- SEO management
- Theme management
- Contact/message management
- Analytics-ready architecture
- Responsive design
- Accessibility
- Security
- Performance optimization
- Error handling
- Loading states
- Empty states
- Deployment-ready production architecture

Do NOT use fake functionality.

If something is represented as editable in the Admin Dashboard, it must actually be stored and retrieved from the database.

If content is changed in Admin Dashboard, the public website must update automatically without requiring a rebuild or manual code editing.

==================================================

1. CORE PRODUCT VISION
   ==================================================

Create a premium international-level creative portfolio platform inspired by the quality level of modern:

- creative agencies
- editorial magazines
- photography studios
- premium designer portfolios
- high-end developer portfolios
- digital studios

However:

DO NOT clone any existing website.

DO NOT copy another website's exact layout, branding, typography, animations, content, code, or visual identity.

Create an original visual system.

The website should communicate:

- creativity
- professionalism
- visual intelligence
- technical quality
- confidence
- editorial sophistication
- premium craftsmanship
- simplicity
- strong personal identity

Avoid generic AI-generated website aesthetics.

Avoid:

- excessive glassmorphism
- excessive gradients
- neon overload
- random colorful cards
- huge meaningless typography
- excessive rounded cards
- Bootstrap-looking layouts
- repetitive sections
- generic SaaS dashboards
- template-like designs
- unnecessary animations
- excessive shadows
- visual clutter

Use strong composition, whitespace, typography, photography, grids, contrast, hierarchy and subtle motion.

==================================================
2. TECHNOLOGY REQUIREMENTS

Frontend:

- React.js
- TypeScript
- Vite
- React Router
- Tailwind CSS or a clean custom CSS architecture
- Framer Motion for motion
- Lucide React or another lightweight icon system

Backend / Infrastructure:

- Firebase
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions where necessary
- Firebase App Check where appropriate

Optional supporting architecture:

- React Query / TanStack Query where useful
- Zod for validation
- React Hook Form for forms

Do not add unnecessary dependencies.

Keep the project maintainable.

Use strict TypeScript.

Avoid any unless absolutely necessary.

==================================================
3. APPLICATION ARCHITECTURE

Create a clean architecture similar to:

src/
components/
pages/
layouts/
sections/
hooks/
services/
lib/
firebase/
types/
utils/
data/
admin/
styles/
config/

Separate:

- UI
- business logic
- Firebase services
- database operations
- authentication
- validation
- types
- reusable components

Do not place all code in App.jsx/App.tsx.

Use reusable components.

Use feature-based organization where appropriate.

==================================================
4. PUBLIC WEBSITE ROUTES

Create:

/
/about
/services
/projects
/projects/:slug
/photography
/photography/:slug
/writing
/writing/:slug
/experience
/contact
/privacy
/404

Optional:

/search

The homepage should feel like a complete editorial portfolio rather than a collection of unrelated cards.

==================================================
5. HOMEPAGE STRUCTURE

Build the homepage using CMS-controlled sections.

Suggested order:

1. Announcement / availability bar
2. Premium navigation
3. Hero
4. Introduction
5. Selected Work
6. Services
7. Photography preview
8. Creative process
9. Featured case study
10. Skills / tools
11. Experience timeline
12. Writing / author preview
13. Testimonials
14. CTA
15. Contact
16. Footer

Every major section must support:

- enabled/disabled
- ordering
- CMS content
- visibility
- responsive behavior

==================================================
6. HERO SECTION

Create a cinematic editorial hero.

Support:

- profile/portrait image
- background image
- video background if configured
- title
- subtitle
- eyebrow text
- description
- primary CTA
- secondary CTA
- availability badge
- location text
- social links
- small technical/status metadata

The hero should have a strong visual hierarchy.

Add subtle technical/editorial details inspired by premium creative/developer portfolios, but do not turn the website into a fake terminal.

Animations:

- text reveal
- image reveal
- subtle parallax
- cursor/hover interaction where appropriate
- controlled entrance animation

Respect prefers-reduced-motion.

All hero text must be editable through Admin.

==================================================
7. PREMIUM NAVIGATION

Create a responsive navigation system.

Desktop:

- logo/wordmark
- navigation links
- active state
- CTA
- theme switcher

Mobile:

- hamburger menu
- full-screen or elegant mobile navigation
- smooth open/close animation

Admin must be able to:

- add nav items
- edit labels
- change URLs
- reorder
- hide/show
- choose internal/external links

==================================================
8. ABOUT SECTION

Create a strong editorial About experience.

Support:

- portrait
- biography
- short introduction
- professional identity
- personal statement
- skills summary
- statistics
- downloadable CV
- availability
- location
- experience summary

Do not invent qualifications, certifications, clients, awards, years of experience or achievements.

Everything must come from CMS data.

==================================================
9. SERVICES SYSTEM

Create a complete Services CMS.

Each service should support:

- title
- slug
- short description
- detailed description
- icon
- image
- category
- featured
- visibility
- order
- CTA
- tags

Admin functionality:

CREATE
READ
UPDATE
DELETE
DUPLICATE
PUBLISH
UNPUBLISH
FEATURE
HIDE
REORDER

Use real Firestore data.

==================================================
10. PROJECT MANAGEMENT SYSTEM

Create a powerful portfolio/project CMS.

Each project:

- title
- slug
- category
- short description
- full description
- cover image
- gallery
- client
- year
- role
- tools/software
- tags
- external URL
- featured
- published
- visibility
- order
- alt text
- SEO title
- SEO description
- OG image
- challenge
- solution
- result
- process
- credits

Categories:

- Photography
- Graphic Design
- Branding
- Social Media
- Posters
- Creative Projects
- Web Projects
- Writing
- Other

Project detail page must feel like a premium case study.

Do NOT simply display a card grid.

==================================================
11. PHOTOGRAPHY SYSTEM

Create a dedicated photography portfolio.

Features:

- categories
- albums
- galleries
- masonry/grid layouts
- fullscreen lightbox
- keyboard navigation
- next/previous
- zoom
- captions
- image metadata
- alt text
- lazy loading
- responsive images
- optimized loading
- featured photography
- album cover

Support high-quality images without destroying performance.

Use responsive image sizes.

Prefer WebP/AVIF where possible.

Do not load original full-resolution images when thumbnails are sufficient.

==================================================
12. WRITING / AUTHOR SYSTEM

Create a dedicated writing section.

Content types:

- Articles
- Stories
- Poems
- Essays
- Publications

Each post:

- title
- slug
- excerpt
- body
- cover image
- category
- tags
- author
- published date
- updated date
- featured
- status
- reading time
- SEO metadata
- social sharing image

Create:

/writing
/writing/:slug

The writing experience should feel editorial and readable.

==================================================
13. SKILLS / TOOLS

Create CMS-managed skills.

Each skill:

- name
- category
- proficiency if configured
- icon/logo
- description
- order
- visibility

Possible categories:

- Design
- Photography
- Video
- Writing
- Web
- Social Media
- Software

Do not invent proficiency levels.

==================================================
14. EXPERIENCE TIMELINE

Create a CMS-managed timeline.

Fields:

- title
- organization
- description
- start date
- end date
- current
- location
- category
- order
- visibility

Do not fabricate experience.

==================================================
15. TESTIMONIAL SYSTEM

Create testimonial CRUD.

Fields:

- name
- role
- organization
- message
- image
- rating
- featured
- published
- order

IMPORTANT:

Do not generate fake testimonials.

If no real testimonials exist, show an elegant empty state or hide the section.

==================================================
16. CONTACT SYSTEM

Create a professional contact system.

Fields:

- name
- email
- phone optional
- service
- budget optional
- message
- preferred contact method

Implement:

- validation
- loading state
- success state
- error state
- spam prevention
- rate limiting strategy
- sanitization

Store messages securely in Firestore.

Do not expose messages publicly.

Create Admin → Messages.

Admin should be able to:

- view
- mark read/unread
- archive
- delete
- search
- filter
- view details

==================================================
17. ADMIN DASHBOARD

Create a completely separate protected admin application.

Route:

/admin

Use Firebase Authentication.

Admin pages:

/admin
/admin/hero
/admin/about
/admin/services
/admin/projects
/admin/photography
/admin/writing
/admin/skills
/admin/experience
/admin/testimonials
/admin/media
/admin/navigation
/admin/social
/admin/contact
/admin/footer
/admin/seo
/admin/theme
/admin/settings
/admin/security
/admin/messages

Dashboard overview cards:

- Projects
- Services
- Photography
- Writing
- Testimonials
- Media
- Skills
- Experience
- Messages
- Published Content

Add recent activity.

Add quick actions.

==================================================
18. ADMIN AUTHENTICATION

Use Firebase Authentication.

Preferred:

Email/password authentication.

Never hard-code:

- admin email
- admin password
- API keys
- private secrets

Use environment variables.

Implement authorization.

A logged-in normal user must NOT automatically become an administrator.

Create an admin authorization system.

Recommended model:

users/{uid}

Fields:

uid
email
role
active
createdAt
updatedAt

Roles:

admin
editor
viewer

Public users must never access admin-only Firestore collections.

==================================================
19. FIRESTORE DATABASE DESIGN

Create collections:

settings
hero
about
services
projects
photographyAlbums
photographyImages
writing
skills
experience
testimonials
navigation
socialLinks
contactMessages
media
seo
activityLogs
users

Use timestamps:

createdAt
updatedAt

Use stable document IDs.

Use slugs for public routes.

Avoid duplicated data where possible.

Create appropriate indexes.

==================================================
20. FIREBASE STORAGE

Create storage architecture such as:

/media/
/projects/
/photography/
/writing/
/profile/
/testimonials/
/documents/
/site/

Store metadata in Firestore.

Support:

- upload
- replace
- delete
- search
- filter
- preview
- copy URL
- alt text
- title
- file type
- file size
- upload date

Validate:

- MIME type
- file size
- filename
- authorization

Do not allow anonymous uploads.

==================================================
21. MEDIA LIBRARY

Create a professional media library.

Features:

- grid/list view
- search
- filters
- upload
- replace
- delete
- preview
- metadata
- usage/reference information
- copy media URL
- alt text
- folders/categories

Prevent accidental deletion when media is currently referenced.

Show confirmation dialogs.

==================================================
22. REAL-TIME UPDATES

This is mandatory.

When Admin changes:

- hero text
- project
- service
- image
- navigation
- theme
- social link
- testimonial
- writing article
- homepage section

the public website should receive the updated data without requiring a rebuild.

Use Firestore real-time listeners where appropriate.

Avoid unnecessary listeners.

Use caching intelligently.

==================================================
23. THEME SYSTEM

Create:

Dark mode
Light mode
System mode

Theme CMS:

- accent color
- background colors
- foreground colors
- border colors
- typography choices
- button style
- radius scale
- animation intensity

Default visual direction:

dark-first
black/charcoal
off-white
neutral gray
one controlled accent color

Do not allow CMS settings to destroy accessibility or contrast.

==================================================
24. TYPOGRAPHY

Use a sophisticated font system.

Typography should have:

- display font
- body font
- metadata font

Avoid too many fonts.

Use fluid typography with clamp().

Create a clear type scale.

Typography should remain readable from approximately 360px mobile screens to large desktop screens.

==================================================
25. MOTION DESIGN

Use Framer Motion carefully.

Implement:

- page transitions
- section reveals
- image reveals
- hover interactions
- menu transitions
- lightbox transitions
- project transitions

Avoid:

- constant movement
- excessive bouncing
- distracting animations
- animation on every element

Implement reduced-motion support.

==================================================
26. PERFORMANCE

Optimize aggressively.

Implement:

- code splitting
- lazy-loaded routes
- lazy-loaded images
- responsive image sizing
- WebP/AVIF where possible
- preload only critical assets
- minimize JavaScript
- avoid unnecessary re-renders
- memoize where useful
- pagination for large collections
- Firestore query limits
- caching
- optimized fonts

Target excellent Core Web Vitals.

Avoid loading the entire media library on initial page load.

==================================================
27. SEO

Implement dynamic SEO.

Each project/writing page must have:

- title
- description
- canonical URL
- Open Graph
- Twitter/X metadata
- OG image

Generate:

sitemap.xml
robots.txt

Implement structured data where appropriate:

Person
CreativeWork
WebSite
Article
ImageObject
BreadcrumbList

Do not create fake structured data.

Use only CMS information.

==================================================
28. ACCESSIBILITY

Target WCAG 2.2 AA where practical.

Implement:

- semantic HTML
- keyboard navigation
- focus states
- accessible dialogs
- accessible navigation
- alt text
- sufficient color contrast
- ARIA only where needed
- reduced motion
- form labels
- error announcements
- screen-reader-friendly controls

The lightbox must be keyboard accessible.

==================================================
29. SECURITY

Implement production-grade security practices.

Never expose private credentials.

Use:

- Firebase Authentication
- Firestore Security Rules
- Storage Security Rules
- input validation
- output sanitization
- authorization checks
- rate limiting strategy
- Firebase App Check where appropriate
- secure headers where deployment permits
- protected admin routes

IMPORTANT:

Do not rely only on hiding the Admin Dashboard UI.

Security must be enforced server-side through Firebase rules/backend authorization.

==================================================
30. FIRESTORE SECURITY RULES

Create real Firestore Security Rules.

Public read:

Only published public content should be readable.

Admin/editor:

Only authorized roles may create/update/delete CMS content.

Contact messages:

Only authorized admin/editor roles can read.

Users:

Users must not read arbitrary users.

Activity logs:

Only authorized administrators.

Prevent clients from assigning themselves:

admin
editor

or changing their own role.

==================================================
31. STORAGE SECURITY RULES

Public:

Only intended public media can be read.

Uploads:

Only authorized admin/editor users.

Deletion:

Only authorized users.

Validate file size/type where possible.

Prevent unauthorized access to private documents.

==================================================
32. ADMIN UX

Admin dashboard must feel like a professional CMS.

Use:

- sidebar
- top bar
- breadcrumbs
- search
- filters
- tables
- cards
- forms
- tabs
- drawers
- modal dialogs
- toast notifications
- confirmations

Include:

loading states
empty states
error states
success states

Do not use browser alert() for normal UX.

==================================================
33. CRUD EXPERIENCE

Every CMS module should support appropriate:

Create
Edit
Duplicate
Delete
Publish
Unpublish
Feature
Hide
Reorder

Use reusable form components.

Validate forms before submission.

Show meaningful errors.

Prevent accidental deletion.

==================================================
34. DRAG & DROP REORDERING

Implement drag-and-drop reordering for:

- homepage sections
- navigation
- services
- projects
- photography albums
- skills
- experience
- testimonials

Persist order in Firestore.

==================================================
35. SEARCH & FILTERING

Admin global search:

Search:

- projects
- services
- writing
- photography
- messages
- media

Add filters:

category
status
featured
published
date

Use efficient Firestore queries.

Do not download the entire database just to perform client-side filtering.

==================================================
36. ACTIVITY LOG

Create:

activityLogs

Track important admin actions:

- login
- create
- update
- delete
- publish
- unpublish
- media upload
- settings update

Store:

userId
action
resource
resourceId
timestamp

Do not store sensitive credentials.

==================================================
37. ERROR HANDLING

Create robust handling for:

- Firebase unavailable
- network failure
- missing document
- permission denied
- invalid data
- upload failure
- image failure
- form failure

Create:

404 page
500/error boundary
offline-friendly states

Do not leave blank white screens.

==================================================
38. IMAGE HANDLING

Create reusable Image component.

Support:

- loading placeholder
- blur placeholder if possible
- responsive sizes
- lazy loading
- object positioning
- fallback image
- alt text

Do not stretch images incorrectly.

Photography must remain visually dominant.

==================================================
39. PROJECT CASE STUDY DESIGN

Project detail pages should have a premium editorial layout.

Structure:

Project number
Project title
Category
Year
Role
Tools
Hero image

Then:

Overview
Challenge
Approach
Solution
Process
Gallery
Results
Credits
Related work
CTA

Not every field has to be visible if empty.

Never display empty labels.

==================================================
40. WRITING EXPERIENCE

Create an elegant reading layout.

Include:

- reading progress
- estimated reading time
- typography optimized for long-form reading
- table of contents where useful
- share controls
- related articles
- previous/next article

Do not overload articles with UI.

==================================================
41. FOOTER

Footer CMS:

- logo/name
- short description
- navigation
- social links
- contact information
- copyright
- privacy link
- availability
- custom CTA

Everything editable.

==================================================
42. SOCIAL MEDIA CMS

Create Social Links manager.

Fields:

- platform
- label
- URL
- icon
- visibility
- order

Support arbitrary future platforms.

Do not hard-code social URLs into components.

==================================================
43. GLOBAL CMS SETTINGS

Create a Settings area for:

- site name
- site URL
- logo
- favicon
- default SEO
- default OG image
- email/contact settings
- analytics IDs
- social links
- theme
- maintenance mode
- copyright

==================================================
44. SEO CMS

Admin can edit:

- homepage title
- meta description
- keywords
- canonical URL
- OG image
- social title
- social description
- robots settings

Provide sensible defaults.

Prevent invalid metadata.

==================================================
45. ANALYTICS READY

Create an analytics integration architecture.

Do not hard-code third-party IDs.

Allow configuration through environment variables or Admin Settings where safe.

Possible:

Google Analytics
Google Search Console verification
Plausible
Vercel Analytics

Do not expose private secrets.

==================================================
46. CONTACT EMAIL ARCHITECTURE

Do not put private email credentials in React frontend code.

If email notifications are required, use a secure backend/cloud function architecture.

Contact submission flow:

Frontend
→ validation
→ secure backend/Firebase
→ Firestore
→ optional email notification

Never:

Frontend
→ private SMTP password

==================================================
47. ADMIN DASHBOARD MOBILE

Admin must work on:

360px
390px
414px
768px
1024px
1440px
1920px

On mobile:

- collapsible sidebar
- touch-friendly controls
- responsive tables
- responsive forms
- bottom navigation if useful

Do not create a desktop-only admin dashboard.

==================================================
48. PUBLIC WEBSITE RESPONSIVENESS

Test design logic for:

360px
375px
390px
414px
768px
1024px
1280px
1440px
1920px

Avoid:

horizontal overflow
broken grids
oversized text
tiny buttons
cropped navigation
layout shifts

==================================================
49. DESIGN SYSTEM

Create design tokens for:

colors
spacing
typography
radius
shadows
transitions
z-index
container widths

Create reusable:

Button
Input
Textarea
Select
Modal
Drawer
Toast
Badge
Card
Image
SectionHeading
Container
Breadcrumbs
Pagination
Skeleton
EmptyState
ErrorState
ConfirmDialog

==================================================
50. DATA VALIDATION

Use schema validation.

Validate:

- emails
- URLs
- slugs
- text lengths
- required fields
- upload types
- upload sizes

Do not trust client input.

==================================================
51. SEED / INITIAL CONTENT

Do NOT invent personal information.

Create a safe seed structure with placeholder/example values clearly marked:

[ADD YOUR NAME]
[ADD YOUR BIO]
[ADD YOUR PHOTO]
[ADD YOUR SERVICES]
[ADD YOUR PROJECTS]
[ADD YOUR SOCIAL LINKS]

The application must function even before personal information is added.

Do not present placeholders as real achievements.

==================================================
52. FIREBASE SETUP AUTOMATION

Prepare the project so Firebase setup is straightforward.

Create:

firebase configuration module
Firestore service layer
Storage service layer
Authentication service
Security rules
Firestore indexes configuration
Cloud Functions structure if required

Use environment variables such as:

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

Do not invent production credentials.

Create:

.env.example

with placeholders.

If Firebase configuration is not available yet:

- keep the app buildable
- show clear setup instructions
- provide a controlled development fallback only if necessary
- do NOT silently use fake Firebase credentials

==================================================
53. FIREBASE INITIALIZATION GUIDE

Generate a clear implementation guide inside the project:

1. Create Firebase project
2. Register web application
3. Enable Authentication
4. Enable Email/Password
5. Create Firestore
6. Create Storage
7. Add Firebase configuration
8. Configure environment variables
9. Deploy Firestore rules
10. Deploy Storage rules
11. Deploy indexes
12. Create first admin user
13. Assign admin role securely
14. Test admin login
15. Test CRUD
16. Test real-time updates
17. Test production deployment

==================================================
54. FIRST ADMIN CREATION

Never create a hard-coded admin password.

Provide a secure bootstrap mechanism.

Possible implementation:

Create first user through Firebase Authentication, then securely assign role through:

- Firebase Admin SDK / Cloud Function
  OR
- a controlled server-side bootstrap script

Never allow frontend users to modify their own role.

==================================================
55. REAL-TIME CMS MODEL

Public site data should come from Firebase.

Example:

Firestore:

settings/site
settings/theme
hero/main
about/main
seo/global

services/{serviceId}
projects/{projectId}
photographyAlbums/{albumId}
writing/{postId}

Public React app:

Firebase listener
→ state/cache
→ UI

Admin:

Form
→ validation
→ Firestore write
→ real-time listener
→ public UI updates

==================================================
56. EMPTY STATES

If no:

projects
services
testimonials
writing
photography

exist, do not show broken sections.

Use elegant CMS-aware empty states.

Admin should show:

"No projects yet — Create your first project."

Public site should either hide the section or show a carefully designed minimal state depending on the configuration.

==================================================
57. ACCESSIBILITY OF ADMIN

Admin controls must have:

- labels
- keyboard access
- focus state
- accessible dialogs
- confirmation messages
- proper button semantics

Do not make icon-only controls without accessible labels.

==================================================
58. QUALITY CONTROL

Before considering the project complete, audit:

Frontend
Backend
Firebase
Firestore
Storage
Authentication
Security Rules
Admin
CRUD
Real-time updates
Forms
Images
Responsive layouts
Accessibility
SEO
Performance
Error handling
Loading states
Empty states
Navigation
404
Deployment

Fix all discovered issues.

==================================================
59. BUILD / DEPLOYMENT

Make the application deployment-ready for Vercel.

Include:

- production build configuration
- environment variable documentation
- Firebase deployment instructions
- SPA routing configuration if required
- security headers where appropriate
- sitemap generation strategy
- robots configuration

Ensure:

npm install
npm run dev

works.

Ensure:

npm run build

works without TypeScript/build errors.

Do not leave broken imports.

Do not leave unused critical code.

==================================================
60. CODE QUALITY

Rules:

- TypeScript strict mode
- reusable components
- no duplicated logic
- no hard-coded CMS content
- no hard-coded credentials
- no fake APIs
- no fake backend
- no dead buttons
- no non-functional CRUD
- no console errors
- meaningful naming
- comments only where useful
- clean imports
- modular services

==================================================
61. FINAL AUDIT MODE

After implementing everything, behave like a senior QA engineer.

Inspect the entire project.

Find and fix:

- broken routes
- broken imports
- TypeScript errors
- Firebase configuration errors
- Firestore permission errors
- Storage permission errors
- authentication problems
- mobile layout issues
- desktop layout issues
- accessibility problems
- SEO issues
- performance issues
- race conditions
- loading problems
- empty states
- missing error states
- duplicate code
- dead UI controls
- fake functionality
- hard-coded content that should be CMS-controlled

Do not simply report issues.

Fix them.

==================================================
62. IMPORTANT IMPLEMENTATION RULE

DO NOT generate everything as one enormous file.

Build the project as a real maintainable application.

Use modular architecture.

If a feature is too large, split it into:

components
hooks
services
types
pages
utilities

==================================================
63. DELIVERY FORMAT

When generating the project:

First create the architecture.

Then implement:

PHASE 1
Project setup
React
TypeScript
Vite
Tailwind
routing
design tokens

PHASE 2
Firebase
Auth
Firestore
Storage
environment configuration

PHASE 3
Public layout
navigation
hero
sections
footer

PHASE 4
Projects
Photography
Writing
Services
Skills
Experience
Testimonials

PHASE 5
Admin authentication
Admin dashboard
CMS

PHASE 6
CRUD
Media Library
Messages
Navigation
SEO
Theme

PHASE 7
Real-time synchronization

PHASE 8
Security Rules
Storage Rules
Indexes

PHASE 9
Performance
SEO
Accessibility
Responsive optimization

PHASE 10
Testing
QA
production build
deployment documentation

==================================================
64. DO NOT STOP AT UI

This instruction is extremely important.

Do NOT stop after creating the frontend.

Do NOT create a beautiful UI with fake buttons.

Every important admin control must connect to real data.

Every CMS record must be persisted.

Every public page must consume the appropriate data.

Every protected operation must be authorized.

==================================================
65. DO NOT INVENT PERSONAL DATA

I will provide personal information separately.

Do NOT create or assume:

- real name
- address
- phone number
- email
- social media URLs
- clients
- awards
- qualifications
- certifications
- employment history
- testimonials
- project results

Use placeholders or empty CMS states.

==================================================
66. FINAL DESIGN DIRECTION

The visual result should feel like:

Premium Creative Portfolio
+
Editorial Magazine
+
Photography Studio
+
Modern Digital Agency
+
High-End Personal Brand

Design characteristics:

- dark-first
- sophisticated
- cinematic
- minimal
- editorial
- asymmetric layouts where appropriate
- strong typography
- high-quality imagery
- precise spacing
- subtle motion
- intelligent micro-interactions
- strong grid systems
- premium hover states
- restrained color palette

Do not make it look like:

- generic AI website
- Bootstrap template
- SaaS dashboard
- gaming website
- crypto website
- excessive cyberpunk UI
- neon landing page

==================================================
67. FINAL SUCCESS CRITERIA

The project is considered successful only when:

1. React application runs.
2. Production build succeeds.
3. Firebase integration works.
4. Admin authentication works.
5. Firestore CRUD works.
6. Storage uploads work.
7. Public content is database-driven.
8. Admin changes update public content.
9. Admin permissions are enforced.
10. Security rules are implemented.
11. Photography galleries work.
12. Project case studies work.
13. Writing system works.
14. Contact system works.
15. Media library works.
16. SEO is dynamic.
17. Theme system works.
18. Mobile works.
19. Desktop works.
20. Accessibility is considered.
21. Performance is optimized.
22. No fake credentials exist.
23. No fake testimonials/data are presented.
24. No important UI button is non-functional.
25. The final result looks like a premium professional creative portfolio.

Build this as a real production application, not a visual demonstration.

// This is firebase details
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCE77gqSboOqivCz-U0MPgPBbXi3P1VLs8",
  authDomain: "ash-wickramasinghe.firebaseapp.com",
  projectId: "ash-wickramasinghe",
  storageBucket: "ash-wickramasinghe.firebasestorage.app",
  messagingSenderId: "1055246300348",
  appId: "1:1055246300348:web:54f7742299cc4291490cb9",
  measurementId: "G-RXR7GWYCZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//"My personal details"//

PERSONAL PROFILE & PORTFOLIO IDENTITY

Use the following information as the verified personal and professional profile of the portfolio owner. Do not invent, exaggerate, or add qualifications, certifications, awards, employment history, or experience that are not explicitly provided here.

━━━━━━━━━━━━━━━━━━
PERSONAL IDENTITY
━━━━━━━━━━━━━━━━━━

Full Name:
Kushan A Wickramasinghe

Preferred Professional Name:
Kushan A Wickramasinghe

Professional / Creative Name:
Ash Wickramasinghe

Primary Professional Roles:
Graphic Designer
Social Media Manager
Author
Creative Writer
Content Editor
Digital Content Creator

Author / Writing Identities:
Writer Ash
Writer Tizzy
Tizzy

Location:
Sri Lanka

Work Availability:
Remote / Available for selected creative projects and collaborations

━━━━━━━━━━━━━━━━━━
PROFESSIONAL PROFILE
━━━━━━━━━━━━━━━━━━

Kushan A Wickramasinghe is a multidisciplinary creative professional working across graphic design, social media management, digital content, creative writing, and visual communication.

His work focuses on creating clean, purposeful, modern and engaging visual content for individuals, schools, organizations, brands, social media platforms and creative projects.

His creative areas include graphic design, social media content creation and management, branding, poster and promotional design, digital content, photo editing, content writing, creative writing and web-related creative projects.

The professional identity should be presented in a realistic and authentic way. Avoid exaggerated claims such as “world's best designer”, “award-winning” or “internationally recognized” unless such claims are specifically verified and provided.

━━━━━━━━━━━━━━━━━━
CORE PROFESSIONAL SKILLS
━━━━━━━━━━━━━━━━━━

Graphic Design
Social Media Management
Social Media Content Creation
Social Media Post Design
Content Editing
Content Writing
Creative Writing
Digital Content Creation
Branding
Visual Communication
Poster Design
Certificate Design
Invitation Design
Tute Design
CV Design
Logo Design
Photo Editing
Image Retouching
Colour Correction
Creative Direction
Web Design
Web Management
Basic Digital / Web Creative Work

━━━━━━━━━━━━━━━━━━
DESIGN SERVICES
━━━━━━━━━━━━━━━━━━

Graphic Design
Social Media Post Design
Certificate Design
Invitation Design
Poster Design
Tute Design
CV Design
Logo Design
Branding and Visual Identity
Digital Promotional Materials
Social Media Graphics
Marketing Creatives

━━━━━━━━━━━━━━━━━━
SOCIAL MEDIA MANAGEMENT
━━━━━━━━━━━━━━━━━━

Social Media Management is an important part of the professional profile.

Services may include:

- Social media page management
- Content planning
- Social media post creation
- Caption and content editing
- Visual content creation
- Campaign content
- Platform-specific creative content
- Short-form social media content
- Facebook content
- Instagram content
- TikTok content
- YouTube content and thumbnails
- Content scheduling and organization
- Brand-consistent social media communication

Do not claim specific client results, follower growth, engagement percentages or campaign success unless actual verified data is provided.

━━━━━━━━━━━━━━━━━━
WRITING & AUTHOR IDENTITY
━━━━━━━━━━━━━━━━━━

Kushan A Wickramasinghe also works in creative writing and authoring.

Writing areas may include:

- Creative writing
- Articles
- Stories
- Poetry
- Personal reflections
- Literary content
- Digital publications
- Content writing

Author identities:
Writer Ash
Writer Tizzy
Tizzy

The writing/author section should feel personal, literary and authentic rather than corporate.

━━━━━━━━━━━━━━━━━━
DIGITAL & CREATIVE PROJECTS
━━━━━━━━━━━━━━━━━━

Relevant projects associated with the portfolio include:

1. Personal Portfolio Website
   A personal professional portfolio showcasing graphic design, social media work, creative projects, writing and digital work.

2. Personal Diary / Journal Web Project
   A personal digital diary and reflective writing platform designed around private journaling, writing and personal reflection.

3. CINEXUS
   A creative digital/web project that can be presented as a portfolio case study.

4. Web and Digital Creative Projects
   Various website, digital content, interface and creative technology projects associated with the portfolio.

Project information must be presented accurately. Do not invent clients, project dates, results, awards or commercial achievements.

━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━

Primary Phone:
+94 75 226 9410

Secondary Phone:
+94 74 085 8041

WhatsApp:
https://wa.me/94752269410

Primary Email:
Kushanashvika216@gmail.com

Creative / Business Email:
ashx8designs@gmail.com

━━━━━━━━━━━━━━━━━━
SOCIAL MEDIA
━━━━━━━━━━━━━━━━━━

YouTube:
https://www.youtube.com/@Ash-x8

Facebook:
https://www.facebook.com/share/1UeTQSvLik/

LinkedIn:
https://www.linkedin.com/in/kushan-a-wickramasinghe-28b1aa2a0

Telegram:
https://t.me/kawickramasinghe

TikTok:
https://vm.tiktok.com/ZS9Ypfen3rcYL-KiVCP/

WhatsApp:
https://wa.me/94752269410

Important:
All social media links should remain editable through the portfolio Admin Dashboard / CMS.

━━━━━━━━━━━━━━━━━━
PORTFOLIO CONTENT CATEGORIES
━━━━━━━━━━━━━━━━━━

Primary categories:

- Graphic Design
- Social Media
- Social Media Management
- Branding
- Digital Content
- Content Writing
- Creative Writing
- Web Projects
- Creative Projects
- Photo Editing
- Other Design Work

Do NOT use “Photography” or “Photographer” as a primary professional identity or role.

━━━━━━━━━━━━━━━━━━
PERSONAL BRAND DIRECTION
━━━━━━━━━━━━━━━━━━

The personal brand name must be:

ASH WICKRAMASINGHE

The old brand name “Ash X8”, “ASH-X8”, “Ash_x8” and similar variations must NOT be displayed anywhere as the person's current brand identity.

Use:
“Ash Wickramasinghe”

instead of:
“Ash X8”
“ASH-X8”
“Ash_x8”

The website should feel like a personal professional portfolio rather than a generic agency website.

Visual direction:

- Premium
- Modern
- Minimal
- Editorial
- Clean
- Professional
- Creative
- Sophisticated
- Strong typography
- Strong visual hierarchy
- Generous whitespace
- Dark-first with optional light mode
- Neutral colour palette with a controlled accent colour
- Subtle animations
- High-quality visual presentation

Avoid:

- Generic templates
- Excessive gradients
- Excessive neon colours
- Excessive glassmorphism
- Overly rounded UI elements
- Cluttered layouts
- Fake statistics
- Fake testimonials
- Fake certifications
- Fake client names
- Fake awards
- Exaggerated professional claims
- AI-looking generic copy

━━━━━━━━━━━━━━━━━━
PREFERRED PROFESSIONAL TITLE
━━━━━━━━━━━━━━━━━━

Primary:
Graphic Designer • Social Media Manager • Author

Alternative:
Graphic Designer | Social Media Manager | Creative Writer

Alternative short version:
Graphic Designer • Social Media • Author

━━━━━━━━━━━━━━━━━━
SHORT BIO
━━━━━━━━━━━━━━━━━━

Kushan A Wickramasinghe is a creative professional specializing in graphic design, social media management, digital content and creative writing. His work combines visual design, purposeful communication and creative storytelling to produce engaging content for personal, educational, organizational and digital projects.

━━━━━━━━━━━━━━━━━━
PERSONAL STATEMENT
━━━━━━━━━━━━━━━━━━

Design with purpose.
Create with intention.
Write with meaning.

━━━━━━━━━━━━━━━━━━
IMPORTANT DATA RULES
━━━━━━━━━━━━━━━━━━

1. Always use “Ash Wickramasinghe” as the current creative/professional brand name.

2. Completely remove the old “Ash X8 / ASH-X8 / Ash_x8” branding from visible website content, headings, metadata, buttons, descriptions, footer, navigation, SEO text and portfolio copy.

3. Never describe Kushan A Wickramasinghe as a “Photographer” or use “Photographer” as a professional title.

4. Social Media Management must be included as a major professional service and skill.

5. Graphic Design must remain one of the primary professional areas.

6. Author / Creative Writer must remain part of the professional identity.

7. Writer Ash and Writer Tizzy may be used specifically for the writing/author section.

8. Never invent personal information.

9. Never invent education, qualifications, certifications, employment history, clients, awards or professional achievements.

10. Any uncertain information should be left editable through the Admin Dashboard rather than being fabricated.

11. All personal profile information, professional titles, biography, contact details, social links, services and SEO information should be editable through the CMS/Admin Dashboard.

12. The final portfolio should present Kushan A Wickramasinghe as a genuine multidisciplinary creative professional specializing primarily in Graphic Design, Social Media Management, Digital Content and Writing.
