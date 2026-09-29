import { test, expect } from './fixtures';

test.use({ speechRecognitionText: 'Продиктований опис' });

test('dictates text into the rich text editor', async ({ authenticatedPage: page }) => {
  await page.getByText('Додати задачу').click()

  const editor = page.locator('.ProseMirror')
  const micButton = page.getByRole('button', { name: /голосове введення/i })
  await micButton.hover()
  await page.mouse.down()
  await page.mouse.up()
  await expect(editor).toContainText('Продиктований опис')
})