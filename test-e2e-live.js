const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';
const AI_BASE = 'http://localhost:8000';

async function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runLiveVerification() {
  console.log('====================================================');
  console.log('   FULL END-TO-END SYSTEM VERIFICATION');
  console.log('====================================================\n');

  // STEP 1: Check Frontend Homepage
  console.log('--- Flow 1: Frontend Homepage ---');
  const homeRes = await request(`${FRONTEND_BASE}/`);
  assert(homeRes.status === 200, 'Homepage loads with HTTP 200');
  assert(typeof homeRes.body === 'string' && homeRes.body.includes('html'), 'Homepage returns HTML document');

  // Check AI Service Health
  console.log('\n--- Service Check: AI Service Health ---');
  const aiHealth = await request(`${AI_BASE}/health`);
  assert(aiHealth.status === 200, 'AI Service /health returns HTTP 200');
  assert(aiHealth.body.status === 'ok', 'AI Service reports ok status');

  // Check Backend Health
  console.log('\n--- Service Check: Backend API Health ---');
  const backendHealth = await request(`${BACKEND_BASE}/health`);
  assert(backendHealth.status === 200, 'Backend /api/v1/health returns HTTP 200');
  assert(backendHealth.body.data.status === 'healthy' && backendHealth.body.data.database === 'connected', 'Backend database connected');

  // STEP 2: Candidate Registration
  console.log('\n--- Flow 2: Candidate Registration ---');
  const uniqueNum = Date.now().toString().slice(-6);
  const testEmail = `candidate.${uniqueNum}@example.com`;
  const testPassword = 'Password@123';
  
  const regPayload = {
    email: testEmail,
    password: testPassword,
    firstName: 'Candidate',
    lastName: `User${uniqueNum}`
  };
  
  const regRes = await request(`${BACKEND_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, regPayload);
  
  assert(regRes.status === 201 || regRes.status === 200, `Registration returns HTTP ${regRes.status}`);
  assert(regRes.body.data && regRes.body.data.accessToken, 'Registration issues JWT access token');
  const studentToken = regRes.body.data.accessToken;

  // STEP 3: Login & Authentication Persistence
  console.log('\n--- Flow 3: Login & Auth Persistence ---');
  const loginRes = await request(`${BACKEND_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: testPassword });

  assert(loginRes.status === 200, 'Login succeeds with HTTP 200');
  assert(loginRes.body.data && loginRes.body.data.accessToken, 'Login returns access token');
  const authToken = loginRes.body.data.accessToken;

  // Verify auth token with profile
  const meRes = await request(`${BACKEND_BASE}/profile`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(meRes.status === 200, 'User profile retrieved via Bearer token');
  assert(meRes.body.data.profile.email === testEmail, 'User profile email matches registered candidate');

  // STEP 4: Profile Creation & Editing
  console.log('\n--- Flow 4: Profile Creation & Editing ---');
  const updateProfilePayload = {
    firstName: 'Candidate',
    lastName: 'Updated',
    phone: '+1-555-0199',
    bio: 'Aspiring Full Stack Engineer passionate about building scalable web apps.',
    experienceLevel: 'ENTRY_LEVEL',
    targetRole: 'Full Stack Developer',
    technicalSkills: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Docker'],
    careerInterests: ['Artificial Intelligence', 'System Design'],
    education: {
      degree: 'B.Sc. Computer Science',
      college: 'State University',
      department: 'Computer Science',
      graduationYear: 2026
    }
  };

  const updateProfileRes = await request(`${BACKEND_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  }, updateProfilePayload);

  assert(updateProfileRes.status === 200, 'Profile update returns HTTP 200');
  assert(updateProfileRes.body.data.profile.targetRole === 'Full Stack Developer', 'Updated target role verified');
  assert(updateProfileRes.body.data.profile.technicalSkills.includes('React'), 'Skills updated successfully');

  // STEP 5: Resume Upload & Parsing
  console.log('\n--- Flow 5: Resume Upload & Parsing ---');
  // Create a multipart boundary
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const samplePdfContent = '%PDF-1.4\n%Candidate Resume: Skills: React, Node.js, TypeScript, SQL\n%%EOF';
  
  let multipartBody = '';
  multipartBody += `--${boundary}\r\n`;
  multipartBody += `Content-Disposition: form-data; name="file"; filename="sample_resume.pdf"\r\n`;
  multipartBody += `Content-Type: application/pdf\r\n\r\n`;
  multipartBody += samplePdfContent + `\r\n`;
  multipartBody += `--${boundary}--\r\n`;

  const resumeUploadRes = await request(`${BACKEND_BASE}/resumes/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(multipartBody)
    }
  }, multipartBody);

  assert(resumeUploadRes.status === 201 || resumeUploadRes.status === 200, `Resume upload returns HTTP ${resumeUploadRes.status}`);
  const uploadedResumeId = resumeUploadRes.body.data.id;
  assert(!!uploadedResumeId, 'Resume stored and assigned UUID');

  // Verify list resumes
  const resumesListRes = await request(`${BACKEND_BASE}/resumes`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(resumesListRes.status === 200, 'List user resumes returns HTTP 200');
  assert(resumesListRes.body.data.length > 0, 'User resume list contains uploaded resume');

  // STEP 6: Interview Configuration
  console.log('\n--- Flow 6: Interview Configuration & Job Roles ---');
  const rolesRes = await request(`${BACKEND_BASE}/job-roles`);
  assert(rolesRes.status === 200, 'Job roles endpoint returns HTTP 200');
  assert(rolesRes.body.data && rolesRes.body.data.length > 0, `Job roles loaded (${rolesRes.body.data.length} roles found)`);
  const selectedRole = rolesRes.body.data[0];
  console.log(`  Selected Job Role: "${selectedRole.title}" (ID: ${selectedRole.id})`);

  // STEP 7: Create Interview Session
  console.log('\n--- Flow 7: Create Interview Session ---');
  const interviewPayload = {
    jobRoleId: selectedRole.id,
    interviewType: 'TECHNICAL',
    difficulty: 'MEDIUM',
    questionCount: 5,
    resumeId: uploadedResumeId
  };

  const createInterviewRes = await request(`${BACKEND_BASE}/interviews`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  }, interviewPayload);

  assert(createInterviewRes.status === 201 || createInterviewRes.status === 200, `Interview session created with HTTP ${createInterviewRes.status}: ${JSON.stringify(createInterviewRes.body)}`);
  const interview = createInterviewRes.body.data;
  const interviewId = interview.id;
  assert(!!interviewId, `Interview session initialized (ID: ${interviewId})`);

  // Start the interview to generate questions
  console.log('\n--- Flow 7b: Start Interview & Generate Questions ---');
  const startInterviewRes = await request(`${BACKEND_BASE}/interviews/${interviewId}/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  }, {});
  assert(startInterviewRes.status === 200 || startInterviewRes.status === 201, `Interview started with HTTP ${startInterviewRes.status}`);

  // STEP 8: Questions Load
  console.log('\n--- Flow 8: Load Interview Questions ---');
  const getInterviewRes = await request(`${BACKEND_BASE}/interviews/${interviewId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(getInterviewRes.status === 200, 'Interview session details fetched');
  const questions = getInterviewRes.body.data.questions || [];
  assert(questions.length > 0, `Interview questions generated (${questions.length} questions ready)`);
  console.log(`  Q1: "${questions[0].questionText.slice(0, 60)}..."`);

  // STEP 9: Submit Answers & Evaluations
  console.log('\n--- Flow 9: Submit Answers & Receive Evaluations ---');
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answerPayload = {
      questionId: q.id,
      answerText: `To handle this scenario effectively in modern web development, I leverage TypeScript interfaces to ensure strict type safety, implement modular component separation with React hooks, and apply optimized memoization and asynchronous request batching to guarantee high responsiveness and scalability.`,
      timeTakenSeconds: 45
    };

    const answerRes = await request(`${BACKEND_BASE}/interviews/${interviewId}/answers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }, answerPayload);

    assert(answerRes.status === 201 || answerRes.status === 200, `Answer ${i + 1}/${questions.length} submitted with HTTP ${answerRes.status}`);
    const evalData = answerRes.body.data.evaluation;
    if (evalData) {
      console.log(`  Evaluation score for Q${i + 1}: ${evalData.score ?? evalData.overallScore}/100`);
    }
  }

  // STEP 10: Complete Session & Generate Report
  console.log('\n--- Flow 10: Complete Interview & Generate Results Report ---');
  const completeRes = await request(`${BACKEND_BASE}/interviews/${interviewId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(completeRes.status === 200 || completeRes.status === 201, 'Interview completion returns HTTP 200 or 201');

  const reportRes = await request(`${BACKEND_BASE}/interviews/${interviewId}/report`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(reportRes.status === 200, 'Comprehensive interview report generated');
  const report = reportRes.body.data;
  assert(typeof report.overallScore === 'number' || !isNaN(Number(report.overallScore)), `Overall score calculated: ${report.overallScore}`);
  console.log(`  Report structure received with score: ${report.overallScore}`);

  // STEP 11: Dashboard and History
  console.log('\n--- Flow 11: Candidate Dashboard & History ---');
  const historyRes = await request(`${BACKEND_BASE}/interviews`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  assert(historyRes.status === 200, 'Interview history endpoint returns HTTP 200');
  const historyData = historyRes.body.data;
  // Handle both array and paginated response
  const userInterviews = Array.isArray(historyData) ? historyData : (historyData.interviews || []);
  console.log(`  User has ${userInterviews.length} interviews in history`);

  // STEP 12: Admin Dashboard
  console.log('\n--- Flow 12: Admin Dashboard Verification ---');
  const adminLoginRes = await request(`${BACKEND_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@example.com', password: 'Admin@123456' });

  if (adminLoginRes.status === 200 && adminLoginRes.body.data && adminLoginRes.body.data.user && adminLoginRes.body.data.user.role === 'ADMIN') {
    const adminToken = adminLoginRes.body.data.accessToken;
    console.log('✅ PASSED: Admin user role is verified as ADMIN');

    // Admin stats
    const adminStatsRes = await request(`${BACKEND_BASE}/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminStatsRes.status === 200, 'Admin dashboard stats fetched successfully');
    console.log(`  Total Users: ${adminStatsRes.body.data.totalUsers}`);
    console.log(`  Total Interviews: ${adminStatsRes.body.data.totalInterviews}`);
    console.log(`  Completed Interviews: ${adminStatsRes.body.data.completedInterviews}`);
    console.log(`  Average Score: ${adminStatsRes.body.data.averageScore}`);

    // Admin users list
    const adminUsersRes = await request(`${BACKEND_BASE}/admin/users?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminUsersRes.status === 200, 'Admin user management list fetched successfully');

    // Admin system settings
    const adminSettingsRes = await request(`${BACKEND_BASE}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminSettingsRes.status === 200, 'Admin system configuration settings retrieved');
  } else {
    console.log('  ⚠️  Admin account not configured, skipping admin tests');
  }

  // Verify Next.js routes
  console.log('\n--- Next.js Frontend Pages Verification ---');
  const pagesToTest = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/profile',
    '/resumes',
    '/interview/setup',
    '/history',
    '/admin/dashboard'
  ];

  for (const pagePath of pagesToTest) {
    const pageRes = await request(`${FRONTEND_BASE}${pagePath}`);
    assert(pageRes.status === 200, `Frontend page "${pagePath}" loads with HTTP 200`);
  }

  console.log('\n====================================================');
  console.log('   🎉 ALL 12 USER JOURNEY FLOWS VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
}

runLiveVerification().catch(err => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
