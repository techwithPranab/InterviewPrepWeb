import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';
import { authenticateToken } from '@/lib/middleware/auth';

// Ensure User model is registered before using populate
import '@/lib/models/User';

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

    const total = await InterviewGuide.countDocuments();
    const published = await InterviewGuide.countDocuments({ isPublished: true });

    // Calculate total views (sum of views from all guides)
    const viewStats = await InterviewGuide.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const totalViews = viewStats.length > 0 ? viewStats[0].totalViews : 0;

    // Get guides by domain
    const domainStats = await InterviewGuide.aggregate([
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get guides by difficulty
    const difficultyStats = await InterviewGuide.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return NextResponse.json({
      total,
      published,
      views: totalViews,
      domainStats,
      difficultyStats
    });

  } catch (error) {
    console.error('Get interview guides stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
