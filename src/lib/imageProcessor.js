// imageProcessor.js - Client-Side 16:9 Canvas Crop, Resizing & WebP Compression

export async function processImageFile(file, targetWidth = 1280, targetHeight = 720, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Calculate center crop maintaining 16:9
          const sourceRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight; // 16:9 = 1.7777...

          let sx, sy, sw, sh;
          if (sourceRatio > targetRatio) {
            // Source is wider than 16:9 - crop horizontally
            sh = img.height;
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
            // Source is taller than 16:9 - crop vertically
            sw = img.width;
            sh = img.width / targetRatio;
            sx = 0;
            sy = (img.height - sh) / 2;
          }

          // Draw cropped & scaled image
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

          // Convert to WebP data URL with fallback to JPEG
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          const originalSizeKB = Math.round(file.size / 1024);
          const compressedSizeKB = Math.round((dataUrl.length * 3/4) / 1024);

          resolve({
            dataUrl,
            originalSizeKB,
            compressedSizeKB,
            aspectRatio: '16:9',
            width: targetWidth,
            height: targetHeight
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image into memory'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error reading uploaded file'));
    reader.readAsDataURL(file);
  });
}
