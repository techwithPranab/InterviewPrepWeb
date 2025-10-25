import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Skill from '@/lib/models/Skill';
import { authenticateToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid skill ID format' },
        { status: 400 }
      );
    }

    const { name, category, description, isActive } = body;

    if (!name || !category) {
      return NextResponse.json(
        { message: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Check if another skill with the same name exists (excluding current skill)
    const existingSkill = await Skill.findOne({
      name: name.trim(),
      _id: { $ne: id }
    });
    if (existingSkill) {
      return NextResponse.json(
        { message: 'Skill with this name already exists' },
        { status: 400 }
      );
    }

    const skill = await Skill.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        category: category.trim(),
        description: description?.trim(),
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!skill) {
      return NextResponse.json(
        { message: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Skill updated successfully',
      skill
    });

  } catch (error) {
    console.error('Update skill error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid skill ID format' },
        { status: 400 }
      );
    }

    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return NextResponse.json(
        { message: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Skill deleted successfully'
    });

  } catch (error) {
    console.error('Delete skill error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
