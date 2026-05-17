import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3002/api';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface JobResponse {
  job: {
    id: number;
    title: string;
  };
}

async function testExportEndpoint() {
  try {
    console.log('🧪 Testing Export Endpoint\n');

    // Step 1: Login as existing HR user
    console.log('1️⃣  Logging in as HR user...');
    try {
      const loginRes = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, {
        email: 'mahmoudhamedabdo9@gmail.com',
        password: 'password123',
      });
      console.log('✅ Login successful');

      const accessToken = loginRes.data.accessToken;
      const headers = { Authorization: `Bearer ${accessToken}` };

      // Use existing job with applications
      const jobId = 19;
      console.log(`\n2️⃣  Using existing job ID: ${jobId}`);

      // Step 2: Call the export endpoint
      console.log(`3️⃣  Calling export endpoint for job ID: ${jobId}...`);
      try {
        const exportRes = await axios.get(
          `${BASE_URL}/application/job/${jobId}/export`,
          {
            headers,
            responseType: 'arraybuffer',
          }
        );

        const fileName = `test-export-job-${jobId}.xlsx`;
        const filePath = path.join(__dirname, fileName);
        const buffer = Buffer.from(exportRes.data as ArrayBuffer);
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Export successful! File saved to: ${filePath}`);
        console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`\n✨ Excel file is ready for download!`);
      } catch (err: any) {
        console.error('❌ Export failed');
        console.error('Status:', err.response?.status);
        console.error('Error details:', err.response?.data);
      }
    } catch (loginErr: any) {
      console.error('❌ Login failed');
      console.error('Status:', loginErr.response?.status);
      console.error('Error:', loginErr.response?.data);
    }
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testExportEndpoint().catch(console.error);
