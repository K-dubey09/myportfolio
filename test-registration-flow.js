// Test the complete registration flow
const testRegistration = async () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testName = 'Test User';
  const testPassword = 'password123';
  
  console.log('🧪 Testing registration flow...');
  console.log('📧 Test email:', testEmail);
  
  try {
    // Step 1: Request email verification
    console.log('\n1️⃣ Requesting email verification...');
    const response1 = await fetch('http://localhost:5000/api/auth/register/request-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: testName,
        password: testPassword
      })
    });
    
    const result1 = await response1.json();
    console.log('Response:', result1);
    
    if (!response1.ok) {
      console.error('❌ Registration request failed');
      return;
    }
    
    console.log('✅ Email verification request successful');
    console.log('🔗 Verification link:', result1.verificationLink);
    
    // Extract parameters from the verification link
    const linkUrl = new URL(result1.verificationLink);
    const oobCode = linkUrl.searchParams.get('oobCode');
    console.log('🔑 OOB Code:', oobCode);
    
    // Step 2: Simulate Firebase email verification (this would normally be done by clicking the email link)
    // In a real scenario, Firebase handles this automatically when user clicks the email link
    console.log('\n2️⃣ In real scenario: User clicks email link, Firebase verifies email automatically');
    
    // Step 3: Complete registration (simulate what happens after email verification)
    console.log('\n3️⃣ Completing registration...');
    const response2 = await fetch('http://localhost:5000/api/auth/register/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: result1.uid
      })
    });
    
    const result2 = await response2.json();
    console.log('Registration completion response:', result2);
    
    if (response2.ok) {
      console.log('✅ Registration completed successfully!');
      console.log('🎉 User created:', result2.user);
    } else {
      console.error('❌ Registration completion failed:', result2.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testRegistration();