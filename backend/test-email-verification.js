// Simple test to verify the email verification API
const testEmailVerification = async () => {
  try {
    console.log('Testing email verification request...');
    
    const response = await fetch('http://localhost:5000/api/auth/register/request-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
    if (response.ok) {
      console.log('✅ Email verification request successful');
    } else {
      console.log('❌ Email verification request failed');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testEmailVerification();