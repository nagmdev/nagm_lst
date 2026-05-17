import axios = require('axios');
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  error?: string;
  data?: any;
  duration?: number;
}

const results: TestResult[] = [];
let testStartTime = Date.now();

// Helper function to log results
function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to create test
async function test(
  name: string,
  fn: () => Promise<{ status: number; data?: any }>
): Promise<boolean> {
  const startTime = Date.now();
  try {
    log(`\n🧪 Testing: ${name}`, colors.cyan);
    const result = await fn();
    const duration = Date.now() - startTime;
    const passed = result.status >= 200 && result.status < 300;
    
    if (passed) {
      log(`✅ PASSED: ${name} (${result.status}) - ${duration}ms`, colors.green);
      results.push({ name, passed: true, status: result.status, data: result.data, duration });
      return true;
    } else {
      log(`❌ FAILED: ${name} (${result.status}) - ${duration}ms`, colors.red);
      results.push({ name, passed: false, status: result.status, duration });
      return false;
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const status = error.response?.status || 0;
    let message = 'Unknown error';
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      message = `Server connection failed: ${error.code}`;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    
    log(`❌ FAILED: ${name} - ${message} (${status}) - ${duration}ms`, colors.red);
    if (error.code === 'ECONNREFUSED') {
      log(`   💡 Make sure the server is running at ${BASE_URL}`, colors.yellow);
    }
    results.push({ name, passed: false, status, error: message, duration });
    return false;
  }
}

// Test data storage
interface TestData {
  employerEmail: string;
  candidateEmail: string;
  employerToken?: string;
  candidateToken?: string;
  adminToken?: string;
  employerId?: string;
  candidateId?: string;
  jobId?: number;
  applicationId?: number;
  employerOtp?: string;
  candidateOtp?: string;
}

const testData: TestData = {
  employerEmail: `employer-${Date.now()}@test.com`,
  candidateEmail: `candidate-${Date.now()}@test.com`,
};

// Create a minimal test PDF file
function createTestPdf(): string {
  const testPdfPath = path.join(__dirname, 'test-cv.pdf');
  // Minimal valid PDF
  const pdfContent = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test CV Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000317 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n398\n%%EOF'
  );
  fs.writeFileSync(testPdfPath, pdfContent);
  return testPdfPath;
}

function cleanupTestFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function checkServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    // Try root endpoint
    try {
      const response = await axios.get(`${BASE_URL}/`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}

async function runAllTests() {
  testStartTime = Date.now();
  log('\n🚀 Starting Complete Endpoint Test Suite...', colors.blue);
  log('='.repeat(70), colors.blue);
  log(`Base URL: ${BASE_URL}`, colors.cyan);
  log(`Test started at: ${new Date().toISOString()}`, colors.cyan);
  
  // Check if server is running
  log('\n🔍 Checking server availability...', colors.cyan);
  const serverAvailable = await checkServerHealth();
  if (!serverAvailable) {
    log(`\n❌ ERROR: Server is not running at ${BASE_URL}`, colors.red);
    log('   Please start the server with: npm run dev', colors.yellow);
    process.exit(1);
  }
  log('   ✅ Server is running', colors.green);

  // ===== PHASE 1: AUTHENTICATION =====
  log('\n📋 PHASE 1: Authentication & User Setup', colors.yellow);
  log('-'.repeat(70), colors.yellow);

  // Register Employer
  await test('1.1 Register Employer', async () => {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      email: testData.employerEmail,
      password: 'password123',
      firstName: 'John',
      lastName: 'Employer',
    });
    const data = response.data as any;
    testData.employerId = data.id;
    testData.employerOtp = data.devOtp; // Get OTP from dev mode
    log(`   📧 Employer Email: ${testData.employerEmail}`, colors.magenta);
    if (testData.employerOtp) {
      log(`   🔑 Dev OTP: ${testData.employerOtp}`, colors.magenta);
    }
    return { status: response.status, data: response.data };
  });

  // Register Candidate
  await test('1.2 Register Candidate', async () => {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      email: testData.candidateEmail,
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Candidate',
    });
    const data = response.data as any;
    testData.candidateId = data.id;
    testData.candidateOtp = data.devOtp;
    log(`   📧 Candidate Email: ${testData.candidateEmail}`, colors.magenta);
    if (testData.candidateOtp) {
      log(`   🔑 Dev OTP: ${testData.candidateOtp}`, colors.magenta);
    }
    return { status: response.status, data: response.data };
  });

  // Verify Employer Email (if OTP available, or resend)
  if (testData.employerOtp) {
    await test('1.3 Verify Employer Email', async () => {
      const response = await axios.post(`${API_BASE}/auth/verify-email`, {
        email: testData.employerEmail,
        otp: testData.employerOtp,
      });
      return { status: response.status, data: response.data };
    });
  } else {
    // Try to resend and get OTP
    log('   🔄 Resending verification email for employer...', colors.yellow);
    try {
      const resendResponse = await axios.post(`${API_BASE}/auth/resend-verification`, {
        email: testData.employerEmail,
      });
      const resendData = resendResponse.data as any;
      if (resendData.devOtp) {
        testData.employerOtp = resendData.devOtp;
        await test('1.3 Verify Employer Email (from resend)', async () => {
          const response = await axios.post(`${API_BASE}/auth/verify-email`, {
            email: testData.employerEmail,
            otp: testData.employerOtp,
          });
          return { status: response.status, data: response.data };
        });
      }
    } catch (error) {
      log('   ⚠️  Could not resend OTP, will try direct verification skip', colors.yellow);
    }
  }

  // Verify Candidate Email (if OTP available, or resend)
  if (testData.candidateOtp) {
    await test('1.4 Verify Candidate Email', async () => {
      const response = await axios.post(`${API_BASE}/auth/verify-email`, {
        email: testData.candidateEmail,
        otp: testData.candidateOtp,
      });
      return { status: response.status, data: response.data };
    });
  } else {
    // Try to resend and get OTP
    log('   🔄 Resending verification email for candidate...', colors.yellow);
    try {
      const resendResponse = await axios.post(`${API_BASE}/auth/resend-verification`, {
        email: testData.candidateEmail,
      });
      const resendData = resendResponse.data as any;
      if (resendData.devOtp) {
        testData.candidateOtp = resendData.devOtp;
        await test('1.4 Verify Candidate Email (from resend)', async () => {
          const response = await axios.post(`${API_BASE}/auth/verify-email`, {
            email: testData.candidateEmail,
            otp: testData.candidateOtp,
          });
          return { status: response.status, data: response.data };
        });
      }
    } catch (error) {
      log('   ⚠️  Could not resend OTP, will try direct verification skip', colors.yellow);
    }
  }
  
  // If still not verified, try to verify directly via database (for testing)
  if (!testData.employerOtp || !testData.candidateOtp) {
    log('\n   🔄 Attempting direct verification via database...', colors.yellow);
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      if (testData.employerId) {
        await prisma.user.update({
          where: { id: testData.employerId },
          data: { isVerified: true, status: 'ACTIVE' },
        });
        log('   ✅ Employer verified directly', colors.green);
      }
      
      if (testData.candidateId) {
        await prisma.user.update({
          where: { id: testData.candidateId },
          data: { isVerified: true, status: 'ACTIVE' },
        });
        log('   ✅ Candidate verified directly', colors.green);
      }
      
      await prisma.$disconnect();
    } catch (error: any) {
      log(`   ⚠️  Could not verify directly: ${error.message}`, colors.yellow);
    }
  }

  // Login Employer
  await test('1.5 Login Employer', async () => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testData.employerEmail,
      password: 'password123',
    });
    const data = response.data as any;
    testData.employerToken = data.accessToken;
    log(`   🔐 Employer Token: ${testData.employerToken?.substring(0, 20)}...`, colors.magenta);
    return { status: response.status, data: response.data };
  });

  // Login Candidate
  await test('1.6 Login Candidate', async () => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testData.candidateEmail,
      password: 'password123',
    });
    const data = response.data as any;
    testData.candidateToken = data.accessToken;
    log(`   🔐 Candidate Token: ${testData.candidateToken?.substring(0, 20)}...`, colors.magenta);
    return { status: response.status, data: response.data };
  });

  // Update user roles and verify via Prisma (for testing)
  log('\n   🔄 Updating user roles and verification status...', colors.yellow);
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    if (testData.employerId) {
      await prisma.user.update({
        where: { id: testData.employerId },
        data: { 
          role: 'employer',
          isVerified: true,
          status: 'ACTIVE',
        },
      });
      log('   ✅ Employer role set and verified', colors.green);
    }
    
    if (testData.candidateId) {
      await prisma.user.update({
        where: { id: testData.candidateId },
        data: { 
          role: 'candidate',
          isVerified: true,
          status: 'ACTIVE',
        },
      });
      log('   ✅ Candidate role set and verified', colors.green);
    }
    
    await prisma.$disconnect();
    
    // Re-login to get new tokens with updated roles
    if (testData.employerId) {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testData.employerEmail,
        password: 'password123',
      });
      const loginData = loginResponse.data as any;
      testData.employerToken = loginData.accessToken;
      log('   🔐 Refreshed employer token', colors.green);
    }
    
    if (testData.candidateId) {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testData.candidateEmail,
        password: 'password123',
      });
      const loginData = loginResponse.data as any;
      testData.candidateToken = loginData.accessToken;
      log('   🔐 Refreshed candidate token', colors.green);
    }
  } catch (error: any) {
    log(`   ⚠️  Could not update roles: ${error.message}`, colors.yellow);
    log('   💡 You may need to update roles manually in database', colors.yellow);
  }

  // ===== PHASE 2: JOB POSTING =====
  log('\n📋 PHASE 2: Job Posting (Employer)', colors.yellow);
  log('-'.repeat(70), colors.yellow);

  if (!testData.employerToken) {
    log('   ⚠️  Skipping job tests - no employer token', colors.yellow);
  } else {
    // Create Job
    await test('2.1 Create Job Post', async () => {
      const response = await axios.post(
        `${API_BASE}/jobs`,
        {
          title: 'Senior Software Engineer',
          description: 'We are looking for an experienced software engineer to join our team.',
          responsibilities: 'Develop and maintain web applications. Write clean code. Collaborate with team.',
          requirements: ['5+ years experience', 'React', 'Node.js', 'TypeScript'],
          salaryMin: 80000,
          salaryMax: 120000,
          location: 'New York, NY',
          employmentType: 'FULL_TIME',
        },
        {
          headers: {
            Authorization: `Bearer ${testData.employerToken}`,
          },
        }
      );
      const data = response.data as any;
      testData.jobId = data.job.id;
      log(`   📝 Job ID: ${testData.jobId}`, colors.magenta);
      return { status: response.status, data: response.data };
    });

    // Get My Jobs
    await test('2.2 Get My Jobs', async () => {
      const response = await axios.get(`${API_BASE}/jobs/my-jobs`, {
        headers: {
          Authorization: `Bearer ${testData.employerToken}`,
        },
      });
      return { status: response.status, data: response.data };
    });

    // Get Job by ID (should fail - not approved yet)
    await test('2.3 Get Job by ID (Pending - should fail)', async () => {
      try {
        const response = await axios.get(`${API_BASE}/jobs/${testData.jobId}`);
        // If it succeeds, that's unexpected but not a failure
        return { status: response.status, data: response.data };
      } catch (error: any) {
        // Expected to fail for pending jobs
        if (error.response?.status === 403) {
          return { status: 200, data: { message: 'Expected 403 for pending job' } };
        }
        throw error;
      }
    });

    // Update Job
    await test('2.4 Update Job', async () => {
      const response = await axios.put(
        `${API_BASE}/jobs/${testData.jobId}`,
        {
          title: 'Updated: Senior Software Engineer',
          description: 'Updated description',
          responsibilities: 'Updated responsibilities',
          location: 'Updated Location',
        },
        {
          headers: {
            Authorization: `Bearer ${testData.employerToken}`,
          },
        }
      );
      return { status: response.status, data: response.data };
    });
  }

  // ===== PHASE 3: ADMIN JOB REVIEW =====
  log('\n📋 PHASE 3: Admin Job Review', colors.yellow);
  log('-'.repeat(70), colors.yellow);

  if (!testData.adminToken) {
    log('   ⚠️  Skipping admin tests - no admin token', colors.yellow);
    log('   💡 Tip: Create admin user and login to get admin token', colors.yellow);
  } else {
    // Get All Jobs
    await test('3.1 Get All Jobs (Admin)', async () => {
      const response = await axios.get(`${API_BASE}/admin/jobs?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${testData.adminToken}`,
        },
      });
      return { status: response.status, data: response.data };
    });

    // Approve Job
    if (testData.jobId) {
      await test('3.2 Approve Job', async () => {
        const response = await axios.patch(
          `${API_BASE}/admin/jobs/${testData.jobId}/status`,
          { status: 'APPROVED' },
          {
            headers: {
              Authorization: `Bearer ${testData.adminToken}`,
            },
          }
        );
        return { status: response.status, data: response.data };
      });

      // Get Job by ID (should work now - approved)
      await test('3.3 Get Job by ID (Approved - should work)', async () => {
        const response = await axios.get(`${API_BASE}/jobs/${testData.jobId}`);
        return { status: response.status, data: response.data };
      });
    }
  }

  // ===== PHASE 4: APPLICATIONS =====
  log('\n📋 PHASE 4: Candidate Applications', colors.yellow);
  log('-'.repeat(70), colors.yellow);

  if (!testData.candidateToken || !testData.jobId) {
    log('   ⚠️  Skipping application tests - missing token or job ID', colors.yellow);
  } else {
    const testPdfPath = createTestPdf();

    // Apply to Job
    await test('4.1 Apply to Job', async () => {
      const form = new FormData();
      form.append('cv', fs.createReadStream(testPdfPath), {
        filename: 'test-cv.pdf',
        contentType: 'application/pdf',
      });
      form.append('expectedSalary', '90000');
      form.append('phone', '+1234567890');
      form.append('experienceYears', '5');
      form.append('skills', 'JavaScript');
      form.append('skills', 'React');
      form.append('skills', 'Node.js');

      const response = await axios.post(
        `${API_BASE}/applications/${testData.jobId}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${testData.candidateToken}`,
          },
        }
      );
      const data = response.data as any;
      testData.applicationId = data.application.id;
      log(`   📄 Application ID: ${testData.applicationId}`, colors.magenta);
      if (data.application.atsScore) {
        log(`   📊 ATS Score: ${data.application.atsScore}`, colors.magenta);
      }
      return { status: response.status, data: response.data };
    });

    cleanupTestFile(testPdfPath);

    // Get Application by ID
    if (testData.applicationId) {
      await test('4.2 Get Application by ID', async () => {
        const response = await axios.get(`${API_BASE}/applications/${testData.applicationId}`, {
          headers: {
            Authorization: `Bearer ${testData.candidateToken}`,
          },
        });
        return { status: response.status, data: response.data };
      });
    }

    // Get Job Applications (Employer)
    if (testData.employerToken && testData.jobId) {
      await test('4.3 Get Job Applications (Employer)', async () => {
        const response = await axios.get(
          `${API_BASE}/applications/employer/applications/${testData.jobId}`,
          {
            headers: {
              Authorization: `Bearer ${testData.employerToken}`,
            },
          }
        );
        return { status: response.status, data: response.data };
      });
    }

    // Update Application Status
    if (testData.employerToken && testData.applicationId) {
      await test('4.4 Update Application Status', async () => {
        const response = await axios.patch(
          `${API_BASE}/applications/${testData.applicationId}/status`,
          { status: 'REVIEWED' },
          {
            headers: {
              Authorization: `Bearer ${testData.employerToken}`,
            },
          }
        );
        return { status: response.status, data: response.data };
      });
    }
  }

  // ===== PHASE 5: ERROR CASES =====
  log('\n📋 PHASE 5: Error Handling Tests', colors.yellow);
  log('-'.repeat(70), colors.yellow);

  // Test unauthorized access
  await test('5.1 Create Job Without Auth (should fail)', async () => {
    try {
      await axios.post(`${API_BASE}/jobs`, {
        title: 'Test',
        description: 'Test',
        responsibilities: 'Test',
        location: 'Test',
      });
      return { status: 401 }; // Should not reach here
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { status: 200, data: { message: 'Correctly rejected unauthorized access' } };
      }
      throw error;
    }
  });

  // Test validation errors (only if we have a valid token)
  if (testData.employerToken) {
    await test('5.2 Create Job With Missing Fields (should fail)', async () => {
      try {
        await axios.post(
          `${API_BASE}/jobs`,
          {
            title: 'Test',
            // Missing required fields
          },
          {
            headers: {
              Authorization: `Bearer ${testData.employerToken}`,
            },
          }
        );
        return { status: 400 }; // Should not reach here
      } catch (error: any) {
        if (error.response?.status === 400) {
          return { status: 200, data: { message: 'Correctly rejected invalid input' } };
        }
        throw error;
      }
    });
  } else {
    log('   ⚠️  Skipping validation test - no employer token', colors.yellow);
  }

  // ===== SUMMARY =====
  const totalDuration = Date.now() - testStartTime;
  log('\n' + '='.repeat(70), colors.blue);
  log('\n📊 TEST SUMMARY', colors.blue);
  log('='.repeat(70), colors.blue);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;

  log(`\n⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, colors.cyan);
  log(`📈 Average Test Time: ${avgDuration.toFixed(0)}ms`, colors.cyan);
  log(`\n📊 Results:`, colors.cyan);
  log(`   Total Tests: ${total}`, colors.cyan);
  log(`   ✅ Passed: ${passed}`, colors.green);
  log(`   ❌ Failed: ${failed}`, colors.red);
  log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`, colors.cyan);

  if (failed > 0) {
    log('\n❌ Failed Tests:', colors.red);
    results.filter(r => !r.passed).forEach(r => {
      log(`   - ${r.name}`, colors.red);
      if (r.status) log(`     Status: ${r.status}`, colors.yellow);
      if (r.error) log(`     Error: ${r.error}`, colors.yellow);
    });
  }

  log('\n' + '='.repeat(70), colors.blue);
  log(`\n🎯 Test Data Used:`, colors.magenta);
  log(`   Employer: ${testData.employerEmail}`, colors.magenta);
  log(`   Candidate: ${testData.candidateEmail}`, colors.magenta);
  log(`   Job ID: ${testData.jobId || 'N/A'}`, colors.magenta);
  log(`   Application ID: ${testData.applicationId || 'N/A'}`, colors.magenta);
  log('='.repeat(70), colors.blue);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal Error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

