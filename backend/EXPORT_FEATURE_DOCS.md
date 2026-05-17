# Export Applicants to Excel - Implementation Summary

## ✅ What's Done

The export endpoint for applicants has been successfully implemented and is **ready to use**.

### Files Modified

1. **`package.json`**
   - Added `exceljs@^4.4.0` dependency ✅

2. **`src/Controllers/ApplicationController.ts`**
   - Added `exportApplicationsForJob()` function that:
     - Validates user is HR or SuperAdmin
     - Checks job ownership (HR users can only export their own jobs)
     - Fetches all applications for the job with candidate details
     - Generates an Excel file (.xlsx) with the following columns:
       - Candidate Email
       - First Name
       - Last Name
       - Phone
       - Experience Years
       - Applied At (formatted date/time)
       - Expected Salary (formatted with $ prefix)
       - ATS Score (formatted as percentage)
       - CV Filename

3. **`src/Routers/api/applicationRoutes.ts`**
   - Added route: `GET /job/:jobId/export`
   - Protected with authentication and role-based access control
   - Route placed before generic `/job/:jobId` route to avoid conflicts

## 🔗 Endpoint Details

**Endpoint:** `GET /api/application/job/:jobId/export`

**Authentication:** Required (Bearer token)

**Authorization:** HR or SuperAdmin role required
- HR users can only export applicants for jobs they created
- SuperAdmins can export applicants for any job

**Response:** Excel file (.xlsx) as attachment

**Example Usage:**
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:3002/api/application/job/19/export" \
  --output applications-job-19.xlsx
```

## 🧪 Testing Status

✅ **Excel Generation**: Tested and working
- ExcelJS library is correctly installed and functional
- Generates valid .xlsx files
- File size: ~6-7 KB for sample data

✅ **TypeScript Compilation**: No errors

✅ **Test Data Available**:
- HR User: `mahmoudhamedabdo9@gmail.com`
- Job with applicants: Job ID 19 (has 10+ applications)
- Test file created: `test-direct-excel.xlsx`

## 🚀 How to Use

### 1. Start the server
```bash
npm run dev
```

### 2. Login to get access token
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mahmoudhamedabdo9@gmail.com","password":"password123"}'
```

### 3. Call export endpoint
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  "http://localhost:3002/api/application/job/19/export" \
  --output applications.xlsx
```

### 4. Frontend Integration (React example)
```javascript
// Call export endpoint and download file
const downloadApplicantsExcel = async (jobId, accessToken) => {
  try {
    const response = await fetch(
      `/api/application/job/${jobId}/export`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-job-${jobId}.xlsx`;
    a.click();
  } catch (error) {
    console.error('Failed to download:', error);
  }
};
```

Then add a button to your UI:
```jsx
<button onClick={() => downloadApplicantsExcel(jobId, token)}>
  📥 Export All
</button>
```

## 📊 Excel File Structure

The exported Excel file contains one sheet named "Applicants" with:
- **Header row** with column titles
- **One row per applicant** with:
  - Full candidate information
  - Application date
  - Salary expectations
  - ATS matching score
  - CV file reference

Example data row:
```
test3@gmail.com | Test | User | 004155 | 2 | 12/14/2025, 12:00:00 PM | $20,000 | 10% | cv-file.pdf
```

## ✨ Features

- ✅ Role-based access control (HR + SuperAdmin only)
- ✅ Job ownership validation (HR can't export other HR's jobs)
- ✅ Proper Excel formatting with column widths
- ✅ Safe date/time formatting
- ✅ Salary and score formatting for readability
- ✅ Sorted by creation date (newest first)
- ✅ Error handling and validation
- ✅ Returns proper HTTP headers for file download

## 🐛 Any Issues?

If you encounter issues:

1. **Port conflicts**: Server will auto-try ports 3000 → 3001 → 3002
2. **Module not found**: Run `npm install` to install dependencies
3. **Authentication fails**: Verify JWT token is valid and user role is 'hr' or 'superadmin'
4. **File not generated**: Check database connection and ensure job ID exists

## 📝 Next Steps (Optional)

- Add CSV export option (similar implementation)
- Add more columns (ATS recommendations, application status, etc.)
- Add date range filtering for exports
- Add email integration to send Excel file directly
- Add batch export for multiple jobs
