# Quick Reference - Schedule Interview Feature

## 🚀 How It Works

### For Interviewers:
1. **Access**: Go to `/interviewer-dashboard/schedule`
2. **Fill Form**:
   - Candidate Name (required)
   - Candidate Email (required)
   - Select Skills (checkbox multi-select, minimum 1)
   - Date & Time (future date/time only)
   - Duration (in minutes, 15+ increments)
   - Resume (optional, PDF/DOC/DOCX, max 5MB)
   - Notes (optional, for candidate)
3. **Submit**: Click "Schedule Interview"
4. **Result**: Email sent to candidate with registration link

### For Candidates:
1. **Receive Email** with:
   - Interview date/time
   - Skills to be tested
   - Interviewer name
   - Registration link
   - Meeting link
2. **Click Register** in email
3. **Create Account** (if new) or Login
4. **Join Interview** using the meeting link

---

## 📁 Files Modified/Created

| File | Type | Change |
|------|------|--------|
| `/src/app/components/Header.tsx` | MODIFIED | Removed "New Interview" button |
| `/src/app/interviewer-dashboard/schedule/page.tsx` | MODIFIED | Complete scheduling form |
| `/src/app/api/schedule/interview/route.ts` | **NEW** | Backend API endpoint |
| `/lib/models/ScheduledInterview.ts` | MODIFIED | Added new fields |
| `/lib/services/emailService.ts` | MODIFIED | Added email method |

---

## 🔧 API Reference

### Endpoint
```
POST /api/schedule/interview
```

### Required Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

### Request Body
```
candidateName: "John Doe"
candidateEmail: "john@example.com"
skills: '["Java", "Spring Boot"]'
scheduledAt: "2024-12-25T10:00:00Z"
duration: "60"
notes: "Please review design patterns"
resume: <File> (optional)
```

### Response (201 Created)
```json
{
  "message": "Interview scheduled successfully",
  "interview": {
    "_id": "...",
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "skills": ["Java", "Spring Boot"],
    "scheduledAt": "2024-12-25T10:00:00Z",
    "duration": 60
  }
}
```

---

## 📧 Email Template Content

The system sends a professional HTML email including:

✅ Interview date and time  
✅ Duration  
✅ Skills to be tested  
✅ Interviewer name  
✅ **Registration link** (with CTA button)  
✅ Meeting link  
✅ Pre-interview checklist  
✅ Interviewer's optional notes  
✅ Professional branding  

---

## 🎨 UI Components Used

- **Material-UI Components**: TextField, Button, Card, Alert, CircularProgress
- **Date Picker**: MUI DateTimePicker (Dayjs adapter)
- **Styling**: Tailwind CSS + MUI styling
- **Icons**: SVG inline icons
- **Layout**: Responsive grid system

---

## ✅ Validation Rules

**Candidate Name**
- Required
- Text input
- No minimum length

**Candidate Email**
- Required
- Valid email format (xxx@xxx.xxx)
- Used for notifications

**Skills**
- Required (minimum 1)
- Multi-select checkboxes
- Dynamically loaded from database

**Date & Time**
- Required
- Must be in the future
- Uses calendar picker + time input

**Duration**
- Required
- Minimum: 15 minutes
- Increments: 15 minutes

**Resume**
- Optional
- Formats: PDF, DOC, DOCX
- Max size: 5MB
- Stored in `/public/uploads/`

**Notes**
- Optional
- Text area (multiline)

---

## 🗄️ Database Schema

### ScheduledInterview Model

```typescript
{
  _id: ObjectId
  userId: ObjectId (interviewer)
  interviewerId: ObjectId
  title: String
  description: String
  candidateName: String (NEW)
  candidateEmail: String (NEW)
  skills: [String] (NEW)
  scheduledAt: Date
  duration: Number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  reminderSent: Boolean
  meetingLink: String
  registrationLink: String (NEW)
  resumeUrl: String (NEW)
  calendarEventId: String
  notes: String
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔐 Security Features

✅ JWT Authentication required  
✅ Email validation  
✅ File type validation  
✅ File size limits (5MB)  
✅ Input sanitization  
✅ Future date validation  
✅ Server-side validation  

---

## 📊 Form Sections

### 1. **Candidate Information**
   - Name input
   - Email input

### 2. **Interview Skills**
   - Multi-select checkboxes
   - Skill category display
   - Selected skills summary

### 3. **Interview Details**
   - Date & Time picker (calendar + time)
   - Duration input (minutes)

### 4. **Resume Upload**
   - Drag-and-drop area
   - File type validation
   - File size validation
   - Upload feedback

### 5. **Additional Notes**
   - Optional text area for instructions

### 6. **Action Buttons**
   - Cancel button → redirects to interviews list
   - Schedule button → submits form

---

## 🚨 Error Messages

**Candidate name is required**  
**Candidate email is required**  
**Invalid email format**  
**Please select at least one skill**  
**Duration must be greater than 0**  
**Scheduled date must be in the future**  
**Resume file size must be less than 5MB**  
**Resume must be PDF or Word document**  
**Failed to schedule interview** (generic error)  

---

## ✨ Success Flow

1. User fills form with valid data
2. Clicks "Schedule Interview"
3. Form is submitted to `/api/schedule/interview`
4. API validates all fields
5. Resume file is uploaded (if provided)
6. ScheduledInterview record is created in MongoDB
7. Email is sent to candidate
8. Success message displayed
9. Form is reset
10. Auto-redirect to interviews list (2 seconds)

---

## 🐛 Troubleshooting

**Email not sending?**
- Check SMTP configuration in `.env.local`
- Verify email credentials
- Check Gmail app password is set

**Date picker not showing?**
- Ensure Dayjs is installed: `npm install dayjs`
- Clear build cache: `rm -rf .next`
- Rebuild: `npm run build`

**Resume upload failing?**
- Check file size (max 5MB)
- Check file format (PDF, DOC, DOCX only)
- Ensure `/public/uploads/` directory exists

**Validation errors?**
- Fill all required fields
- Use valid email format
- Select at least one skill
- Use future date/time

---

## 📦 Dependencies

```json
{
  "@mui/material": "^7.3.1",
  "@mui/x-date-pickers": "^8.10.0",
  "dayjs": "^1.11.x",
  "nodemailer": "^7.0.12"
}
```

---

## 🔗 Related Routes

- `/interviewer-dashboard/schedule` - Schedule new interview
- `/interviewer-dashboard/interviews` - View all interviews
- `/interviewer-dashboard/assessments` - Assessment history
- `/api/schedule/interview` - Schedule API endpoint
- `/api/skills` - Get available skills

---

## 📝 Status

✅ **Implementation Complete**  
✅ **Build: 0 Errors**  
✅ **Ready for Production**  

---

Generated: December 25, 2025
