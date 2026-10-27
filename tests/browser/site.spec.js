import {test,expect} from '@playwright/test';
import catalog from '../../content/projects.json' with {type:'json'};
import roster from '../../content/members.json' with {type:'json'};
import snapshot from '../../content/live-snapshot.json' with {type:'json'};
import {rosterWithProfiles} from '../../src/member-profile.mjs';
const profiles=rosterWithProfiles(roster,snapshot).members;

test.beforeEach(async({page})=>{
  await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname.startsWith('/api/avatar/'))return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#334a78"/></svg>'});
    if(url.pathname==='/api/community')return route.fulfill({json:{members:profiles,source:'live',updatedAt:'2026-10-27T05:00:00Z'}});
    const slug=url.pathname.split('/').pop(),record=snapshot.projects[slug];
    if(!record)return route.fulfill({status:404,json:{error:'Unknown project'}});
    const pageNumber=Number(url.searchParams.get('page'))||1;
    const users=Array.from({length:pageNumber===1?24:2},(_,i)=>({id:pageNumber*100+i,login:`supporter-${pageNumber}-${i}`}));
    await route.fulfill({json:{...record,source:'github-actions',stargazers:{users,available:true,hasMore:pageNumber===1,page:pageNumber,source:'github-actions'},packages:record.packages?.map(item=>({...item,dependenciesAvailable:true,dependencies:[{id:'Microsoft.Extensions.Logging.Abstractions',range:'[10.0.0, )'}]}))}});
  });
});

test('homepage renders all curated projects with no external runtime requests or errors',async({page})=>{
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4321')&&!r.url().startsWith('data:'))external.push(r.url());});
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText('超越想象');
  await expect(page.locator('.project-card')).toHaveCount(catalog.projects.length);
  await expect(page.locator('#ecosystem-code')).toContainText('using FunAsrNet');
  await expect(page.getByRole('link',{name:'参与 GitHub 社区'}).locator('svg').first()).toBeVisible();
  expect(errors).toEqual([]);expect(external).toEqual([]);
});

test('category and bilingual search combine, then reset the empty state',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:/人工智能/}).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(catalog.projects.filter(project=>project.category==='ai').length);
  await page.getByRole('searchbox').fill('speech');await expect(page.locator('.project-card:visible')).toHaveCount(1);
  await page.getByRole('searchbox').fill('not-a-real-project');await expect(page.locator('.empty-state')).toBeVisible();
  await page.getByRole('button',{name:'重置搜索'}).click();await expect(page.locator('.project-card:visible')).toHaveCount(catalog.projects.length);
});

test('the main OCR project opens the sdcb upstream page and survives a reload',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('.project-title[href="/projects/simdpaddleocr/"]').click();
  await expect(page).toHaveURL(/\/projects\/simdpaddleocr\/$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('SimdPaddleOCR');
  await expect(page.locator('.attribution')).toHaveCount(0);
  await expect(page.locator('.project-hero a[href="https://github.com/sdcb/SimdPaddleOCR"]')).toBeVisible();
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
  await page.getByRole('link',{name:/^回到首页/}).click();await expect(page).toHaveTitle(/.NET 中文开源社区/);
});

test('About pages identify the organization and preserve language when switching',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('a.github-button')).toHaveAttribute('href','https://github.com/donet-org-cn');
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

test('project dropdown supports keyboard, mobile taps, and independent upstream links',async({page,isMobile})=>{
  await page.goto('/');
  if(isMobile)await page.getByRole('button',{name:'打开导航菜单'}).click();
  const toggle=page.locator('.projects-toggle');
  if(isMobile)await toggle.click();else{await toggle.focus();await page.keyboard.press('ArrowDown');}
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.projects-dropdown .project-nav-link')).toHaveCount(catalog.projects.length);
  await expect(page.locator('.projects-dropdown')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');
  if(isMobile)await page.getByRole('button',{name:'打开导航菜单'}).click();
  await toggle.press('ArrowDown');
  await page.locator('.projects-dropdown a[href="/projects/simdpaddleocr/"]').click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('SimdPaddleOCR');
  await expect(page.locator('.project-hero a[href="https://github.com/sdcb/SimdPaddleOCR"]')).toBeVisible();
});

test('supporter dialog loads paginated users and restores focus after Escape',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/projects/funasrnet/');
  const button=page.locator('.activity-metric[data-stars]');await button.click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  await expect(dialog.locator('.star-person')).toHaveCount(24);
  await dialog.getByRole('button',{name:'加载更多'}).click();
  await expect(dialog.locator('.star-person')).toHaveCount(26);
  await expect(dialog.getByRole('button',{name:'加载更多'})).toBeHidden();
  await expect(dialog.locator('[data-stargazers-github]')).toHaveAttribute('href','https://github.com/donet-org-cn/FunAsrNet/stargazers');
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(button).toBeFocused();expect(errors).toEqual([]);
});

test('NuGet data displays real package versions, dependencies and an install command',async({page})=>{
  await page.goto('/projects/puredb/');
  await expect(page.locator('[data-package-id]')).toHaveText('PureDb');
  await expect(page.locator('[data-package-version]')).not.toHaveText('—');
  await expect(page.locator('[data-package-dependencies]')).toContainText('Microsoft.Extensions.Logging.Abstractions');
  await expect(page.locator('[data-package-command]')).toContainText('dotnet add package PureDb --version');
  await page.evaluate(()=>{window.copiedPackage='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedPackage=text;}}});});
  await page.getByRole('button',{name:'复制 NuGet 安装命令'}).click();
  expect(await page.evaluate(()=>window.copiedPackage)).toMatch(/^dotnet add package PureDb --version /);
  await expect(page.locator('.data-definition')).toContainText('不等于引用项目数');
});

test('member pages include curated maintainers and automatically add only public profiles',async({page})=>{
  await page.route('**/api/community',route=>route.fulfill({json:{members:[...profiles,{id:1234,login:'public-member',name:'Public Member',bio:'A public GitHub bio',publicMembership:true}],source:'live',updatedAt:'2026-10-27T05:00:00Z'}}));
  await page.goto('/members/');await expect(page.locator('.members-grid [data-member="sdcb"]')).toContainText('PaddleSharp');
  await expect(page.locator('[data-member="sdcb"] .member-honor')).toHaveText('◆ Microsoft MVP');
  await expect(page.locator('[data-member="sdcb"] .member-public-bio')).toContainText('Microsoft MVP');
  await expect(page.locator('[data-member="sdcb"] .member-profile-source')).toHaveAttribute('href','https://github.com/sdcb');
  await expect(page.locator('[data-member="public-member"]')).toContainText('A public GitHub bio');
  await expect(page.locator('.member-visibility-note')).toContainText('由成员自行选择');
  await page.getByRole('link',{name:'Switch to English'}).click();await expect(page).toHaveURL(/\/en\/members\/$/);
  await expect(page.getByRole('heading',{level:1})).toContainText('people');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('a failed data endpoint keeps readable project details and cached supporter data',async({page})=>{
  await page.route('**/api/projects/**',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto('/projects/funasrnet/');await page.locator('.activity-metric[data-stars]').click();
  await expect(page.getByRole('dialog').locator('.star-person').first()).toBeVisible();
  await expect(page.getByRole('dialog').locator('.stars-status')).toContainText('缓存名单');
  await expect(page.getByRole('dialog').getByRole('button',{name:'加载更多'})).toBeHidden();
});

test('featured project tabs expose real introductions and support keyboard navigation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const first=page.locator('[data-spotlight-tab="0"]');await first.focus();
  await expect(page.locator('[data-spotlight-tab]')).toHaveCount(4);
  await expect(page.locator('#spotlight-panel-0')).toBeVisible();await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-spotlight-tab="1"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#spotlight-panel-1')).toBeVisible();await expect(page.locator('#spotlight-panel-0')).toBeHidden();
  await page.locator('#spotlight-panel-1 a').click();await expect(page).toHaveURL(/\/projects\/simdyolo\/$/);
});

test('the featured OCR panel shows upstream Star data and older upstream links redirect',async({page})=>{
  await page.goto('/');await page.locator('[data-spotlight-tab="2"]').click();
  const panel=page.locator('#spotlight-panel-2');await expect(panel.getByRole('heading')).toHaveText('SimdPaddleOCR');
  await expect(panel.locator('.spotlight-project-meta')).toContainText('sdcb');
  await expect(panel.locator('[data-star-count="simdpaddleocr"]')).toHaveText(String(snapshot.projects.simdpaddleocr.stars));
  await expect(panel.locator('a[href="/projects/simdpaddleocr/"]')).toBeVisible();
  const response=await page.request.get('/en/projects/sdcb-simdpaddleocr/?ref=community',{maxRedirects:0});expect(response.status()).toBe(301);expect(response.headers().location).toBe('/en/projects/simdpaddleocr/?ref=community');
  await page.goto('/projects/sdcb-simdpaddleocr/');await expect(page).toHaveURL(/\/projects\/simdpaddleocr\/$/);
});

test('color themes follow the system, remember manual choices, and survive language and page changes',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'切换到浅色模式'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.emulateMedia({colorScheme:'dark'});await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.getByRole('link',{name:'Switch to English'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.getByRole('button',{name:'Switch to dark mode'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.goto('/en/members/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.getByRole('button',{name:'Switch to light mode'})).toBeVisible();
});

test('a system theme change is applied until the visitor makes a manual choice',async({page})=>{
  await page.emulateMedia({colorScheme:'light'});await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'切换到浅色模式'}).click();await page.emulateMedia({colorScheme:'light'});await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('brand downloads provide real NuGet and GitHub PNG files and preserve language',async({page})=>{
  await page.goto('/brand/');
  const response=await page.request.get('/brand/nuget-icon.png'),bytes=await response.body();
  expect(response.status()).toBe(200);expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(bytes.readUInt32BE(16)).toBe(256);expect(bytes.readUInt32BE(20)).toBe(256);expect(bytes.length).toBeLessThan(1024*1024);
  const avatar=await page.request.get('/brand/github-avatar.png');expect((await avatar.body()).readUInt32BE(16)).toBe(512);
  const download=page.waitForEvent('download');await page.locator('a[download][href$=".zip"]').click();expect((await download).suggestedFilename()).toBe('dotnet-community-brand-kit.zip');
  await page.getByRole('link',{name:'Switch to English'}).click();await expect(page).toHaveURL(/\/en\/brand\/$/);await expect(page.getByRole('heading',{level:1})).toContainText('Open code');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
