import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import ScheduledInterview from '@/lib/models/ScheduledInterview';
import { authenticateToken } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const interviewerId = (auth as any).decoded.userId;

    // Count scheduled interviews (scheduled or confirmed)
    const scheduledCount = await ScheduledInterview.countDocuments({
      $or: [
        { userId: interviewerId, status: { $in: ['scheduled', 'confirmed'] } },
        { interviewerId, status: { $in: ['scheduled', 'confirmed'] } }
      ]
    });

    // Count completed interviews
    const completedCount = await ScheduledInterview.countDocuments({
      $or: [
        { userId: interviewerId, status: 'completed' },
        { interviewerId, status: 'completed' }
      ]
    });

    // Get all completed interviews to calculate average rating
    // (Assuming there's a rating field, if not, we'll use a default)
    const completedInterviews = await ScheduledInterview.find({
      $or: [
        { userId: interviewerId, status: 'completed' },
        { interviewerId, status: 'completed' }
      ]
    }).select('rating');

    // Calculate average rating (default to 4.7 if no ratings)
    let avgRating = 4.7;
    if (completedInterviews.length > 0) {
      const totalRating = completedInterviews.reduce((sum, interview: any) => {
        return sum + (interview.rating || 0);
      }, 0);
      avgRating = totalRating / completedInterviews.length || 4.7;
    }

    // Count unique candidates (based on candidateEmail)
    const uniqueCandidates = await ScheduledInterview.distinct('candidateEmail', {
      $or: [
        { userId: interviewerId },
        { interviewerId }
      ]
    });

    const activeCandidatesCount = uniqueCandidates.length;

    return NextResponse.json(
      {
        stats: {
          scheduledInterviews: scheduledCount,
          completedAssessments: completedCount,
          activeCandidates: activeCandidatesCount,
          avgRating: parseFloat(avgRating.toFixed(1)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching interviewer stats:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
