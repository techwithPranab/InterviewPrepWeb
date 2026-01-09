'use client';

import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType: string;
  variables: string[];
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [smtpVerifyDialogOpen, setSmtpVerifyDialogOpen] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterType !== 'all') {
        params.templateType = filterType;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/email-templates', { params });
      
      if (response.success && response.data) {
        setTemplates(response.data);
        setError('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTemplates();
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await api.delete(`/email-templates/${selectedTemplate._id}`);
      
      if (response.success) {
        setSuccess('Template deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedTemplate(null);
        fetchTemplates();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const response = await api.put(`/email-templates/${template._id}`, {
        isActive: !template.isActive,
      });
      
      if (response.success) {
        setSuccess(`Template ${template.isActive ? 'deactivated' : 'activated'} successfully`);
        fetchTemplates();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const response = await api.post('/email-templates/test/send', {
        testEmail,
      });
      
      if (response.success) {
        setSuccess('Test email sent successfully! Check your inbox.');
        setTestEmailDialogOpen(false);
        setTestEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send test email');
    }
  };

  const handleVerifySMTP = async () => {
    try {
      setSmtpStatus(null);
      const response = await api.post('/email-templates/smtp/verify');
      
      if (response.success) {
        setSmtpStatus({
          success: true,
          message: response.message,
          smtpHost: response.data?.smtpHost,
          smtpPort: response.data?.smtpPort,
        });
      } else {
        setSmtpStatus({
          success: false,
          message: response.message,
        });
      }
      setSmtpVerifyDialogOpen(true);
    } catch (err: any) {
      setSmtpStatus({
        success: false,
        message: err.message || 'Failed to verify SMTP connection',
      });
      setSmtpVerifyDialogOpen(true);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📧 Email Templates</h1>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={() => setTestEmailDialogOpen(true)}
          >
            Test Email
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleVerifySMTP}
          >
            Verify SMTP
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/admin/email-templates/new')}
          >
            Create Template
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex gap-4">
            <TextField
              fullWidth
              label="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Template Type</InputLabel>
              <Select
                value={filterType}
                label="Template Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                <MenuItem value="interview_reminder">Interview Reminder</MenuItem>
                <MenuItem value="interview_confirmation">Interview Confirmation</MenuItem>
                <MenuItem value="interview_cancelled">Interview Cancelled</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500">No email templates found</p>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/admin/email-templates/new')}
                className="mt-4"
              >
                Create Your First Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <Chip
                        label={template.templateType.replace('_', ' ')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {template.isActive ? (
                        <Chip label="Active" size="small" color="success" />
                      ) : (
                        <Chip label="Inactive" size="small" color="default" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Subject:</strong> {template.subject}
                    </p>
                    
                    {template.description && (
                      <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((variable) => (
                        <Chip
                          key={variable}
                          label={`{{${variable}}}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={template.isActive}
                          onChange={() => handleToggleActive(template)}
                          size="small"
                        />
                      }
                      label=""
                    />
                    
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => router.push(`/admin/email-templates/${template._id}`)}
                      title="View/Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Email Template</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the template &quot;{selectedTemplate?.name}&quot;?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={() => setTestEmailDialogOpen(false)}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            margin="normal"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            A test email will be sent to verify your email configuration.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendTestEmail}
            color="primary"
            variant="contained"
            disabled={!testEmail}
          >
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* SMTP Verification Dialog */}
      <Dialog open={smtpVerifyDialogOpen} onClose={() => setSmtpVerifyDialogOpen(false)}>
        <DialogTitle>SMTP Connection Status</DialogTitle>
        <DialogContent>
          {smtpStatus ? (
            <div>
              <Alert
                severity={smtpStatus.success ? 'success' : 'error'}
                className="mb-4"
              >
                {smtpStatus.message}
              </Alert>
              {smtpStatus.success && (
                <div className="text-sm text-gray-600">
                  <p><strong>SMTP Host:</strong> {smtpStatus.smtpHost}</p>
                  <p><strong>SMTP Port:</strong> {smtpStatus.smtpPort}</p>
                  <p><strong>Authentication:</strong> Username/Password</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CircularProgress size={20} />
              <span>Verifying SMTP connection...</span>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmtpVerifyDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
