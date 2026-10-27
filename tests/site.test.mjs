import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const source = JSON.parse(await readFile(new URL('../content/projects.json',import.meta.url),'utf8'));

test('all curated projects are present in the built HTML without JavaScript',()=>{
  for(const project of source.projects) {
    assert.ok(html.includes(`data-project="${project.name}"`), `${project.name} must be discoverable`);
    assert.ok(html.includes(project.description), `${project.name} description must be server rendered`);
    assert.ok(html.includes(`href="https://github.com/${source.owner}/${project.name}"`));
  }
  assert.equal(new Set(source.projects.map(p=>p.name)).size,source.projects.length);
  assert.equal((html.match(/class="project-card /g)||[]).length,source.projects.length);
});

test('internal navigation and packaged asset paths resolve',async()=>{
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const [,anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(anchor),`Missing section ${anchor}`);
  for(const [,asset] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#]+)"/g)) {
    const file = new URL(`../dist${asset}`,import.meta.url);
    assert.ok((await stat(file)).isFile(),`Missing asset ${asset}`);
  }
  assert.ok(!html.includes('<!-- PROJECT_CARDS -->'));
  assert.ok(!html.includes('{{'));
});

test('domain metadata and crawler resources agree',async()=>{
  assert.ok(html.includes('<link rel="canonical" href="https://dotnet.org.cn/">'));
  const sitemap = await readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');
  const robots = await readFile(new URL('../dist/robots.txt',import.meta.url),'utf8');
  assert.ok(sitemap.includes('<loc>https://dotnet.org.cn/</loc>'));
  assert.ok(robots.includes('https://dotnet.org.cn/sitemap.xml'));
  assert.ok((await readFile(new URL('../dist/404.html',import.meta.url),'utf8')).includes('回到首页'));
});

test('project details preserve attribution and meaningful capability limits',async()=>{
  const data = JSON.parse(await readFile(new URL('../dist/projects.json',import.meta.url),'utf8'));
  const fork = data.projects.find(p=>p.name==='SimdPaddleOCR');
  assert.equal(fork.fork,true);
  assert.equal(fork.upstream,'https://github.com/sdcb/SimdPaddleOCR');
  for(const project of data.projects) {
    assert.ok(['ai','infra','connect','apps'].includes(project.category));
    assert.ok(project.features.length && project.note && project.command);
    assert.ok(Number.isInteger(project.stars) && project.stars>=0);
  }
});
