import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/lib/models/User';
import { authenticateToken } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';
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
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

        const { firstName, lastName, email, password, role, isActive } = body;    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if another user with the same email exists (excluding current user)
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: id }
    });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      role,
      isActive,
    };

    // Only update password if provided
    if (password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
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
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === (auth as any).decoded.userId) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
