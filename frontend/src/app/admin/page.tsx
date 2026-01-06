'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  People as UsersIcon,
  LibraryBooks as GuidesIcon,
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalGuides: number;
  publishedGuides: number;
  totalViews: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGuides: 0,
    publishedGuides: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch users count
      const usersResponse = await api.get('/admin/users/count');

      // Fetch guides stats
      const guidesResponse = await api.get('/admin/interview-guides/stats');

      if (usersResponse.success) {
        setStats(prev => ({ ...prev, totalUsers: usersResponse.data?.count || 0 }));
      }

      if (guidesResponse.success) {
        setStats(prev => ({
          ...prev,
          totalGuides: guidesResponse.data?.total || 0,
          publishedGuides: guidesResponse.data?.published || 0,
          totalViews: guidesResponse.data?.views || 0,
        }));
      }

    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UsersIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Total Guides',
      value: stats.totalGuides,
      icon: <GuidesIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Published Guides',
      value: stats.publishedGuides,
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Overview
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {statCards.map((card) => (
            <Box key={card.title} sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {loading ? '...' : card.value.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ opacity: 0.8 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Recent Activity or Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Card sx={{ flex: '1 1 300px', minWidth: '250px', cursor: 'pointer' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Manage Interview Guides
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, edit, and publish interview preparation guides
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 300px', minWidth: '250px', cursor: 'pointer' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage user accounts and permissions
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 300px', minWidth: '250px', cursor: 'pointer' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skills Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage skills and technologies for the platform
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
