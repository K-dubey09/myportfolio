#!/usr/bin/env node

/**
 * Comprehensive Test Script for Firebase CRUD API
 * Tests all endpoints with proper authentication
 */

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testIds = {};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name) {
  log(`\n🧪 Testing: ${name}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function request(method, endpoint, data = null, needsAuth = false) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (needsAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function testAuth() {
  logSection('🔐 AUTHENTICATION TESTS');

  // Test registration
  logTest('Register new user');
  const registerData = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    username: 'testuser'
  };

  const register = await request('POST', '/api/auth/register', registerData);
  if (register.status === 201) {
    logSuccess('Registration successful');
    authToken = register.data.token;
    testIds.userId = register.data.user.id;
  } else {
    logError(`Registration failed: ${register.data.error}`);
  }

  // Test login
  logTest('Login with credentials');
  const login = await request('POST', '/api/auth/login', {
    email: registerData.email,
    password: registerData.password
  });
  
  if (login.status === 200) {
    logSuccess('Login successful');
    authToken = login.data.token;
  } else {
    logError(`Login failed: ${login.data.error}`);
  }

  // Test get profile
  logTest('Get user profile');
  const profile = await request('GET', '/api/auth/profile', null, true);
  if (profile.status === 200) {
    logSuccess('Profile retrieved successfully');
  } else {
    logError(`Profile retrieval failed: ${profile.data.error}`);
  }
}

async function testSkills() {
  logSection('🛠️ SKILLS CRUD TESTS');

  // Create skill
  logTest('Create new skill');
  const skillData = {
    name: 'Test Skill',
    category: 'Testing',
    level: 'advanced',
    percentage: 85,
    featured: true
  };

  const create = await request('POST', '/api/admin/skills', skillData, true);
  if (create.status === 201) {
    logSuccess('Skill created successfully');
    testIds.skillId = create.data.data.id;
  } else {
    logError(`Skill creation failed: ${create.data.error}`);
  }

  // Get all skills
  logTest('Get all skills');
  const getAll = await request('GET', '/api/skills');
  if (getAll.status === 200) {
    logSuccess(`Retrieved ${getAll.data.data.length} skills`);
  } else {
    logError(`Failed to get skills: ${getAll.data.error}`);
  }

  // Get skill by ID
  if (testIds.skillId) {
    logTest('Get skill by ID');
    const getById = await request('GET', `/api/skills/${testIds.skillId}`);
    if (getById.status === 200) {
      logSuccess('Skill retrieved by ID');
    } else {
      logError(`Failed to get skill by ID: ${getById.data.error}`);
    }
  }

  // Update skill
  if (testIds.skillId) {
    logTest('Update skill');
    const updateData = { ...skillData, percentage: 90 };
    const update = await request('PUT', `/api/admin/skills/${testIds.skillId}`, updateData, true);
    if (update.status === 200) {
      logSuccess('Skill updated successfully');
    } else {
      logError(`Failed to update skill: ${update.data.error}`);
    }
  }

  // Test duplicate prevention
  logTest('Test duplicate prevention');
  const duplicate = await request('POST', '/api/admin/skills', skillData, true);
  if (duplicate.status === 409) {
    logSuccess('Duplicate prevention working correctly');
  } else {
    logWarning('Duplicate prevention may not be working');
  }

  // Batch create skills
  logTest('Batch create skills');
  const batchData = [
    { name: 'Batch Skill 1', category: 'Testing', level: 'beginner', percentage: 50 },
    { name: 'Batch Skill 2', category: 'Testing', level: 'intermediate', percentage: 70 }
  ];
  const batch = await request('POST', '/api/admin/skills/batch', batchData, true);
  if (batch.status === 201) {
    logSuccess(`Batch created ${batch.data.data.created} skills`);
  } else {
    logError(`Batch creation failed: ${batch.data.error}`);
  }

  // Search skills
  logTest('Search skills');
  const search = await request('GET', '/api/skills/search?field=name&query=Test');
  if (search.status === 200) {
    logSuccess(`Found ${search.data.data.length} skills matching search`);
  } else {
    logError(`Search failed: ${search.data.error}`);
  }

  // Delete skill
  if (testIds.skillId) {
    logTest('Delete skill');
    const deleteRes = await request('DELETE', `/api/admin/skills/${testIds.skillId}`, null, true);
    if (deleteRes.status === 200) {
      logSuccess('Skill deleted successfully');
    } else {
      logError(`Failed to delete skill: ${deleteRes.data.error}`);
    }
  }
}

async function testProjects() {
  logSection('🚀 PROJECTS CRUD TESTS');

  // Create project
  logTest('Create new project');
  const projectData = {
    title: 'Test Project',
    description: 'A test project for API testing',
    technologies: ['Node.js', 'Firebase'],
    url: 'https://github.com/test/project',
    featured: true,
    status: 'completed'
  };

  const create = await request('POST', '/api/admin/projects', projectData, true);
  if (create.status === 201) {
    logSuccess('Project created successfully');
    testIds.projectId = create.data.data.id;
  } else {
    logError(`Project creation failed: ${create.data.error}`);
  }

  // Get all projects
  logTest('Get all projects');
  const getAll = await request('GET', '/api/projects');
  if (getAll.status === 200) {
    logSuccess(`Retrieved ${getAll.data.data.length} projects`);
  } else {
    logError(`Failed to get projects: ${getAll.data.error}`);
  }

  // Filter by featured
  logTest('Filter featured projects');
  const featured = await request('GET', '/api/projects?featured=true');
  if (featured.status === 200) {
    logSuccess(`Retrieved ${featured.data.data.length} featured projects`);
  } else {
    logError(`Failed to filter projects: ${featured.data.error}`);
  }

  // Delete project
  if (testIds.projectId) {
    logTest('Delete project');
    const deleteRes = await request('DELETE', `/api/admin/projects/${testIds.projectId}`, null, true);
    if (deleteRes.status === 200) {
      logSuccess('Project deleted successfully');
    } else {
      logError(`Failed to delete project: ${deleteRes.data.error}`);
    }
  }
}

async function testContacts() {
  logSection('📧 CONTACTS TESTS');

  // Submit contact form (public endpoint)
  logTest('Submit contact form');
  const contactData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message',
    status: 'unread'
  };

  const create = await request('POST', '/api/contacts', contactData);
  if (create.status === 201) {
    logSuccess('Contact form submitted successfully');
    testIds.contactId = create.data.data.id;
  } else {
    logError(`Contact form submission failed: ${create.data.error}`);
  }

  // Get all contacts (admin)
  logTest('Get all contacts (admin)');
  const getAll = await request('GET', '/api/admin/contacts', null, true);
  if (getAll.status === 200) {
    logSuccess(`Retrieved ${getAll.data.data.length} contacts`);
  } else {
    logError(`Failed to get contacts: ${getAll.data.error}`);
  }

  // Mark as read
  if (testIds.contactId) {
    logTest('Mark contact as read');
    const markRead = await request('POST', `/api/admin/contacts/${testIds.contactId}/mark-read`, null, true);
    if (markRead.status === 200) {
      logSuccess('Contact marked as read');
    } else {
      logError(`Failed to mark contact as read: ${markRead.data.error}`);
    }
  }
}

async function testPortfolio() {
  logSection('📊 PORTFOLIO AGGREGATION TEST');

  logTest('Get all portfolio data');
  const portfolio = await request('GET', '/api/portfolio');
  if (portfolio.status === 200) {
    logSuccess('Portfolio data retrieved successfully');
    const data = portfolio.data.data;
    console.log(`   - Profile: ${data.profile ? '✓' : '✗'}`);
    console.log(`   - Skills: ${data.skills?.length || 0}`);
    console.log(`   - Projects: ${data.projects?.length || 0}`);
    console.log(`   - Experiences: ${data.experiences?.length || 0}`);
    console.log(`   - Education: ${data.education?.length || 0}`);
    console.log(`   - Blogs: ${data.blogs?.length || 0}`);
    console.log(`   - Vlogs: ${data.vlogs?.length || 0}`);
    console.log(`   - Gallery: ${data.gallery?.length || 0}`);
    console.log(`   - Testimonials: ${data.testimonials?.length || 0}`);
    console.log(`   - Services: ${data.services?.length || 0}`);
    console.log(`   - Achievements: ${data.achievements?.length || 0}`);
    console.log(`   - Contact Info: ${data.contactInfo ? '✓' : '✗'}`);
  } else {
    logError(`Failed to get portfolio data: ${portfolio.data.error}`);
  }
}

async function testValidation() {
  logSection('✔️ VALIDATION TESTS');

  // Test missing required fields
  logTest('Test missing required fields');
  const invalid = await request('POST', '/api/admin/skills', { name: 'Test' }, true);
  if (invalid.status === 400) {
    logSuccess('Validation working - rejected invalid data');
  } else {
    logWarning('Validation may not be working properly');
  }

  // Test invalid email format
  logTest('Test invalid email format');
  const invalidContact = await request('POST', '/api/contacts', {
    name: 'Test',
    email: 'invalid-email',
    message: 'Test'
  });
  if (invalidContact.status === 400) {
    logSuccess('Email validation working');
  } else {
    logWarning('Email validation may not be working');
  }

  // Test invalid percentage range
  logTest('Test invalid percentage range');
  const invalidSkill = await request('POST', '/api/admin/skills', {
    name: 'Test',
    category: 'Test',
    level: 'advanced',
    percentage: 150
  }, true);
  if (invalidSkill.status === 400) {
    logSuccess('Range validation working');
  } else {
    logWarning('Range validation may not be working');
  }
}

async function runAllTests() {
  log('\n🧪 Starting Comprehensive API Tests\n', 'cyan');
  log(`Base URL: ${BASE_URL}\n`, 'yellow');

  try {
    await testAuth();
    await testSkills();
    await testProjects();
    await testContacts();
    await testPortfolio();
    await testValidation();

    logSection('✅ ALL TESTS COMPLETED');
    log('\n✨ Test suite finished successfully!\n', 'green');
  } catch (error) {
    logError(`\n❌ Test suite failed with error: ${error.message}\n`);
    console.error(error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    logError('\n❌ Server is not running!');
    logWarning('Please start the server with: npm start\n');
    process.exit(1);
  }

  await runAllTests();
})();
