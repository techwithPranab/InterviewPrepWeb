import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/lib/models/User';
import { authenticateToken } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';

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

    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });

    return NextResponse.json({
      message: 'Users retrieved successfully',
      users
    });

  } catch (error) {
    console.error('Get admin users error:', error);
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
    const { firstName, lastName, email, password, role = 'user', isActive = true } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive,
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
