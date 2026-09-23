/**
 * Client-Side Image Optimizer & Processor
 * Optimizes high-resolution image uploads in browser memory before transferring to Firebase Storage.
 * Generates an optimized WebP public asset and a lightweight gallery thumbnail.
 */

export interface OptimizationResult {
  file: File;
  originalName: string;
  optimizedBlob: Blob;
  thumbnailBlob: Blob;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  thumbnailSize: number;
  format: 'webp' | 'jpeg' | 'png';
  mimeType: string;
  sizeFormatted: string;
  savingsPercentage: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType: 'image' | 'document' | 'other';
}

/**
 * Validates file size, extension, and MIME type before processing.
 */
export function validateMediaFile(file: File, maxSizeBytes: number = 30 * 1024 * 1024): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected', fileType: 'other' };
  }

  // Check file size (e.g. 30 MB max)
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum allowed size is ${formatBytes(maxSizeBytes)}.`,
      fileType: 'other'
    };
  }

  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(name);
  const isDocument = mime.includes('pdf') || /\.(pdf|doc|docx)$/i.test(name);

  if (!isImage && !isDocument) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload images (PNG, JPG, WebP, SVG) or documents (PDF).`,
      fileType: 'other'
    };
  }

  return {
    valid: true,
    fileType: isImage ? 'image' : 'document'
  };
}

/**
 * Formats raw byte count into human-readable string.
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Optimizes an image file by resizing, compressing to WebP, and producing a thumbnail.
 * If the file is an SVG or PDF, optimization is skipped and original file is returned safely.
 */
export async function optimizeImageFile(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    thumbSize?: number;
    thumbQuality?: number;
  } = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 0.85,
    thumbSize = 380,
    thumbQuality = 0.80
  } = options;

  const originalSize = file.size;
  const originalName = file.name;
  const isSvg = file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg');
  const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');

  // SVG and PDF documents are preserved as-is
  if (isSvg || isPdf) {
    return {
      file,
      originalName,
      optimizedBlob: file,
      thumbnailBlob: file,
      width: 0,
      height: 0,
      originalSize,
      optimizedSize: originalSize,
      thumbnailSize: originalSize,
      format: isSvg ? 'png' : 'jpeg',
      mimeType: file.type || (isSvg ? 'image/svg+xml' : 'application/pdf'),
      sizeFormatted: formatBytes(originalSize),
      savingsPercentage: 0
    };
  }

  // Load image into HTMLImageElement
  const img = await loadImageElement(file);
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // 1. Calculate target dimensions for optimized public image (never upscale)
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // 2. Render optimized image onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context for image optimization.');
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 3. Compress to WebP (fallback to JPEG if webp produces 0 size or unsupported)
  let optimizedBlob = await canvasToBlob(canvas, 'image/webp', quality);
  let format: 'webp' | 'jpeg' = 'webp';
  let mimeType = 'image/webp';

  if (!optimizedBlob || optimizedBlob.size === 0) {
    optimizedBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
    format = 'jpeg';
    mimeType = 'image/jpeg';
  }

  // If the optimized blob ended up larger than the original (e.g. tiny already-compressed PNG),
  // prefer original file to never penalize small images
  if (optimizedBlob.size >= originalSize && originalSize < 400 * 1024) {
    optimizedBlob = file;
    mimeType = file.type || 'image/jpeg';
  }

  // 4. Generate gallery thumbnail (max 380px)
  let thumbW = origWidth;
  let thumbH = origHeight;
  const thumbRatio = Math.min(thumbSize / thumbW, thumbSize / thumbH, 1);
  thumbW = Math.max(1, Math.round(thumbW * thumbRatio));
  thumbH = Math.max(1, Math.round(thumbH * thumbRatio));

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const thumbCtx = thumbCanvas.getContext('2d');
  if (thumbCtx) {
    thumbCtx.imageSmoothingEnabled = true;
    thumbCtx.imageSmoothingQuality = 'medium';
    thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
  }

  let thumbnailBlob = await canvasToBlob(thumbCanvas, 'image/webp', thumbQuality);
  if (!thumbnailBlob) {
    thumbnailBlob = optimizedBlob;
  }

  const optimizedSize = optimizedBlob.size;
  const thumbnailSize = thumbnailBlob.size;
  const savings = originalSize > 0 
    ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
    : 0;

  return {
    file,
    originalName,
    optimizedBlob,
    thumbnailBlob,
    width: targetWidth,
    height: targetHeight,
    originalSize,
    optimizedSize,
    thumbnailSize,
    format,
    mimeType,
    sizeFormatted: formatBytes(optimizedSize),
    savingsPercentage: savings
  };
}

/**
 * Loads a File into an HTMLImageElement
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file. File may be corrupted or in an unsupported format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts canvas to Blob with promise
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to encode canvas to ${mimeType}`));
        }
      },
      mimeType,
      quality
    );
  });
}
