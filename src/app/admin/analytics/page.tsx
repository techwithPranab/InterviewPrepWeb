'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalQuestions: number;
  activeUsersToday: number;
  userGrowth: number;
  sessionGrowth: number;
  questionGrowth: number;
  activeUsersGrowth: number;
  monthlyStats: {
    month: string;
    users: number;
    sessions: number;
    questions: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!analytics) {
    return <Alert severity="info">No analytics data available</Alert>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers.toLocaleString(),
      growth: analytics.userGrowth,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Total Sessions',
      value: analytics.totalSessions.toLocaleString(),
      growth: analytics.sessionGrowth,
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Total Questions',
      value: analytics.totalQuestions.toLocaleString(),
      growth: analytics.questionGrowth,
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'Active Users Today',
      value: analytics.activeUsersToday.toLocaleString(),
      growth: analytics.activeUsersGrowth,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Analytics Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {statCards.map((card, index) => (
          <Box key={card.title} sx={{ flex: '1 1 250px', maxWidth: '300px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body1" component="div">
                      {card.title}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon
                    sx={{
                      fontSize: 16,
                      color: card.growth >= 0 ? 'success.main' : 'error.main',
                      mr: 0.5
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: card.growth >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {card.growth >= 0 ? '+' : ''}{card.growth}% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Monthly Trends */}
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Monthly Trends
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                User Registration Trend
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Chart visualization would go here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Session Activity Trend
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Chart visualization would go here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Question Usage Trend
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Chart visualization would go here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 2 }}>
        Recent Activity
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Recent activity feed would go here
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
