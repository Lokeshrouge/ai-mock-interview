const https = require('https');
const http = require('http');

const agent = new https.Agent({ rejectUnauthorized: false });

async function request(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      agent: isHttps ? agent : undefined
    };
    
    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    
    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testWorkflow() {
  console.log('\n=== AI Mock Interview - Complete Workflow Test ===\n');
  
  let token = null;
  let userId = null;
  let interviewId = null;
  let questionId = null;
  let answerId = null;
  
  try {
    // 1. Register new user
    console.log('1. Testing registration...');
    const email = `test_${Date.now()}@example.com`;
    const password = 'Test123!@#';
    
    const register = await request('POST', 'http://localhost:3001/api/v1/auth/register', {
      email, password
    });
    
    if (register.status === 201) {
      console.log('   ✅ Registration successful');
    } else {
      console.log('   ❌ Registration failed:', register.status);
      return;
    }
    
    // 2. Login
    console.log('2. Testing login...');
    const login = await request('POST', 'http://localhost:3001/api/v1/auth/login', {
      email, password
    });
    
    if (login.status === 200 && login.data.data.accessToken) {
      token = login.data.data.accessToken;
      userId = login.data.data.user.id;
      console.log('   ✅ Login successful');
    } else {
      console.log('   ❌ Login failed:', login.status);
      return;
    }
    
    // 3. Get job roles
    console.log('3. Getting job roles...');
    const roles = await request('GET', 'http://localhost:3001/api/v1/job-roles');
    
    if (roles.status === 200 && roles.data.data.length > 0) {
      const jobRoleId = roles.data.data[0].id;
      console.log(`   ✅ Found ${roles.data.data.length} job roles`);
      
      // 4. Create interview
      console.log('4. Creating interview...');
      const interview = await request('POST', 'http://localhost:3001/api/v1/interviews', {
        jobRoleId,
        interviewType: 'technical',
        difficulty: 'medium',
        targetRole: 'Software Engineer'
      });
      
      interview.headers = { 'Authorization': `Bearer ${token}` };
      const createReq = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/v1/interviews',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch (e) {
              resolve({ status: res.statusCode, data: body });
            }
          });
        });
        
        req.on('error', reject);
        req.write(JSON.stringify({
          jobRoleId,
          interviewType: 'technical',
          difficulty: 'medium',
          targetRole: 'Software Engineer'
        }));
        req.end();
      });
      
      if (createReq.status === 201 && createReq.data.data) {
        interviewId = createReq.data.data.id;
        console.log('   ✅ Interview created');
        
        // 5. Start interview
        console.log('5. Starting interview...');
        const startReq = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/v1/interviews/${interviewId}/start`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };
          
          const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, data: JSON.parse(body) });
              } catch (e) {
                resolve({ status: res.statusCode, data: body });
              }
            });
          });
          
          req.on('error', reject);
          req.end();
        });
        
        if (startReq.status === 200 && startReq.data.data.question) {
          questionId = startReq.data.data.question.id;
          console.log('   ✅ Interview started, question generated');
          console.log(`      Question: ${startReq.data.data.question.question_text.substring(0, 60)}...`);
          
          // 6. Submit answer
          console.log('6. Submitting answer...');
          const answerReq = await new Promise((resolve, reject) => {
            const options = {
              hostname: 'localhost',
              port: 3001,
              path: `/api/v1/interviews/${interviewId}/answers`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            };
            
            const req = http.request(options, (res) => {
              let body = '';
              res.on('data', chunk => body += chunk);
              res.on('end', () => {
                try {
                  resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                  resolve({ status: res.statusCode, data: body });
                }
              });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify({
              questionId,
              answer: 'This is a sample answer demonstrating my understanding of the concept.',
              timeTakenSeconds: 120
            }));
            req.end();
          });
          
          if (answerReq.status === 201 && answerReq.data.data) {
            answerId = answerReq.data.data.answer.id;
            console.log('   ✅ Answer submitted and evaluated');
            console.log(`      Score: ${answerReq.data.data.evaluation.score}/100`);
            console.log(`      Feedback: ${answerReq.data.data.evaluation.feedback.substring(0, 60)}...`);
            
            // 7. Complete interview
            console.log('7. Completing interview...');
            const completeReq = await new Promise((resolve, reject) => {
              const options = {
                hostname: 'localhost',
                port: 3001,
                path: `/api/v1/interviews/${interviewId}/complete`,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              };
              
              const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                  try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                  } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                  }
                });
              });
              
              req.on('error', reject);
              req.end();
            });
            
            if (completeReq.status === 200) {
              console.log('   ✅ Interview completed');
              
              // 8. Get report
              console.log('8. Getting interview report...');
              const reportReq = await new Promise((resolve, reject) => {
                const options = {
                  hostname: 'localhost',
                  port: 3001,
                  path: `/api/v1/interviews/${interviewId}/report`,
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                };
                
                const req = http.request(options, (res) => {
                  let body = '';
                  res.on('data', chunk => body += chunk);
                  res.on('end', () => {
                    try {
                      resolve({ status: res.statusCode, data: JSON.parse(body) });
                    } catch (e) {
                      resolve({ status: res.statusCode, data: body });
                    }
                  });
                });
                
                req.on('error', reject);
                req.end();
              });
              
              if (reportReq.status === 200 && reportReq.data.data) {
                console.log('   ✅ Report generated');
                console.log(`      Overall Score: ${reportReq.data.data.overallScore || 'N/A'}`);
                console.log(`      Questions: ${reportReq.data.data.totalQuestions}`);
                console.log(`      Answered: ${reportReq.data.data.answeredQuestions}`);
                
                console.log('\n✅ COMPLETE WORKFLOW TEST PASSED');
                console.log('\nAll features working:');
                console.log('  ✅ User registration');
                console.log('  ✅ User login');
                console.log('  ✅ Interview creation');
                console.log('  ✅ Question generation (AI service)');
                console.log('  ✅ Answer submission');
                console.log('  ✅ Answer evaluation (AI service)');
                console.log('  ✅ Interview completion');
                console.log('  ✅ Report generation');
              } else {
                console.log('   ❌ Report retrieval failed:', reportReq.status);
              }
            } else {
              console.log('   ❌ Interview completion failed:', completeReq.status);
            }
          } else {
            console.log('   ❌ Answer submission failed:', answerReq.status);
          }
        } else {
          console.log('   ❌ Interview start failed:', startReq.status);
        }
      } else {
        console.log('   ❌ Interview creation failed:', createReq.status);
      }
    } else {
      console.log('   ❌ Failed to get job roles:', roles.status);
    }
    
  } catch (error) {
    console.log('\n❌ Workflow test failed:', error.message);
  }
}

testWorkflow();
