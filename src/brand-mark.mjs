const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

/**
 * The community connection mark: code brackets, an N bridge, and a connection dot.
 * No defs or SVG IDs are used, so several inline marks can share one document.
 */
export function brandMark({className='',variant='color',title='',size=100}={}){
  const palette=variant==='light'?['#f3f5f8','#f3f5f8','#f3f5f8']:
    variant==='dark'?['#182235','#182235','#182235']:
    variant==='color-light'?['#7252c3','#182235','#3f741f']:['#9f8cff','#f3f5f8','#bcf879'];
  const accessible=title?`role="img" aria-label="${escape(title)}"`:'aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${Number(size)||100}" height="${Number(size)||100}" class="${escape(className)}" ${accessible} fill="none">${title?`<title>${escape(title)}</title>`:''}<path d="M28 18 8 50l20 32" fill="none" stroke="${palette[0]}" stroke-width="9" stroke-linecap="square" stroke-linejoin="miter"/><path d="M32 71V29h9l18 26V29h9v42h-9L41 45v26H32Z" fill="${palette[1]}"/><path d="m72 18 20 32-20 32" fill="none" stroke="${palette[2]}" stroke-width="9" stroke-linecap="square" stroke-linejoin="miter"/><circle cx="86" cy="11" r="5" fill="${palette[2]}"/></svg>`;
}

export const brandName={zh:'.NET 中文开源社区',en:'.NET Chinese Open Source Community'};
