# Ash Wickramasinghe - Ultra-Modern Portfolio

A next-generation personal portfolio showcasing full-stack development expertise, innovative projects, and professional excellence.

## 🎨 Features

- **Ultra-Sleek Design**: Modern all-rounder tech & developer aesthetic with dark-mode obsidian slate backgrounds and cyan/blue accent glows
- **Smooth Animations**: Framer Motion page transitions, micro-interactions, and glassmorphism effects
- **Dynamic Content**: Firebase-powered projects, CV, and profile management
- **Admin Dashboard**: Hidden `/admin` route for managing content without exposing on public UI
- **CV Viewer**: Secure, read-only PDF viewer with anti-download protections
- **Multi-Page Architecture**: Client-side routing with Home, About, Projects, CV, and Contact pages
- **Responsive Design**: Fully responsive with mobile-first approach
- **SEO Optimized**: Metadata, open graph, and structured data

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **PDF Viewer**: react-pdf with pdfjs-dist
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/ash-x8/Ash-Wickramasinghe.git
cd Ash-Wickramasinghe

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Firebase Setup

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable Authentication (Email/Password & Google)
- Create Firestore database
- Set up Cloud Storage

### 2. Configure Authentication

**Fix `auth/operation-not-allowed` Error:**

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Enable "Google" provider with OAuth credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `https://your-domain.com`
   - `https://your-project.firebaseapp.com/__/auth/handler`

### 3. Configure Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for projects
    match /projects/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid == 'admin_uid'; // Add your admin UID
    }
    
    // Contact messages - authenticated writes
    match /contact_messages/{document=**} {
      allow write: if true;
      allow read: if request.auth.uid == 'admin_uid';
    }
    
    // Profile data
    match /profile/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid == 'admin_uid';
    }
  }
}
```

### 4. Configure Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == 'admin_uid';
    }
  }
}
```

## 🔑 Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📄 Admin Dashboard

Access the hidden admin interface at `/admin` (requires Firebase authentication)

**Features:**
- ✅ Upload/update profile photo
- ✅ Replace CV PDF
- ✅ Manage projects (CRUD)
- ✅ View contact messages
- ✅ Manage skills and experience

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
npm start
```

## 📧 Contact

For inquiries, use the contact form or reach out via email.

## 📝 License

Private portfolio - All rights reserved.
