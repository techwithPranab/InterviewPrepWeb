import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Interviewer from '@/lib/models/Interviewer';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const expertise = searchParams.get('expertise');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const verified = searchParams.get('verified') === 'true';
    const language = searchParams.get('language');

    // Build query
    const query: any = {};
    
    if (expertise) {
      query.expertise = expertise;
    }
    
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }
    
    if (verified) {
      query.verified = true;
    }
    
    if (language) {
      query.languages = language;
    }

    const interviewers = await Interviewer.find(query)
      .populate('userId', 'name email')
      .sort({ verified: -1, rating: -1, totalInterviews: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      interviewers: interviewers.map((interviewer: any) => ({
        id: interviewer._id,
        name: interviewer.userId?.name || 'Anonymous',
        bio: interviewer.bio,
        expertise: interviewer.expertise,
        availability: interviewer.availability,
        hourlyRate: interviewer.hourlyRate,
        rating: interviewer.rating,
        totalInterviews: interviewer.totalInterviews,
        verified: interviewer.verified,
        languages: interviewer.languages,
      })),
    });

  } catch (error: any) {
    console.error('Error fetching interviewers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch interviewers' },
      { status: 500 }
    );
  }
}
