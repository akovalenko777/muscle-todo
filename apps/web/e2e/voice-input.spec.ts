import { test, expect } from './fixtures';

test.use({ speechRecognitionText: 'Продиктована назва задачі' });

test('create a task title via voice input', async ({ authenticatedPage: page }) => {
  await page.getByText('Додати задачу').click()
  await page.locator('#task-title + div > button').hover()
  await page.mouse.down()
  await expect(page.locator('#task-title')).toHaveValue('Продиктована назва задачі')
  await page.mouse.up()
})
