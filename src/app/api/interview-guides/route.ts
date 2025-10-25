import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';

// Ensure User model is registered before using populate
import '@/lib/models/User';

// GET - Fetch all published interview guides (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const technology = searchParams.get('technology');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '12');

    const query: any = { isPublished: true };
    
    if (domain) query.domain = domain;
    if (technology) query.technology = technology;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const guides = await InterviewGuide.find(query)
      .select('-questions.answer -questions.codeExample') // Don't send answers in list view
      .populate('createdBy', 'firstName lastName')
      .sort({ publishedDate: -1, views: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InterviewGuide.countDocuments(query);

    // Get unique domains and technologies for filters
    const domains = await InterviewGuide.distinct('domain', { isPublished: true });
    const technologies = await InterviewGuide.distinct('technology', { isPublished: true });

    return NextResponse.json({
      guides,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      filters: {
        domains: domains.sort(),
        technologies: technologies.sort()
      }
    });

  } catch (error) {
    console.error('Fetch guides error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
