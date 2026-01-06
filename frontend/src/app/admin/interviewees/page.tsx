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
  completedAt?: string;
  overallEvaluation?: {
    overallScore: number;
    summary: string;
    performanceBySkill: { [key: string]: number };
    criteriaBreakdown: {
      technical_accuracy: number;
      communication: number;
      problem_solving: number;
      confidence: number;
    };
  };
}

interface IntervieweeData {
  profile: IntervieweeProfile;
  sessions: InterviewSession[];
  stats: {
    totalInterviews: number;
    averageScore: number;
    completedInterviews: number;
    lastInterviewDate?: string;
    improvementTrend: 'up' | 'down' | 'stable';
  };
}

export default function AdminIntervieweesPage() {
  const router = useRouter();
  const [interviewees, setInterviewees] = useState<IntervieweeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchInterviewees();
    fetchAvailableSkills();
  }, [page, searchQuery, skillFilter, statusFilter, experienceFilter]);

  const fetchInterviewees = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(skillFilter && { skill: skillFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(experienceFilter !== 'all' && { experience: experienceFilter }),
      });

      const response = await api.get(`/admin/interviewees?${queryParams}`);

      if (response.success) {
        setInterviewees(response.data?.interviewees || []);
        setTotalPages(response.data?.pagination?.pages || 1);
      } else {
        setError(response.message || 'Failed to fetch interviewees');
      }
    } catch (err) {
      console.error('Error fetching interviewees:', err);
      setError('Failed to fetch interviewees');
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

  const handleViewDetails = (intervieweeId: string) => {
    router.push(`/admin/interviewees/${intervieweeId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <StarIcon color="action" />;
    }
  };

  const filteredInterviewees = interviewees;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          Interviewees Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage all candidates who have participated in interviews
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Skill</InputLabel>
              <Select
                value={skillFilter}
                label="Skill"
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <MenuItem value="">All Skills</MenuItem>
                {availableSkills.map((skill) => (
                  <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Experience</InputLabel>
              <Select
                value={experienceFilter}
                label="Experience"
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <MenuItem value="all">All Experience</MenuItem>
                <MenuItem value="fresher">Fresher</MenuItem>
                <MenuItem value="1-3">1-3 Years</MenuItem>
                <MenuItem value="3-5">3-5 Years</MenuItem>
                <MenuItem value="5-10">5-10 Years</MenuItem>
                <MenuItem value="10+">10+ Years</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchQuery('');
                setSkillFilter('');
                setStatusFilter('all');
                setExperienceFilter('all');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{filteredInterviewees.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Interviewees</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {filteredInterviewees.reduce((acc, curr) => acc + curr.stats.completedInterviews, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Completed Interviews</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <StarIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {filteredInterviewees.length > 0 
                    ? Math.round(filteredInterviewees.reduce((acc, curr) => acc + curr.stats.averageScore, 0) / filteredInterviewees.length)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Average Score</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <SkillIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{availableSkills.length}</Typography>
                <Typography variant="body2" color="text.secondary">Skills Tracked</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Interviewees Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Loading interviewees...
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Interviewee</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell align="center">Interviews</TableCell>
                    <TableCell align="center">Avg Score</TableCell>
                    <TableCell align="center">Trend</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInterviewees.map((interviewee) => (
                    <TableRow key={interviewee.profile._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {interviewee.profile.firstName[0]}{interviewee.profile.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {interviewee.profile.firstName} {interviewee.profile.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {interviewee.profile.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {getExperienceLabel(interviewee.profile.profile.experience)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                          {interviewee.profile.profile.skills.slice(0, 3).map((skill) => (
                            <Chip key={skill} label={skill} size="small" variant="outlined" />
                          ))}
                          {interviewee.profile.profile.skills.length > 3 && (
                            <Chip 
                              label={`+${interviewee.profile.profile.skills.length - 3}`} 
                              size="small" 
                              color="primary" 
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Badge badgeContent={interviewee.stats.completedInterviews} color="primary">
                          <AssessmentIcon />
                        </Badge>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={`${Math.round(interviewee.stats.averageScore)}%`}
                          color={getScoreColor(interviewee.stats.averageScore)}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title={`Performance trend: ${interviewee.stats.improvementTrend}`}>
                          {getTrendIcon(interviewee.stats.improvementTrend)}
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={interviewee.profile.isActive ? 'Active' : 'Inactive'}
                          color={interviewee.profile.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => handleViewDetails(interviewee.profile._id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredInterviewees.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No interviewees found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
}
