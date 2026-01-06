import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Mock Interview Platform" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendInterviewCompletionEmail(
    userEmail: string,
    userName: string,
    interviewData: {
      skill: string;
      score: number;
      totalQuestions: number;
      duration: number;
      recommendations: string[];
    }
  ): Promise<boolean> {
    const subject = `Interview Completed: ${interviewData.skill} - Score: ${interviewData.score}%`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Interview Completion</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .score { font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .recommendations { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .recommendation { margin: 10px 0; padding: 10px; background: #e8f5e8; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Interview Completed!</h1>
              <p>Congratulations on completing your ${interviewData.skill} interview</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>You have successfully completed your mock interview session. Here are your results:</p>

              <div class="score">
                Overall Score: ${interviewData.score}%
              </div>

              <div class="stats">
                <div class="stat">
                  <strong>${interviewData.totalQuestions}</strong><br>
                  Questions Answered
                </div>
                <div class="stat">
                  <strong>${Math.round(interviewData.duration / 60)} min</strong><br>
                  Duration
                </div>
                <div class="stat">
                  <strong>${interviewData.skill}</strong><br>
                  Skill Focus
                </div>
              </div>

              ${interviewData.recommendations.length > 0 ? `
                <div class="recommendations">
                  <h3>📚 AI Recommendations for Improvement:</h3>
                  ${interviewData.recommendations.map(rec => `
                    <div class="recommendation">${rec}</div>
                  `).join('')}
                </div>
              ` : ''}

              <p>Keep practicing to improve your skills! You can start a new interview anytime from your dashboard.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Full Analytics
                </a>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message from Mock Interview Platform</p>
              <p>© 2024 Mock Interview Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: `Interview Completed: ${interviewData.skill} - Score: ${interviewData.score}%. View your results at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    });
  }

  async sendInterviewReminderEmail(
    userEmail: string,
    userName: string,
    daysSinceLastInterview: number
  ): Promise<boolean> {
    const subject = `Time for another mock interview! 🚀`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Interview Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Interview Reminder</h1>
              <p>It's been ${daysSinceLastInterview} days since your last practice session</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Consistent practice is key to interview success! It's been ${daysSinceLastInterview} days since your last mock interview.</p>

              <p>Regular practice helps you:</p>
              <ul>
                <li>Build confidence in your responses</li>
                <li>Identify areas for improvement</li>
                <li>Track your progress over time</li>
                <li>Stay sharp with current technologies</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview"
                   style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Start New Interview
                </a>
              </div>

              <p>Remember: Every expert was once a beginner. Keep pushing forward!</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from Mock Interview Platform</p>
              <p>© 2024 Mock Interview Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: `It's been ${daysSinceLastInterview} days since your last mock interview. Start practicing again at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview`
    });
  }

  async sendScheduledInterviewEmail(data: {
    candidateName: string;
    candidateEmail: string;
    interviewerName: string;
    skills: string[];
    scheduledAt: Date;
    duration: number;
    registrationLink: string;
    meetingLink: string;
    notes?: string;
  }): Promise<boolean> {
    const { candidateName, candidateEmail, interviewerName, skills, scheduledAt, duration, registrationLink, meetingLink, notes } = data;
    
    const subject = `Interview Scheduled: ${skills.join(', ')} - ${new Date(scheduledAt).toLocaleDateString()}`;
    
    const formattedDate = new Date(scheduledAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Interview Scheduled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .cta-button { 
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .skill-tag {
              display: inline-block;
              background: #e8f1ff;
              color: #667eea;
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 12px;
              margin: 5px 5px 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Interview Scheduled!</h1>
              <p>We're excited to meet you for this interview opportunity</p>
            </div>
            <div class="content">
              <p>Hi ${candidateName},</p>
              <p>Great news! Your interview has been scheduled with <strong>${interviewerName}</strong>. Below are the details:</p>

              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">📅 Date & Time:</span>
                  <span>${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">⏱️ Duration:</span>
                  <span>${duration} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🎯 Skills:</span>
                  <div>
                    ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                  </div>
                </div>
                <div class="detail-row">
                  <span class="detail-label">👤 Interviewer:</span>
                  <span>${interviewerName}</span>
                </div>
              </div>

              ${notes ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #856404;">📝 Message from Interviewer:</p>
                  <p style="margin: 10px 0 0 0; color: #856404;">${notes}</p>
                </div>
              ` : ''}

              <h3>What's Next?</h3>
              <p>To participate in this interview, you need to register on our platform:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${registrationLink}" class="cta-button">Register Now</a>
              </div>

              <h3>Before Your Interview</h3>
              <ul>
                <li>Ensure you have a quiet, professional environment</li>
                <li>Test your camera, microphone, and internet connection</li>
                <li>Review the skills mentioned above</li>
                <li>Have your resume ready for reference</li>
                <li>Log in 5 minutes before the scheduled time</li>
              </ul>

              <p>Good luck with your interview! 🚀</p>
            </div>
            <div class="footer">
              <p>© 2024 Mock Interview Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject,
      html,
      text: `Your interview with ${interviewerName} is scheduled for ${formattedDate}. Register here: ${registrationLink}`
    });
  }
}

export default new EmailService();
