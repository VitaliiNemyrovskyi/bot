import { NextRequest } from 'next/server';
import { POST } from './src/app/api/auth/login/route';

async function testLoginAPI() {
  try {
    console.log('=== Testing Login API Route Directly ===\n');

    const body = JSON.stringify({
      email: 'admin@test.com',
      password: 'password123'
    });

    // Create a mock request
    const mockRequest = {
      json: async () => ({ email: 'admin@test.com', password: 'password123' }),
      headers: new Map(),
    } as any as NextRequest;

    console.log('Calling POST handler...');
    const response = await POST(mockRequest);

    console.log('Response status:', response.status);

    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

  } catch (error: any) {
    console.error('Error testing login API:', error);
    console.error('Error stack:', error.stack);
  }
}

testLoginAPI();
