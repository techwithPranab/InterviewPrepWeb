import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Cloudinary configuration
// All resume files are uploaded to MeritAI/Resume folder structure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   * @param filePath - Path to the file to upload
   * @param folder - Cloudinary folder to upload to (default: 'MeritAI/Resume')
   * @returns Upload result with URL and public ID
   */
  async uploadFile(filePath: string, folder: string = 'MeritAI/Resume'): Promise<CloudinaryUploadResult> {
    try {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('Cloudinary configuration missing');
        return {
          success: false,
          error: 'Cloudinary service not configured'
        };
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'File not found'
        };
      }

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto', // Automatically detect file type
        use_filename: true,
        unique_filename: true
      });

      // Delete local file after upload (optional)
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting local file:', error);
      }

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload a file buffer to Cloudinary
   * @param buffer - File buffer to upload
   * @param filename - Original filename
   * @param folder - Cloudinary folder to upload to (default: 'MeritAI/Resume')
   * @returns Upload result with URL and public ID
   */
  async uploadBuffer(buffer: Buffer, filename: string, folder: string = 'MeritAI/Resume'): Promise<CloudinaryUploadResult> {
    try {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('Cloudinary configuration missing');
        return {
          success: false,
          error: 'Cloudinary service not configured'
        };
      }

      // Upload buffer to Cloudinary
      const result = await cloudinary.uploader.upload(`data:application/pdf;base64,${buffer.toString('base64')}`, {
        folder: folder,
        resource_type: 'auto',
        public_id: filename.replace('.pdf', ''), // Remove extension for public_id
        use_filename: false,
        unique_filename: true
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Error uploading buffer to Cloudinary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - The public ID of the file to delete
   * @returns Deletion result
   */
  async deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed'
      };
    }
  }

  /**
   * Upload resume file
   * @param filePath - Path to the resume file
   * @param userId - User ID for organizing files (optional, for subfolder organization)
   * @returns Upload result
   */
  async uploadResume(filePath: string, userId?: string): Promise<CloudinaryUploadResult> {
    const folder = userId ? `MeritAI/Resume/${userId}` : 'MeritAI/Resume';
    return this.uploadFile(filePath, folder);
  }

  /**
   * Check if Cloudinary is configured
   * @returns True if configured, false otherwise
   */
  isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }
}

export default new CloudinaryService();
