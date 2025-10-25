import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Skill from '@/lib/models/Skill';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let query: any = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skills = await Skill.find(query)
      .select('name category description level')
      .sort({ usageCount: -1, name: 1 })
      .limit(100);

    return NextResponse.json({
      message: 'Skills retrieved successfully',
      skills
    });

  } catch (error) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
