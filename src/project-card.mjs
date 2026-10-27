import {messages,escape as e,projectPath,prefix} from './i18n.mjs';
import {layout,icon} from './layout.mjs';
import {repositoryUrl} from '../scripts/project-metadata.mjs';
import {projectSlug} from './data-service.mjs';

export function projectCard(p,locale,{featured=false,index=0}={}){
 const t=messages[locale],url=projectPath(p,locale),repo=repositoryUrl(p),zh=locale==='zh';
 const visual=featured?(index===0?`<div class="project-visual voice-visual" aria-hidden="true"><div class="waveform">${Array.from({length:51},(_,i)=>`<i style="--h:${12+Math.round(Math.abs(Math.sin(i*.85)*Math.cos(i*.16))*72)}px;--d:${i*-.045}s"></i>`).join('')}</div><div class="visual-caption"><span>VOICE</span><span>→</span><span>HELLO, WORLD.</span></div></div>`:`<div class="project-visual vision-visual" aria-hidden="true"><div class="vision-crosshair"></div><div class="detect-frame frame-one"><span>OBJECT</span><i></i></div><div class="detect-frame frame-two"><span>POSE</span><i></i></div><span class="vision-coordinate">X / Y / POSSIBILITY</span></div>`):'';
 return `<article class="project-card ${featured?'featured':''} ${p.fork?'fork-card':''}" data-live-project="${projectSlug(p)}" data-category="${p.category}" data-search="${e([p.name,p.title,p.description,...p.tags,p.searchText||''].join(' ').toLowerCase())}">
 <div class="card-top"><span class="project-index">${String(index+1).padStart(2,'0')} /</span><span class="card-category">${p.fork?t.upstreamFork:t.categories[p.category]}</span><a class="icon-link" href="${repo}" target="_blank" rel="noopener noreferrer" aria-label="GitHub · ${e(p.title)}">${icon('arrow-up-right')}</a></div>
 <div class="project-card-copy"><span class="project-icon" data-icon="${p.icon}" aria-hidden="true"></span>${featured?`<p class="project-eyebrow">${e(p.eyebrow)}</p>`:''}<h3><a class="project-title" href="${url}">${e(p.title)}<span aria-hidden="true">↗</span></a></h3><p class="project-desc">${e(p.description)}</p></div>${visual}
 <div class="tags">${p.tags.map(tag=>`<span>${e(tag)}</span>`).join('')}</div><div class="card-bottom"><span class="repository-owner">${e(p.owner||'hnlyf168')}</span><button class="star" data-stars="${projectSlug(p)}" aria-label="${e(p.title)} Star ${zh?'支持者':'supporters'}">${icon('star')}<span data-star-count="${projectSlug(p)}">${p.stars}</span></button><a class="detail-link" href="${url}">${t.learnMore} ${icon('arrow-right')}</a></div></article>`;
}
