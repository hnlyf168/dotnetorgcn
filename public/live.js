const locale=document.documentElement.dataset.locale||'zh',zh=locale==='zh';
const number=value=>typeof value==='number'?new Intl.NumberFormat(zh?'zh-CN':'en-US').format(value):'—';
const timestamp=value=>value?new Intl.DateTimeFormat(zh?'zh-CN':'en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):(zh?'最近一次同步':'the last synchronization');
const records=new Map();let backup;
async function snapshot(){return backup||(backup=fetch('/live-data.json').then(response=>response.json()));}
async function record(slug,{people=false,page=1,refresh=false}={}){
 const key=`${slug}:${people}:${page}`;if(refresh)records.delete(key);
 if(!records.has(key))records.set(key,(async()=>{
  try{const response=await fetch(`/api/projects/${encodeURIComponent(slug)}?people=${people?1:0}&page=${page}`,{signal:AbortSignal.timeout(18000)});if(!response.ok)throw new Error();return await response.json();}
  catch{const data=(await snapshot()).projects?.[slug];if(!data)throw new Error('Data unavailable');return {...data,source:'snapshot',stargazers:page===1?{...data.stargazers,hasMore:false}:{users:[],available:false,hasMore:false}};}
 })());return records.get(key);
}
const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
function avatar(user,className='star-avatar'){
 const link=element('a',className);link.href=`https://github.com/${user.login}`;link.target='_blank';link.rel='noopener noreferrer';link.append(element('span','',user.login.slice(0,2).toUpperCase()));
 const image=element('img');image.src=`/api/avatar/${user.id}`;image.alt=user.login;image.loading='lazy';image.width=48;image.height=48;link.append(image);return link;
}
function updateProject(data){
 for(const node of document.querySelectorAll('[data-star-count]'))if(node.dataset.starCount===data.slug)node.textContent=number(data.stars);
 const panel=[...document.querySelectorAll('[data-project-activity]')].find(node=>node.dataset.projectActivity===data.slug);if(!panel)return;
 for(const key of ['forks','issues'])panel.querySelector(`[data-metric="${key}"]`).textContent=number(data[key]);
 panel.querySelector('[data-metric="pushedAt"]').textContent=data.pushedAt?data.pushedAt.slice(0,10):'—';
 panel.querySelector('[data-project-status]').textContent=(zh?'同步于 ':'Synced ')+timestamp(data.updatedAt);
 panel.querySelector('[data-activity-source]').textContent=(data.source==='snapshot'?(zh?'当前显示最近一次成功同步的数据。':'Showing the last successful synchronization. '):(zh?'GitHub 数据已同步；各服务存在缓存。':'GitHub data synchronized; sources are cached. '))+(zh?'名单更新时间：':'Supporter data: ')+timestamp(data.updatedAt);
 if(data.stargazers?.users?.length){const preview=panel.querySelector('[data-supporter-preview]');let row=preview.querySelector('.supporter-avatars');if(!row){row=element('div','supporter-avatars');preview.prepend(row);}row.replaceChildren(...data.stargazers.users.slice(0,8).map(user=>avatar(user)));}
 const pkg=data.packages?.find(item=>item.available),nuget=panel.querySelector('[data-nuget-panel]');if(!pkg)return;
 nuget.hidden=false;nuget.querySelector('[data-package-id]').textContent=pkg.id;nuget.querySelector('[data-package-version]').textContent=pkg.version;nuget.querySelector('[data-package-downloads]').textContent=number(pkg.downloads);nuget.querySelector('[data-package-link]').href=pkg.url;nuget.querySelector('[data-package-command]').textContent=`dotnet add package ${pkg.id} --version ${pkg.version}`;
 const dependencies=nuget.querySelector('[data-package-dependencies]');
 if(pkg.dependenciesAvailable){const title=element('h4','',zh?'当前版本的包依赖':'Package dependencies for this version');if(pkg.dependencies?.length){const list=element('ul');for(const item of pkg.dependencies.slice(0,12)){const li=element('li'),link=element('a','',item.id);link.href=`https://www.nuget.org/packages/${encodeURIComponent(item.id)}`;link.target='_blank';link.rel='noopener noreferrer';li.append(link,element('span','',item.range));list.append(li);}dependencies.replaceChildren(title,list);}else dependencies.replaceChildren(title,element('p','',zh?'该版本未列出额外的包依赖。':'No additional package dependencies are listed for this version.'));}
}
const starsDialog=document.querySelector('#stars-dialog');let currentSlug,currentPage=1,trigger,generation=0;const seen=new Set();
async function loadPeople(slug,page=1){
 const currentGeneration=generation,status=starsDialog.querySelector('.stars-status'),more=starsDialog.querySelector('[data-load-stargazers]');more.disabled=true;status.textContent=zh?'正在读取公开支持者数据…':'Loading public supporter data…';
 try{
  const data=await record(slug,{people:true,page});if(currentGeneration!==generation||!starsDialog.open)return;updateProject(data);const people=data.stargazers,list=starsDialog.querySelector('.stargazers-grid');if(page===1){list.replaceChildren();seen.clear();}
  for(const user of people?.users||[]){if(seen.has(user.id))continue;seen.add(user.id);const card=element('div','star-person');card.append(avatar(user),element('span','',user.login));list.append(card);}
  status.textContent=people?.available&&data.stars===0?(zh?'目前还没有 Star，欢迎成为第一位支持者。':'No stars yet. You can be the first supporter.'):people?.available&&seen.size?`${number(seen.size)} / ${number(data.stars)} ${zh?'位 Star 支持者':'stargazers'} · ${zh?'同步于':'Synced'} ${timestamp(data.updatedAt)}${people.source==='snapshot'?(zh?' · 缓存名单':' · Cached list'):''}`:(zh?'该项目的支持者名单暂不可用，可前往 GitHub 查看。':'This project’s supporter list is not available here. You can view the repository on GitHub.');
  more.hidden=!people?.hasMore;more.disabled=false;currentPage=page;starsDialog.querySelector('[data-stargazers-github]').href=data.repository+'/stargazers';
 }catch{status.textContent=zh?'暂时无法读取名单，请稍后重试。':'The list could not be loaded. Please try again later.';more.hidden=true;}
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-stars]');if(!button||!starsDialog)return;currentSlug=button.dataset.stars;trigger=button;generation++;starsDialog.querySelector('.stargazers-grid').replaceChildren();starsDialog.querySelector('[data-load-stargazers]').hidden=true;starsDialog.showModal();document.body.style.overflow='hidden';loadPeople(currentSlug);});
starsDialog?.querySelector('.stars-close').addEventListener('click',()=>starsDialog.close());
starsDialog?.querySelector('[data-load-stargazers]').addEventListener('click',()=>loadPeople(currentSlug,currentPage+1));
starsDialog?.addEventListener('close',()=>{document.body.style.overflow='';trigger?.focus();});
starsDialog?.addEventListener('click',event=>{const r=starsDialog.getBoundingClientRect();if(event.target===starsDialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))starsDialog.close();});
const loaded=new Set();function loadProject(slug,people=false){if(loaded.has(slug)&&!people)return;loaded.add(slug);record(slug,{people}).then(updateProject).catch(()=>{});}
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){loadProject(entry.target.dataset.liveProject);observer.unobserve(entry.target);}},{rootMargin:'80px'});
document.querySelectorAll('[data-live-project]').forEach(node=>observer.observe(node));
document.querySelectorAll('[data-project-activity]').forEach(node=>loadProject(node.dataset.projectActivity,true));
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement&&event.target.closest('.star-avatar,.member-avatar'))event.target.hidden=true;},true);
function newMember(member){
 const card=element('article','member-card');card.dataset.member=member.login;const top=element('div','member-card-top');top.append(avatar(member,'member-avatar'),element('span','member-badge',zh?'公开成员':'Public member'));
 const title=element('h2'),link=element('a','',member.name||member.login);link.href=`https://github.com/${member.login}`;link.target='_blank';link.rel='noopener noreferrer';title.append(link);const bio=typeof member.bio==='string'?member.bio:(member.bio?.[locale]||member.githubBio||'');card.append(top,title,element('p','member-handle','@'+member.login),element('p','member-intro',bio));const more=element('a','text-link',zh?'查看 GitHub 作品 ↗':'Explore GitHub repositories ↗');more.href=`https://github.com/${member.login}?tab=repositories`;more.target='_blank';more.rel='noopener noreferrer';card.append(more);return card;
}
let communityPromise;
function profileDetails(member){
 const details=element('div','member-profile-details');
 if(typeof member.githubBio!=='string'||!member.githubBio)return details;
 const url=`https://github.com/${member.login}`,source=zh?'GitHub 公开简介':'Public GitHub bio';
 if(member.highlights?.some(item=>item.id==='microsoft-mvp')){const badge=element('a','member-honor');badge.href=url;badge.target='_blank';badge.rel='noopener noreferrer';badge.title=source;badge.append(element('span','','◆'),document.createTextNode(' Microsoft MVP'));details.append(badge);}
 const link=element('a','member-profile-source',source+' ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';details.append(element('p','member-public-bio',member.githubBio),link);return details;
}
async function loadMembers(grid){
 try{communityPromise||=fetch('/api/community',{signal:AbortSignal.timeout(15000)}).then(response=>{if(!response.ok)throw new Error();return response.json();}).catch(async()=>({members:(await snapshot()).members||[],source:'snapshot'}));const data=await communityPromise,limit=Number(grid.dataset.memberLimit)||100;
  for(const member of data.members||[]){const existing=[...grid.querySelectorAll('[data-member]')].find(node=>node.dataset.member===member.login);if(existing){const name=existing.querySelector('h2 a');if(name)name.textContent=(member.name||member.login)+' ↗';const old=existing.querySelector('.member-profile-details'),details=profileDetails(member);if(old)old.replaceWith(details);else existing.querySelector('.member-intro')?.before(details);continue;}if(grid.children.length<limit){const card=newMember(member);card.querySelector('.member-intro').before(profileDetails(member));grid.append(card);}}
  const status=document.querySelector('[data-members-status]');if(status)status.textContent=(zh?'公开资料与社区名单 · 更新于 ':'Public profiles and community roster · Updated ')+timestamp(data.updatedAt);
 }catch{}
}
const memberObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){loadMembers(entry.target);memberObserver.unobserve(entry.target);}});document.querySelectorAll('[data-members-grid]').forEach(node=>memberObserver.observe(node));
setInterval(()=>{if(document.hidden)return;for(const node of document.querySelectorAll('[data-project-activity]'))record(node.dataset.projectActivity,{people:true,refresh:true}).then(updateProject).catch(()=>{});},120000);
