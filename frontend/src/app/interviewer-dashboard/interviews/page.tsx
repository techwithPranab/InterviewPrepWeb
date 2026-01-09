'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '@/lib/api';

dayjs.extend(relativeTime);

interface ScheduledInterview {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  skills: string[];
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  resumeUrl?: string;
  registrationLink?: string;
  meetingLink?: string;
}

const statusColors: Record<string, 'error' | 'warning' | 'success' | 'info'> = {
  scheduled: 'info',
  confirmed: 'warning',
  completed: 'success',
  cancelled: 'error',
};export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState<ScheduledInterview | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  const handleDownloadResume = async (resumeUrl: string) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'resume.pdf'; // Default filename
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download resume:', error);
      // Fallback: open in new tab
      window.open(resumeUrl, '_blank');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchInterviews();
  }, [router, statusFilter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string> = {
        sortBy: 'scheduledAt',
        sortOrder: 'desc'
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/interviewers/scheduled-interviews', { params });
      console.log('Fetch Interviews Response:', response);  
      if (response.success) {
        setInterviews(response.interviews || []);
      } else {
        throw new Error(response.message || 'Failed to fetch interviews');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (interview: ScheduledInterview) => {
    setSelectedInterview(interview);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInterview(null);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl flex justify-center items-center min-h-96">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📋 My Interviews</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/interviewer-dashboard/schedule')}
        >
          + Schedule New Interview
        </Button>
      </div>

      {error && <Alert severity="error" className="mb-6">{error}</Alert>}

      {/* Status Filter */}
      <div className="mb-6 flex gap-2">
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter(status)}
            size="small"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-base font-semibold text-gray-900 mb-2">No Interviews Yet</h2>
              <p className="text-sm text-gray-600">
                {statusFilter === 'all'
                  ? 'You haven\'t created any interviews yet. Create one to get started!'
                  : `No ${statusFilter} interviews found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((interview) => (
            <Card key={interview._id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {interview.candidateName}
                      </h3>
                      <Chip
                        label={interview.status}
                        color={statusColors[interview.status]}
                        size="small"
                        variant="outlined"
                      />
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Email:</strong> {interview.candidateEmail}
                    </p>

                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Scheduled:</strong> {dayjs(interview.scheduledAt).format('MMM DD, YYYY HH:mm A')} ({dayjs(interview.scheduledAt).fromNow()})
                    </p>

                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Duration:</strong> {interview.duration} minutes
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {interview.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: '#667eea',
                            color: 'white',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewDetails(interview)}
                    >
                      View Details
                    </Button>
                    {interview.meetingLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={interview.meetingLink}
                        target="_blank"
                      >
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Interview Details</DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Box className="space-y-4 mt-4">
              <div>
                <strong>Candidate:</strong>
                <p>{selectedInterview.candidateName}</p>
              </div>

              <div>
                <strong>Email:</strong>
                <p>{selectedInterview.candidateEmail}</p>
              </div>

              <div>
                <strong>Scheduled Date & Time:</strong>
                <p>{dayjs(selectedInterview.scheduledAt).format('MMMM DD, YYYY HH:mm A')}</p>
              </div>

              <div>
                <strong>Duration:</strong>
                <p>{selectedInterview.duration} minutes</p>
              </div>

              <div>
                <strong>Status:</strong>
                <div className="mt-2">
                  <Chip
                    label={selectedInterview.status}
                    color={statusColors[selectedInterview.status]}
                    size="small"
                    variant="outlined"
                  />
                </div>
              </div>

              <div>
                <strong>Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedInterview.skills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                </div>
              </div>

              {selectedInterview.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="text-gray-600">{selectedInterview.notes}</p>
                </div>
              )}

              {selectedInterview.resumeUrl && (
                <div>
                  <strong>Resume:</strong>
                  <Button
                    size="small"
                    onClick={() => handleDownloadResume(selectedInterview.resumeUrl!)}
                    sx={{ mt: 1 }}
                  >
                    Download Resume
                  </Button>
                </div>
              )}

              {selectedInterview.registrationLink && (
                <div>
                  <strong>Registration Link:</strong>
                  <TextField
                    fullWidth
                    size="small"
                    value={selectedInterview.registrationLink}
                    inputProps={{ readOnly: true }}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                      navigator.clipboard.writeText(selectedInterview.registrationLink || '');
                    }}
                  />
                </div>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
