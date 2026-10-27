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
  const more=document.querySelector('.catalog-more');if(more){more.open=true;more.hidden=count===0||![...more.querySelectorAll('.project-card')].some(card=>!card.hidden);more.classList.toggle('is-filtered',activeFilter!=='all'||Boolean(query));}
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

const exampleRepositories=JSON.parse(document.querySelector('#code-source').dataset.repositories||'{}');
const examples = {
  ai: { filename:'Speech.cs', caption:'FunASR.NET · 普通话语音识别', source:'FunAsrNet', code:'using FunAsrNet;\n\n// 模型权重需按项目文档另行准备\nvar asr = new FunAsr(\n  "models/funasr-encoder-f16.gguf",\n  "models/qwen3-0.6b-q8_0.gguf", threads: 4);\nvar (samples, rate) = AudioFile.ReadWave("input.wav");\nvar result = asr.Transcribe(\n  AudioFile.Resample(samples, rate, 16000),\n  maxTokens: 128);\nConsole.WriteLine(result.Text);' },
  infra: { filename:'Database.cs', caption:'PureDb · 纯托管文件数据库', source:'PureDb', code:'using PureDb;\n\n// 为想法，留一份持久的存储\nawait using var db = new SqlDatabase("app.pdb");\nawait db.ExecuteAsync(\n  "CREATE TABLE IF NOT EXISTS ideas(" +\n  "id INTEGER PRIMARY KEY, name TEXT)");\n\nvar result = db.Query("SELECT name FROM ideas");\nConsole.WriteLine(result.Rows.Count);' },
  connect: { filename:'Terminal', caption:'Serein · 从源码启动流媒体服务', source:'Serein', code:'# 需要 .NET 10 SDK\ngit clone https://github.com/hnlyf168/Serein.git\ncd Serein\n\n# 还原、构建并运行示例\ndotnet restore Serein.slnx\ndotnet build Serein.slnx -c Release --no-restore\ndotnet run --project samples/Serein.Server \\\n  -c Release --no-build\n\n# 默认地址 http://127.0.0.1:5080' }
};
if(exampleRepositories.Serein)examples.connect.code=examples.connect.code.replace('https://github.com/hnlyf168/Serein.git',exampleRepositories.Serein+'.git');
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
  const brief=document.querySelector('[data-workbench-projects]');if(brief){const item=JSON.parse(brief.dataset.workbenchProjects)[currentExample.source];if(item){brief.querySelector('[data-workbench-title]').textContent=item.title;brief.querySelector('[data-workbench-description]').textContent=item.description;brief.querySelector('[data-workbench-link]').href=item.url;const list=brief.querySelector('[data-workbench-features]');list.replaceChildren(...item.features.map(feature=>{const li=document.createElement('li');li.textContent='✓ '+feature;return li;}));}}
  document.querySelector('#code-source').href = `${exampleRepositories[currentExample.source]||'https://github.com/hnlyf168/'+currentExample.source}#readme`;
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
