import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Skill from '@/lib/models/Skill';
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

    const skills = await Skill.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json({
      message: 'Skills retrieved successfully',
      skills
    });

  } catch (error) {
    console.error('Get admin skills error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { name, category, description, isActive = true } = body;

    if (!name || !category) {
      return NextResponse.json(
        { message: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: name.trim() });
    if (existingSkill) {
      return NextResponse.json(
        { message: 'Skill with this name already exists' },
        { status: 400 }
      );
    }

    const skill = new Skill({
      name: name.trim(),
      category: category.trim(),
      description: description?.trim(),
      isActive,
    });

    await skill.save();

    return NextResponse.json({
      message: 'Skill created successfully',
      skill
    }, { status: 201 });

  } catch (error) {
    console.error('Create skill error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
