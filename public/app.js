import {locale,labels,copy} from './shared.js';

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
  document.querySelector('#filter-status').textContent = `${count} ${labels.projects}`;
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  applyFilters();
}));
search.addEventListener('input', applyFilters);
document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; filters[0].click(); search.focus(); });
document.addEventListener('keydown', e => {
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable && !document.querySelector('dialog[open]')) {
    e.preventDefault(); search.scrollIntoView({ block:'center' }); search.focus({ preventScroll:true });
  }
  if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; applyFilters(); search.blur(); }
});

const examples = {
  ai: { filename:'Speech.cs', caption:'FunASR.NET · 普通话语音识别', source:'FunAsrNet', code:'using FunAsrNet;\n\n// 模型权重需按项目文档另行准备\nvar asr = new FunAsr(\n  "models/funasr-encoder-f16.gguf",\n  "models/qwen3-0.6b-q8_0.gguf", threads: 4);\nvar (samples, rate) = AudioFile.ReadWave("input.wav");\nvar result = asr.Transcribe(\n  AudioFile.Resample(samples, rate, 16000),\n  maxTokens: 128);\nConsole.WriteLine(result.Text);' },
  infra: { filename:'Database.cs', caption:'PureDb · 纯托管文件数据库', source:'PureDb', code:'using PureDb;\n\n// 为想法，留一份持久的存储\nawait using var db = new SqlDatabase("app.pdb");\nawait db.ExecuteAsync(\n  "CREATE TABLE IF NOT EXISTS ideas(" +\n  "id INTEGER PRIMARY KEY, name TEXT)");\n\nvar result = db.Query("SELECT name FROM ideas");\nConsole.WriteLine(result.Rows.Count);' },
  connect: { filename:'Terminal', caption:'Serein · 从源码启动流媒体服务', source:'Serein', code:'# 需要 .NET 10 SDK\ngit clone https://github.com/hnlyf168/Serein.git\ncd Serein\n\n# 还原、构建并运行示例\ndotnet restore Serein.slnx\ndotnet build Serein.slnx -c Release --no-restore\ndotnet run --project samples/Serein.Server \\\n  -c Release --no-build\n\n# 默认地址 http://127.0.0.1:5080' }
};
if(locale==='en'){
 examples.ai.caption='FunASR.NET · Mandarin speech recognition';examples.infra.caption='PureDb · Managed file storage';examples.connect.caption='Serein · Run the streaming example';
 for(const item of Object.values(examples))item.code=item.code.replace('模型权重需按项目文档另行准备','Prepare compatible model weights separately').replace('为想法，留一份持久的存储','Give your ideas a persistent home').replace('需要 .NET 10 SDK','Requires the .NET 10 SDK').replace('还原、构建并运行示例','Restore, build, and run the example').replace('默认地址','Default URL');
}
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
    const glow = ctx.createRadialGradient(cx,cy,r*.15,cx,cy,r*1.3); glow.addColorStop(0,'rgba(99,91,223,.035)'); glow.addColorStop(.7,'rgba(99,91,223,.025)'); glow.addColorStop(1,'rgba(99,91,223,0)'); ctx.fillStyle = glow; ctx.fillRect(0,0,width,height);
    for (let ring=0;ring<3;ring++) {
      ctx.beginPath();
      const tilt = [.3,-.55,.85][ring];
      for(let i=0;i<=160;i++) { const t=i/160*Math.PI*2; const x=Math.cos(t)*1.22, y=Math.sin(t)*Math.sin(tilt)*1.22, z=Math.sin(t)*Math.cos(tilt)*1.22; const p=project(x,y,z); i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }
      ctx.strokeStyle = ['rgba(110,101,213,.18)','rgba(110,101,213,.10)','rgba(110,101,213,.12)'][ring]; ctx.lineWidth=.6;ctx.stroke();
    }
    // Latitude threads keep the sphere legible when animation is disabled.
    for (const latitude of [-.65,-.3,.1,.5,.78]) {
      ctx.beginPath(); const rr=Math.sqrt(1-latitude*latitude);
      for(let i=0;i<=100;i++) { const t=i/100*Math.PI*2;const p=project(Math.cos(t)*rr,latitude,Math.sin(t)*rr);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }
      ctx.strokeStyle='rgba(109,102,185,.06)';ctx.lineWidth=.5;ctx.stroke();
    }
    const projected=points.map(p=>project(...p)).sort((a,b)=>a[2]-b[2]);
    for(const p of projected) { const opacity=.12+(p[2]+1)*.32; ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.45,p[3]*.92),0,Math.PI*2);ctx.fillStyle=`rgba(103,93,197,${opacity})`;ctx.fill(); }
    for(let i=0;i<3;i++){ const t=angle*1.5+i*2.1,p=project(Math.cos(t)*1.22,Math.sin(t)*Math.sin(.3)*1.22,Math.sin(t)*Math.cos(.3)*1.22);ctx.beginPath();ctx.arc(p[0],p[1],2.6,0,Math.PI*2);ctx.fillStyle='#6b5fe7';ctx.shadowBlur=12;ctx.shadowColor='#6b5fe7';ctx.fill();ctx.shadowBlur=0; }
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
