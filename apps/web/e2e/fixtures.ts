import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import type { APIRequestContext, Page, TestInfo } from '@playwright/test';
import { mockSpeechRecognition } from './mock-speech-recognition';

declare const process: {
  env: Record<string, string | undefined>;
};

interface TestUser {
  email: string;
  name: string;
  password?: string;
}

const authHelper = async (user: TestUser, apiContext: APIRequestContext): Promise<string> => {
  const response = await apiContext.post(`${process.env.API_BASE_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (response.status() !== 200) {
    throw new Error('Unable to auth user')
  }
  const { accessToken } = await response.json();
  return accessToken
}

const authenticatedPageHelper = async (
  { page, user, request, speechRecognitionText }: { page: Page, user: TestUser, request: APIRequestContext, speechRecognitionText: string | null },
  use: (r: Page) => Promise<void>) => {
  if (speechRecognitionText !== null) {
    await mockSpeechRecognition(page, speechRecognitionText);
  }
  const loginResponse = await request.post(`${process.env.API_BASE_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  const { refreshToken } = await loginResponse.json();
  await page.goto('/login');
  await page.evaluate((token) => {
    localStorage.setItem('refreshToken', token);
  }, refreshToken);

  await page.goto('/board');
  await expect(page.locator('h1')).toBeVisible()

  await use(page);
}

const createUserHelper = async (iteration: number, token: string, testInfo: TestInfo, apiContext: APIRequestContext): Promise<TestUser[]> => {
  const users: TestUser[] = []
  const response = await apiContext.post(process.env.API_BASE_URL + '/users', {
    headers: { Authorization: `bearer ${token}` },
    data: {
      name: 'E2E Auto User ' + iteration,
      email: `e2etest${iteration}-${testInfo.testId}-${new Date().getTime()}@test.com`,
      password: 'Aa1'
    }
  });
  if (response.status() !== 201) {
    throw new Error(`Failed to create test user: ${response.status()}`);
  }
  const json = await response.json()
  users.push({
    name: json.name,
    email: json.email,
  })
  if (iteration < 7){
    const subusers = await createUserHelper(iteration+1, token, testInfo, apiContext)
    users.push(...subusers)
  }
  return users
}

export const test = base.extend<{
  testUser: TestUser;
  testAdmin: TestUser;
  authenticatedPage: Page;
  authenticatedAdminPage: Page;
  testUsers: TestUser[];
  speechRecognitionText: string | null;
}>({
  speechRecognitionText: [null, { option: true }],
  testUser: async ({ }, use, testInfo) => {
    const user: TestUser = {
      email: `e2e-${testInfo.testId}-${new Date().getTime()}@test.com`,
      name: 'E2E Frontend',
      password: 'Aa1',
    };
    const apiContext = await playwrightRequest.newContext();
    const response = await apiContext.post(process.env.API_BASE_URL + '/users', { data: user });
    if (response.status() !== 201) {
      throw new Error(`Failed to create test user: ${response.status()}`);
    }
    await apiContext.dispose();

    await use(user);
  },

  testAdmin: [async ({ }, use) => {
    const superAdmin: TestUser = {
      email: 'admin@localhost.com',
      name: 'E2E Admin',
      password: 'Aa1'
    }
    const admin: TestUser = {
      email: `admin-${new Date().getTime()}@localhost.com`,
      name: 'E2E Worker Admin',
      password: 'Aa1'
    }
    const apiContext = await playwrightRequest.newContext();
    await apiContext.post(process.env.API_BASE_URL + '/users', { data: superAdmin });
    const token = await authHelper(superAdmin, apiContext)
    const apiResponse = await apiContext.post(process.env.API_BASE_URL + '/users', { data: admin });
    if (apiResponse.status() !== 201) {
      throw new Error(`Failed to create worker admin: ${apiResponse.status()}`);
    }
    const json = await apiResponse.json()
    const adminResponse = await apiContext.patch(process.env.API_BASE_URL + '/users/'+json.id, {
      headers: { Authorization: `bearer ${token}` }, 
      data: {
        role: 'ADMIN'
      }
    });
    if (adminResponse.status() !== 200) {
      throw new Error(`Failed to set ADMIN role: ${adminResponse.status()}`);
    }
    const adminJson = await adminResponse.json()
    expect(adminJson.role).toBe('ADMIN')
    await apiContext.post(process.env.API_BASE_URL + '/auth/logout', { headers: { Authorization: `bearer ${token}` },  });
    await apiContext.dispose();
    await use(admin)
  }, { scope: 'worker' }],

  authenticatedPage: async ({ page, testUser, request, speechRecognitionText }, use) => {
    await authenticatedPageHelper({ page, user: testUser, request, speechRecognitionText }, use)
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authenticatedAdminPage: async ({ page, testAdmin, request, speechRecognitionText, testUsers: _testUsers }, use) => {
    await authenticatedPageHelper({ page, user: testAdmin, request, speechRecognitionText }, use)
  },

  testUsers: [async ({ testAdmin }, use, testInfo) => {
    //auth admin anf get admin token
    const apiContext = await playwrightRequest.newContext();
    const token = await authHelper(testAdmin, apiContext)
    const users: TestUser[] = await createUserHelper(0, token, testInfo, apiContext)
    await apiContext.dispose();

    await use(users);
  }, { scope: 'worker' }]
});

export { expect } from '@playwright/test';