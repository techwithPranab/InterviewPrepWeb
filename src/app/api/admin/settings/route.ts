import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import SystemSettings from '@/lib/models/SystemSettings';
import { authenticateToken } from '@/lib/middleware/auth';

// GET - Fetch system settings (admin only)
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

    // Get or create default settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return NextResponse.json({
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail: settings.contactEmail,
        enableRegistration: settings.enableRegistration,
        enableEmailNotifications: settings.enableEmailNotifications,
        maxSessionsPerUser: settings.maxSessionsPerUser,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        enableAnalytics: settings.enableAnalytics,
        maintenanceMode: settings.maintenanceMode,
      }
    });

  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update system settings (admin only)
export async function PUT(request: NextRequest) {
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
      siteName,
      siteDescription,
      contactEmail,
      enableRegistration,
      enableEmailNotifications,
      maxSessionsPerUser,
      sessionTimeoutMinutes,
      enableAnalytics,
      maintenanceMode
    } = body;

    // Validation
    if (!siteName?.trim() || !contactEmail?.trim()) {
      return NextResponse.json(
        { message: 'Site name and contact email are required' },
        { status: 400 }
      );
    }

    if (!contactEmail.includes('@')) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (maxSessionsPerUser < 1 || sessionTimeoutMinutes < 5) {
      return NextResponse.json(
        { message: 'Invalid numeric values' },
        { status: 400 }
      );
    }

    // Get or create settings document
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    // Update settings
    settings.siteName = siteName;
    settings.siteDescription = siteDescription;
    settings.contactEmail = contactEmail;
    settings.enableRegistration = enableRegistration;
    settings.enableEmailNotifications = enableEmailNotifications;
    settings.maxSessionsPerUser = maxSessionsPerUser;
    settings.sessionTimeoutMinutes = sessionTimeoutMinutes;
    settings.enableAnalytics = enableAnalytics;
    settings.maintenanceMode = maintenanceMode;

    await settings.save();

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail: settings.contactEmail,
        enableRegistration: settings.enableRegistration,
        enableEmailNotifications: settings.enableEmailNotifications,
        maxSessionsPerUser: settings.maxSessionsPerUser,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        enableAnalytics: settings.enableAnalytics,
        maintenanceMode: settings.maintenanceMode,
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
