import * as brevo from '@getbrevo/brevo';
import nodemailer from 'nodemailer';
import EmailTemplate from '../models/EmailTemplate';

interface EmailData {
  to: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderEmail?: string;
  senderName?: string;
  replyTo?: string;
}

interface TemplateVariables {
  [key: string]: string | number | boolean;
}

class BrevoService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private smtpTransporter: nodemailer.Transporter;
  private defaultSender: { email: string; name: string };

  constructor() {
    // Initialize Brevo API with username and password authentication
    // Note: Brevo API uses Basic Auth - credentials are base64 encoded
    const username = process.env.BREVO_USERNAME || '';
    const password = process.env.BREVO_PASSWORD || '';
    
    // Create basic auth token (username:password encoded in base64)
    const authToken = Buffer.from(`${username}:${password}`).toString('base64');
    
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, authToken);
    
    // Initialize SMTP transporter for Brevo
    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
      // Brevo SMTP settings
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });
    
    this.defaultSender = {
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@mockinterview.com',
      name: process.env.BREVO_SENDER_NAME || 'MockInterview Platform',
    };
  }

  /**
   * Send a basic email using SMTP
   */
  async sendEmail(emailData: EmailData): Promise<any> {
    try {
      const mailOptions = {
        from: `"${emailData.senderName || this.defaultSender.name}" <${emailData.senderEmail || this.defaultSender.email}>`,
        to: emailData.to.join(', '),
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
        replyTo: emailData.replyTo,
      };

      const result = await this.smtpTransporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully via SMTP:', result.messageId);
      return result;
    } catch (error: any) {
      console.error('❌ Error sending email via SMTP:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: TemplateVariables): string {
    let renderedTemplate = template;
    
    // Replace all {{variable}} placeholders with actual values
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedTemplate = renderedTemplate.replace(regex, String(variables[key]));
    });
    
    return renderedTemplate;
  }

  /**
   * Send email using a template from the database
   */
  async sendTemplateEmail(
    templateType: string,
    recipientEmail: string | string[],
    variables: TemplateVariables
  ): Promise<any> {
    try {
      // Find the active template
      const template = await EmailTemplate.findOne({
        templateType,
        isActive: true,
      });

      if (!template) {
        throw new Error(`No active template found for type: ${templateType}`);
      }

      // Render the template with variables
      const renderedSubject = this.renderTemplate(template.subject, variables);
      const renderedHtmlContent = this.renderTemplate(template.htmlContent, variables);
      const renderedTextContent = template.textContent
        ? this.renderTemplate(template.textContent, variables)
        : undefined;

      // Convert recipient to array if it's a string
      const recipients = Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail];

      // Send the email
      return await this.sendEmail({
        to: recipients,
        subject: renderedSubject,
        htmlContent: renderedHtmlContent,
        textContent: renderedTextContent,
      });
    } catch (error: any) {
      console.error('❌ Error sending template email:', error);
      throw new Error(`Failed to send template email: ${error.message}`);
    }
  }

  /**
   * Send interview scheduled email
   */
  async sendInterviewScheduledEmail(data: {
    candidateName: string;
    candidateEmail: string;
    interviewerName: string;
    interviewDate: string;
    interviewTime: string;
    duration: number;
    meetingLink?: string;
    skills?: string[];
  }): Promise<any> {
    const variables: TemplateVariables = {
      candidateName: data.candidateName,
      interviewerName: data.interviewerName,
      interviewDate: data.interviewDate,
      interviewTime: data.interviewTime,
      duration: data.duration,
      meetingLink: data.meetingLink || 'To be shared',
      skills: data.skills?.join(', ') || 'General',
      platformName: 'MockInterview Platform',
      supportEmail: 'support@mockinterview.com',
    };

    return await this.sendTemplateEmail(
      'interview_scheduled',
      data.candidateEmail,
      variables
    );
  }

  /**
   * Send interview reminder email
   */
  async sendInterviewReminderEmail(data: {
    candidateName: string;
    candidateEmail: string;
    interviewerName: string;
    interviewDate: string;
    interviewTime: string;
    meetingLink?: string;
  }): Promise<any> {
    const variables: TemplateVariables = {
      candidateName: data.candidateName,
      interviewerName: data.interviewerName,
      interviewDate: data.interviewDate,
      interviewTime: data.interviewTime,
      meetingLink: data.meetingLink || 'Check your original email',
      platformName: 'MockInterview Platform',
    };

    return await this.sendTemplateEmail(
      'interview_reminder',
      data.candidateEmail,
      variables
    );
  }

  /**
   * Send interview cancellation email
   */
  async sendInterviewCancelledEmail(data: {
    candidateName: string;
    candidateEmail: string;
    interviewerName: string;
    interviewDate: string;
    reason?: string;
  }): Promise<any> {
    const variables: TemplateVariables = {
      candidateName: data.candidateName,
      interviewerName: data.interviewerName,
      interviewDate: data.interviewDate,
      reason: data.reason || 'Not specified',
      platformName: 'MockInterview Platform',
      supportEmail: 'support@mockinterview.com',
    };

    return await this.sendTemplateEmail(
      'interview_cancelled',
      data.candidateEmail,
      variables
    );
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(testEmail: string): Promise<any> {
    return await this.sendEmail({
      to: [testEmail],
      subject: 'MockInterview - Email Configuration Test',
      htmlContent: `
        <html>
          <body>
            <h1>✅ Email Configuration Test Successful!</h1>
            <p>Your Brevo SMTP email integration is working correctly.</p>
            <p>This is a test email from MockInterview Platform.</p>
            <p><em>Authentication: Username/Password via SMTP</em></p>
            <p><em>SMTP Host: ${process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com'}</em></p>
            <p><em>SMTP Port: ${process.env.BREVO_SMTP_PORT || '587'}</em></p>
          </body>
        </html>
      `,
      textContent: 'Email Configuration Test Successful! Your Brevo SMTP email integration is working correctly.',
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.smtpTransporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error: any) {
      console.error('❌ SMTP connection verification failed:', error);
      return false;
    }
  }
}

export default new BrevoService();
