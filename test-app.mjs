import { chromium } from './node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';

const OUT = '/tmp/sakan-screenshots';
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:5173';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: 'ar-SA',
});
const page = await ctx.newPage();

// --- 1. Setup screen ---
await page.goto(BASE);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/01-setup.png` });
console.log('✅ 1. Setup screen');

// --- 2. Enter names ---
const inputs = await page.locator('input[type="text"]').all();
await inputs[0].fill('أحمد');
await inputs[1].fill('يوسف');
await inputs[2].fill('محمد');
await page.screenshot({ path: `${OUT}/02-setup-filled.png` });
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/03-add-expense-tab.png` });
console.log('✅ 2. Names entered → main app loaded');

// --- 3. Add expense: يوسف pays 150 إيجار ---
// click يوسف payer button
await page.locator('button').filter({ hasText: /^يوسف$/ }).first().click();
await page.locator('input[type="number"]').fill('150');
await page.getByRole('button', { name: '🏠 إيجار' }).click();
await page.locator('input[type="text"]').fill('إيجار شهر مايو');
await page.screenshot({ path: `${OUT}/04-expense-form.png` });
console.log('✅ 3. Expense form filled');

await page.locator('button[type="submit"]').click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/05-expense-saved.png` });
console.log('✅ 4. Expense saved');

// --- 4. Add second expense: أحمد pays 90 بقالة ---
await page.locator('button').filter({ hasText: /^أحمد$/ }).first().click();
await page.locator('input[type="number"]').fill('90');
await page.getByRole('button', { name: '🛒 بقالة' }).click();
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(500);
console.log('✅ 5. Second expense saved');

// --- 5. Balances tab ---
await page.locator('nav button').filter({ hasText: 'الأرصدة' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/06-balances.png` });
console.log('✅ 6. Balances tab — debts visible');

// --- 6. Copy summary ---
const copyBtn = page.locator('button').filter({ hasText: 'نسخ الملخص' });
if (await copyBtn.count()) {
  await copyBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/07-copy-done.png` });
  console.log('✅ 7. Copy summary → "تم النسخ" shown');
}

// --- 7. Settle debt ---
const settleBtn = page.locator('button').filter({ hasText: 'تسوية' }).first();
if (await settleBtn.count()) {
  await settleBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/08-after-settle.png` });
  console.log('✅ 8. Settle button clicked → balance updated');
}

// --- 8. History tab + filters ---
await page.locator('nav button').filter({ hasText: 'السجل' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/09-history.png` });
console.log('✅ 9. History tab loaded');

// Filter by person
await page.locator('button').filter({ hasText: /^يوسف$/ }).first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/10-history-filtered.png` });
console.log('✅ 10. History filtered by يوسف');

// --- 9. Delete with confirmation ---
await page.locator('button').filter({ hasText: 'الكل' }).first().click(); // reset filter
await page.waitForTimeout(300);
const trashBtn = page.locator('button.p-1\\.5').first();
if (await trashBtn.count()) {
  await trashBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/11-delete-modal.png` });
  console.log('✅ 11. Delete confirmation modal shown');
  await page.locator('button').filter({ hasText: 'إلغاء' }).click();
  await page.waitForTimeout(300);
}

// --- 10. Rent tab ---
await page.locator('nav button').filter({ hasText: 'الإيجار' }).click();
await page.waitForTimeout(500);
await page.locator('button').filter({ hasText: 'تعديل' }).click();
await page.waitForTimeout(200);
await page.locator('input[type="number"]').fill('1500');
await page.locator('button').filter({ hasText: 'حفظ' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/12-rent.png` });
console.log('✅ 12. Rent tab — amount set to 1500₪, share = 500₪');

// Toggle payment status — click first rent row (أحمد)
await page.locator('button.w-full.px-4').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/13-rent-paid.png` });
console.log('✅ 13. أحمد marked as paid');

// --- 11. Reports tab ---
await page.locator('nav button').filter({ hasText: 'التقارير' }).click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/14-reports.png` });
console.log('✅ 14. Reports tab — bar chart rendered');

// Switch to all-time
await page.locator('button').filter({ hasText: 'الكل' }).last().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/15-reports-alltime.png` });
console.log('✅ 15. Reports all-time toggle');

// --- 12. Settings ---
await page.locator('header button').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/16-settings.png` });
console.log('✅ 16. Settings overlay');

await browser.close();
console.log(`\n📸 All screenshots → ${OUT}`);
