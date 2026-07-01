import { test, expect } from '@playwright/test'

test.describe('Landing', () => {
  test('loads home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/PostPilot/i)
  })
})
