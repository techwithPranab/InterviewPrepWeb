'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  enableEmailNotifications: boolean;
  maxSessionsPerUser: number;
  sessionTimeoutMinutes: number;
  enableAnalytics: boolean;
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    enableRegistration: true,
    enableEmailNotifications: true,
    maxSessionsPerUser: 10,
    sessionTimeoutMinutes: 60,
    enableAnalytics: true,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings || settings);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    }
  };

  const handleSave = async () => {
    if (!settings.siteName.trim() || !settings.contactEmail.trim()) {
      setError('Site name and contact email are required');
      return;
    }

    if (!settings.contactEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* General Settings */}
        <Card>
          <CardHeader
            title="General Settings"
            avatar={<StorageIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Site Name"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Site Description"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />

              <TextField
                label="Contact Email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                fullWidth
                required
              />
            </Box>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader
            title="User Management"
            avatar={<SecurityIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableRegistration}
                    onChange={(e) => handleInputChange('enableRegistration', e.target.checked)}
                  />
                }
                label="Enable user registration"
              />

              <TextField
                label="Max sessions per user"
                type="number"
                value={settings.maxSessionsPerUser}
                onChange={(e) => handleInputChange('maxSessionsPerUser', Number.parseInt(e.target.value) || 0)}
                fullWidth
                slotProps={{
                  input: {
                    inputProps: { min: 1, max: 100 }
                  }
                }}
              />

              <TextField
                label="Session timeout (minutes)"
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => handleInputChange('sessionTimeoutMinutes', Number.parseInt(e.target.value) || 0)}
                fullWidth
                slotProps={{
                  input: {
                    inputProps: { min: 5, max: 480 }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* System Features */}
        <Card>
          <CardHeader
            title="System Features"
            avatar={<NotificationsIcon />}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onChange={(e) => handleInputChange('enableEmailNotifications', e.target.checked)}
                  />
                }
                label="Enable email notifications"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAnalytics}
                    onChange={(e) => handleInputChange('enableAnalytics', e.target.checked)}
                  />
                }
                label="Enable analytics tracking"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    color="warning"
                  />
                }
                label="Maintenance mode (users cannot access the platform)"
              />
            </Box>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader title="System Information" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Version:</strong> 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Environment:</strong> Production
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
