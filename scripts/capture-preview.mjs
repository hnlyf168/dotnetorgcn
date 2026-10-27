import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts', { recursive:true });
const browser = await chromium.launch({ headless:true, ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}) });
try {
  const page = await browser.newPage({ viewport:{width:1440,height:1000}, deviceScaleFactor:1,locale:'zh-CN' });
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('http://127.0.0.1:4321');
  await page.screenshot({ path:'artifacts/desktop.png' });
  await page.screenshot({ path:'artifacts/homepage-full.png', fullPage:true });
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'artifacts/mobile-first-screen.png'});
  await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4321/projects/funasrnet/');
  await page.screenshot({path:'artifacts/project-page.png',fullPage:true});
  await page.goto('http://127.0.0.1:4321/en/');
  await page.screenshot({path:'artifacts/english-home.png'});
  for(const path of ['/','/en/','/projects/funasrnet/','/en/projects/simdpaddleocr/']) {
    await page.goto('http://127.0.0.1:4321'+path);
    for (const width of [360,390,680,768,900,1024,1440]) {
      await page.setViewportSize({width,height:900});
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw new Error(`Horizontal overflow at ${width}px: ${path}`);
    }
  }
  console.log('Responsive overflow checks passed: 360–1440px');
  console.log('Screenshots saved to artifacts/');
} finally { await browser.close(); }
