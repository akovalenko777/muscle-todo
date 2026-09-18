import { test as base, request as playwrightRequest } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockSpeechRecognition } from './mock-speech-recognition';
interface TestUser {
  email: string;
  name: string;
  password: string;
}

interface TestTask {
  title: string;
  description: string;
}

let token = ''

export const test = base.extend<{
  testUser: TestUser;
  authenticatedPage: Page;
  testTask: TestTask,
  speechRecognitionText: string | null
}>({
  speechRecognitionText: [null, { option: true }],
  testUser: async ({}, use, testInfo) => {
    const user: TestUser = {
      email: `e2e-${testInfo.testId}-${new Date().getTime()}@test.com`,
      name: 'E2E Frontend',
      password: 'Aa1',
    };

    const apiContext = await playwrightRequest.newContext();
    const response = await apiContext.post(process.env.API_BASE_URL+'/users', { data: user });
    if (response.status() !== 201) {
      throw new Error(`Failed to create test user: ${response.status()}`);
    }
    await apiContext.dispose();

    await use(user);
  },

  authenticatedPage: async ({ page, testUser, request, speechRecognitionText }, use) => {
    if (speechRecognitionText !== null) {
      await mockSpeechRecognition(page, speechRecognitionText);
    }
    const loginResponse = await request.post(`${process.env.API_BASE_URL}/auth/login`, {
      data: { email: testUser.email, password: testUser.password },
    });
    const { refreshToken, accessToken } = await loginResponse.json();
    token = accessToken
    await page.goto('/login');
    await page.evaluate((token) => {
      localStorage.setItem('refreshToken', token);
    }, refreshToken);

    await page.goto('/board');
    await use(page);
  },

  testTask: async ({}, use, testInfo) => {
    const task: TestTask = {
      title: `task-${testInfo.testId}-${new Date().getTime()}`,
      description: 'Test task description'
    };

    const apiContext = await playwrightRequest.newContext();
    const response = await apiContext.post(process.env.API_BASE_URL+'/tasks', { 
      headers: { Authorization: `bearer ${token}` },
      data: task 
    });
    if (response.status() !== 201) {
      throw new Error(`Failed to create test task: ${response.status()}`);
    }
    await apiContext.dispose();

    await use(task);
  }
});

export { expect } from '@playwright/test';