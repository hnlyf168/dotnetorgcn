(() => {
  const root=document.documentElement;
  let saved;
  try {saved=localStorage.getItem('dotnet-language');}catch{}
  const requested=new URLSearchParams(location.search).get('lang');
  const preferred=requested==='zh'||requested==='en'?requested:(saved==='zh'||saved==='en'?saved:((navigator.languages?.[0]||navigator.language||'en').toLowerCase().startsWith('zh')?'zh':'en'));
  // Explicit English URLs remain shareable. Chinese/default routes follow the visitor's preference.
  if(root.dataset.autoLocale==='true' && root.dataset.locale==='zh' && preferred==='en') {
    const target=root.dataset.enUrl;
    if(target)location.replace(target+location.search+location.hash);
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('[data-set-locale]');
    if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const target=new URL(link.href,location.href);
    try{localStorage.setItem('dotnet-language',link.dataset.setLocale);}catch{target.searchParams.set('lang',link.dataset.setLocale);}
    if(location.hash&&!target.hash)target.hash=location.hash;
    link.href=target.href;
  });
})();
