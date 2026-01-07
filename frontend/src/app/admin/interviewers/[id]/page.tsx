'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  PlayCircleOutline as PlayCircleIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  RemoveCircle as NeutralIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface InterviewerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: {
    experience: string;
    skills: string[];
    bio?: string;
  };
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface InterviewSession {
  _id: string;
  title: string;
  candidate: any;
  status: string;
  completedAt?: string;
  overallEvaluation?: {
    recommendation?: string;
    averageScore?: number;
    totalScore?: number;
  };
}

interface InterviewerData {
  profile: InterviewerProfile;
  sessions: InterviewSession[];
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    totalEvaluated: number;
    acceptedCount: number;
    rejectedCount: number;
    neutralCount: number;
    acceptanceRate: number;
    rejectionRate: number;
    averageScore: number;
    lastInterviewDate?: string;
  };
}

export default function InterviewerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewerId = params.id as string;

  const [interviewer, setInterviewer] = useState<InterviewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (interviewerId) {
      fetchInterviewerDetails();
    }
  }, [interviewerId]);

  const fetchInterviewerDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/interviewers/${interviewerId}`);

      if (response.success) {
        setInterviewer(response.data);
      } else {
        setError(response.message || 'Failed to fetch interviewer details');
      }
    } catch (err) {
      console.error('Error fetching interviewer details:', err);
      setError('Failed to fetch interviewer details');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation) {
      case 'strongly_recommend':
      case 'recommend':
        return <AcceptIcon sx={{ color: 'success.main' }} />;
      case 'not_recommend':
      case 'strongly_not_recommend':
        return <RejectIcon sx={{ color: 'error.main' }} />;
      case 'neutral':
        return <NeutralIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const getRecommendationText = (recommendation?: string) => {
    switch (recommendation) {
      case 'strongly_recommend':
        return 'Strongly Recommend';
      case 'recommend':
        return 'Recommend';
      case 'neutral':
        return 'Neutral';
      case 'not_recommend':
        return 'Not Recommend';
      case 'strongly_not_recommend':
        return 'Strongly Not Recommend';
      default:
        return 'Not Evaluated';
    }
  };

  const getAcceptanceRateColor = (rate: number) => {
    if (rate >= 70) return 'success.main';
    if (rate >= 50) return 'warning.main';
    return 'error.main';
  };

  const getRejectionRateColor = (rate: number) => {
    if (rate <= 30) return 'success.main';
    if (rate <= 50) return 'warning.main';
    return 'error.main';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
        <Typography variant="h6" align="center">
          Loading interviewer details...
        </Typography>
      </Container>
    );
  }

  if (error || !interviewer) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Interviewer not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/interviewers')}
        >
          Back to Interviewers
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/interviewers')}
          sx={{ mb: 1 }}
        >
          Back to Interviewers
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
          Interviewer Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {interviewer.profile.firstName} {interviewer.profile.lastName}
        </Typography>
      </Box>

      {/* Profile Overview */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                {interviewer.profile.firstName?.[0] || interviewer.profile.email?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {interviewer.profile.firstName} {interviewer.profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {interviewer.profile.email}
              </Typography>
              <Chip
                label={interviewer.profile.isActive ? 'Active' : 'Inactive'}
                color={interviewer.profile.isActive ? 'success' : 'default'}
                size="small"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '2 1 500px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: getAcceptanceRateColor(interviewer.stats.acceptanceRate) }}>
                    {interviewer.stats.acceptanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acceptance Rate
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: getRejectionRateColor(interviewer.stats.rejectionRate) }}>
                    {interviewer.stats.rejectionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejection Rate
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Typography variant="h4">
                    {interviewer.stats.averageScore.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Score
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
                  <Typography variant="h4">
                    {interviewer.stats.totalInterviews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Interviews
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Detailed Information */}
      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Profile Information" />
            <Tab label="Interview History" />
            <Tab label="Performance Breakdown" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Full Name"
                        secondary={`${interviewer.profile.firstName} ${interviewer.profile.lastName}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={interviewer.profile.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Experience"
                        secondary={interviewer.profile.profile?.experience || 'Not specified'}
                      />
                    </ListItem>
                  </List>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Skills"
                        secondary={
                          interviewer.profile.profile?.skills?.length > 0
                            ? interviewer.profile.profile.skills.join(', ')
                            : 'No skills specified'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Interview"
                        secondary={
                          interviewer.stats.lastInterviewDate
                            ? new Date(interviewer.stats.lastInterviewDate).toLocaleDateString()
                            : 'No interviews yet'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AssessmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Member Since"
                        secondary={new Date(interviewer.profile.createdAt).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Interview Sessions
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Interview Title</TableCell>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Recommendation</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interviewer.sessions.map((session) => (
                      <TableRow key={session._id}>
                        <TableCell>{session.title}</TableCell>
                        <TableCell>
                          {session.candidate?.firstName} {session.candidate?.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.status}
                            color={
                              session.status === 'completed' ? 'success' :
                              session.status === 'in-progress' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getRecommendationIcon(session.overallEvaluation?.recommendation)}
                            <Typography variant="body2">
                              {getRecommendationText(session.overallEvaluation?.recommendation)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {session.overallEvaluation?.averageScore?.toFixed(1) || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {session.completedAt
                            ? new Date(session.completedAt).toLocaleDateString()
                            : 'Not completed'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Performance Breakdown
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Evaluation Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total Evaluated:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {interviewer.stats.totalEvaluated}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Accepted:</Typography>
                        <Typography variant="body2" sx={{ color: 'success.main' }}>
                          {interviewer.stats.acceptedCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Rejected:</Typography>
                        <Typography variant="body2" sx={{ color: 'error.main' }}>
                          {interviewer.stats.rejectedCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Neutral:</Typography>
                        <Typography variant="body2" sx={{ color: 'warning.main' }}>
                          {interviewer.stats.neutralCount}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Average Scores
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Overall Average:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {interviewer.stats.averageScore.toFixed(1)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Acceptance Rate:</Typography>
                        <Typography variant="body2" sx={{ color: getAcceptanceRateColor(interviewer.stats.acceptanceRate) }}>
                          {interviewer.stats.acceptanceRate}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Rejection Rate:</Typography>
                        <Typography variant="body2" sx={{ color: getRejectionRateColor(interviewer.stats.rejectionRate) }}>
                          {interviewer.stats.rejectionRate}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
