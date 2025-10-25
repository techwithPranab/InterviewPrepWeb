const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

class FileService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    this.initializeUploadDirectory();
  }

  async initializeUploadDirectory() {
    try {
      await fs.access(this.uploadPath);
    } catch (error) {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  // Configure multer for file uploads
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname);
        const filename = `${timestamp}-${randomString}${extension}`;
        cb(null, filename);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (this.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 1
      }
    });
  }

  // Extract text from uploaded resume
  async extractResumeText(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();

      if (fileExtension === '.pdf') {
        const data = await pdfParse(fileBuffer);
        return this.cleanExtractedText(data.text);
      } else if (fileExtension === '.doc' || fileExtension === '.docx') {
        // For Word documents, you might want to use a library like mammoth
        // For now, we'll return a placeholder
        return 'Word document text extraction not implemented yet. Please use PDF format.';
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (error) {
      console.error('Error extracting text from resume:', error);
      throw new Error('Failed to extract text from resume');
    }
  }

  // Clean and normalize extracted text
  cleanExtractedText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .trim();
  }

  // Extract skills from resume text using basic keyword matching
  extractSkillsFromText(text) {
    const commonSkills = [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'scala', 'typescript', 'html', 'css', 'sql',
      
      // Frameworks & Libraries
      'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel',
      'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
      
      // Databases
      'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'oracle', 'sqlite',
      
      // Tools & Technologies
      'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'terraform',
      'nginx', 'apache', 'linux', 'windows', 'macos',
      
      // Methodologies
      'agile', 'scrum', 'devops', 'ci/cd', 'tdd', 'microservices', 'rest', 'graphql'
    ];

    const textLower = text.toLowerCase();
    const foundSkills = [];

    commonSkills.forEach(skill => {
      const variations = [
        skill,
        skill.replace(/[.\-]/g, ''), // Remove dots and dashes
        skill.replace(/js$/, 'javascript'), // Handle js -> javascript
        skill.replace(/sql$/, ' sql') // Handle SQL variations
      ];

      variations.forEach(variation => {
        // Utility to escape regex special characters
        const escapeRegExp = (string) => {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const skillRegex = new RegExp(`\\b${escapeRegExp(variation)}\\b`, 'i');
        if (skillRegex.test(textLower) && !foundSkills.includes(skill)) {
          foundSkills.push(skill);
        }
      });
    });

    return foundSkills;
  }

  // Delete uploaded file
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
    } catch (error) {
      return {
        exists: false
      };
    }
  }

  // Validate file
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return errors;
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only PDF and Word documents are allowed.');
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`);
    }

    return errors;
  }

  // Generate file URL
  generateFileUrl(filename) {
    return `/uploads/${filename}`;
  }

  // Process resume upload
  async processResumeUpload(file) {
    try {
      // Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Extract text content
      const textContent = await this.extractResumeText(file.path);
      
      // Extract skills
      const extractedSkills = this.extractSkillsFromText(textContent);

      return {
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileUrl: this.generateFileUrl(file.filename),
        size: file.size,
        mimeType: file.mimetype,
        textContent,
        extractedSkills,
        uploadDate: new Date()
      };
    } catch (error) {
      // Clean up file if processing failed
      if (file && file.path) {
        await this.deleteFile(file.path);
      }
      throw error;
    }
  }
}

module.exports = new FileService();
