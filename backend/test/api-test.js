import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// Test utility functions
const log = (test, result) => {
  console.log(`${result ? '✅' : '❌'} ${test}`);
  return result;
};

const testEndpoint = async (method, endpoint, data = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Server Health Check
  total++;
  const health = await testEndpoint('GET', '/api/health');
  if (log('Server Health Check', health.success)) passed++;
  
  // Test 2: Get Profile
  total++;
  const profile = await testEndpoint('GET', '/api/profile');
  if (log('Get Profile', profile.success)) passed++;
  
  // Test 3: Get Projects
  total++;
  const projects = await testEndpoint('GET', '/api/projects');
  if (log('Get Projects', projects.success)) passed++;
  
  // Test 4: Get Skills
  total++;
  const skills = await testEndpoint('GET', '/api/skills');
  if (log('Get Skills', skills.success)) passed++;
  
  // Test 5: Admin Login
  total++;
  const login = await testEndpoint('POST', '/api/auth/login', {
    email: 'admin@portfolio.com',
    password: 'admin123'
  });
  if (log('Admin Login', login.success)) passed++;
  
  let token = null;
  if (login.success) {
    token = login.data.token;
  }
  
  // Test 6: Protected Route (if login successful)
  if (token) {
    total++;
    const protectedTest = await fetch(`${API_BASE}/api/auth/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (log('Protected Route Access', protectedTest.ok)) passed++;
  }
  
  // Test 7: Get Portfolio Data
  total++;
  const portfolio = await testEndpoint('GET', '/api/portfolio');
  if (log('Get Portfolio Data', portfolio.success)) passed++;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed!');
    process.exit(1);
  }
};

// Wait for server to start
setTimeout(runTests, 1000);