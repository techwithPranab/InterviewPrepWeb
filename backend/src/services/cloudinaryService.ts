import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Cloudinary configuration
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
   * @param folder - Cloudinary folder to upload to (default: 'resumes')
   * @returns Upload result with URL and public ID
   */
  async uploadFile(filePath: string, folder: string = 'resumes'): Promise<CloudinaryUploadResult> {
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
   * @param userId - User ID for organizing files
   * @returns Upload result
   */
  async uploadResume(filePath: string, userId: string): Promise<CloudinaryUploadResult> {
    return this.uploadFile(filePath, `resumes/${userId}`);
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
