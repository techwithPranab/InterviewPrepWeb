'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  Code as CodeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  EmojiEvents as AwardIcon,
  AccountTree as ProjectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Psychology as AIIcon,
  CloudDownload as DownloadIcon
} from '@mui/icons-material';
import api from '@/lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reparsingprofil, setReparsingProfile] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getCandidateProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Profile not found. Please upload your resume first.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReparseProfile = async () => {
    if (!profile) return;

    setReparsingProfile(true);

    try {
      const response = await api.reparseProfile(profile._id);

      if (response.success) {
        setProfile(response.data);
        alert('Profile reparsed successfully!');
      } else {
        alert(response.message || 'Failed to reparse profile');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setReparsingProfile(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!profile) return;

    setGeneratingQuestions(true);

    try {
      const response = await api.generateInterviewQuestions(profile._id);

      if (response.success && response.data.questions) {
        setQuestions(response.data.questions);
      } else {
        alert(response.message || 'Failed to generate questions');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;

    try {
      const response = await api.deleteCandidateProfile(profile._id);

      if (response.success) {
        alert('Profile deleted successfully');
        router.push('/dashboard/resume');
      } else {
        alert(response.message || 'Failed to delete profile');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error || 'No profile found'}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/dashboard/resume')}>
          Upload Resume
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Profile
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={reparsingprofil ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleReparseProfile}
            disabled={reparsingprofil}
          >
            {reparsingprofil ? 'Reparsing...' : 'Re-parse with AI'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Profile
          </Button>
        </Box>
      </Box>

      {/* Personal Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Personal Information
            </Typography>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {profile.personalInfo.fullName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">{profile.personalInfo.fullName}</Typography>
                </Box>
              </Box>
            )}

            {profile.personalInfo.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{profile.personalInfo.email}</Typography>
                </Box>
              </Box>
            )}

            {profile.personalInfo.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{profile.personalInfo.phone}</Typography>
                </Box>
              </Box>
            )}

            {profile.personalInfo.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{profile.personalInfo.location}</Typography>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {profile.personalInfo.linkedIn && (
                <Chip
                  icon={<LinkedInIcon />}
                  label="LinkedIn"
                  component="a"
                  href={profile.personalInfo.linkedIn}
                  target="_blank"
                  clickable
                  color="primary"
                  variant="outlined"
                />
              )}
              {profile.personalInfo.github && (
                <Chip
                  icon={<GitHubIcon />}
                  label="GitHub"
                  component="a"
                  href={profile.personalInfo.github}
                  target="_blank"
                  clickable
                  variant="outlined"
                />
              )}
              {profile.personalInfo.portfolio && (
                <Chip
                  icon={<WebsiteIcon />}
                  label="Portfolio"
                  component="a"
                  href={profile.personalInfo.portfolio}
                  target="_blank"
                  clickable
                  variant="outlined"
                />
              )}
            </Box>

            {/* Resume Link */}
            {profile.resumeUrl && (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={profile.resumeUrl}
                  target="_blank"
                  size="small"
                >
                  View Resume PDF
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Summary */}
      {profile.summary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Professional Summary
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile.summary}
            </Typography>
            {profile.currentRole && (
              <Chip
                label={`Current Role: ${profile.currentRole}`}
                color="primary"
                size="small"
                sx={{ mt: 2 }}
              />
            )}
            {profile.totalExperience && (
              <Chip
                label={`Experience: ${profile.totalExperience}`}
                size="small"
                sx={{ mt: 2, ml: 1 }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for detailed information */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable">
          <Tab label={`Skills (${profile.skills.technical.length})`} icon={<CodeIcon />} iconPosition="start" />
          <Tab label={`Experience (${profile.experience.length})`} icon={<WorkIcon />} iconPosition="start" />
          <Tab label={`Projects (${profile.projects.length})`} icon={<ProjectIcon />} iconPosition="start" />
          <Tab label={`Education (${profile.education.length})`} icon={<SchoolIcon />} iconPosition="start" />
          <Tab label={`Certifications (${profile.certifications.length})`} icon={<AwardIcon />} iconPosition="start" />
        </Tabs>

        {/* Skills Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {profile.skills.technical.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Technical Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.skills.technical.map((skill: string, index: number) => (
                    <Chip key={index} label={skill} color="primary" />
                  ))}
                </Box>
              </Box>
            )}

            {profile.skills.tools.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Tools & Technologies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.skills.tools.map((tool: string, index: number) => (
                    <Chip key={index} label={tool} color="success" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {profile.skills.soft.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Soft Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.skills.soft.map((skill: string, index: number) => (
                    <Chip key={index} label={skill} color="secondary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {profile.skills.languages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Languages
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.skills.languages.map((lang: string, index: number) => (
                    <Chip key={index} label={lang} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Experience Tab */}
        <TabPanel value={tabValue} index={1}>
          {profile.experience.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {profile.experience.map((exp: any, index: number) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {exp.position}
                        </Typography>
                        <Typography color="text.secondary">{exp.company}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {exp.duration}
                      </Typography>
                    </Box>
                    {exp.location && (
                      <Typography variant="body2" color="text.secondary">
                        📍 {exp.location}
                      </Typography>
                    )}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <List dense sx={{ mt: 1 }}>
                        {exp.responsibilities.map((resp: string, i: number) => (
                          <ListItem key={i}>
                            <ListItemText primary={`• ${resp}`} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {exp.technologies.map((tech: string, i: number) => (
                          <Chip key={i} label={tech} size="small" />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No experience data available</Typography>
          )}
        </TabPanel>

        {/* Projects Tab */}
        <TabPanel value={tabValue} index={2}>
          {profile.projects.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {profile.projects.map((project: any, index: number) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {project.description}
                    </Typography>
                    {project.role && (
                      <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                        Role: {project.role} {project.duration && `(${project.duration})`}
                      </Typography>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {project.technologies.map((tech: string, i: number) => (
                          <Chip key={i} label={tech} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>
                    )}
                    {project.achievements && project.achievements.length > 0 && (
                      <List dense sx={{ mt: 1 }}>
                        {project.achievements.map((achievement: string, i: number) => (
                          <ListItem key={i}>
                            <ListItemText primary={`✓ ${achievement}`} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No projects data available</Typography>
          )}
        </TabPanel>

        {/* Education Tab */}
        <TabPanel value={tabValue} index={3}>
          {profile.education.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {profile.education.map((edu: any, index: number) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {edu.degree}
                    </Typography>
                    <Typography color="text.secondary">{edu.institution}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {edu.year}
                      {edu.grade && ` • Grade: ${edu.grade}`}
                    </Typography>
                    {edu.major && (
                      <Chip label={`Major: ${edu.major}`} size="small" color="primary" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No education data available</Typography>
          )}
        </TabPanel>

        {/* Certifications Tab */}
        <TabPanel value={tabValue} index={4}>
          {profile.certifications.length > 0 ? (
            <List>
              {profile.certifications.map((cert: any, index: number) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AwardIcon color="warning" />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {cert.name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {cert.issuer}
                          </Typography>
                          {cert.year && ` • Issued: ${cert.year}`}
                          {cert.credentialId && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Credential ID: {cert.credentialId}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < profile.certifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No certifications data available</Typography>
          )}
        </TabPanel>
      </Paper>

      {/* AI Interview Questions */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI-Generated Interview Questions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={generatingQuestions ? <CircularProgress size={16} /> : <AIIcon />}
              onClick={handleGenerateQuestions}
              disabled={generatingQuestions}
            >
              {generatingQuestions ? 'Generating...' : 'Generate Questions'}
            </Button>
          </Box>

          {questions.length > 0 ? (
            <List>
              {questions.map((question, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body1">
                          <strong>Q{index + 1}:</strong> {question}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < questions.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              Click "Generate Questions" to create personalized interview questions based on your profile.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Profile?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your candidate profile? This action cannot be undone.
            You will need to upload your resume again to create a new profile.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProfile} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
