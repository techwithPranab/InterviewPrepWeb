import dotenv from 'dotenv';
import path from 'path';
import { connectDB, disconnectDB } from '../src/config/database';
import EmailTemplate from '../src/models/EmailTemplate';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const emailTemplates = [
  {
    name: 'Interview Scheduled',
    subject: 'Interview Scheduled - {{candidateName}}',
    templateType: 'interview_scheduled',
    description: 'Email sent when an interview is scheduled',
    variables: [
      'candidateName',
      'interviewerName',
      'interviewDate',
      'interviewTime',
      'duration',
      'meetingLink',
      'skills',
      'platformName',
      'supportEmail'
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Scheduled</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Interview Scheduled!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>{{candidateName}}</strong>,</p>
      
      <p>Great news! Your interview has been successfully scheduled with {{platformName}}.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Interviewer:</span> {{interviewerName}}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span> {{interviewDate}}
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span> {{interviewTime}}
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span> {{duration}} minutes
        </div>
        <div class="detail-row">
          <span class="detail-label">Skills to Assess:</span> {{skills}}
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="{{meetingLink}}" class="button">Join Interview</a>
      </div>
      
      <h3>📝 Preparation Tips:</h3>
      <ul>
        <li>Review the skills mentioned above</li>
        <li>Prepare examples from your experience</li>
        <li>Test your internet connection and audio/video setup</li>
        <li>Join 5 minutes early</li>
      </ul>
      
      <p>If you have any questions, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
      
      <p>Good luck!</p>
      <p>The {{platformName}} Team</p>
    </div>
    <div class="footer">
      <p>© 2026 {{platformName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `
Hello {{candidateName}},

Great news! Your interview has been successfully scheduled with {{platformName}}.

Interview Details:
- Interviewer: {{interviewerName}}
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Duration: {{duration}} minutes
- Skills to Assess: {{skills}}

Meeting Link: {{meetingLink}}

Preparation Tips:
- Review the skills mentioned above
- Prepare examples from your experience
- Test your internet connection and audio/video setup
- Join 5 minutes early

If you have any questions, please contact us at {{supportEmail}}

Good luck!
The {{platformName}} Team
    `,
    isActive: true
  },
  {
    name: 'Interview Reminder',
    subject: 'Reminder: Interview Tomorrow with {{interviewerName}}',
    templateType: 'interview_reminder',
    description: 'Reminder email sent before the interview',
    variables: [
      'candidateName',
      'interviewerName',
      'interviewDate',
      'interviewTime',
      'meetingLink',
      'platformName'
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Interview Reminder</h1>
    </div>
    <div class="content">
      <p>Hello <strong>{{candidateName}}</strong>,</p>
      
      <div class="reminder-box">
        <strong>⚠️ Reminder:</strong> Your interview is scheduled for tomorrow!
      </div>
      
      <p><strong>Interview Details:</strong></p>
      <ul>
        <li><strong>Interviewer:</strong> {{interviewerName}}</li>
        <li><strong>Date:</strong> {{interviewDate}}</li>
        <li><strong>Time:</strong> {{interviewTime}}</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{meetingLink}}" class="button">Join Interview</a>
      </div>
      
      <p><strong>Last-minute checklist:</strong></p>
      <ul>
        <li>✅ Stable internet connection</li>
        <li>✅ Quiet environment</li>
        <li>✅ Camera and microphone tested</li>
        <li>✅ Resume and notes ready</li>
      </ul>
      
      <p>See you tomorrow!</p>
      <p>The {{platformName}} Team</p>
    </div>
    <div class="footer">
      <p>© 2026 {{platformName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `
Hello {{candidateName}},

REMINDER: Your interview is scheduled for tomorrow!

Interview Details:
- Interviewer: {{interviewerName}}
- Date: {{interviewDate}}
- Time: {{interviewTime}}

Meeting Link: {{meetingLink}}

Last-minute checklist:
✅ Stable internet connection
✅ Quiet environment
✅ Camera and microphone tested
✅ Resume and notes ready

See you tomorrow!
The {{platformName}} Team
    `,
    isActive: true
  },
  {
    name: 'Interview Cancelled',
    subject: 'Interview Cancelled - {{candidateName}}',
    templateType: 'interview_cancelled',
    description: 'Email sent when an interview is cancelled',
    variables: [
      'candidateName',
      'interviewerName',
      'interviewDate',
      'reason',
      'platformName',
      'supportEmail'
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Cancelled</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .notice-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Interview Cancelled</h1>
    </div>
    <div class="content">
      <p>Hello <strong>{{candidateName}}</strong>,</p>
      
      <div class="notice-box">
        We regret to inform you that your interview scheduled for <strong>{{interviewDate}}</strong> with <strong>{{interviewerName}}</strong> has been cancelled.
      </div>
      
      <p><strong>Reason:</strong> {{reason}}</p>
      
      <p>We apologize for any inconvenience this may cause. If you would like to reschedule, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
      
      <p>Thank you for your understanding.</p>
      <p>The {{platformName}} Team</p>
    </div>
    <div class="footer">
      <p>© 2026 {{platformName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `
Hello {{candidateName}},

We regret to inform you that your interview scheduled for {{interviewDate}} with {{interviewerName}} has been cancelled.

Reason: {{reason}}

We apologize for any inconvenience this may cause. If you would like to reschedule, please contact us at {{supportEmail}}

Thank you for your understanding.
The {{platformName}} Team
    `,
    isActive: true
  }
];

async function seedEmailTemplates() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('🗑️  Clearing existing email templates...');
    await EmailTemplate.deleteMany({});

    console.log('📧 Seeding email templates...');
    await EmailTemplate.insertMany(emailTemplates);

    console.log('✅ Email templates seeded successfully!');
    console.log(`📊 Total templates created: ${emailTemplates.length}`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    process.exit(1);
  }
}

// Run the seeder
seedEmailTemplates();
