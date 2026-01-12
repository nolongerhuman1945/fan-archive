import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

let sessionCookies = null;
let isAuthenticated = false;

const AO3_BASE_URL = 'https://archiveofourown.org';
const AO3_LOGIN_URL = `${AO3_BASE_URL}/users/login`;

export async function authenticate() {
  if (isAuthenticated && sessionCookies) {
    return sessionCookies;
  }

  const username = process.env.AO3_USERNAME;
  const password = process.env.AO3_PASSWORD;

  if (!username || !password) {
    throw new Error('AO3 credentials not configured. Please set AO3_USERNAME and AO3_PASSWORD in .env file');
  }

  try {
    const loginPageResponse = await fetch(AO3_LOGIN_URL);
    const loginPageHtml = await loginPageResponse.text();
    
    const authenticityTokenMatch = loginPageHtml.match(/name="authenticity_token" value="([^"]+)"/);
    if (!authenticityTokenMatch) {
      throw new Error('Failed to extract authenticity token from login page');
    }
    const authenticityToken = authenticityTokenMatch[1];

    const cookies = loginPageResponse.headers.get('set-cookie') || '';
    const sessionCookie = cookies.split(';')[0];

    const formData = new URLSearchParams();
    formData.append('user[login]', username);
    formData.append('user[password]', password);
    formData.append('authenticity_token', authenticityToken);
    formData.append('commit', 'Log in');

    const loginResponse = await fetch(AO3_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie,
        'Referer': AO3_LOGIN_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString(),
      redirect: 'manual'
    });

    const responseCookies = loginResponse.headers.get('set-cookie');
    if (!responseCookies) {
      throw new Error('Login failed: No cookies received');
    }

    const cookieArray = responseCookies.split(',').map(c => c.trim().split(';')[0]);
    sessionCookies = cookieArray.join('; ');
    
    const location = loginResponse.headers.get('location');
    if (location && location.includes('/users/')) {
      isAuthenticated = true;
      console.log('✅ Successfully authenticated with AO3');
      return sessionCookies;
    } else {
      throw new Error('Login failed: Invalid credentials or authentication error');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

export function getSessionCookies() {
  return sessionCookies;
}

export function clearSession() {
  sessionCookies = null;
  isAuthenticated = false;
}

export async function ensureAuthenticated() {
  if (!isAuthenticated || !sessionCookies) {
    await authenticate();
  }
  return sessionCookies;
}
