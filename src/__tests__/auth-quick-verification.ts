/**
 * Quick Authentication Verification Script
 * 
 * This script performs basic checks to verify the authentication system is working.
 * Run this before running full E2E tests to ensure the system is ready.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const results: TestResult[] = [];

function logResult(test: string, status: 'PASS' | 'FAIL', message: string) {
  results.push({ test, status, message });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
}

async function testBackendConnection() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      logResult('Backend Connection', 'PASS', 'Backend is reachable');
      return true;
    }
  } catch (error) {
    logResult('Backend Connection', 'FAIL', 'Cannot connect to backend. Is it running?');
    return false;
  }
  return false;
}

async function testUserRegistration() {
  try {
    const uniqueEmail = `test.${Date.now()}@example.com`;
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: uniqueEmail,
      password: 'TestPassword123!',
    });

    if (response.status === 200 || response.status === 201) {
      if (response.data.token && response.data.user) {
        logResult('User Registration', 'PASS', 'User registered successfully with token');
        return { success: true, email: uniqueEmail, token: response.data.token };
      } else {
        logResult('User Registration', 'FAIL', 'Registration succeeded but missing token or user data');
        return { success: false };
      }
    }
  } catch (error: any) {
    logResult('User Registration', 'FAIL', `Registration failed: ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
  return { success: false };
}

async function testDuplicateEmailValidation(email: string) {
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email: email,
      password: 'TestPassword123!',
    });
    logResult('Duplicate Email Validation', 'FAIL', 'Should have rejected duplicate email');
    return false;
  } catch (error: any) {
    if (error.response?.status === 409 || error.response?.status === 400) {
      logResult('Duplicate Email Validation', 'PASS', 'Duplicate email correctly rejected');
      return true;
    } else {
      logResult('Duplicate Email Validation', 'FAIL', `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testUserLogin(email: string, password: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email,
      password: password,
    });

    if (response.status === 200) {
      if (response.data.token && response.data.user) {
        logResult('User Login', 'PASS', 'Login successful with token');
        return { success: true, token: response.data.token };
      } else {
        logResult('User Login', 'FAIL', 'Login succeeded but missing token or user data');
        return { success: false };
      }
    }
  } catch (error: any) {
    logResult('User Login', 'FAIL', `Login failed: ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
  return { success: false };
}

async function testInvalidCredentials() {
  try {
    await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'WrongPassword123!',
    });
    logResult('Invalid Credentials', 'FAIL', 'Should have rejected invalid credentials');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      logResult('Invalid Credentials', 'PASS', 'Invalid credentials correctly rejected');
      return true;
    } else {
      logResult('Invalid Credentials', 'FAIL', `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testProtectedEndpoint(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200 && response.data.user) {
      logResult('Protected Endpoint', 'PASS', 'Protected endpoint accessible with valid token');
      return true;
    }
  } catch (error: any) {
    logResult('Protected Endpoint', 'FAIL', `Cannot access protected endpoint: ${error.message}`);
    return false;
  }
  return false;
}

async function testProtectedEndpointWithoutToken() {
  try {
    await axios.get(`${API_BASE_URL}/auth/me`);
    logResult('Protected Endpoint Without Token', 'FAIL', 'Should have rejected request without token');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      logResult('Protected Endpoint Without Token', 'PASS', 'Request without token correctly rejected');
      return true;
    } else {
      logResult('Protected Endpoint Without Token', 'FAIL', `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testPasswordHashing(email: string, password: string) {
  // This test would require database access, so we'll just verify the password is not returned
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email,
      password: password,
    });

    if (response.data.user && !response.data.user.password && !response.data.user.password_hash) {
      logResult('Password Security', 'PASS', 'Password/hash not returned in response');
      return true;
    } else {
      logResult('Password Security', 'FAIL', 'Password or hash found in response');
      return false;
    }
  } catch (error) {
    logResult('Password Security', 'FAIL', 'Could not verify password security');
    return false;
  }
}

async function runAllTests() {
  console.log('\n🧪 Authentication System Quick Verification\n');
  console.log('='.repeat(60));
  console.log('\n');

  // Test 1: Backend Connection
  const backendConnected = await testBackendConnection();
  if (!backendConnected) {
    console.log('\n❌ Backend is not running. Please start the backend server first.');
    console.log('   Run: npm start (from backend directory)\n');
    return;
  }

  console.log('\n');

  // Test 2: User Registration
  const registrationResult = await testUserRegistration();
  if (!registrationResult.success) {
    console.log('\n❌ Registration failed. Cannot continue with other tests.\n');
    return;
  }

  console.log('\n');

  // Test 3: Duplicate Email Validation
  await testDuplicateEmailValidation(registrationResult.email!);

  console.log('\n');

  // Test 4: User Login
  const loginResult = await testUserLogin(registrationResult.email!, 'TestPassword123!');

  console.log('\n');

  // Test 5: Invalid Credentials
  await testInvalidCredentials();

  console.log('\n');

  // Test 6: Protected Endpoint with Token
  if (loginResult.success && loginResult.token) {
    await testProtectedEndpoint(loginResult.token);
  }

  console.log('\n');

  // Test 7: Protected Endpoint without Token
  await testProtectedEndpointWithoutToken();

  console.log('\n');

  // Test 8: Password Security
  await testPasswordHashing(registrationResult.email!, 'TestPassword123!');

  // Summary
  console.log('\n');
  console.log('='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! Authentication system is working correctly.\n');
    console.log('You can now run the full E2E test suite:');
    console.log('   npm run test:auth\n');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues before running E2E tests.\n');
    console.log('Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.test}: ${r.message}`);
    });
    console.log('\n');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Unexpected error running tests:', error.message);
  process.exit(1);
});
