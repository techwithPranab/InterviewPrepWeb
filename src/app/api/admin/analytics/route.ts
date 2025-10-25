import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/lib/models/User';
import InterviewSession from '@/lib/models/InterviewSession';
import InterviewGuide from '@/lib/models/InterviewGuide';
import { authenticateToken } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate and check admin role
    const auth = authenticateToken(request);
    if (!auth.success || (auth as any).decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total sessions
    const totalSessions = await InterviewSession.countDocuments();

    // Get total questions (sum of questions in all guides)
    const questionStats = await InterviewGuide.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: { $size: '$questions' } }
        }
      }
    ]);
    const totalQuestions = questionStats.length > 0 ? questionStats[0].totalQuestions : 0;

    // Get active users today (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeUsersToday = await User.countDocuments({
      lastLogin: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Calculate growth percentages (comparing with last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const thisMonth = new Date();

    const usersLastMonth = await User.countDocuments({
      createdAt: { $lt: lastMonth }
    });
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });
    const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100) : 0;

    const sessionsLastMonth = await InterviewSession.countDocuments({
      createdAt: { $lt: lastMonth }
    });
    const sessionsThisMonth = await InterviewSession.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });
    const sessionGrowth = sessionsLastMonth > 0 ? ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth * 100) : 0;

    // For questions growth, we'll use guide creation as proxy
    const guidesLastMonth = await InterviewGuide.countDocuments({
      createdAt: { $lt: lastMonth }
    });
    const guidesThisMonth = await InterviewGuide.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });
    const questionGrowth = guidesLastMonth > 0 ? ((guidesThisMonth - guidesLastMonth) / guidesLastMonth * 100) : 0;

    // Active users growth (simplified - comparing last month active users)
    const activeUsersLastMonth = await User.countDocuments({
      lastLogin: {
        $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
        $lt: lastMonth
      }
    });
    const activeUsersGrowth = activeUsersLastMonth > 0 ? ((activeUsersToday - activeUsersLastMonth) / activeUsersLastMonth * 100) : 0;

    // Monthly stats for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const usersInMonth = await User.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });

      const sessionsInMonth = await InterviewSession.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });

      const guidesInMonth = await InterviewGuide.find({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });

      const questionsInMonth = guidesInMonth.reduce((total, guide) => total + guide.questions.length, 0);

      monthlyStats.push({
        month: monthName,
        users: usersInMonth,
        sessions: sessionsInMonth,
        questions: questionsInMonth
      });
    }

    const analyticsData = {
      totalUsers,
      totalSessions,
      totalQuestions,
      activeUsersToday,
      userGrowth: Math.round(userGrowth * 100) / 100,
      sessionGrowth: Math.round(sessionGrowth * 100) / 100,
      questionGrowth: Math.round(questionGrowth * 100) / 100,
      activeUsersGrowth: Math.round(activeUsersGrowth * 100) / 100,
      monthlyStats
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
