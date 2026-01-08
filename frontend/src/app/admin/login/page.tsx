'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated as admin
    if (typeof globalThis !== 'undefined' && globalThis.window) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          router.push('/admin');
          return;
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting admin login...');
      const response = await api.login(formData.email, formData.password);
      console.log('Login response:', response);

      if (response.success && response.user) {
        // Check if user is admin
        if (response.user?.role === 'admin') {
          console.log('Admin user confirmed, storing credentials...');
          // Store token and user data
          if (response.token) {
            api.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            console.log('Credentials stored, redirecting to /admin...');
          }

          // Force a page reload to ensure proper state initialization
          console.log('Performing hard redirect to /admin');
          window.location.href = '/admin';
        } else {
          console.log('User role is not admin:', response.data.user?.role);
          setError('Access denied. Admin privileges required.');
        }
      } else {
        console.log('Login failed:', response.message);
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {/* Admin Icon */}
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'primary.main',
              width: 64,
              height: 64,
            }}
          >
            <AdminIcon sx={{ fontSize: 32 }} />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Admin Login
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Sign in to access the administration panel
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Demo Admin Credentials
            </Typography>
            <Typography variant="body2">
              Email: admin@mockinterview.com
            </Typography>
            <Typography variant="body2">
              Password: Admin@123
            </Typography>
          </Alert>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => router.push('/login')}
                sx={{ textTransform: 'none' }}
              >
                Back to User Login
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 MeritAI. Admin Access Only.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
