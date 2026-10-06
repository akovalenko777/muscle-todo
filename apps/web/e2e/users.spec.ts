import { test, expect } from './fixtures';
// access tests
test('restricted /users page for regular user', async({ authenticatedPage: page }) => {
  await page.goto('/users')
  await expect(page.locator('h1')).toContainText('Немає доступу')
  const alertMessage = page.locator('.MuiAlert-message')
  expect(alertMessage).toBeDefined()
  await expect(alertMessage).toContainText('У вас немає достатньо прав для перегляду цієї сторінки')
})

test('allow /users page for admin', async({ authenticatedAdminPage: page }) => {
  await page.goto('/users')
  await expect(page.locator('h1')).toContainText('Список користувачів')
  expect(page.locator('.MuiTable-root')).toBeDefined()
})

//CRUD tests
test('create new user', async({ authenticatedAdminPage: page }) => {

  const user = {
    name: 'Test Created User',
    email: `testuser-${test.info().testId}-${new Date().getTime()}@test.com`
  }
  const nameField = page.locator('#user-name')
  const emailField = page.locator('#user-email')

  await page.goto('/users')

  //create user
  await page.getByText('Додати користувача').click()
  await nameField.fill(user.name)
  await emailField.fill(user.email)
  await page.locator('button[aria-label="Сгенерувати пароль"]').click()
  await page.getByText('Зберегти').click()
  await expect(page.locator('.Toastify__toast--success').last()).toContainText('Користувача додано')
  // search created user by email, not case sansetive
  await page.getByLabel("Пошук за ім'ям або email").fill(user.email.toUpperCase())
  await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('1–1 з 1')

  // edit user, change user name
  await page.locator('button[aria-label="Редагувати"]').click()
  await expect(nameField).toHaveValue(user.name)
  await expect(emailField).toHaveValue(user.email)
  await expect(page.locator('#user-password')).toHaveCount(0)
  await nameField.fill('New Test Name')
  await page.getByText('Зберегти').click()
  await expect(page.locator('.Toastify__toast--success').last()).toContainText('Профіль користувача змінено')

  await page.getByLabel("Пошук за ім'ям або email").fill(user.email)

  // change role
  await expect(page.locator('.MuiChip-label')).toContainText('USER')
  await page.locator('button[aria-label="Змінити роль"]').click()
  await expect(page.locator('.MuiChip-label')).toContainText('ADMIN')

  // delete user
  await page.locator('button[aria-label="Видалити"]').click()
  await page.getByRole('button', { name: 'Видалити' }).click()
  await expect(page.locator('.Toastify__toast--success').last()).toContainText('Користувач успішно видалений')

  await page.getByLabel("Пошук за ім'ям або email").fill(user.email)
  await expect(page.locator('.MuiTablePagination-displayedRows')).toContainText('0–0 з 0')

})

test('no actions for self actions', async({ authenticatedAdminPage: page, testAdmin }) => {
  // no action buttons for current admin
  await page.goto('/users')
  await page.getByLabel("Пошук за ім'ям або email").fill(testAdmin.email)
  await expect(page.locator('.MuiTableBody-root tr')).toHaveCount(1)
  await expect(page.locator('.MuiTableBody-root tr td').last()).toBeEmpty()
})

test('unable to create user with existing email', async({ authenticatedAdminPage: page, testUser }) => {
  const nameField = page.locator('#user-name')
  const emailField = page.locator('#user-email')

  await page.goto('/users')
  //create user with existing email
  await page.getByText('Додати користувача').click()
  await nameField.fill(testUser.name)
  await emailField.fill(testUser.email)
  await page.locator('button[aria-label="Сгенерувати пароль"]').click()
  await page.getByText('Зберегти').click()
  const errMessage = await page.locator('.Toastify__toast--error').last().innerText()
  if(errMessage === 'Пароль недостатньо надійний.') {
    //regenerate password and try to save
    await page.locator('#user-email').fill('Aa1')
    await page.getByText('Зберегти').click()
  }
  await expect(page.locator('.Toastify__toast--error').last()).toContainText('Користувач з таким email вже існує.')
})

test('check users list pagination', async({ authenticatedAdminPage: page }) => {
  await page.goto('/users')
  const nextPageBtn = page.locator('button[aria-label="Go to next page"]')
  const tableTrs = page.locator('.MuiTableBody-root tr')
  await expect(nextPageBtn).not.toBeDisabled()
  await nextPageBtn.click()
  await expect(tableTrs).not.toHaveCount(0)
  await page.locator('.MuiTablePagination-select').first().click()
  await page.locator('.MuiTablePagination-menuItem[data-value="-1"]').click()
  const displayedRows = await page.locator('.MuiTablePagination-displayedRows').innerText()
  const countUsers = parseInt(displayedRows.split(' ').pop() as string, 10)
  await expect(tableTrs).toHaveCount(countUsers)
})

test('search from second page and check pagination', async ({ authenticatedAdminPage: page, testUser }) => {
  await page.goto('/users')
  const nextPageBtn = page.locator('button[aria-label="Go to next page"]')
  await nextPageBtn.click()
  await page.getByLabel("Пошук за ім'ям або email").fill(testUser.email.toUpperCase())
  await expect(page.locator('.MuiTableBody-root tr')).not.toHaveCount(0)
})