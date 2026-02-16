/**
 * Client-side image utilities for check-in photo evidence.
 * Handles validation, preview generation, and display conversion.
 */

/**
 * Validates that a file is an image
 */
export function validateImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Converts a File to a base64 data URL for preview
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a stored photo string (base64) to a safe image src
 */
export function photoToImageSrc(photo: string): string {
  // If it's already a data URL, return as-is
  if (photo.startsWith('data:')) {
    return photo;
  }
  // Otherwise, assume it's base64 and add the data URL prefix
  return `data:image/jpeg;base64,${photo}`;
}

/**
 * Compresses an image file to reduce size before upload
 */
export async function compressImage(file: File, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions to keep aspect ratio
        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to meet size requirement
        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Reduce quality if still too large
        while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
