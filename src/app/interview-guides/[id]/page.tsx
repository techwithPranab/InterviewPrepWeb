'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

interface Question {
  _id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  codeExample?: string;
  references?: string[];
  order: number;
}

interface InterviewGuide {
  _id: string;
  title: string;
  description: string;
  domain: string;
  technology: string;
  difficulty: string;
  tags: string[];
  questions: Question[];
  views: number;
  upvotes: number;
  downvotes: number;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  publishedDate: string;
}

export default function InterviewGuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string;

  const [guide, setGuide] = useState<InterviewGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteMessage, setVoteMessage] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);

  useEffect(() => {
    if (guideId) {
      fetchGuide();
    }
  }, [guideId]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interview-guides/${guideId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }

      const data = await response.json();
      setGuide(data.guide);
      setError('');
    } catch (err) {
      setError('Failed to load interview guide');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setVoteMessage('Please login to vote');
        return;
      }

      const response = await fetch(`/api/interview-guides/${guideId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      
      if (guide) {
        setGuide({
          ...guide,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
        });
      }

      setVoteMessage('Vote recorded successfully!');
      setTimeout(() => setVoteMessage(''), 3000);
    } catch (err) {
      setVoteMessage('Failed to record vote');
      console.error(err);
    }
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

  const handleAccordionChange = (questionId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedQuestion(isExpanded ? questionId : false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error || !guide) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Guide not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/interview-guides')}
          sx={{ mt: 2 }}
        >
          Back to Guides
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/interview-guides')}
        sx={{ mb: 3 }}
      >
        Back to Guides
      </Button>

      {voteMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {voteMessage}
        </Alert>
      )}

      {/* Guide Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={guide.difficulty}
            color={getDifficultyColor(guide.difficulty) as any}
            size="small"
          />
          <Chip label={guide.domain} variant="outlined" size="small" />
          <Chip label={guide.technology} color="primary" size="small" />
        </Box>

        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
        >
          {guide.title}
        </Typography>

        <Typography 
          variant="body1" 
          color="textSecondary" 
          paragraph 
          sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' } }}
        >
          {guide.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ViewIcon color="action" fontSize="small" />
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
              >
                {guide.views} views
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThumbUpIcon color="action" fontSize="small" />
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
              >
                {guide.upvotes} upvotes
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
            >
              {guide.questions.length} questions
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ThumbUpIcon />}
              onClick={() => handleVote('upvote')}
              size="small"
            >
              Upvote
            </Button>
            <Button
              variant="outlined"
              startIcon={<ThumbDownIcon />}
              onClick={() => handleVote('downvote')}
              size="small"
              color="inherit"
            >
              Downvote
            </Button>
          </Box>
        </Box>

        {guide.tags.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                Tags:
              </Typography>
              {guide.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="caption" color="textSecondary">
          Created by {guide.createdBy.firstName} {guide.createdBy.lastName}
        </Typography>
      </Paper>

      {/* Questions Section */}
      <Typography 
        variant="h5" 
        component="h2" 
        fontWeight="bold" 
        sx={{ 
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' }
        }}
      >
        Questions & Answers
      </Typography>

      {guide.questions.map((question, index) => (
        <Accordion
          key={question._id}
          expanded={expandedQuestion === question._id}
          onChange={handleAccordionChange(question._id)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
              <Typography 
                variant="h6" 
                fontWeight="500"
                sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}
              >
                Q{index + 1}. {question.question}
              </Typography>
              <Chip label={question.category} size="small" color="secondary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Divider sx={{ mb: 2 }} />
            
            <Typography 
              variant="subtitle2" 
              color="primary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
            >
              Answer:
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                whiteSpace: 'pre-wrap',
                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' }
              }}
            >
              {question.answer}
            </Typography>

            {question.codeExample && (
              <Card sx={{ bgcolor: '#f5f5f5', mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CodeIcon fontSize="small" color="primary" />
                    <Typography 
                      variant="subtitle2" 
                      color="primary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
                    >
                      Code Example:
                    </Typography>
                  </Box>
                  <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', overflowX: 'auto' }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {question.codeExample}
                    </pre>
                  </Paper>
                </CardContent>
              </Card>
            )}

            {question.references && question.references.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                >
                  References:
                </Typography>
                <ul>
                  {question.references.map((ref, idx) => (
                    <li key={idx}>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' } }}
                      >
                        {ref}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            {question.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                {question.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {guide.questions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No questions available yet.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
