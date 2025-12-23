'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Send as SendIcon
} from '@mui/icons-material';

interface UserNeedingReminder {
  id: string;
  name: string;
  email: string;
  lastInterview: string;
  daysSinceLastInterview: number;
}

interface ReminderResults {
  totalUsersChecked: number;
  remindersSent: number;
  failed: number;
  maxReminders: number;
}

export default function NotificationsAdmin() {
  const [usersNeedingReminders, setUsersNeedingReminders] = useState<UserNeedingReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [daysThreshold, setDaysThreshold] = useState(7);
  const [maxReminders, setMaxReminders] = useState(50);
  const [results, setResults] = useState<ReminderResults | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsersNeedingReminders();
  }, [daysThreshold]);

  const fetchUsersNeedingReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/reminders?days=${daysThreshold}`);
      if (response.ok) {
        const data = await response.json();
        setUsersNeedingReminders(data.usersNeedingReminders);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  const sendReminders = async () => {
    setSending(true);
    setConfirmDialog(false);

    try {
      const response = await fetch('/api/notifications/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daysSinceLastInterview: daysThreshold,
          maxReminders: maxReminders
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setSnackbar({
          open: true,
          message: `Successfully sent ${data.results.remindersSent} reminder emails!`,
          severity: 'success'
        });
        // Refresh the list
        fetchUsersNeedingReminders();
      } else {
        throw new Error('Failed to send reminders');
      }
    } catch (error) {
      console.error('Failed to send reminders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send reminder emails. Please try again.',
        severity: 'error'
      });
    }
    setSending(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon />
        Email Notifications
      </Typography>

      {/* Stats Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, flex: '1 1 300px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h6">Users Needing Reminders</Typography>
          </Box>
          <Typography variant="h3" color="primary">
            {loading ? <CircularProgress size={30} /> : usersNeedingReminders.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Haven't interviewed in {daysThreshold}+ days
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, flex: '1 1 300px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ScheduleIcon color="secondary" />
            <Typography variant="h6">Reminder Threshold</Typography>
          </Box>
          <Typography variant="h3" color="secondary">
            {daysThreshold}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Days since last interview
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, flex: '1 1 300px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SendIcon color="success" />
            <Typography variant="h6">Last Batch Results</Typography>
          </Box>
          <Typography variant="h3" color="success.main">
            {results?.remindersSent || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Emails sent successfully
          </Typography>
        </Paper>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Send Interview Reminders
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Days Since Last Interview"
            type="number"
            value={daysThreshold}
            onChange={(e) => setDaysThreshold(parseInt(e.target.value) || 7)}
            helperText="Users who haven't interviewed in this many days"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Max Reminders to Send"
            type="number"
            value={maxReminders}
            onChange={(e) => setMaxReminders(parseInt(e.target.value) || 50)}
            helperText="Limit the number of emails sent"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="outlined"
            onClick={fetchUsersNeedingReminders}
            disabled={loading}
            sx={{ minWidth: 150 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh List'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setConfirmDialog(true)}
            disabled={usersNeedingReminders.length === 0 || sending}
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sending ? 'Sending...' : `Send ${Math.min(usersNeedingReminders.length, maxReminders)} Reminders`}
          </Button>

          {results && (
            <Alert severity="info" sx={{ flex: 1 }}>
              Last batch: {results.remindersSent} sent, {results.failed} failed out of {results.totalUsersChecked} users checked
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Users Needing Reminders
        </Typography>

        {usersNeedingReminders.length === 0 ? (
          <Alert severity="info">
            No users need reminders with the current threshold of {daysThreshold} days.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Last Interview</TableCell>
                  <TableCell>Days Since</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersNeedingReminders.slice(0, maxReminders).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.lastInterview)}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${user.daysSinceLastInterview} days`}
                        color={user.daysSinceLastInterview > 14 ? 'error' : user.daysSinceLastInterview > 7 ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Will Receive Reminder"
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Send Reminders</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send reminder emails to {Math.min(usersNeedingReminders.length, maxReminders)} users
            who haven't interviewed in {daysThreshold} days?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={sendReminders} variant="contained" color="primary">
            Send Reminders
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
