import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {repositoryUrl} from '../scripts/project-metadata.mjs';

const root=new URL('../dist/',import.meta.url);
const data=JSON.parse(await readFile(new URL('../content/projects.json',import.meta.url),'utf8'));
const english=JSON.parse(await readFile(new URL('../content/projects.en.json',import.meta.url),'utf8'));
const read=url=>readFile(new URL(url.replace(/^\//,''),root),'utf8');
async function htmlFiles(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())files.push(...await htmlFiles(file));else if(entry.name.endsWith('.html'))files.push(file);}return files;}

test('all nine projects have server-rendered introductions and links in both languages',async()=>{
  for(const locale of ['zh','en']){
    const home=await read(locale==='en'?'en/index.html':'index.html');
    assert.equal((home.match(/class="project-card /g)||[]).length,data.projects.length);
    for(const p of data.projects){
      const path=`${locale==='en'?'/en':''}/projects/${p.name.toLowerCase()}/`;
      const page=await read(path+'index.html');
      assert.ok(home.includes(`href="${path}"`));
      assert.ok(page.includes(locale==='en'?english[p.name].description:p.description));
      for(const section of ['overview','capabilities','scenarios','quickStart','boundaries'])assert.ok(page.includes(`id="${section}"`));
      assert.ok(page.includes(`href="${repositoryUrl(p,data.owner)}"`));
      assert.ok(page.includes(`<link rel="canonical" href="https://dotnet.org.cn${path}">`));
    }
  }
});

test('every internal page, fragment, and packaged asset resolves',async()=>{
  const files=await htmlFiles(root);
  assert.equal(files.length,23);
  for(const file of files){
    const html=await readFile(file,'utf8');
    for(const [,url] of html.matchAll(/(?:href|src)="((?:\/|#)[^\"]*)"/g)){
      const parsed=new URL(url,file.href);
      let target=parsed.pathname;
      if(url.startsWith('/'))target=new URL(url.slice(1),root).pathname;
      if(target.endsWith('/'))target+='index.html';
      const path=decodeURIComponent(target);
      assert.ok((await stat(process.platform==='win32'?path.replace(/^\/(\w:)/,'$1'):path)).isFile(),`${file.href}: missing ${url}`);
      if(parsed.hash){const content=await readFile(process.platform==='win32'?path.replace(/^\/(\w:)/,'$1'):path,'utf8');assert.ok(content.includes(`id="${parsed.hash.slice(1)}"`),`Missing anchor ${url}`);}
    }
    assert.ok(!html.includes('{{'));
  }
});

test('sitemap and alternate-language metadata cover all bilingual public pages',async()=>{
  const sitemap=await read('sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g)||[]).length,22);
  for(const url of ['/', '/en/','/about/','/en/about/',...data.projects.flatMap(p=>[`/projects/${p.name.toLowerCase()}/`,`/en/projects/${p.name.toLowerCase()}/`])])assert.ok(sitemap.includes(`<loc>https://dotnet.org.cn${url}</loc>`));
  for(const file of await htmlFiles(root)){
    const html=await readFile(file,'utf8');assert.ok(html.includes('hreflang="zh-CN"'));assert.ok(html.includes('hreflang="en"'));
  }
});

test('community navigation points to the organization while source links retain actual ownership',async()=>{
  for(const locale of ['','en/']){
    const home=await read(`${locale}index.html`),about=await read(`${locale}about/index.html`);
    assert.ok(home.includes('href="https://github.com/donet-org-cn"'));
    assert.ok(home.includes(`href="/${locale}about/"`));
    assert.ok(about.includes('https://github.com/donet-org-cn/community/discussions'));
    assert.ok(about.includes('https://github.com/donet-org-cn/.github/blob/main/CONTRIBUTING.md'));
  }
});

test('fork attribution and capability boundaries remain visible in both languages',async()=>{
  for(const locale of ['','en/']){
    const html=await read(`${locale}projects/simdpaddleocr/index.html`);
    assert.ok(html.includes('https://github.com/sdcb/SimdPaddleOCR'));
    assert.ok(html.includes(locale?'This repository is a fork.':'此仓库是上游项目的 Fork'));
  }
});
