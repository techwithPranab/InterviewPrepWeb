'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Paper,
  Alert,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

interface Question {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  codeExample?: string;
  references?: string[];
  order: number;
}

interface GuideForm {
  title: string;
  description: string;
  domain: string;
  technology: string;
  difficulty: string;
  tags: string[];
  isPublished: boolean;
  questions: Question[];
}

export default function AdminGuideEditorPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params?.id as string | undefined;
  const isEditMode = guideId && guideId !== 'create';

  const [formData, setFormData] = useState<GuideForm>({
    title: '',
    description: '',
    domain: '',
    technology: '',
    difficulty: 'beginner',
    tags: [],
    isPublished: false,
    questions: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Question Dialog
  const [questionDialog, setQuestionDialog] = useState({
    open: false,
    mode: 'add' as 'add' | 'edit',
    questionIndex: -1,
    data: {
      question: '',
      answer: '',
      category: '',
      tags: [] as string[],
      codeExample: '',
      references: [] as string[],
      order: 0,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchGuide();
    }
  }, [isEditMode]);

  const fetchGuide = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/interview-guides/${guideId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch guide');

      const data = await response.json();
      setFormData({
        title: data.guide.title,
        description: data.guide.description,
        domain: data.guide.domain,
        technology: data.guide.technology,
        difficulty: data.guide.difficulty,
        tags: data.guide.tags || [],
        isPublished: data.guide.isPublished,
        questions: data.guide.questions || [],
      });
    } catch (err) {
      setError('Failed to load guide');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode
        ? `/api/admin/interview-guides/${guideId}`
        : '/api/admin/interview-guides';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save guide');

      const data = await response.json();
      setSuccess(isEditMode ? 'Guide updated successfully' : 'Guide created successfully');
      
      setTimeout(() => {
        router.push('/admin/interview-guides');
      }, 1500);
    } catch (err) {
      setError('Failed to save guide');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete),
    }));
  };

  const openQuestionDialog = (mode: 'add' | 'edit', index: number = -1) => {
    if (mode === 'edit' && index >= 0) {
      const question = formData.questions[index];
      setQuestionDialog({
        open: true,
        mode,
        questionIndex: index,
        data: {
          question: question.question,
          answer: question.answer,
          category: question.category,
          tags: [...question.tags],
          codeExample: question.codeExample || '',
          references: question.references || [],
          order: question.order,
        },
      });
    } else {
      setQuestionDialog({
        open: true,
        mode: 'add',
        questionIndex: -1,
        data: {
          question: '',
          answer: '',
          category: '',
          tags: [],
          codeExample: '',
          references: [],
          order: formData.questions.length,
        },
      });
    }
  };

  const handleSaveQuestion = () => {
    const newQuestions = [...formData.questions];
    
    if (questionDialog.mode === 'add') {
      newQuestions.push(questionDialog.data);
    } else {
      newQuestions[questionDialog.questionIndex] = questionDialog.data;
    }

    setFormData(prev => ({ ...prev, questions: newQuestions }));
    setQuestionDialog(prev => ({ ...prev, open: false }));
  };

  const handleDeleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/interview-guides')}
          sx={{ mb: 2 }}
        >
          Back to Guides
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Interview Guide' : 'Create Interview Guide'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            required
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Domain *</InputLabel>
              <Select
                value={formData.domain}
                label="Domain *"
                required
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              >
                <MenuItem value="Frontend">Frontend</MenuItem>
                <MenuItem value="Backend">Backend</MenuItem>
                <MenuItem value="DevOps">DevOps</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
                <MenuItem value="Mobile">Mobile</MenuItem>
                <MenuItem value="Cloud">Cloud</MenuItem>
                <MenuItem value="Database">Database</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Technology"
              required
              value={formData.technology}
              onChange={(e) => setFormData(prev => ({ ...prev, technology: e.target.value }))}
              placeholder="e.g., React, Node.js, AWS"
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty *</InputLabel>
            <Select
              value={formData.difficulty}
              label="Difficulty *"
              required
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
              <MenuItem value="expert">Expert</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} variant="outlined">Add</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              />
            }
            label="Published"
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Questions ({formData.questions.length})</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openQuestionDialog('add')}
              >
                Add Question
              </Button>
            </Box>

            <List>
              {formData.questions.map((question, index) => (
                <ListItem key={`${question.question}-${index}`} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={`${index + 1}. ${question.question}`}
                    secondary={`Category: ${question.category} | Tags: ${question.tags.join(', ')}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => openQuestionDialog('edit', index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDeleteQuestion(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => router.push('/admin/interview-guides')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Guide'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Question Dialog */}
      <Dialog
        open={questionDialog.open}
        onClose={() => setQuestionDialog(prev => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {questionDialog.mode === 'add' ? 'Add Question' : 'Edit Question'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question"
            required
            multiline
            rows={2}
            value={questionDialog.data.question}
            onChange={(e) => setQuestionDialog(prev => ({
              ...prev,
              data: { ...prev.data, question: e.target.value }
            }))}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Answer"
            required
            multiline
            rows={4}
            value={questionDialog.data.answer}
            onChange={(e) => setQuestionDialog(prev => ({
              ...prev,
              data: { ...prev.data, answer: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Category"
            required
            value={questionDialog.data.category}
            onChange={(e) => setQuestionDialog(prev => ({
              ...prev,
              data: { ...prev.data, category: e.target.value }
            }))}
            placeholder="e.g., Concept, Practical, Scenario-based"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Code Example (Optional)"
            multiline
            rows={4}
            value={questionDialog.data.codeExample}
            onChange={(e) => setQuestionDialog(prev => ({
              ...prev,
              data: { ...prev.data, codeExample: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Order"
            type="number"
            value={questionDialog.data.order}
            onChange={(e) => setQuestionDialog(prev => ({
              ...prev,
              data: { ...prev.data, order: Number.parseInt(e.target.value) }
            }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialog(prev => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button onClick={handleSaveQuestion} variant="contained">
            Save Question
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
