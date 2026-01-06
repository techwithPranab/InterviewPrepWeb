'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface InterviewGuide {
  _id: string;
  title: string;
  description: string;
  domain: string;
  technology: string;
  difficulty: string;
  questionCount: number;
  isPublished: boolean;
  views: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminInterviewGuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<InterviewGuide[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; guideId: string | null }>({
    open: false,
    guideId: null,
  });
  const [stats, setStats] = useState<{
    total: number;
    published: number;
    views: number;
  } | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    domain: '',
    technology: '',
    difficulty: '',
    isPublished: '',
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'info';
      case 'advanced': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  useEffect(() => {
    fetchGuides();
    fetchStats();
  }, [page, filters]);

  const fetchGuides = async () => {
    try {
      const token = api.getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };

      if (filters.domain) params.domain = filters.domain;
      if (filters.technology) params.technology = filters.technology;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.isPublished) params.isPublished = filters.isPublished;

      const response = await api.get('/admin/interview-guides', { params });

      if (!response.success) {
        if (response.message?.includes('Unauthorized') || response.message?.includes('403')) {
          setError('Unauthorized access. Admin privileges required.');
          return;
        }
        throw new Error(response.message || 'Failed to fetch interview guides');
      }

      setGuides(response.data?.guides || []);
      setTotalPages(response.data?.pagination?.pages || 1);
      setError('');
    } catch (err) {
      setError('Failed to load interview guides');
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = api.getToken();
      
      if (!token) {
        return;
      }

      const response = await api.get('/admin/interview-guides/stats');

      if (!response.success) {
        if (response.message?.includes('Unauthorized') || response.message?.includes('403')) {
          return;
        }
        throw new Error(response.message || 'Failed to fetch stats');
      }

      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.guideId) return;

    try {
      const response = await api.delete(`/admin/interview-guides/${deleteDialog.guideId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete guide');
      }

      setSuccess('Interview guide deleted successfully');
      setDeleteDialog({ open: false, guideId: null });
      fetchGuides();
    } catch (err) {
      setError('Failed to delete interview guide');
      console.error(err);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Interview Guides
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/admin/interview-guides/create')}
        >
          Create New Guide
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Guides
              </Typography>
              <Typography variant="h4">
                {stats?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Published
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats?.published || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Drafts
              </Typography>
              <Typography variant="h4" color="warning.main">
                {(stats?.total || 0) - (stats?.published || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats?.views || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Domain</InputLabel>
              <Select
                value={filters.domain}
                label="Domain"
                onChange={(e) => handleFilterChange('domain', e.target.value)}
              >
                <MenuItem value="">All Domains</MenuItem>
                <MenuItem value="Frontend">Frontend</MenuItem>
                <MenuItem value="Backend">Backend</MenuItem>
                <MenuItem value="DevOps">DevOps</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
                <MenuItem value="Mobile">Mobile</MenuItem>
                <MenuItem value="Cloud">Cloud</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <TextField
              fullWidth
              size="small"
              label="Technology"
              value={filters.technology}
              onChange={(e) => handleFilterChange('technology', e.target.value)}
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                label="Difficulty"
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.isPublished}
                label="Status"
                onChange={(e) => handleFilterChange('isPublished', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Published</MenuItem>
                <MenuItem value="false">Draft</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Technology</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell align="center">Questions</TableCell>
              <TableCell align="center">Views</TableCell>
              <TableCell align="center">Votes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guides.map((guide) => (
              <TableRow key={guide._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {guide.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    by {guide.createdBy?.firstName} {guide.createdBy?.lastName}
                  </Typography>
                </TableCell>
                <TableCell>{guide.domain}</TableCell>
                <TableCell>{guide.technology}</TableCell>
                <TableCell>
                  <Chip
                    label={guide.difficulty}
                    size="small"
                    color={getDifficultyColor(guide.difficulty) as any}
                  />
                </TableCell>
                <TableCell align="center">{guide.questionCount}</TableCell>
                <TableCell align="center">{guide.views}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Chip label={`👍 ${guide.upvotes}`} size="small" />
                    <Chip label={`👎 ${guide.downvotes}`} size="small" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={guide.isPublished ? 'Published' : 'Draft'}
                    size="small"
                    color={guide.isPublished ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/admin/interview-guides/${guide._id}`)}
                    title="View/Edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog({ open: true, guideId: guide._id })}
                    title="Delete"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, guideId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this interview guide? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, guideId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
