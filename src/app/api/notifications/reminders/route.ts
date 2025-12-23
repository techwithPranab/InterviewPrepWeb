import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/lib/models/User';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';
import emailService from '@/lib/services/emailService';

// POST - Send reminder emails to users who haven't interviewed in X days
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate admin user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = (auth as any).decoded.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { daysSinceLastInterview = 7, maxReminders = 50 } = await request.json();

    // Find users who haven't had interviews in the specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastInterview);

    // Get users who have completed at least one interview but not recently
    const usersWithOldInterviews = await User.find({
      role: 'user',
      isActive: true,
      lastLogin: { $exists: true }
    }).select('firstName lastName email _id');

    const reminderPromises = [];
    let remindersSent = 0;

    for (const user of usersWithOldInterviews) {
      if (remindersSent >= maxReminders) break;

      // Check if user has any recent interviews
      const recentInterview = await InterviewSession.findOne({
        candidate: user._id,
        completedAt: { $gte: cutoffDate }
      });

      if (!recentInterview) {
        // Check if user has completed any interviews at all
        const hasCompletedInterviews = await InterviewSession.findOne({
          candidate: user._id,
          status: 'completed'
        });

        if (hasCompletedInterviews) {
          // Send reminder email
          const userName = `${user.firstName} ${user.lastName}`;
          reminderPromises.push(
            emailService.sendInterviewReminderEmail(
              user.email,
              userName,
              daysSinceLastInterview
            )
          );
          remindersSent++;
        }
      }
    }

    // Wait for all emails to be sent
    const emailResults = await Promise.allSettled(reminderPromises);
    const successful = emailResults.filter(result => result.status === 'fulfilled').length;
    const failed = emailResults.filter(result => result.status === 'rejected').length;

    return NextResponse.json({
      message: 'Reminder emails processed',
      results: {
        totalUsersChecked: usersWithOldInterviews.length,
        remindersSent: successful,
        failed: failed,
        maxReminders: maxReminders
      }
    });

  } catch (error) {
    console.error('Send reminders error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get users who need reminders (for preview)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate admin user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = (auth as any).decoded.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysSinceLastInterview = parseInt(searchParams.get('days') || '7');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastInterview);

    // Get users who need reminders
    const usersNeedingReminders = [];
    const users = await User.find({
      role: 'user',
      isActive: true
    }).select('firstName lastName email _id lastLogin');

    for (const user of users) {
      const recentInterview = await InterviewSession.findOne({
        candidate: user._id,
        completedAt: { $gte: cutoffDate }
      });

      if (!recentInterview) {
        const hasCompletedInterviews = await InterviewSession.findOne({
          candidate: user._id,
          status: 'completed'
        });

        if (hasCompletedInterviews) {
          const lastInterview = await InterviewSession.findOne({
            candidate: user._id,
            status: 'completed'
          }).sort({ completedAt: -1 });

          usersNeedingReminders.push({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            lastInterview: lastInterview?.completedAt,
            daysSinceLastInterview: lastInterview?.completedAt
              ? Math.floor((new Date().getTime() - lastInterview.completedAt.getTime()) / (1000 * 60 * 60 * 24))
              : null
          });
        }
      }
    }

    return NextResponse.json({
      usersNeedingReminders,
      total: usersNeedingReminders.length,
      daysThreshold: daysSinceLastInterview
    });

  } catch (error) {
    console.error('Get reminder candidates error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
