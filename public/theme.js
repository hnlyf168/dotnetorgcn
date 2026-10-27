(() => {
 const root=document.documentElement,media=matchMedia('(prefers-color-scheme: dark)'),key='dotnet-community-theme';
 let preference;
 try{preference=localStorage.getItem(key);}catch{}
 if(!['light','dark'].includes(preference)){try{preference=document.cookie.split('; ').find(item=>item.startsWith(key+'='))?.split('=')[1];}catch{}}
 if(!['light','dark'].includes(preference))preference='system';
 const moon='<path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z"/>',sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
 function apply(){
  const theme=preference==='system'?(media.matches?'dark':'light'):preference;root.dataset.theme=theme;root.dataset.themePreference=preference;
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#0c111b':'#f8f9fd';
  for(const button of document.querySelectorAll('[data-theme-toggle]')){
   const zh=root.dataset.locale!=='en',label=theme==='dark'?(zh?'切换到浅色模式':'Switch to light mode'):(zh?'切换到深色模式':'Switch to dark mode');
   button.disabled=false;button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(theme==='dark'));
   button.innerHTML='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(theme==='dark'?sun:moon)+'</svg>';
  }
  for(const image of document.querySelectorAll('[data-theme-logo]'))image.src=theme==='dark'?'/brand/logo-symbol.svg':'/brand/logo-color-light.svg';
 }
 function toggle(){preference=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(key,preference);}catch{}try{document.cookie=key+'='+preference+'; Path=/; Max-Age=31536000; SameSite=Lax';}catch{}apply();}
 apply();
 document.addEventListener('DOMContentLoaded',()=>{apply();document.querySelectorAll('[data-theme-toggle]').forEach(button=>button.addEventListener('click',toggle));},{once:true});
 media.addEventListener('change',()=>{if(preference==='system')apply();});
 addEventListener('storage',event=>{if(event.key===key){preference=['light','dark'].includes(event.newValue)?event.newValue:'system';apply();}});
})();
