const paths = {
  'arrow-up-right':'M7 17 17 7M7 7h10v10', 'arrow-right':'M4 12h16m-6-6 6 6-6 6', search:'m21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0', menu:'M4 6h16M4 12h16M4 18h16', x:'m6 6 12 12M6 18 18 6', copy:'M9 9h11v11H9zM5 15H3V3h12v2', star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3', wave:'M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4', scan:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12l3 3 7-7', database:'M20 6c0 2.2-3.6 4-8 4S4 8.2 4 6s3.6-4 8-4 8 1.8 8 4ZM4 6v12c0 2.2 3.6 4 8 4s8-1.8 8-4V6M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4', layers:'m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5', play:'m10 7 7 5-7 5V7ZM22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', cloud:'M6 18a5 5 0 0 1-.8-9.9 7 7 0 0 1 13.3 1.6A4.2 4.2 0 0 1 18 18H6Zm6-9v10m-4-6 4-4 4 4', network:'M9 3h6v6H9zM2 16h6v6H2zM16 16h6v6h-6zM12 9v4m-7 3v-3h14v3', terminal:'m4 5 6 6-6 6m9 1h7', text:'M5 5h14M12 5v14m-4 0h8M3 3v4m18-4v4', book:'M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2V3Z', code:'m8 5-7 7 7 7m8-14 7 7-7 7m-2-17-4 20', 'git-branch':'M6 3v12a6 6 0 0 0 12 0V9M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', github:'M9 19c-4 1-4-2-6-2m12 5v-3.9c0-1.1-.4-1.8-.8-2.2 2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 6a4.5 4.5 0 0 0-.1-3S17.3 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.7 2.7 5.6 3 5.6 3a4.5 4.5 0 0 0-.1 3 4.7 4.7 0 0 0-1.3 3.9c0 4.7 2.9 5.7 5.6 6-.4.4-.8 1.1-.8 2.2V22'
};
document.querySelectorAll('[data-icon]').forEach(el => {
  el.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[el.dataset.icon] || paths.code}"/></svg>`;
});

let toastTimer;
function toast(message) {
  const el = document.querySelector('.toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('已复制，去构建你的下一个可能。'); }
  catch { toast('浏览器暂不支持复制，请选中文本手动复制。'); }
}

const search = document.querySelector('#project-search');
const cards = [...document.querySelectorAll('.project-card')];
const filters = [...document.querySelectorAll('[data-filter]')];
let activeFilter = 'all';
function applyFilters() {
  const query = search.value.trim().toLocaleLowerCase('zh-CN');
  let count = 0;
  for (const card of cards) {
    card.hidden = !((activeFilter === 'all' || card.dataset.category === activeFilter) && (!query || card.dataset.search.includes(query)));
    if (!card.hidden) count++;
  }
  document.querySelector('.empty-state').hidden = count > 0;
  document.querySelector('#filter-status').textContent = `显示 ${count} 个项目${query ? `，搜索关键词：${query}` : ''}`;
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  applyFilters();
}));
search.addEventListener('input', applyFilters);
document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; filters[0].click(); search.focus(); });
document.querySelector('.search-trigger').addEventListener('click', () => { search.scrollIntoView({ block:'center' }); search.focus({ preventScroll:true }); });
document.addEventListener('keydown', e => {
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable && !document.querySelector('dialog[open]')) {
    e.preventDefault(); search.scrollIntoView({ block:'center' }); search.focus({ preventScroll:true });
  }
  if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; applyFilters(); search.blur(); }
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeNav() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '打开导航菜单'); }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单'); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); menu.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeNav(); });

const examples = {
  ai: { filename:'Speech.cs', caption:'FunASR.NET · 普通话语音识别', source:'FunAsrNet', code:'using FunAsrNet;\n\n// 模型权重需按项目文档另行准备\nvar asr = new FunAsr(\n  "models/funasr-encoder-f16.gguf",\n  "models/qwen3-0.6b-q8_0.gguf", threads: 4);\nvar (samples, rate) = AudioFile.ReadWave("input.wav");\nvar result = asr.Transcribe(\n  AudioFile.Resample(samples, rate, 16000),\n  maxTokens: 128);\nConsole.WriteLine(result.Text);' },
  infra: { filename:'Database.cs', caption:'PureDb · 纯托管文件数据库', source:'PureDb', code:'using PureDb;\n\n// 为想法，留一份持久的存储\nawait using var db = new SqlDatabase("app.pdb");\nawait db.ExecuteAsync(\n  "CREATE TABLE IF NOT EXISTS ideas(" +\n  "id INTEGER PRIMARY KEY, name TEXT)");\n\nvar result = db.Query("SELECT name FROM ideas");\nConsole.WriteLine(result.Rows.Count);' },
  connect: { filename:'Terminal', caption:'Serein · 从源码启动流媒体服务', source:'Serein', code:'# 需要 .NET 10 SDK\ngit clone https://github.com/hnlyf168/Serein.git\ncd Serein\n\n# 还原、构建并运行示例\ndotnet restore Serein.slnx\ndotnet build Serein.slnx -c Release --no-restore\ndotnet run --project samples/Serein.Server \\\n  -c Release --no-build\n\n# 默认地址 http://127.0.0.1:5080' }
};
const escape = text => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function highlight(code) {
  return code.split(/("(?:\\.|[^"\\])*"|\/\/[^\n]*|#[^\n]*|\b(?:using|var|await|new)\b)/g).map(token => {
    const cls = token.startsWith('"') ? 'code-string' : token.startsWith('//') || token.startsWith('#') ? 'code-comment' : /^(using|var|await|new)$/.test(token) ? 'code-keyword' : '';
    return cls ? `<span class="${cls}">${escape(token)}</span>` : escape(token);
  }).join('');
}
let currentExample = examples.ai;
const ecoTabs = [...document.querySelectorAll('[data-eco]')];
function selectExample(tab) {
  currentExample = examples[tab.dataset.eco];
  ecoTabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  document.querySelector('#ecosystem-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('#code-filename').textContent = currentExample.filename;
  document.querySelector('#code-caption').textContent = currentExample.caption;
  document.querySelector('#ecosystem-code').innerHTML = highlight(currentExample.code);
  document.querySelector('#code-source').href = `https://github.com/hnlyf168/${currentExample.source}#readme`;
}
ecoTabs.forEach((tab,index) => {
  tab.addEventListener('click', () => selectExample(tab));
  tab.addEventListener('keydown', e => {
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (index+1)%ecoTabs.length : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (index+ecoTabs.length-1)%ecoTabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? ecoTabs.length-1 : null;
    if (next !== null) { e.preventDefault(); ecoTabs[next].focus(); selectExample(ecoTabs[next]); }
  });
});
selectExample(ecoTabs[0]);
document.querySelector('#copy-code').addEventListener('click', () => copy(currentExample.code));

const dialog = document.querySelector('#project-dialog');
let projectData;
async function loadProjects() {
  if (projectData) return projectData;
  const response = await fetch('/projects.json');
  if (!response.ok) throw new Error('Project data unavailable');
  projectData = await response.json();
  return projectData;
}
let projectTrigger;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', async () => {
  button.disabled = true;
  try {
    const data = await loadProjects();
    const project = data.projects.find(item => item.name === button.dataset.project);
    if (!project) throw new Error('Unknown project');
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-category').textContent = `${project.fork ? 'UPSTREAM FORK' : 'OPEN SOURCE PROJECT'} / ${project.eyebrow}`;
    document.querySelector('#dialog-description').textContent = project.description;
    document.querySelector('#dialog-features').replaceChildren(...project.features.map(feature => { const li = document.createElement('li'); li.textContent = feature; return li; }));
    document.querySelector('#dialog-note').textContent = project.note;
    document.querySelector('#dialog-command').textContent = project.command;
    document.querySelector('#dialog-github').href = `https://github.com/${data.owner}/${project.name}`;
    const upstream = document.querySelector('#dialog-upstream');
    upstream.hidden = !project.upstream;
    if (project.upstream) upstream.href = project.upstream;
    projectTrigger = button;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  } catch { toast('项目详情暂时无法读取，请通过卡片右上角前往 GitHub。'); }
  finally { button.disabled = false; }
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; projectTrigger?.focus(); });
document.querySelector('#copy-command').addEventListener('click', () => copy(document.querySelector('#dialog-command').textContent));

// A locally rendered orbital sculpture: no image downloads or third-party runtime.
const canvas = document.querySelector('#orb');
const ctx = canvas.getContext('2d');
if (ctx) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const art = canvas.parentElement;
  let width = 0, height = 0, angle = .35, frame, visible = true, pointerX = 0, pointerY = 0, lastTime = 0;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points = Array.from({length:700}, (_,i) => { const y = 1 - i / 699 * 2, radius = Math.sqrt(1-y*y), theta = golden*i; return [Math.cos(theta)*radius,y,Math.sin(theta)*radius]; });
  function resize() { const r = art.getBoundingClientRect(); width = r.width; height = r.height; const dpr = Math.min(devicePixelRatio || 1,2); canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function project(x,y,z) {
    const ca = Math.cos(angle + pointerX*.12), sa = Math.sin(angle + pointerX*.12);
    const rx = x*ca-z*sa, rz = x*sa+z*ca;
    const tilt = -.28+pointerY*.1, cy = Math.cos(tilt), sy = Math.sin(tilt);
    const ry = y*cy-rz*sy, depth = y*sy+rz*cy;
    const radius = Math.min(width*.355,height*.365), scale = 3.7/(3.7-depth);
    return [width*.5+rx*radius*scale,height*.465+ry*radius*scale,depth,scale];
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    const cx = width*.5, cy = height*.465, r = Math.min(width*.355,height*.365);
    const glow = ctx.createRadialGradient(cx,cy,r*.15,cx,cy,r*1.3); glow.addColorStop(0,'rgba(142,202,65,.035)'); glow.addColorStop(.7,'rgba(142,202,65,.025)'); glow.addColorStop(1,'rgba(142,202,65,0)'); ctx.fillStyle = glow; ctx.fillRect(0,0,width,height);
    for (let ring=0;ring<3;ring++) {
      ctx.beginPath();
      const tilt = [.3,-.55,.85][ring];
      for(let i=0;i<=160;i++) { const t=i/160*Math.PI*2; const x=Math.cos(t)*1.22, y=Math.sin(t)*Math.sin(tilt)*1.22, z=Math.sin(t)*Math.cos(tilt)*1.22; const p=project(x,y,z); i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }
      ctx.strokeStyle = ['rgba(172,217,106,.18)','rgba(172,217,106,.10)','rgba(172,217,106,.12)'][ring]; ctx.lineWidth=.6;ctx.stroke();
    }
    // Latitude threads keep the sphere legible when animation is disabled.
    for (const latitude of [-.65,-.3,.1,.5,.78]) {
      ctx.beginPath(); const rr=Math.sqrt(1-latitude*latitude);
      for(let i=0;i<=100;i++) { const t=i/100*Math.PI*2;const p=project(Math.cos(t)*rr,latitude,Math.sin(t)*rr);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }
      ctx.strokeStyle='rgba(145,192,79,.06)';ctx.lineWidth=.5;ctx.stroke();
    }
    const projected=points.map(p=>project(...p)).sort((a,b)=>a[2]-b[2]);
    for(const p of projected) { const opacity=.12+(p[2]+1)*.32; ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.45,p[3]*.92),0,Math.PI*2);ctx.fillStyle=`rgba(190,237,123,${opacity})`;ctx.fill(); }
    for(let i=0;i<3;i++){ const t=angle*1.5+i*2.1,p=project(Math.cos(t)*1.22,Math.sin(t)*Math.sin(.3)*1.22,Math.sin(t)*Math.cos(.3)*1.22);ctx.beginPath();ctx.arc(p[0],p[1],2.6,0,Math.PI*2);ctx.fillStyle='#c4f564';ctx.shadowBlur=12;ctx.shadowColor='#c4f564';ctx.fill();ctx.shadowBlur=0; }
  }
  function animate(time) { frame=null; if (!visible || document.hidden || motion.matches) return; if(time-lastTime>30){angle+=.0023;draw();lastTime=time;} frame=requestAnimationFrame(animate); }
  function start() { cancelAnimationFrame(frame); if(visible&&!document.hidden&&!motion.matches) frame=requestAnimationFrame(animate); else draw(); }
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();},{threshold:.05}).observe(art);
  art.addEventListener('pointermove',e=>{const b=art.getBoundingClientRect();pointerX=(e.clientX-b.left)/b.width-.5;pointerY=(e.clientY-b.top)/b.height-.5;if(motion.matches)draw();});
  art.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  motion.addEventListener('change',start);document.addEventListener('visibilitychange',start);
  resize();start();
}
