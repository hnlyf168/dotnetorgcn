export const locale=document.documentElement.dataset.locale||'zh';
export const labels=locale==='en'?{menuOpen:'Open navigation menu',menuClose:'Close navigation menu',copied:'Copied',copyFailed:'Please select and copy the text manually.',projects:'projects'}:{menuOpen:'打开导航菜单',menuClose:'关闭导航菜单',copied:'已复制',copyFailed:'请选中文本，手动复制。',projects:'个项目'};
const paths = {
  'arrow-up-right':'M7 17 17 7M7 7h10v10', 'arrow-right':'M4 12h16m-6-6 6 6-6 6', search:'m21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0', menu:'M4 6h16M4 12h16M4 18h16', x:'m6 6 12 12M6 18 18 6', copy:'M9 9h11v11H9zM5 15H3V3h12v2', star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3', wave:'M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4', scan:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12l3 3 7-7', database:'M20 6c0 2.2-3.6 4-8 4S4 8.2 4 6s3.6-4 8-4 8 1.8 8 4ZM4 6v12c0 2.2 3.6 4 8 4s8-1.8 8-4V6M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4', layers:'m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5', play:'m10 7 7 5-7 5V7ZM22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', cloud:'M6 18a5 5 0 0 1-.8-9.9 7 7 0 0 1 13.3 1.6A4.2 4.2 0 0 1 18 18H6Zm6-9v10m-4-6 4-4 4 4', network:'M9 3h6v6H9zM2 16h6v6H2zM16 16h6v6h-6zM12 9v4m-7 3v-3h14v3', terminal:'m4 5 6 6-6 6m9 1h7', text:'M5 5h14M12 5v14m-4 0h8M3 3v4m18-4v4', book:'M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2V3Z', code:'m8 5-7 7 7 7m8-14 7 7-7 7m-2-17-4 20', 'git-branch':'M6 3v12a6 6 0 0 0 12 0V9M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', github:'M9 19c-4 1-4-2-6-2m12 5v-3.9c0-1.1-.4-1.8-.8-2.2 2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 6a4.5 4.5 0 0 0-.1-3S17.3 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.7 2.7 5.6 3 5.6 3a4.5 4.5 0 0 0-.1 3 4.7 4.7 0 0 0-1.3 3.9c0 4.7 2.9 5.7 5.6 6-.4.4-.8 1.1-.8 2.2V22'
};
Object.assign(paths,{globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c4 5 4 13 0 18-4-5-4-13 0-18Z',check:'m5 12 4 4 10-10',info:'M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',message:'M21 11a9 9 0 0 1-9 9H5l-4 3 2-7a9 9 0 1 1 18-5Z'});
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
  try { await navigator.clipboard.writeText(text); toast(labels.copied); }
  catch { toast(labels.copyFailed); }
}

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeNav() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', labels.menuOpen); }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? labels.menuClose : labels.menuOpen); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); menu.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeNav(); });


export {copy,toast};
