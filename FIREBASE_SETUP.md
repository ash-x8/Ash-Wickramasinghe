# Firebase Complete Setup Guide

## Step 1: Authentication Configuration

### Enable Email/Password Authentication

```bash
# Firebase Console → Authentication → Sign-in method
# 1. Click "Email/Password"
# 2. Toggle "Enable"
# 3. Click "Save"
```

### Enable Google Authentication

```bash
# Firebase Console → Authentication → Sign-in method
# 1. Click "Google"
# 2. Toggle "Enable"
# 3. Add support email
# 4. Click "Save"
```

### Configure OAuth Redirect URIs

```bash
# Firebase Console → Settings → Authorized domains
# Add:
# - localhost:3000
# - your-domain.com
# - your-project.firebaseapp.com
```

## Step 2: Firestore Setup

### Create Collections

```javascript
// Collection: projects
{
  id: string,
  title: string,
  description: string,
  longDescription: string,
  image: string (URL),
  technologies: array,
  liveUrl: string,
  githubUrl: string,
  featured: boolean,
  category: string (web|mobile|fullstack|other),
  createdAt: timestamp
}

// Collection: profile
{
  bio: string,
  image: string (URL),
  headline: string,
  email: string,
  location: string
}

// Collection: contact_messages
{
  name: string,
  email: string,
  subject: string,
  message: string,
  createdAt: timestamp,
  read: boolean
}

// Collection: cv
{
  url: string (storage path),
  updatedAt: timestamp,
  version: number
}
```

## Step 3: Storage Setup

### Create Folders

```
gsutil mkdir gs://your-bucket/profile/
gsutil mkdir gs://your-bucket/cv/
gsutil mkdir gs://your-bucket/projects/
```

### Upload Initial Files

```bash
# Upload profile photo
gsutil cp profile-photo.jpg gs://your-bucket/profile/photo.jpg

# Upload CV PDF
gsutil cp cv.pdf gs://your-bucket/cv/resume.pdf
```

## Step 4: Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Auth helper
    function isAdmin() {
      return request.auth.uid == 'YOUR_ADMIN_UID';
    }

    // Public read - Projects
    match /projects/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Public read - Profile
    match /profile/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Write only - Contact messages
    match /contact_messages/{document=**} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Admin only - CV
    match /cv/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth.uid == 'YOUR_ADMIN_UID';
    }

    // Public read, admin write
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## Step 5: Get Your Admin UID

```javascript
// Firebase Console → Authentication → Users
// Copy your UID and add to Security Rules above

// Alternatively, in code:
import { auth } from '@/config/firebase';

auth.currentUser?.uid  // Your Admin UID
```

## Step 6: Initialize Sample Data

```typescript
// scripts/init-firebase.ts
import { db, storage } from '@/config/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

async function initializeData() {
  // Sample Project
  await addDoc(collection(db, 'projects'), {
    title: 'Personal Portfolio',
    description: 'Ultra-modern portfolio with Next.js and Firebase',
    longDescription: '...',
    image: 'https://firebasestorage.googleapis.com/...',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind'],
    liveUrl: 'https://ash-wickramasinghe.site',
    githubUrl: 'https://github.com/ash-x8/Ash-Wickramasinghe',
    featured: true,
    category: 'fullstack',
    createdAt: new Date(),
  });

  // Profile
  await setDoc(doc(db, 'profile', 'main'), {
    bio: 'Full-Stack Developer specializing in modern web technologies',
    headline: 'Full-Stack Software Engineer',
    email: 'contact@example.com',
    location: 'Your Location',
  });
}
```

## Troubleshooting

### `auth/operation-not-allowed` Error

**Cause**: Email/Password provider not enabled in Firebase Console

**Solution**:
1. Go to Firebase Console
2. Navigate to Authentication → Sign-in method
3. Enable "Email/Password"
4. Refresh your app

### Storage Download Errors

**Cause**: Storage rules too restrictive

**Solution**: Ensure rules allow read access:
```javascript
allow read: if true;
```

### CORS Issues with PDF Viewer

**Solution**: Add CORS headers to Firebase Storage:
```bash
gsutil cors set cors.json gs://your-bucket
```

`cors.json`:
```json
[{
  "origin": ["*"],
  "method": ["GET", "HEAD"],
  "responseHeader": ["Content-Type"],
  "maxAgeSeconds": 3600
}]
```

## Useful Firebase CLI Commands

```bash
# Login
firebase login

# Initialize project
firebase init

# Deploy functions
firebase deploy --only functions

# Deploy rules
firebase deploy --only firestore:rules,storage

# View logs
firebase functions:log

# Emulator suite
firebase emulators:start
```
