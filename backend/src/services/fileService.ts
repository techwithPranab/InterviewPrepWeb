import multer, { StorageEngine, Multer } from 'multer';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import pdfParse from 'pdf-parse';
import cloudinaryService from './cloudinaryService';
import resumeParserService from './resumeParserService';

interface FileInfo {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadDate: Date;
  url: string;
}

interface ResumeParsedData {
  text: string;
  skills: string[];
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  candidateProfileId?: string; // ID of saved candidate profile
  metadata: {
    uploadedAt: Date;
    fileName: string;
    fileSize: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Skill extraction keywords
const SKILL_KEYWORDS: { [key: string]: string[] } = {
  programming_languages: [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'go', 'rust',
    'php', 'ruby', 'kotlin', 'swift', 'objective-c', 'dart', 'scala'
  ],
  frameworks: [
    'react', 'angular', 'vue', 'express', 'nest.js', 'django', 'flask',
    'spring boot', 'spring framework', 'fastapi', 'rails', 'laravel',
    'next.js', 'nuxt', 'svelte', 'ember'
  ],
  databases: [
    'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'cassandra',
    'dynamodb', 'elasticsearch', 'neo4j', 'oracle', 'sql server', 'firebase'
  ],
  cloud_platforms: [
    'aws', 'azure', 'google cloud', 'heroku', 'digitalocean',
    'linode', 'openstack', 'ibm cloud'
  ],
  tools_devops: [
    'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket',
    'terraform', 'ansible', 'circleci', 'travis ci', 'git', 'npm', 'yarn',
    'maven', 'gradle', 'webpack', 'vite'
  ],
  methodologies: [
    'agile', 'scrum', 'kanban', 'ci/cd', 'devops', 'tdd', 'bdd',
    'microservices', 'rest', 'graphql', 'soap'
  ]
};

class FileService {
  /**
   * Get multer configuration for file uploads (PDF only for resumes)
   */
  getMulterConfig(): Multer {
    const storage: StorageEngine = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}-${random}${ext}`);
      }
    });

    return multer({
      storage: storage,
      limits: {
        fileSize: MAX_FILE_SIZE
      },
      fileFilter: (req, file, cb) => {
        // Only allow PDF files for resume upload
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed. Please upload a PDF file.'));
        }
      }
    });
  }

  /**
   * Extract text from PDF file
   */
  async extractResumeText(filePathOrBuffer: string | Buffer): Promise<string> {
    try {
      let fileBuffer: Buffer;
      
      if (typeof filePathOrBuffer === 'string') {
        // It's a file path
        fileBuffer = fs.readFileSync(filePathOrBuffer);
      } else {
        // It's already a buffer
        fileBuffer = filePathOrBuffer;
      }
      
      // Only support PDF files now
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('Error extracting resume text:', error);
      throw new Error('Failed to extract text from resume');
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    // Remove extra whitespace and normalize newlines
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Remove special characters but keep alphanumeric and basic punctuation
    cleaned = cleaned.replace(/[^\w\s.,\-+/#&()]/g, '');
    
    return cleaned.toLowerCase();
  }

  /**
   * Extract skills from text
   */
  async extractSkillsFromText(text: string): Promise<string[]> {
    try {
      const cleanedText = this.cleanExtractedText(text);
      const extractedSkills: Set<string> = new Set();

      // Check each skill category
      Object.values(SKILL_KEYWORDS).forEach((skillList: string[]) => {
        skillList.forEach((skill: string) => {
          const skillRegex = new RegExp(`\\b${skill}\\b`, 'gi');
          if (skillRegex.test(cleanedText)) {
            extractedSkills.add(skill.toLowerCase());
          }
        });
      });

      return Array.from(extractedSkills);
    } catch (error) {
      console.error('Error extracting skills from text:', error);
      return [];
    }
  }

  /**
   * Validate file type and size
   */
  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    try {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        };
      }

      // Check file type
      const allowedMimes = ['application/pdf', 'application/msword',
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return {
          isValid: false,
          error: `Invalid file type. Allowed types: PDF, DOC, DOCX`
        };
      }

      // Check file extension
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      
      if (!allowedExtensions.includes(ext)) {
        return {
          isValid: false,
          error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating file:', error);
      return {
        isValid: false,
        error: 'File validation failed'
      };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const filename = path.basename(filePath);

      return {
        filename: filename,
        originalName: filename,
        mimetype: this.getMimeType(filePath),
        size: stats.size,
        path: filePath,
        uploadDate: stats.birthtime,
        url: `/uploads/${filename}`
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Generate file URL
   */
  generateFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Process complete resume upload and skill extraction
   */
  async processResumeUpload(file: Express.Multer.File, userId?: string): Promise<ResumeParsedData | null> {
    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'File validation failed');
      }

      // Extract text from resume
      const extractedText = await this.extractResumeText(file.buffer);
      
      if (!extractedText) {
        throw new Error('Could not extract text from resume');
      }

      // Extract skills from text (basic extraction)
      const skills = await this.extractSkillsFromText(extractedText);

      const result: ResumeParsedData = {
        text: extractedText,
        skills: skills,
        metadata: {
          uploadedAt: new Date(),
          fileName: file.originalname,
          fileSize: file.size
        }
      };

      // Upload to Cloudinary if configured
      let cloudinaryUrl: string | undefined;
      let cloudinaryPublicId: string | undefined;
      
      if (cloudinaryService.isConfigured() && userId) {
        const uploadResult = await cloudinaryService.uploadBuffer(file.buffer, file.originalname, `MeritAI/Resume/${userId}`);
        if (uploadResult.success) {
          cloudinaryUrl = uploadResult.url;
          cloudinaryPublicId = uploadResult.publicId;
          result.cloudinaryUrl = cloudinaryUrl;
          result.cloudinaryPublicId = cloudinaryPublicId;
        } else {
          console.error('Failed to upload to Cloudinary:', uploadResult.error);
          // Continue without Cloudinary upload
        }
      }

      // Parse resume with AI and save to database
      if (userId && cloudinaryUrl) {
        try {
          const parsedData = await resumeParserService.parseResumeWithAI(extractedText);
          const candidateProfile = await resumeParserService.saveToDatabase(
            userId,
            parsedData,
            cloudinaryUrl,
            cloudinaryPublicId,
            extractedText
          );
          result.candidateProfileId = candidateProfile._id.toString();
          console.log('✅ Resume parsed and candidate profile created:', candidateProfile._id);
        } catch (aiError) {
          console.error('⚠️  AI parsing failed, but resume was uploaded:', aiError);
          // Continue even if AI parsing fails - resume is still uploaded
        }
      }

      return result;
    } catch (error) {
      console.error('Error processing resume upload:', error);
      
      // No cleanup needed for memory storage - files are not saved locally
      throw error;
    }
  }

  /**
   * Helper method to determine MIME type
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get list of uploaded files
   */
  async getUploadedFiles(): Promise<FileInfo[]> {
    try {
      const files = fs.readdirSync(UPLOAD_PATH);
      const fileInfoList: FileInfo[] = [];

      for (const file of files) {
        const filePath = path.join(UPLOAD_PATH, file);
        const info = await this.getFileInfo(filePath);
        if (info) {
          fileInfoList.push(info);
        }
      }

      return fileInfoList;
    } catch (error) {
      console.error('Error getting uploaded files:', error);
      return [];
    }
  }

  /**
   * Clean up old files (older than specified days)
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const files = fs.readdirSync(UPLOAD_PATH);
      let deletedCount = 0;
      const now = Date.now();
      const cutoffTime = daysOld * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(UPLOAD_PATH, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > cutoffTime) {
          await this.deleteFile(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      return 0;
    }
  }
}

export default new FileService();
