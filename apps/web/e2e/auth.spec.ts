import { test, expect } from './fixtures';

test.describe('Auth flow', () => {
  test('registers, logs in, and reaches the board', async ({ page, testUser }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUser.email)
    await page.getByLabel('Пароль').fill(testUser.password)
    await page.getByText('Увійти').click()
    await expect(page).toHaveURL('/board')
  });
});