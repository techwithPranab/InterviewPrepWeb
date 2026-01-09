import express, { Request, Response } from 'express';
import EmailTemplate from '../models/EmailTemplate';
import { authenticate, authorize } from '../middleware/auth';
import brevoService from '../services/brevoService';

const router = express.Router();

// Helper function to wrap async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * GET /api/email-templates
 * Get all email templates (admin only)
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { templateType, isActive, search } = req.query;

    const filter: any = {};

    if (templateType) {
      filter.templateType = templateType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const templates = await EmailTemplate.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  })
);

/**
 * GET /api/email-templates/:id
 * Get a specific email template
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const template = await EmailTemplate.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  })
);

/**
 * POST /api/email-templates
 * Create a new email template (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      subject,
      htmlContent,
      textContent,
      templateType,
      variables,
      isActive,
      description,
    } = req.body;

    const userId = (req as any).user?.userId;

    // Check if template with same name already exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists',
      });
    }

    const template = new EmailTemplate({
      name,
      subject,
      htmlContent,
      textContent,
      templateType,
      variables: variables || [],
      isActive: isActive !== undefined ? isActive : true,
      description,
      createdBy: userId,
      updatedBy: userId,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template,
    });
  })
);

/**
 * PUT /api/email-templates/:id
 * Update an email template (admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      subject,
      htmlContent,
      textContent,
      templateType,
      variables,
      isActive,
      description,
    } = req.body;

    const userId = (req as any).user?.userId;

    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    // Check if new name conflicts with existing template
    if (name && name !== template.name) {
      const existingTemplate = await EmailTemplate.findOne({ name });
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: 'Template with this name already exists',
        });
      }
    }

    // Update fields
    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (htmlContent) template.htmlContent = htmlContent;
    if (textContent !== undefined) template.textContent = textContent;
    if (templateType) template.templateType = templateType;
    if (variables) template.variables = variables;
    if (isActive !== undefined) template.isActive = isActive;
    if (description !== undefined) template.description = description;
    template.updatedBy = userId;

    await template.save();

    res.json({
      success: true,
      message: 'Email template updated successfully',
      data: template,
    });
  })
);

/**
 * DELETE /api/email-templates/:id
 * Delete an email template (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    await EmailTemplate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Email template deleted successfully',
    });
  })
);

/**
 * POST /api/email-templates/:id/preview
 * Preview email template with variables
 */
router.post(
  '/:id/preview',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found',
      });
    }

    const { variables } = req.body;

    // Render the template with provided variables
    const renderedSubject = brevoService.renderTemplate(template.subject, variables || {});
    const renderedHtmlContent = brevoService.renderTemplate(template.htmlContent, variables || {});
    const renderedTextContent = template.textContent
      ? brevoService.renderTemplate(template.textContent, variables || {})
      : undefined;

    res.json({
      success: true,
      data: {
        subject: renderedSubject,
        html: renderedHtmlContent,
        text: renderedTextContent,
      },
    });
  })
);

/**
 * POST /api/email-templates/test/send
 * Send test email (admin only)
 */
router.post(
  '/test/send',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required',
      });
    }

    try {
      const result = await brevoService.testEmailConfiguration(testEmail);

      res.json({
        success: true,
        message: 'Test email sent successfully',
        result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message,
      });
    }
  })
);

/**
 * POST /api/email-templates/smtp/verify
 * Verify SMTP connection (admin only)
 */
router.post(
  '/smtp/verify',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const isConnected = await brevoService.verifyConnection();

      if (isConnected) {
        res.json({
          success: true,
          message: 'SMTP connection verified successfully',
          smtpHost: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
          smtpPort: process.env.BREVO_SMTP_PORT || '587',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'SMTP connection verification failed',
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'SMTP connection verification failed',
        error: error.message,
      });
    }
  })
);

export default router;
