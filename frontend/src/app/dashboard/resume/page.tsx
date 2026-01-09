'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  EmojiEvents as AwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '@/lib/api';

interface UploadedData {
  text: string;
  skills: string[];
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  candidateProfileId: string;
  metadata: {
    uploadedAt: string;
    fileName: string;
    fileSize: number;
  };
}

interface CandidateProfile {
  _id: string;
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  experience: any[];
  projects: any[];
  education: any[];
  certifications: any[];
  totalExperience?: string;
  currentRole?: string;
}

export default function ResumeUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<CandidateProfile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Validate file
  const validateAndSetFile = (file: File) => {
    // Reset states
    setUploadSuccess(false);
    setUploadError(null);
    setUploadedData(null);
    setExtractedProfile(null);

    // Check file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed. Please select a PDF file.');
      setSelectedFile(null);
      return;
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size exceeds 5MB limit. Please select a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate progress (since fetch doesn't support upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.uploadResume(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setUploadSuccess(true);
        setUploadedData(response.data);

        // Fetch the complete profile
        if (response.data.candidateProfileId) {
          const profileResponse = await api.getCandidateProfileById(response.data.candidateProfileId);
          if (profileResponse.success) {
            setExtractedProfile(profileResponse.data);
          }
        }
      } else {
        setUploadError(response.message || 'Upload failed. Please try again.');
      }
    } catch (error: any) {
      setUploadError(error.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Upload Your Resume
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          {/* Upload Area */}
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
              backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h6" sx={{ mb: 1 }}>
              {isDragging ? 'Drop your PDF here' : 'Drag & Drop your resume'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              or click to browse (PDF only, max 5MB)
            </Typography>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="resume-upload-input"
            />
            
            <label htmlFor="resume-upload-input">
              <Button variant="contained" component="span" disabled={uploading}>
                Select PDF File
              </Button>
            </label>

            {selectedFile && (
              <Box sx={{ mt: 3 }}>
                <Chip
                  icon={<FileIcon />}
                  label={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
                  onDelete={() => setSelectedFile(null)}
                  color="primary"
                />
              </Box>
            )}
          </Paper>

          {/* Upload Button */}
          {selectedFile && !uploading && !uploadSuccess && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUpload}
                startIcon={<CloudUploadIcon />}
              >
                Upload & Parse Resume
              </Button>
            </Box>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {uploadProgress < 90 ? 'Uploading...' : 'Parsing with AI...'}
              </Typography>
            </Box>
          )}

          {/* Error Alert */}
          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>
              <AlertTitle>Upload Failed</AlertTitle>
              {uploadError}
            </Alert>
          )}

          {/* Success Alert */}
          {uploadSuccess && uploadedData && (
            <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
              <AlertTitle>Resume Uploaded Successfully!</AlertTitle>
              Your resume has been uploaded and parsed with AI. View your extracted profile below.
            </Alert>
          )}

          {/* AI Parsing Note */}
          <Paper sx={{ mt: 3, p: 2, backgroundColor: 'info.lighter' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📝 AI-Powered Resume Parsing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We use advanced AI (GPT-4o-mini) to extract your information including personal details,
              skills, experience, projects, education, and certifications. You can review and edit
              the extracted data in your profile.
            </Typography>
          </Paper>
        </Box>

        {/* Extracted Data Preview */}
        {extractedProfile && (
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Extracted Information
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    View Full Profile
                  </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Personal Info */}
                {extractedProfile.personalInfo.fullName && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Personal Information
                      </Typography>
                    </Box>
                    <List dense>
                      {extractedProfile.personalInfo.fullName && (
                        <ListItem>
                          <ListItemText
                            primary="Name"
                            secondary={extractedProfile.personalInfo.fullName}
                          />
                        </ListItem>
                      )}
                      {extractedProfile.personalInfo.email && (
                        <ListItem>
                          <ListItemText
                            primary="Email"
                            secondary={extractedProfile.personalInfo.email}
                          />
                        </ListItem>
                      )}
                      {extractedProfile.personalInfo.phone && (
                        <ListItem>
                          <ListItemText
                            primary="Phone"
                            secondary={extractedProfile.personalInfo.phone}
                          />
                        </ListItem>
                      )}
                      {extractedProfile.personalInfo.location && (
                        <ListItem>
                          <ListItemText
                            primary="Location"
                            secondary={extractedProfile.personalInfo.location}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                )}

                {/* Skills */}
                {extractedProfile.skills.technical.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CodeIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Technical Skills ({extractedProfile.skills.technical.length})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {extractedProfile.skills.technical.slice(0, 10).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                      ))}
                      {extractedProfile.skills.technical.length > 10 && (
                        <Chip label={`+${extractedProfile.skills.technical.length - 10} more`} size="small" />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Experience */}
                {extractedProfile.experience.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WorkIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Work Experience ({extractedProfile.experience.length})
                      </Typography>
                    </Box>
                    <List dense>
                      {extractedProfile.experience.slice(0, 2).map((exp, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={exp.position}
                            secondary={`${exp.company} - ${exp.duration}`}
                          />
                        </ListItem>
                      ))}
                      {extractedProfile.experience.length > 2 && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          +{extractedProfile.experience.length - 2} more positions
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}

                {/* Education */}
                {extractedProfile.education.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Education ({extractedProfile.education.length})
                      </Typography>
                    </Box>
                    <List dense>
                      {extractedProfile.education.slice(0, 2).map((edu, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={edu.degree}
                            secondary={`${edu.institution} - ${edu.year}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Certifications */}
                {extractedProfile.certifications.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AwardIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Certifications ({extractedProfile.certifications.length})
                      </Typography>
                    </Box>
                    <List dense>
                      {extractedProfile.certifications.slice(0, 3).map((cert, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={cert.name}
                            secondary={cert.issuer}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* View Profile Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push('/dashboard/profile')}
                  sx={{ mt: 2 }}
                >
                  View Complete Profile
                </Button>
              </CardContent>
            </Card>

            {/* Extracted Text Toggle */}
            {uploadedData && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setShowExtractedText(!showExtractedText)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Extracted Text from PDF
                    </Typography>
                    <IconButton size="small">
                      {showExtractedText ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  
                  <Collapse in={showExtractedText}>
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: 'grey.100',
                        borderRadius: 1,
                        maxHeight: 300,
                        overflow: 'auto'
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {uploadedData.text}
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
