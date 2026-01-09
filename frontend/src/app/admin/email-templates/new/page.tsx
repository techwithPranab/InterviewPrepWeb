'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }) as any;
import 'react-quill/dist/quill.snow.css';

const TEMPLATE_TYPES = [
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_reminder', label: 'Interview Reminder' },
  { value: 'interview_confirmation', label: 'Interview Confirmation' },
  { value: 'interview_cancelled', label: 'Interview Cancelled' },
  { value: 'custom', label: 'Custom' },
];

const COMMON_VARIABLES = [
  'candidateName',
  'candidateEmail',
  'interviewerName',
  'interviewerEmail',
  'interviewDate',
  'interviewTime',
  'meetingLink',
  'skillsToAssess',
  'interviewDuration',
  'reason',
  'companyName',
];

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    templateType: 'custom',
    htmlContent: '',
    textContent: '',
    variables: [] as string[],
    isActive: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVariable = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable],
      }));
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable),
    }));
  };

  const insertVariable = (variable: string) => {
    const variablePlaceholder = `{{${variable}}}`;
    setFormData(prev => ({
      ...prev,
      htmlContent: prev.htmlContent + ' ' + variablePlaceholder,
    }));
    handleAddVariable(variable);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/email-templates', formData);
      
      if (response.success) {
        setSuccess('Email template created successfully!');
        setTimeout(() => {
          router.push('/admin/email-templates');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create email template');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/email-templates')}
          className="mb-4"
        >
          Back to Templates
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create Email Template</h1>
      </div>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                fullWidth
                required
                label="Template Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Interview Scheduled Email"
              />
              
              <FormControl fullWidth required>
                <InputLabel>Template Type</InputLabel>
                <Select
                  value={formData.templateType}
                  label="Template Type"
                  onChange={(e) => handleChange('templateType', e.target.value)}
                >
                  {TEMPLATE_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <TextField
              fullWidth
              required
              label="Email Subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="e.g., Your Interview is Scheduled - {{interviewDate}}"
              className="mb-4"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of when this template is used"
            />
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Email Content</h2>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                HTML Content *
              </label>
              <ReactQuill
                theme="snow"
                value={formData.htmlContent}
                onChange={(content: string) => handleChange('htmlContent', content)}
                modules={modules}
                className="h-64 mb-12"
              />
            </div>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Plain Text Content (Optional)"
              value={formData.textContent}
              onChange={(e) => handleChange('textContent', e.target.value)}
              placeholder="Plain text version for email clients that don't support HTML"
              helperText="If not provided, HTML content will be converted to plain text automatically"
            />
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Variables</h2>
            
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">
                Click to insert variables into your template. Use format: {`{{variableName}}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_VARIABLES.map(variable => (
                  <Button
                    key={variable}
                    size="small"
                    variant="outlined"
                    onClick={() => insertVariable(variable)}
                  >
                    + {variable}
                  </Button>
                ))}
              </div>
            </div>

            {formData.variables.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Variables used in this template:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map(variable => (
                    <Chip
                      key={variable}
                      label={`{{${variable}}}`}
                      onDelete={() => handleRemoveVariable(variable)}
                      size="small"
                      color="primary"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Create Template'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => router.push('/admin/email-templates')}
            disabled={loading}
            size="large"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
