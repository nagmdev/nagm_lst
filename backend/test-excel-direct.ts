import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

async function testExcelGeneration() {
  console.log('🧪 Testing Excel generation directly\n');

  try {
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Applicants');

    sheet.columns = [
      { header: 'Candidate Email', key: 'email', width: 30 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Experience Years', key: 'experienceYears', width: 18 },
      { header: 'Applied At', key: 'appliedAt', width: 20 },
      { header: 'Expected Salary', key: 'expectedSalary', width: 18 },
      { header: 'ATS Score', key: 'atsScore', width: 12 },
      { header: 'CV Filename', key: 'cvUrl', width: 40 },
    ];

    // Add sample data
    sheet.addRow({
      email: 'test3@gmail.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '004155',
      experienceYears: 2,
      appliedAt: new Date('2025-12-14').toLocaleString(),
      expectedSalary: '$20,000',
      atsScore: '10%',
      cvUrl: 'cv-file.pdf',
    });

    // Write to file
    const fileName = 'test-direct-excel.xlsx';
    const filePath = path.join(__dirname, fileName);
    await workbook.xlsx.writeFile(filePath);

    console.log(`✅ Excel file created successfully!`);
    console.log(`📍 Path: ${filePath}`);
    
    // Check file exists and size
    const stats = fs.statSync(filePath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`\n✨ Excel generation works perfectly!`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testExcelGeneration();
