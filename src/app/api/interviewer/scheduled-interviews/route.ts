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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'scheduledAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build filter query
    const filter: any = {
      $or: [
        { userId: interviewerId },
        { interviewerId }
      ]
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Fetch scheduled interviews with sorting
    const interviews = await ScheduledInterview.find(filter)
      .sort({ [sortBy]: sortOrder })
      .lean()
      .exec();

    console.log(`Fetched ${interviews.length} interviews for interviewer ${interviewerId}`);

    return NextResponse.json(
      {
        interviews,
        count: interviews.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching scheduled interviews:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { message: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
