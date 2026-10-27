import {test,expect} from '@playwright/test';

test('homepage renders nine projects with no external runtime requests or errors',async({page})=>{
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4321')&&!r.url().startsWith('data:'))external.push(r.url());});
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText('超越想象');
  await expect(page.locator('.project-card')).toHaveCount(9);
  await expect(page.locator('#ecosystem-code')).toContainText('using FunAsrNet');
  await expect(page.getByRole('link',{name:'GitHub 开源主页'}).locator('svg').first()).toBeVisible();
  expect(errors).toEqual([]);expect(external).toEqual([]);
});

test('category and bilingual search combine, then reset the empty state',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'人工智能',exact:true}).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  await page.getByRole('searchbox').fill('speech');await expect(page.locator('.project-card:visible')).toHaveCount(1);
  await page.getByRole('searchbox').fill('not-a-real-project');await expect(page.locator('.empty-state')).toBeVisible();
  await page.getByRole('button',{name:'重置搜索'}).click();await expect(page.locator('.project-card:visible')).toHaveCount(9);
});

test('project links open standalone pages that survive a reload and retain attribution',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('.project-title').filter({hasText:'SimdPaddleOCR'}).click();
  await expect(page).toHaveURL(/\/projects\/simdpaddleocr\/$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('SimdPaddleOCR');
  await expect(page.locator('.attribution')).toContainText('此仓库是上游项目的 Fork');
  await expect(page.locator('.attribution a')).toHaveAttribute('href','https://github.com/sdcb/SimdPaddleOCR');
  await page.reload();await expect(page.getByRole('heading',{name:'项目概况',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('manual language switch keeps the project and remembers a Chinese preference',async({browser})=>{
  const context=await browser.newContext({locale:'en-US'});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/projects/puredb/');await expect(page).toHaveURL(/\/en\/projects\/puredb\/$/);
  await page.getByRole('link',{name:'切换到中文'}).click();await expect(page).toHaveURL(/4321\/projects\/puredb\/$/);
  await expect(page.getByRole('heading',{name:'项目概况',exact:true})).toBeVisible();
  await page.goto('http://127.0.0.1:4321/');await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await page.getByRole('link',{name:'Switch to English'}).click();await expect(page).toHaveURL(/\/en\/$/);
  await page.goto('http://127.0.0.1:4321/');await expect(page).toHaveURL(/\/en\/$/);await context.close();
});

test('first visits follow the preferred browser language and shared English URLs stay English',async({browser})=>{
  for(const [locale,expected] of [['en-US','en'],['zh-TW','zh-CN'],['fr-FR','en']]){
    const context=await browser.newContext({locale});const page=await context.newPage();await page.goto('http://127.0.0.1:4321/');
    await expect(page.locator('html')).toHaveAttribute('lang',expected);await context.close();
  }
  const context=await browser.newContext({locale:'zh-CN'});const page=await context.newPage();await page.goto('http://127.0.0.1:4321/en/projects/funasrnet/');
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await context.close();
});

test('language switch works when browser storage is unavailable',async({browser})=>{
  const context=await browser.newContext({locale:'en-US'});await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage disabled');}});});
  const page=await context.newPage();await page.goto('http://127.0.0.1:4321/');await expect(page).toHaveURL(/\/en\/$/);
  await page.getByRole('link',{name:'切换到中文'}).click();await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');await context.close();
});

test('ecosystem examples switch with keyboard navigation',async({page})=>{
  await page.goto('/');await page.getByRole('tab',{name:'把基础，握在自己手中',exact:false}).click();
  await expect(page.locator('#ecosystem-code')).toContainText('new SqlDatabase');await page.keyboard.press('ArrowDown');
  await expect(page.locator('#ecosystem-code')).toContainText('dotnet restore Serein.slnx');
});

test('mobile navigation and bilingual project pages fit narrow screens with reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:360,height:780});await page.goto('/');
  await page.getByRole('button',{name:'打开导航菜单'}).click();await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'开源项目'}).click();
  await expect(page.getByRole('button',{name:'打开导航菜单'})).toHaveAttribute('aria-expanded','false');
  for(const path of ['/','/en/','/projects/simdskia/','/en/projects/simdpaddleocr/']){
    await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('custom 404 offers a working return to the homepage',async({page})=>{
  const response=await page.goto('/not-a-real-page');expect(response.status()).toBe(404);
  await page.getByRole('link',{name:/^回到首页/}).click();await expect(page).toHaveTitle(/.NET 中国/);
});

test('About pages identify the organization and preserve language when switching',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('link',{name:'GitHub 开源主页'})).toHaveAttribute('href','https://github.com/donet-org-cn');
  const menu=page.getByRole('button',{name:'打开导航菜单'});
  if(await menu.isVisible())await menu.click();
  await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'关于我们'}).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.locator('.about-hero')).toContainText('开放协作');
  await expect(page.locator('.about-body')).toContainText('donet-org-cn');
  await page.getByRole('link',{name:'Switch to English'}).click();
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await expect(page.getByRole('heading',{name:'Our GitHub organization',exact:true})).toBeVisible();
  await expect(page.locator('.about-body a').filter({hasText:'Join the discussion'})).toHaveAttribute('href','https://github.com/donet-org-cn/community/discussions');
  expect(errors).toEqual([]);
});
