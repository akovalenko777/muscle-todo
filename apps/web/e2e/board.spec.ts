import { test, expect } from './fixtures';

test('create a new task', async ({ authenticatedPage: page }) => {
  await page.getByText('Додати задачу').click()
  await page.getByLabel('Назва задачі').fill('Test task title')
  await page.getByLabel('Детальний опис').fill('Test task description')
  await page.getByText('Зберегти').click()
  expect(page.locator('.MuiPaper-root:nth-child(1)', {
    has: page.getByText('Test task title')
  }))
})

test('drags a task from Planned to In Progress', async ({ authenticatedPage: page, testTask: task }) => {
  const sourceCard = page.getByText(task.title)
  const targetColumn = page.getByText('В процесі')

  const sourceBox = await sourceCard.boundingBox()
  const targetBox = await targetColumn.boundingBox()

  if (!sourceBox || !targetBox) throw new Error('Could not locate drag elements')

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(sourceBox.x + 20, sourceBox.y + 20)
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
  await page.mouse.up()

  await expect(page.getByText(task.title)).toBeVisible()
  expect(page.locator('.MuiPaper-root:nth-child(2)', {
    has: page.getByText(task.title)
  }))
})