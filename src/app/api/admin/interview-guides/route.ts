import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';
import { authenticateToken } from '@/lib/middleware/auth';

// GET - Fetch all interview guides (admin only)
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

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const technology = searchParams.get('technology');
    const difficulty = searchParams.get('difficulty');
    const isPublished = searchParams.get('isPublished');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};
    if (domain) query.domain = domain;
    if (technology) query.technology = technology;
    if (difficulty) query.difficulty = difficulty;
    if (isPublished !== null) query.isPublished = isPublished === 'true';

    const skip = (page - 1) * limit;

    const guides = await InterviewGuide.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InterviewGuide.countDocuments(query);

    return NextResponse.json({
      guides,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
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

// POST - Create a new interview guide (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      domain,
      technology,
      difficulty,
      questions,
      tags,
      isPublished
    } = body;

    // Validate required fields
    if (!title || !description || !domain || !technology || !difficulty) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Create new guide
    const guide = await InterviewGuide.create({
      title,
      description,
      domain,
      technology,
      difficulty,
      questions: questions || [],
      tags: tags || [],
      isPublished: isPublished || false,
      publishedDate: isPublished ? new Date() : undefined,
      createdBy: (auth as any).decoded.userId
    });

    return NextResponse.json({
      message: 'Interview guide created successfully',
      guide
    }, { status: 201 });

  } catch (error) {
    console.error('Create guide error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
