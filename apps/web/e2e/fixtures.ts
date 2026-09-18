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

    const apiContext = await playwrightRequest.newContext();
    const response = await apiContext.post(process.env.API_BASE_URL+'/users', { data: user });
    const body = await response.text();
    if (response.status() !== 201) {
      throw new Error(`Failed to create test user: ${response.status()}`);
    }
    await apiContext.dispose();

    await use(user);
  },
});

export { expect } from '@playwright/test';