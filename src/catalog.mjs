import {messages,escape as e,projectPath} from './i18n.mjs';
import {icon} from './layout.mjs';
import {projectSlug} from './data-service.mjs';
import {repositoryUrl} from '../scripts/project-metadata.mjs';
export function catalogRow(p,locale,index){
 const t=messages[locale],slug=projectSlug(p),url=projectPath(p,locale);
 return `<article class="project-card catalog-row ${p.fork?'fork-card':''}" data-live-project="${slug}" data-category="${p.category}" data-search="${e([p.name,p.title,p.description,...p.tags,p.searchText||''].join(' ').toLowerCase())}"><span class="catalog-index">${String(index+1).padStart(2,'0')}</span><div class="catalog-copy"><div class="catalog-title-line"><span class="catalog-project-icon" data-icon="${p.icon}" aria-hidden="true"></span><h3><a class="project-title" href="${url}">${e(p.title)}</a></h3><span class="catalog-category">${p.fork?t.upstreamFork:t.categories[p.category]}</span></div><p class="project-desc">${e(p.description)}</p><div class="catalog-meta"><span>${e(p.owner)}</span>${p.tags.slice(0,3).map(tag=>`<span>${e(tag)}</span>`).join('')}</div></div><div class="catalog-actions"><button class="star" data-stars="${slug}" aria-label="${e(p.title)} Star ${locale==='zh'?'支持者':'supporters'}">${icon('star')}<span data-star-count="${slug}">${p.stars}</span></button><a href="${repositoryUrl(p)}" class="catalog-github" target="_blank" rel="noopener noreferrer" aria-label="GitHub · ${e(p.title)}">${icon('github')}</a><a class="catalog-open" href="${url}" aria-label="${t.learnMore} ${e(p.title)}">${icon('arrow-up-right')}</a></div></article>`;
}
