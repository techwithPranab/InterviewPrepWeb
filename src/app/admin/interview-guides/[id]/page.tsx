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
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
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
  
  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
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

  // Upload Modal State
  interface ValidationError {
    row: number;
    field: string;
    message: string;
  }
  
  interface ParsedQuestion extends Question {
    rowNumber: number;
    isValid: boolean;
    errors: string[];
  }

  const [uploadModal, setUploadModal] = useState({
    open: false,
    isDragging: false,
    file: null as File | null,
    parsedData: [] as ParsedQuestion[],
    validationErrors: [] as ValidationError[],
    isProcessing: false,
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

  const handleDownloadExcel = () => {
    if (formData.questions.length === 0) {
      setError('No questions to download');
      return;
    }

    // Prepare data for CSV
    const csvData = formData.questions.map((question) => ({
      'Order': question.order,
      'Question': `"${question.question.replaceAll('"', '""')}"`,
      'Answer': `"${question.answer.replaceAll('"', '""')}"`,
      'Category': question.category,
      'Tags': question.tags.join(', '),
      'Code Example': question.codeExample ? `"${question.codeExample.replaceAll('"', '""')}"` : '',
      'References': question.references?.join(', ') || '',
    }));

    // Create CSV header
    const headers = ['Order', 'Question', 'Answer', 'Category', 'Tags', 'Code Example', 'References'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const filename = `${formData.title.replaceAll(/[^a-z0-9]/gi, '_').toLowerCase()}_questions.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSuccess('Questions downloaded successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownloadTemplate = () => {
    // Create template data with sample questions
    const templateData = [
      {
        'Order': 1,
        'Question': '"Sample Question: Explain what a closure is in JavaScript"',
        'Answer': '"A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. This allows the function to ""remember"" the environment in which it was created."',
        'Category': 'Concept',
        'Tags': 'javascript, closures, scope',
        'Code Example': '"function outerFunction() {\n  const outerVariable = ""I am from outer scope"";\n  \n  return function innerFunction() {\n    console.log(outerVariable); // Can access outerVariable\n  };\n}"',
        'References': 'MDN Web Docs, JavaScript.info',
      },
      {
        'Order': 2,
        'Question': '"Sample Question: What is the difference between let and var?"',
        'Answer': '"let is block-scoped while var is function-scoped. let variables are not hoisted to the top of their block, while var variables are hoisted."',
        'Category': 'Syntax',
        'Tags': 'javascript, variables, es6',
        'Code Example': '',
        'References': 'ES6 Specification',
      },
    ];

    // Create CSV header
    const headers = ['Order', 'Question', 'Answer', 'Category', 'Tags', 'Code Example', 'References'];
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'question_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSuccess('Template downloaded successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setUploadModal(prev => ({
      ...prev,
      open: true,
      file,
      isProcessing: true,
      parsedData: [],
      validationErrors: [],
    }));

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setUploadModal(prev => ({
          ...prev,
          isProcessing: false,
          validationErrors: [{
            row: 0,
            field: 'File',
            message: 'CSV file must have at least a header row and one data row',
          }],
        }));
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());

      // Validate required headers
      const requiredHeaders = ['Question', 'Answer', 'Category'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        setUploadModal(prev => ({
          ...prev,
          isProcessing: false,
          validationErrors: [{
            row: 0,
            field: 'Headers',
            message: `Missing required columns: ${missingHeaders.join(', ')}`,
          }],
        }));
        return;
      }

      // Parse data rows
      const parsedQuestions: ParsedQuestion[] = [];
      const errors: ValidationError[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // CSV parsing (handles quoted fields with commas)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char === '"') {
            if (inQuotes && line[j + 1] === '"') {
              current += '"';
              j++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            values.push(current.replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.replace(/^"|"$/g, ''));

        while (values.length < headers.length) {
          values.push('');
        }

        // Create question object
        const questionValue = values[headers.indexOf('Question')] || '';
        const answerValue = values[headers.indexOf('Answer')] || '';
        const categoryValue = values[headers.indexOf('Category')] || '';
        
        const question: ParsedQuestion = {
          question: questionValue.replace(/\\n/g, '\n'),
          answer: answerValue.replace(/\\n/g, '\n'),
          category: categoryValue,
          tags: values[headers.indexOf('Tags')] ?
            values[headers.indexOf('Tags')].split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
          codeExample: values[headers.indexOf('Code Example')]?.replace(/\\n/g, '\n') || '',
          references: values[headers.indexOf('References')] ?
            values[headers.indexOf('References')].split(',').map((ref: string) => ref.trim()).filter(Boolean) : [],
          order: values[headers.indexOf('Order')] ?
            parseInt(values[headers.indexOf('Order')]) || (formData.questions.length + i - 1) :
            (formData.questions.length + i - 1),
          rowNumber: i + 1,
          isValid: true,
          errors: [],
        };

        // Validation
        if (!question.question.trim()) {
          question.isValid = false;
          question.errors.push('Question is required');
          errors.push({
            row: i + 1,
            field: 'Question',
            message: 'Question field is empty',
          });
        }

        if (!question.answer.trim()) {
          question.isValid = false;
          question.errors.push('Answer is required');
          errors.push({
            row: i + 1,
            field: 'Answer',
            message: 'Answer field is empty',
          });
        }

        if (!question.category.trim()) {
          question.isValid = false;
          question.errors.push('Category is required');
          errors.push({
            row: i + 1,
            field: 'Category',
            message: 'Category field is empty',
          });
        }

        if (question.question.length > 500) {
          question.isValid = false;
          question.errors.push('Question too long (max 500 characters)');
          errors.push({
            row: i + 1,
            field: 'Question',
            message: 'Question exceeds maximum length of 500 characters',
          });
        }

        parsedQuestions.push(question);
      }

      setUploadModal(prev => ({
        ...prev,
        isProcessing: false,
        parsedData: parsedQuestions,
        validationErrors: errors,
      }));

    } catch (err) {
      console.error('Error parsing CSV file:', err);
      setUploadModal(prev => ({
        ...prev,
        isProcessing: false,
        validationErrors: [{
          row: 0,
          field: 'File',
          message: 'Failed to parse CSV file. Please check the format.',
        }],
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadModal(prev => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadModal(prev => ({ ...prev, isDragging: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadModal(prev => ({ ...prev, isDragging: false }));
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleConfirmUpload = () => {
    const validQuestions = uploadModal.parsedData.filter(q => q.isValid);
    
    if (validQuestions.length === 0) {
      setError('No valid questions to import');
      return;
    }

    // Remove validation metadata before adding to form
    const cleanedQuestions: Question[] = validQuestions.map(({ rowNumber, isValid, errors, ...rest }) => rest);

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ...cleanedQuestions],
    }));

    setSuccess(`${validQuestions.length} questions imported successfully`);
    setTimeout(() => setSuccess(''), 3000);

    setUploadModal({
      open: false,
      isDragging: false,
      file: null,
      parsedData: [],
      validationErrors: [],
      isProcessing: false,
    });
  };

  const handleCancelUpload = () => {
    setUploadModal({
      open: false,
      isDragging: false,
      file: null,
      parsedData: [],
      validationErrors: [],
      isProcessing: false,
    });
  };

  // Filter and paginate questions
  const filteredQuestions = formData.questions.filter(question =>
    question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + questionsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

            <FormControl fullWidth>
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
          </Box>

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
              <Typography variant="h6">Questions ({filteredQuestions.length})</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadExcel}
                  disabled={formData.questions.length === 0}
                >
                  Download CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                >
                  Download Template
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadModal(prev => ({ ...prev, open: true }))}
                >
                  Upload CSV
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openQuestionDialog('add')}
                >
                  Add Question
                </Button>
              </Box>
            </Box>

            <TextField
              fullWidth
              placeholder="Search questions, answers, categories, or tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <List>
              {paginatedQuestions.map((question, index) => (
                <ListItem key={`${question.question}-${startIndex + index}`} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={`${startIndex + index + 1}. ${question.question}`}
                    secondary={`Category: ${question.category} | Tags: ${question.tags.join(', ')}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => openQuestionDialog('edit', formData.questions.indexOf(question))}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDeleteQuestion(formData.questions.indexOf(question))} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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

      {/* Upload CSV Modal */}
      <Dialog 
        open={uploadModal.open} 
        onClose={handleCancelUpload}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload Questions CSV
        </DialogTitle>
        <DialogContent>
          {!uploadModal.file ? (
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: uploadModal.isDragging ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: uploadModal.isDragging ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag and drop your CSV file here
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ mt: 2 }}
              >
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Accepted format: CSV with columns - Order, Question, Answer, Category, Tags, Code Example, References
              </Typography>
            </Box>
          ) : uploadModal.isProcessing ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Processing file...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validating {uploadModal.file.name}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  File: {uploadModal.file.name}
                </Typography>
                <Typography variant="body2">
                  Total rows: {uploadModal.parsedData.length} | 
                  Valid: {uploadModal.parsedData.filter(q => q.isValid).length} | 
                  Invalid: {uploadModal.validationErrors.length}
                </Typography>
              </Alert>

              {uploadModal.validationErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Validation Errors:
                  </Typography>
                  <List dense>
                    {uploadModal.validationErrors.slice(0, 10).map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`Row ${error.row}: ${error.field}`}
                          secondary={error.message}
                        />
                      </ListItem>
                    ))}
                    {uploadModal.validationErrors.length > 10 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {uploadModal.validationErrors.length - 10} more errors
                      </Typography>
                    )}
                  </List>
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preview:
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                  {uploadModal.parsedData.map((question, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: question.isValid ? 'success.light' : 'error.light',
                        backgroundColor: question.isValid ? 'success.lighter' : 'error.lighter',
                        mb: 1,
                        borderRadius: 1,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                        <Chip
                          label={question.isValid ? 'Valid' : 'Invalid'}
                          color={question.isValid ? 'success' : 'error'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Row {question.rowNumber}
                        </Typography>
                      </Box>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: question.isValid ? 'normal' : 'bold',
                              color: question.isValid ? 'text.primary' : 'error.main',
                            }}
                          >
                            Q: {question.question || '(empty)'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Category: {question.category || '(empty)'} | 
                              Tags: {question.tags.join(', ') || '(none)'}
                            </Typography>
                            {!question.isValid && (
                              <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                                Errors: {question.errors.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload}>
            Cancel
          </Button>
          {uploadModal.parsedData.length > 0 && (
            <Button
              onClick={handleConfirmUpload}
              variant="contained"
              disabled={uploadModal.parsedData.filter(q => q.isValid).length === 0}
            >
              Import {uploadModal.parsedData.filter(q => q.isValid).length} Valid Questions
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
