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
    const category = req.query.category as string || 'media';
    const targetDir = path.join(process.cwd(), 'public', 'uploads', category === 'cv' ? 'cv' : category === 'profile' ? 'profile' : 'media');
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
    fileSize: 30 * 1024 * 1024 // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDFs, Word Docs, and Images
    const mime = (file.mimetype || '').toLowerCase();
    const name = (file.originalname || '').toLowerCase();
    const isDoc = mime.includes('pdf') || mime.includes('word') || mime.includes('officedocument') || mime.includes('msword') || /\.(pdf|doc|docx)$/i.test(name);
    const isImg = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(name);
    if (isDoc || isImg) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF, DOC, DOCX document or image.'));
    }
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// File Upload Endpoint with real-time feedback
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const category = (req.query.category as string) || 'media';
  const subfolder = category === 'cv' ? 'cv' : category === 'profile' ? 'profile' : 'media';
  const relativeUrl = `/uploads/${subfolder}/${req.file.filename}`;

  return res.json({
    success: true,
    url: relativeUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
