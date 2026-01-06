'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
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
} from '@mui/icons-material';
import api from '@/lib/api';

interface IntervieweeProfile {
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
  type: string;
  difficulty: string;
  skills: string[];
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration: number;
  interviewer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  overallEvaluation?: {
    totalScore?: number;
    averageScore?: number;
    totalQuestions?: number;
    completedQuestions?: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
  };
}

interface PerformanceAnalytics {
  skillPerformance: { [key: string]: number };
  difficultyPerformance: { [key: string]: number };
  timeBasedTrends: Array<{ month: string; averageScore: number; sessionCount: number }>;
  criteriaBreakdown: {
    technical_accuracy: number;
    communication: number;
    problem_solving: number;
    confidence: number;
  };
  strengths: string[];
  areasForImprovement: string[];
}

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
      id={`interviewee-tabpanel-${index}`}
      aria-labelledby={`interviewee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function IntervieweeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const intervieweeId = params?.id as string;

  const [profile, setProfile] = useState<IntervieweeProfile | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (intervieweeId) {
      fetchIntervieweeDetails();
    }
  }, [intervieweeId]);

  const fetchIntervieweeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/interviewees/${intervieweeId}`);

      if (response.success) {
        setProfile(response.data.profile);
        setSessions(response.data.sessions);
        setPerformanceAnalytics(response.data.performanceAnalytics);
      } else {
        setError(response.message || 'Failed to fetch interviewee details');
      }
    } catch (err) {
      console.error('Error fetching interviewee details:', err);
      setError('Failed to fetch interviewee details');
    } finally {
      setLoading(false);
    }
  };

  const getExperienceLabel = (experience: string) => {
    const labels: { [key: string]: string } = {
      'fresher': 'Fresher',
      '1-3': '1-3 Years',
      '3-5': '3-5 Years',
      '5-10': '5-10 Years',
      '10+': '10+ Years'
    };
    return labels[experience] || experience;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in-progress':
        return <PlayCircleIcon color="info" />;
      case 'scheduled':
        return <ScheduleIcon color="warning" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'scheduled': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading interviewee details...
        </Typography>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Interviewee not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/interviewees')}
          sx={{ mt: 2 }}
        >
          Back to Interviewees
        </Button>
      </Container>
    );
  }

  // Prepare chart data
  const skillChartData = performanceAnalytics ? Object.entries(performanceAnalytics.skillPerformance).map(([skill, score]) => ({
    skill,
    score: Math.round(score)
  })) : [];

  const criteriaChartData = performanceAnalytics ? [
    {
      subject: 'Technical Accuracy',
      score: Math.round(performanceAnalytics.criteriaBreakdown.technical_accuracy),
      fullMark: 100,
    },
    {
      subject: 'Communication',
      score: Math.round(performanceAnalytics.criteriaBreakdown.communication),
      fullMark: 100,
    },
    {
      subject: 'Problem Solving',
      score: Math.round(performanceAnalytics.criteriaBreakdown.problem_solving),
      fullMark: 100,
    },
    {
      subject: 'Confidence',
      score: Math.round(performanceAnalytics.criteriaBreakdown.confidence),
      fullMark: 100,
    },
  ] : [];

  const completedSessions = sessions.filter(session => session.status === 'completed');
  const averageScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((sum, session) => 
        sum + (session.overallEvaluation?.averageScore || session.overallEvaluation?.totalScore || 0), 0
      ) / completedSessions.length)
    : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/interviewees')}
          sx={{ mr: 3 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Interviewee Profile
        </Typography>
      </Box>

      {/* Profile Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {profile.firstName[0]}{profile.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {profile.firstName} {profile.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="action" />
                      <Typography variant="body2">{profile.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon color="action" />
                      <Typography variant="body2">
                        {getExperienceLabel(profile.profile.experience)}
                      </Typography>
                    </Box>
                    <Chip
                      label={profile.isActive ? 'Active' : 'Inactive'}
                      color={profile.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Skills */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.profile.skills.map((skill) => (
                    <Chip key={skill} label={skill} variant="outlined" />
                  ))}
                </Box>
              </Box>

              {/* Bio */}
              {profile.profile.bio && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Bio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile.profile.bio}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ width: { xs: '100%', md: '300px' } }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Quick Stats
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><AssessmentIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Total Interviews" 
                      secondary={sessions.length}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Completed" 
                      secondary={completedSessions.length}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><StarIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Average Score" 
                      secondary={`${averageScore}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Member Since" 
                      secondary={formatDate(profile.createdAt)}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Interview History" />
            <Tab label="Performance Analytics" />
            <Tab label="Strengths & Improvements" />
          </Tabs>
        </Box>

        {/* Interview History Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Interview</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{session.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.difficulty} • {session.duration}min
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={session.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {session.skills.slice(0, 2).map((skill) => (
                          <Chip key={skill} label={skill} size="small" />
                        ))}
                        {session.skills.length > 2 && (
                          <Chip label={`+${session.skills.length - 2}`} size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {getStatusIcon(session.status)}
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {session.overallEvaluation ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {Math.round(session.overallEvaluation.averageScore || session.overallEvaluation.totalScore || 0)}%
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(session.completedAt || session.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No interview sessions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Performance Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          {performanceAnalytics && (
            <Box>
              {/* Performance Summary */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary.main">
                      {Math.round(performanceAnalytics.criteriaBreakdown.technical_accuracy)}%
                    </Typography>
                    <Typography variant="body2">Technical Accuracy</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary.main">
                      {Math.round(performanceAnalytics.criteriaBreakdown.communication)}%
                    </Typography>
                    <Typography variant="body2">Communication</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary.main">
                      {Math.round(performanceAnalytics.criteriaBreakdown.problem_solving)}%
                    </Typography>
                    <Typography variant="body2">Problem Solving</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary.main">
                      {Math.round(performanceAnalytics.criteriaBreakdown.confidence)}%
                    </Typography>
                    <Typography variant="body2">Confidence</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Skill Performance */}
              {skillChartData.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Skill Performance</Typography>
                    {skillChartData.map((skill) => (
                      <Box key={skill.skill} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{skill.skill}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {skill.score}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={skill.score}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: skill.score >= 80 ? 'success.main' : 
                                           skill.score >= 60 ? 'warning.main' : 'error.main'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Time-based Trends */}
              {performanceAnalytics.timeBasedTrends.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Performance Timeline</Typography>
                    {performanceAnalytics.timeBasedTrends.map((trend) => (
                      <Box key={trend.month} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{trend.month}</Typography>
                          <Typography variant="body2">
                            {trend.averageScore}% ({trend.sessionCount} sessions)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={trend.averageScore}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
          {!performanceAnalytics && (
            <Typography variant="body1" color="text.secondary" align="center">
              No performance data available yet
            </Typography>
          )}
        </TabPanel>

        {/* Strengths & Improvements Tab */}
        <TabPanel value={tabValue} index={2}>
          {performanceAnalytics && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                  Strengths
                </Typography>
                {performanceAnalytics.strengths.length > 0 ? (
                  <List>
                    {performanceAnalytics.strengths.map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUpIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No strengths identified yet
                  </Typography>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                  Areas for Improvement
                </Typography>
                {performanceAnalytics.areasForImprovement.length > 0 ? (
                  <List>
                    {performanceAnalytics.areasForImprovement.map((improvement, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingDownIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={improvement} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No areas for improvement identified yet
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          {!performanceAnalytics && (
            <Typography variant="body1" color="text.secondary" align="center">
              No feedback data available yet
            </Typography>
          )}
        </TabPanel>
      </Card>
    </Container>
  );
}
