import { test as base, request as playwrightRequest } from '@playwright/test';

interface TestUser {
  email: string;
  name: string;
  password: string;
}

export const test = base.extend<{ testUser: TestUser }>({
  testUser: async ({}, use, testInfo) => {
    const user: TestUser = {
      email: `e2e-${testInfo.testId}-${new Date().getTime()}@test.com`,
      name: 'E2E Frontend',
      password: 'Aa1',
    };

    console.log('Trying to create user:', user.email)
    const apiContext = await playwrightRequest.newContext();
    const response = await apiContext.post('http://localhost:3000/users', { data: user });
    const body = await response.text();
    if (response.status() !== 201) {
      throw new Error(`Failed to create test user: ${response.status()} - ${body}`);
    }
    await apiContext.dispose();

    await use(user);
  },
});

export { expect } from '@playwright/test';