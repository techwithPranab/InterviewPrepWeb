'use client';

import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  Skeleton,
  Pagination,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';

interface InterviewGuide {
  _id: string;
  title: string;
  description: string;
  domain: string;
  technology: string;
  difficulty: string;
  questionCount: number;
  views: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
  publishedDate: string;
}

export default function InterviewGuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<InterviewGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    domain: '',
    technology: '',
    difficulty: '',
    search: '',
  });

  const [availableFilters, setAvailableFilters] = useState<{
    domains: string[];
    technologies: string[];
  }>({
    domains: [],
    technologies: [],
  });

  useEffect(() => {
    fetchGuides();
  }, [page, filters]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filters.domain && { domain: filters.domain }),
        ...(filters.technology && { technology: filters.technology }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/interview-guides?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch interview guides');
      }

      const data = await response.json();
      setGuides(data.guides);
      setTotalPages(data.pagination.pages);
      setAvailableFilters(data.filters);
      setError('');
    } catch (err) {
      setError('Failed to load interview guides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'info';
      case 'advanced': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}
        >
          Interview Preparation Guides
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary" 
          paragraph
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          Master technical interviews with our comprehensive guides covering various technologies
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <TextField
              fullWidth
              placeholder="Search guides..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
            <FormControl fullWidth>
              <InputLabel>Domain</InputLabel>
              <Select
                value={filters.domain}
                label="Domain"
                onChange={(e) => handleFilterChange('domain', e.target.value)}
              >
                <MenuItem value="">All Domains</MenuItem>
                {availableFilters.domains.map((domain) => (
                  <MenuItem key={domain} value={domain}>
                    {domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
            <FormControl fullWidth>
              <InputLabel>Technology</InputLabel>
              <Select
                value={filters.technology}
                label="Technology"
                onChange={(e) => handleFilterChange('technology', e.target.value)}
              >
                <MenuItem value="">All Technologies</MenuItem>
                {availableFilters.technologies.map((tech) => (
                  <MenuItem key={tech} value={tech}>
                    {tech}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
            <FormControl fullWidth>
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
        </Box>
      </Paper>

      {/* Guides Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
            <Box sx={{ flex: '1 1 350px', minWidth: '300px' }} key={`skeleton-${key}`}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : guides.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            No interview guides found matching your criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {guides.map((guide) => (
              <Box sx={{ flex: '1 1 350px', minWidth: '300px' }} key={guide._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={guide.difficulty}
                        size="small"
                        color={getDifficultyColor(guide.difficulty) as any}
                      />
                      <Chip
                        label={guide.domain}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom 
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
                    >
                      {guide.title}
                    </Typography>

                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      paragraph
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
                    >
                      {guide.description.length > 120
                        ? `${guide.description.substring(0, 120)}...`
                        : guide.description}
                    </Typography>

                    <Chip
                      label={guide.technology}
                      size="small"
                      color="primary"
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewIcon fontSize="small" color="action" />
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {guide.views} views
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ThumbUpIcon fontSize="small" color="action" />
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {guide.upvotes} upvotes
                        </Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {guide.questionCount} questions
                      </Typography>
                    </Box>

                    {guide.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                        {guide.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push(`/interview-guides/${guide._id}`)}
                    >
                      View Guide
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
