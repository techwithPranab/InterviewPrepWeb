import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import ScheduledInterview from '@/lib/models/ScheduledInterview';
import User from '@/lib/models/User';
import { authenticateToken } from '@/lib/middleware/auth';
import emailService from '@/lib/services/emailService';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const candidateName = formData.get('candidateName') as string;
    const candidateEmail = formData.get('candidateEmail') as string;
    const skillsJson = formData.get('skills') as string;
    const scheduledAt = formData.get('scheduledAt') as string;
    const duration = parseInt(formData.get('duration') as string);
    const notes = formData.get('notes') as string;
    const resumeFile = formData.get('resume') as File | null;

    // Validate required fields
    if (!candidateName?.trim()) {
      return NextResponse.json(
        { message: 'Candidate name is required' },
        { status: 400 }
      );
    }

    if (!candidateEmail?.trim()) {
      return NextResponse.json(
        { message: 'Candidate email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    let skills: string[] = [];
    try {
      skills = JSON.parse(skillsJson || '[]');
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid skills format' },
        { status: 400 }
      );
    }

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { message: 'At least one skill is required' },
        { status: 400 }
      );
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { message: 'Scheduled date and time are required' },
        { status: 400 }
      );
    }

    if (duration <= 0) {
      return NextResponse.json(
        { message: 'Duration must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if scheduled date is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { message: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Handle resume upload
    let resumeUrl = '';
    if (resumeFile) {
      try {
        // Convert file to buffer
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        
        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${resumeFile.name}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        
        // Ensure upload directory exists
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        
        resumeUrl = `/uploads/${fileName}`;
      } catch (uploadError) {
        console.error('Error uploading resume:', uploadError);
        return NextResponse.json(
          { message: 'Failed to upload resume' },
          { status: 500 }
        );
      }
    }

    // Get interviewer details
    const interviewer = await User.findById(interviewerId);
    if (!interviewer) {
      return NextResponse.json(
        { message: 'Interviewer not found' },
        { status: 404 }
      );
    }

    // Create registration link (unique for each scheduled interview)
    const registrationToken = Buffer.from(`${candidateEmail}-${Date.now()}`).toString('base64');
    const registrationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?email=${encodeURIComponent(candidateEmail)}&token=${registrationToken}`;

    // Create scheduled interview record
    const scheduledInterview = new ScheduledInterview({
      userId: interviewerId,
      interviewerId,
      title: `Interview - ${skills.join(', ')}`,
      description: notes,
      candidateName,
      candidateEmail,
      skills,
      scheduledAt: scheduledDate,
      duration,
      status: 'scheduled',
      resumeUrl,
      registrationLink,
      meetingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/join/${registrationToken}`,
    });

    // Validate the document before saving
    await scheduledInterview.validate();
    console.log('Document validated successfully');

    const savedInterview = await scheduledInterview.save();
    console.log('Interview saved successfully:', savedInterview._id);

    // Send email to candidate
    const emailSent = await emailService.sendScheduledInterviewEmail({
      candidateName,
      candidateEmail,
      interviewerName: `${interviewer.firstName} ${interviewer.lastName}`,
      skills,
      scheduledAt: scheduledDate,
      duration,
      registrationLink,
      meetingLink: savedInterview.meetingLink || '',
      notes,
    });

    if (!emailSent) {
      console.warn('Email delivery failed, but interview was scheduled');
    }

    return NextResponse.json(
      {
        message: 'Interview scheduled successfully',
        interview: {
          _id: savedInterview._id,
          candidateName: savedInterview.candidateName,
          candidateEmail: savedInterview.candidateEmail,
          skills: savedInterview.skills,
          scheduledAt: savedInterview.scheduledAt,
          duration: savedInterview.duration,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error scheduling interview:', error);
    
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if it's a Mongoose validation error
      if ('errors' in error) {
        console.error('Validation errors:', (error as any).errors);
      }
    }
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
