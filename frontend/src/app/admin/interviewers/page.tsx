'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  Alert,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  School as SkillIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
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

export default function AdminInterviewersPage() {
  const router = useRouter();
  const [interviewers, setInterviewers] = useState<InterviewerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchInterviewers();
    fetchAvailableSkills();
  }, [page, searchQuery, skillFilter, statusFilter]);

  const fetchInterviewers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(skillFilter && { skill: skillFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await api.get(`/admin/interviewers?${queryParams}`);

      if (response.success) {
        setInterviewers(response.data?.interviewers || []);
        setTotalPages(response.data?.pagination?.pages || 1);
      } else {
        setError(response.message || 'Failed to fetch interviewers');
      }
    } catch (err) {
      console.error('Error fetching interviewers:', err);
      setError('Failed to fetch interviewers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await api.get('/admin/skills');
      if (response.success) {
        const skills = response.data?.skills?.map((skill: any) => skill.name) || [];
        setAvailableSkills(skills);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const handleViewInterviewer = (interviewerId: string) => {
    router.push(`/admin/interviewers/${interviewerId}`);
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

  if (loading && interviewers.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
        <Typography variant="h6" align="center">
          Loading interviewers...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Interviewer Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor interviewer performance, acceptance rates, and activity metrics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search interviewers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Skill</InputLabel>
              <Select
                value={skillFilter}
                label="Skill"
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <MenuItem value="">All Skills</MenuItem>
                {availableSkills.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchQuery('');
                setSkillFilter('');
                setStatusFilter('all');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Interviewers Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Interviewer</TableCell>
                  <TableCell>Total Interviews</TableCell>
                  <TableCell>Acceptance Rate</TableCell>
                  <TableCell>Rejection Rate</TableCell>
                  <TableCell>Average Score</TableCell>
                  <TableCell>Last Interview</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interviewers.map((interviewerData) => (
                  <TableRow key={interviewerData.profile._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={interviewerData.profile.profile?.bio ? '' : undefined}
                          sx={{ bgcolor: 'primary.main' }}
                        >
                          {interviewerData.profile.firstName?.[0] || interviewerData.profile.email?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {interviewerData.profile.firstName} {interviewerData.profile.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {interviewerData.profile.email}
                          </Typography>
                          {interviewerData.profile.profile?.skills && (
                            <Box sx={{ mt: 0.5 }}>
                              {interviewerData.profile.profile.skills.slice(0, 2).map((skill) => (
                                <Chip
                                  key={skill}
                                  label={skill}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                              {interviewerData.profile.profile.skills.length > 2 && (
                                <Chip
                                  label={`+${interviewerData.profile.profile.skills.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {interviewerData.stats.totalInterviews}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {interviewerData.stats.completedInterviews} completed
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ color: getAcceptanceRateColor(interviewerData.stats.acceptanceRate) }}
                        >
                          {interviewerData.stats.acceptanceRate}%
                        </Typography>
                        <AcceptIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {interviewerData.stats.acceptedCount} accepted
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ color: getRejectionRateColor(interviewerData.stats.rejectionRate) }}
                        >
                          {interviewerData.stats.rejectionRate}%
                        </Typography>
                        <RejectIcon sx={{ color: 'error.main', fontSize: 16 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {interviewerData.stats.rejectedCount} rejected
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {interviewerData.stats.averageScore.toFixed(1)}
                        </Typography>
                        <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {interviewerData.stats.totalEvaluated} evaluated
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {interviewerData.stats.lastInterviewDate ? (
                        <Typography variant="body2">
                          {new Date(interviewerData.stats.lastInterviewDate).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No interviews yet
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleViewInterviewer(interviewerData.profile._id)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {interviewers.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No interviewers found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
