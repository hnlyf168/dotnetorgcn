import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content/projects.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
const categories = { ai: '人工智能', infra: '底层引擎', connect: '连接与通信', apps: '应用与工具' };
function card(p, i) {
  const url = `https://github.com/${data.owner}/${p.name}`;
  return `<article class="project-card ${i < 2 ? 'featured' : ''} ${p.fork ? 'fork-card' : ''}" data-category="${p.category}" data-search="${escape([p.name, p.title, p.description, ...p.tags].join(' ').toLowerCase())}">
    <div class="card-top"><span class="project-icon" data-icon="${p.icon}" aria-hidden="true"></span><span class="card-category">${p.fork ? '上游 Fork' : categories[p.category]}</span><a class="icon-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="在 GitHub 查看 ${p.name}"><span data-icon="arrow-up-right"></span></a></div>
    ${i < 2 ? `<p class="project-eyebrow">${p.eyebrow}</p>` : ''}
    <h3><button class="project-title" data-project="${p.name}">${p.title}<span aria-hidden="true">↗</span></button></h3><p class="project-desc">${p.description}</p>
    ${i === 0 ? '<div class="waveform" aria-hidden="true">'+Array.from({length:42}, (_,j)=>`<i style="--h:${16+Math.round(Math.abs(Math.sin(j*1.7)*Math.cos(j*.28))*66)}px;--d:${j*-.07}s"></i>`).join('')+'<span>你好，世界。Hello, .NET.</span></div>' : ''}
    ${i === 1 ? '<div class="vision-demo" aria-hidden="true"><div class="vision-grid"></div><div class="detect-box"><small>object · vision</small><span>✦</span></div><span class="vision-label">C# → SEE THE POSSIBILITY</span></div>' : ''}
    <div class="tags">${p.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div><div class="card-bottom"><span><i class="language-dot"></i>C# <span class="muted">/ .NET</span></span><span class="star" title="GitHub Star，数据截至 ${data.syncedAt}"><span data-icon="star"></span>${p.stars}</span><button class="detail-link" data-project="${p.name}">了解项目 <span aria-hidden="true">→</span></button></div>
  </article>`;
}
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
html = html.replace('<!-- PROJECT_CARDS -->', data.projects.map(card).join('\n'))
  .replaceAll('{{PROJECT_COUNT}}', String(data.projects.length).padStart(2,'0'))
  .replaceAll('{{ORIGINAL_COUNT}}', String(data.projects.filter(p=>!p.fork).length).padStart(2,'0'))
  .replaceAll('{{FORK_COUNT}}', String(data.projects.filter(p=>p.fork).length))
  .replaceAll('{{SYNC_DATE}}', data.syncedAt);
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist/index.html'), html);
await writeFile(path.join(root, 'dist/projects.json'), JSON.stringify(data));
console.log(`Built ${data.projects.length} projects → dist/ (no runtime CDN or API dependencies)`);
