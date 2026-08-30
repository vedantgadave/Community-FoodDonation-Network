import { isDemoMode } from './firebase';

const env = typeof import.meta !== 'undefined' ? import.meta.env || {} : {};

const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME || 'food-donation2-0';
const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET || 'community_food_uploads';

export const isCloudinaryConfigured = Boolean(
  CLOUD_NAME && 
  UPLOAD_PRESET && 
  CLOUD_NAME !== 'your_cloudinary_cloud_name'
);

export interface UploadResult {
  url: string;
  publicId?: string;
}

/**
 * Client-side unsigned image upload to Cloudinary using preset 'community_food_uploads'.
 * Enforces file size limit (< 5MB) and allowed image MIME types.
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // Client-side validations
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes) {
    throw new Error('File size exceeds 5MB limit. Please upload a smaller image.');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file format. Only JPG, PNG, and WEBP images are allowed.');
  }

  // If in demo mode, provide simulated upload preview
  if (isDemoMode) {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const objectUrl = URL.createObjectURL(file);
          resolve({
            url: objectUrl,
            publicId: `demo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '')}`
          });
        }
      }, 150);
    });
  }

  // Real Cloudinary Unsigned Upload with preset community_food_uploads
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id
        });
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error?.message || 'Cloudinary upload failed'));
        } catch {
          reject(new Error(`Upload failed with HTTP status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error occurred during image upload.'));
    xhr.send(formData);
  });
}
