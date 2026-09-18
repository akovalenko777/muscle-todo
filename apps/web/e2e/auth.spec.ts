import { test, expect } from './fixtures';

const testUser = {
  email: 'e2e-frontend2@test.com',
  name: 'E2E Frontend',
  password: 'Aa1',
}

test.describe('Auth flow', () => {
  test('registers, logs in, and reaches the board', async ({ page, testUser }) => {
    await page.goto('/login')
    await page.getByLabel('Your email').fill(testUser.email)
    await page.getByLabel('Password').fill(testUser.password)
    await page.getByText('Sign In').click()
    await expect(page).toHaveURL('/board')
  });
});