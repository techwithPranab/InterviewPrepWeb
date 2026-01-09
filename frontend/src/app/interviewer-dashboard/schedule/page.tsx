'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  InputAdornment,
  Chip,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '@/lib/api';

interface Skill {
  _id: string;
  name: string;
  category: string;
}

interface FormData {
  title: string; // Salutation: Mr, Mrs, Ms, Dr, etc.
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  skills: string[];
  scheduledAt: dayjs.Dayjs;
  duration: string;
  resume?: File | null;
  notes: string;
}

export default function SchedulePage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    skills: [],
    scheduledAt: dayjs().add(1, 'day'),
    duration: '60',
    resume: null,
    notes: '',
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchAvailableSkills();
  }, [router]);

  const fetchAvailableSkills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/skills');

      if (response.success) {
        setAvailableSkills(response.data || []);
      } else {
        setError('Failed to load skills');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume file size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError('Resume must be PDF or Word document');
        return;
      }
      setFormData((prev) => ({ ...prev, resume: file }));
      setResumeFileName(file.name);
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Mx'].includes(formData.title)) {
      setError('Please select a valid title');
      return false;
    }
    if (!formData.candidateName.trim()) {
      setError('Candidate name is required');
      return false;
    }
    if (!formData.candidateEmail.trim()) {
      setError('Candidate email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.candidateEmail)) {
      setError('Invalid email format');
      return false;
    }
    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      return false;
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      setError('Duration must be greater than 0');
      return false;
    }
    if (formData.scheduledAt.isBefore(dayjs())) {
      setError('Scheduled date must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare form data for multipart/form-data
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('candidateName', formData.candidateName);
      submitData.append('candidateEmail', formData.candidateEmail);
      submitData.append('skills', JSON.stringify(formData.skills));
      submitData.append('scheduledAt', formData.scheduledAt.toISOString());
      submitData.append('duration', formData.duration);
      submitData.append('notes', formData.notes);
      
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      }

      const result = await api.uploadFormData('/scheduled-interviews', submitData);

      if (!result.success) {
        throw new Error(result.message || 'Failed to schedule interview');
      }
      
      setSuccess('Interview scheduled successfully! Email has been sent to the candidate.');
      
      // Reset form
      setFormData({
        title: '',
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        skills: [],
        scheduledAt: dayjs().add(1, 'day'),
        duration: '60',
        resume: null,
        notes: '',
      });
      setResumeFileName('');

      // Redirect to interviews list after 2 seconds
      setTimeout(() => {
        router.push('/interviewer-dashboard/interviews');
      }, 2000);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl flex justify-center items-center min-h-96">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📅 Schedule Interview</h1>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Candidate Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Candidate Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  select
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  variant="outlined"
                  required
                >
                  <MenuItem value="">Select Title</MenuItem>
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                  <MenuItem value="Prof">Prof</MenuItem>
                  <MenuItem value="Mx">Mx</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Candidate Name"
                  value={formData.candidateName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      candidateName: e.target.value,
                    }))
                  }
                  placeholder="e.g., John Doe"
                  variant="outlined"
                />
              </div>

              {/* Candidate Phone */}
              <div className="flex-1">
                <FormLabel sx={{ mb: 1, color: 'text.primary', fontWeight: 500 }}>
                  Phone Number (Optional)
                </FormLabel>
                <TextField
                  fullWidth
                  value={formData.candidatePhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, candidatePhone: e.target.value }))
                  }
                  placeholder="e.g., +1234567890"
                  variant="outlined"
                />
              </div>

              <TextField
                fullWidth
                label="Candidate Email"
                type="email"
                value={formData.candidateEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    candidateEmail: e.target.value,
                  }))
                }
                placeholder="e.g., john@example.com"
                variant="outlined"
              />
            </div>

            {/* Skills Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Skills</h2>
              
              <Autocomplete
                multiple
                fullWidth
                options={availableSkills}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  return option.name;
                }}
                value={formData.skills
                  .map((skillName) => {
                    const skill = availableSkills.find((s) => s.name === skillName);
                    return skill || { _id: '', name: skillName, category: '' };
                  })
                  .filter((skill) => skill.name)}
                onChange={(event, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    skills: value.map((item) => item.name),
                  }));
                }}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search and select skills..."
                    variant="outlined"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...rest } = props;
                  return (
                    <Box
                      key={option._id}
                      component="li"
                      {...rest}
                      className="flex items-center justify-between p-2 hover:bg-gray-100"
                    >
                      <span className="font-medium">{option.name}</span>
                      <span className="text-xs text-gray-500">({option.category})</span>
                    </Box>
                  );
                }}
                renderTags={(value, getTagProps) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option.name}
                          size="small"
                          {...tagProps}
                          sx={{
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontWeight: '500',
                            '& .MuiChip-deleteIcon': {
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                color: 'white',
                              },
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              />

              {formData.skills.length === 0 && (
                <FormHelperText sx={{ color: '#d32f2f', marginTop: '8px' }}>
                  Please select at least one skill
                </FormHelperText>
              )}

              {formData.skills.length > 0 && (
                <FormHelperText sx={{ color: '#2e7d32', marginTop: '8px' }}>
                  ✓ {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
                </FormHelperText>
              )}
            </div>

            {/* Interview Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Interview Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Schedule Date & Time"
                    value={formData.scheduledAt}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledAt: newValue,
                        }));
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                      },
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  inputProps={{ min: '15', step: '15' }}
                  variant="outlined"
                />
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Upload</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <label htmlFor="resume" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload resume or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC or DOCX (max 5MB)
                    </p>
                  </div>
                </label>
              </div>

              {resumeFileName && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 16.5a1 1 0 01-1-1V4a1 1 0 112 0v11.5a1 1 0 01-1 1zm3-11a1 1 0 10-2 0v5.757L7.757 9.171a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 10.757V5.5a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{resumeFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, resume: null }));
                      setResumeFileName('');
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <TextField
                fullWidth
                label="Notes for the candidate (optional)"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add any additional information or instructions for the candidate..."
                variant="outlined"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outlined"
                onClick={() => router.push('/interviewer-dashboard/interviews')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #663a91 100%)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #ccc 0%, #aaa 100%)',
                  },
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Interview'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
