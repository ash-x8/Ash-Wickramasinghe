import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure public upload directories exist
const uploadDirs = [
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(process.cwd(), 'public', 'uploads', 'cv'),
  path.join(process.cwd(), 'public', 'uploads', 'media'),
  path.join(process.cwd(), 'public', 'uploads', 'profile'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawCategory = typeof req.query.category === 'string' ? req.query.category.toLowerCase() : 'media';
    const subfolder = (rawCategory === 'cv' || rawCategory === 'document') 
      ? 'cv' 
      : rawCategory === 'profile' 
        ? 'profile' 
        : 'media';
    const targetDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${cleanName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const name = (file.originalname || '').toLowerCase();
    const isDoc = mime.includes('pdf') || mime.includes('word') || mime.includes('officedocument') || mime.includes('msword') || /\.(pdf|doc|docx)$/i.test(name);
    const isImg = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(name);
    if (isDoc || isImg) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF, DOC, DOCX document or an image (JPG, PNG, WebP).'));
    }
  }
});

// Global CORS and Preflight handler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploads statically from public/uploads
const publicUploads = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(publicUploads));

// Upload handler function supporting POST and PUT
const handleFileUpload = (req: express.Request, res: express.Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Server upload error:', err);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded. Please select a file.' });
    }

    const rawCategory = typeof req.query.category === 'string' 
      ? req.query.category.toLowerCase() 
      : (typeof req.query.folder === 'string' ? req.query.folder.toLowerCase() : 'media');
      
    const subfolder = (rawCategory === 'cv' || rawCategory === 'document') 
      ? 'cv' 
      : rawCategory === 'profile' 
        ? 'profile' 
        : 'media';
    const relativeUrl = `/uploads/${subfolder}/${req.file.filename}`;

    // Mirror file into dist/uploads if dist exists in production
    try {
      const distUploadDir = path.join(process.cwd(), 'dist', 'uploads', subfolder);
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        if (!fs.existsSync(distUploadDir)) {
          fs.mkdirSync(distUploadDir, { recursive: true });
        }
        const distTargetPath = path.join(distUploadDir, req.file.filename);
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.copyFileSync(req.file.path, distTargetPath);
        }
      }
    } catch (mirrorErr) {
      console.debug('Upload mirror note:', mirrorErr);
    }

    return res.json({
      success: true,
      url: relativeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  });
};

// File Upload Endpoints with safe multer error handling
app.post('/api/upload', handleFileUpload);
app.put('/api/upload', handleFileUpload);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function bootstrap() {
  const isDev = process.env.NODE_ENV === 'development';
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isDev && hasDist) {
    // Production mode: Serve pre-built SPA dist
    app.use(express.static(distPath));
    app.use((req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development fallback: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling for Cloud Run containers
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
