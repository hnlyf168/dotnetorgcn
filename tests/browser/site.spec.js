import { test, expect } from '@playwright/test';

test('homepage renders all projects without errors or external runtime requests', async({page})=>{
  const errors = [], external = [];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{ if(!request.url().startsWith('http://127.0.0.1:4321') && !request.url().startsWith('data:')) external.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText('超越想象');
  await expect(page.locator('.project-card')).toHaveCount(9);
  await expect(page.locator('#ecosystem-code')).toContainText('using FunAsrNet');
  await expect(page.getByRole('link',{name:'GitHub 开源主页'}).locator('svg').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('category, search and empty-state reset work together', async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'人工智能',exact:true}).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  await page.getByRole('searchbox',{name:'搜索开源项目'}).fill('语音');
  await expect(page.locator('.project-card:visible')).toHaveCount(1);
  await expect(page.locator('.project-card:visible')).toContainText('FunASR.NET');
  await page.getByRole('searchbox').fill('this-project-does-not-exist');
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.getByRole('button',{name:'重置搜索'}).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(9);
  await expect(page.getByRole('searchbox')).toBeFocused();
});

test('project detail preserves fork attribution and closes with Escape', async({page})=>{
  await page.goto('/');
  const trigger = page.getByRole('button',{name:'SimdPaddleOCR',exact:false});
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('此仓库为 sdcb/SimdPaddleOCR 的 Fork');
  await expect(dialog.getByRole('link',{name:'查看上游项目'})).toHaveAttribute('href','https://github.com/sdcb/SimdPaddleOCR');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('ecosystem tabs switch real examples and support keyboard navigation', async({page})=>{
  await page.goto('/');
  const database = page.getByRole('tab',{name:'把基础，握在自己手中',exact:false});
  await database.click();
  await expect(page.locator('#ecosystem-code')).toContainText('new SqlDatabase');
  await expect(page.locator('#code-source')).toHaveAttribute('href','https://github.com/hnlyf168/PureDb#readme');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#ecosystem-code')).toContainText('dotnet restore Serein.slnx');
  await expect(page.locator('#ecosystem-panel')).toHaveAttribute('aria-labelledby','tab-connect');
});

test('reduced motion and narrow viewports retain accessible content', async({page})=>{
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.setViewportSize({width:360,height:780});
  await page.goto('/');
  await page.getByRole('button',{name:'打开导航菜单'}).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.getByRole('navigation').getByRole('link',{name:'开源项目'}).click();
  await expect(page.getByRole('button',{name:'打开导航菜单'})).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'FunASR.NET',exact:false}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
});

test('unknown paths return the custom 404 and a working homepage link',async({page})=>{
  const response = await page.goto('/not-a-real-page');
  expect(response.status()).toBe(404);
  await page.getByRole('link',{name:'回到首页'}).click();
  await expect(page).toHaveTitle(/.NET 中国/);
});
