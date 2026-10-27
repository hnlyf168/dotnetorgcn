export const projectSlug=project=>project.slug||project.name.toLowerCase();
const numeric=value=>Number.isFinite(value)&&value>=0?value:0;
const iso=value=>value&&!Number.isNaN(Date.parse(value))?value:null;
export function publicUser(user){
  if(!user||!Number.isSafeInteger(user.id)||!/^[-a-z0-9]+$/i.test(user.login||''))return null;
  return {id:user.id,login:user.login,name:user.name||user.login,profile:`https://github.com/${user.login}`,avatar:`/api/avatar/${user.id}`,bio:typeof user.bio==='string'?user.bio:''};
}

export function createDataService({projects,members,snapshot={},token='',fetcher=fetch,now=()=>new Date().toISOString()}) {
  const githubHeaders={Accept:'application/vnd.github+json','User-Agent':'dotnet-org-cn-community',...(token?{Authorization:`Bearer ${token}`}:{})};
  async function json(url,github=false){
    const response=await fetcher(url,{headers:github?githubHeaders:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw Object.assign(new Error(`Upstream returned ${response.status}`),{status:response.status});
    return response.json();
  }
  function fallback(project){const slug=projectSlug(project);return {slug,name:project.title,owner:project.owner,repository:`https://github.com/${project.owner}/${project.name}`,stars:numeric(project.stars),forks:null,issues:null,pushedAt:null,packages:[],stargazers:{users:[],available:false,hasMore:false,page:1},...snapshot.projects?.[slug],source:'snapshot',updatedAt:snapshot.projects?.[slug]?.updatedAt||snapshot.generatedAt||null};}
  async function packageInfo(id,{dependencies=false}={}){
    if(!/^[a-z0-9_.-]+$/i.test(id))throw new Error('Invalid NuGet package ID');
    const search=await json(`https://azuresearch-ea.nuget.org/query?q=${encodeURIComponent('packageid:'+id)}&prerelease=true&semVerLevel=2.0.0&take=5`);
    const item=search.data?.find(item=>String(item.id).toLowerCase()===id.toLowerCase());
    if(!item)return {id,available:false};
    const result={id:item.id,available:true,version:item.version,downloads:numeric(item.totalDownloads),url:`https://www.nuget.org/packages/${encodeURIComponent(item.id)}`,prerelease:String(item.version).includes('-'),dependencies:[],updatedAt:now()};
    if(dependencies){
      try{
        const registration=await json(`https://api.nuget.org/v3/registration5-gz-semver2/${id.toLowerCase()}/index.json`);
        const find=entries=>entries?.find(entry=>String(entry.catalogEntry?.version||'').toLowerCase()===item.version.toLowerCase());
        let leaf=find(registration.items?.flatMap(page=>page.items||[]));
        // Most packages embed their versions in the index; larger histories use pages.
        for(const page of [...(registration.items||[])].reverse().filter(page=>!page.items).slice(0,8)){
          if(leaf)break;
          const url=new URL(page['@id']);if(url.protocol!=='https:'||url.hostname!=='api.nuget.org')throw new Error('Invalid NuGet registration URL');
          leaf=find((await json(url.href)).items);
        }
        if(!leaf)throw new Error('NuGet version metadata is unavailable');
        let entry=leaf.catalogEntry;
        if(typeof entry==='string'){
          const url=new URL(entry);if(url.protocol!=='https:'||url.hostname!=='api.nuget.org')throw new Error('Invalid NuGet catalog URL');
          entry=await json(url.href);
        }
        const unique=new Map();
        for(const group of entry?.dependencyGroups||[])for(const dependency of group.dependencies||[]){if(dependency.id&&dependency.id!=='Microsoft.NETCore.App')unique.set(`${dependency.id}:${dependency.range}`,{id:dependency.id,range:dependency.range||'',framework:group.targetFramework||''});}
        result.dependencies=[...unique.values()];result.dependenciesAvailable=true;
      }catch{result.dependenciesAvailable=false;}
    }
    return result;
  }
  async function project(slug,{people=false,page=1}={}){
    const entry=projects.find(project=>projectSlug(project)===slug);
    if(!entry)return null;
    const result=fallback(entry);let repo,published;
    if(entry.communityData){
      try{
        const document=await json(`https://raw.githubusercontent.com/${entry.owner}/${entry.name}/community-data/stargazers.json`);
        if(document.repositoryId!==entry.repositoryId||!Array.isArray(document.users))throw new Error('Community data identity mismatch');
        published=document;
        Object.assign(result,{stars:numeric(document.stars),forks:numeric(document.forks),issues:numeric(document.issues),pushedAt:iso(document.pushedAt),license:document.license||null,source:'github-actions',updatedAt:iso(document.updatedAt)});
      }catch{}
    }
    if(!published){
    try{
      repo=await json(`https://api.github.com/repositories/${entry.repositoryId}`,true);
      if(repo.private)return null;
      if(!repo.owner?.login)throw new Error('Repository is not public');
      Object.assign(result,{owner:repo.owner.login,repository:repo.html_url,stars:numeric(repo.stargazers_count),forks:numeric(repo.forks_count),issues:numeric(repo.open_issues_count),pushedAt:iso(repo.pushed_at),license:repo.license?.spdx_id||null,source:'live',updatedAt:now()});
    }catch{repo=null;}
    }
    if(people&&entry.nugetPackages?.length){
      try{result.packages=[await packageInfo(entry.nugetPackages[0],{dependencies:people})];}catch{result.packages=(result.packages||[]).map(item=>({...item,stale:true}));}
    }
    if(people){
      page=Math.min(100,Math.max(1,Math.floor(Number(page)||1)));
      if(published){
        const users=published.users.map(publicUser).filter(Boolean);
        result.stargazers={users:users.slice((page-1)*24,page*24),available:true,hasMore:page*24<users.length,page,total:result.stars,source:'github-actions',complete:published.complete===true};
        return result;
      }
      try{
        if(!repo)throw new Error('No fresh public repository metadata');
        const users=await json(`https://api.github.com/repos/${repo.owner.login}/${entry.name}/stargazers?per_page=24&page=${page}`,true);
        result.stargazers={users:users.map(publicUser).filter(Boolean),available:true,hasMore:page*24<result.stars&&users.length===24,page,total:result.stars,source:'live'};
      }catch{
        result.stargazers={...(page===1?result.stargazers:{users:[]}),available:page===1&&Boolean(result.stargazers?.users?.length),hasMore:false,page,total:result.stars,source:'snapshot',requiresAuthorization:true};
      }
    }else delete result.stargazers;
    return result;
  }
  async function community(){
    const selected=new Map(members.members.map(member=>[member.login,{id:member.id,login:member.login,name:member.name,profile:`https://github.com/${member.login}`,avatar:`/api/avatar/${member.id}`,bio:member.bio,areas:member.areas,curated:true,publicMembership:false}]));
    let source='snapshot';
    try{
      const list=await json(`https://api.github.com/orgs/${members.organization}/public_members?per_page=100`,true);
      for(const entry of list){const member=publicUser(entry);if(!member)continue;selected.set(entry.login,{...member,...selected.get(entry.login),publicMembership:true});}
      source='live';
    }catch{}
    const output=await Promise.all([...selected.values()].slice(0,100).map(async member=>{
      try{const profile=publicUser(await json(`https://api.github.com/users/${member.login}`,true));if(profile)return {...member,name:profile.name,githubBio:profile.bio};}catch{}
      return member;
    }));
    return {members:output,source,updatedAt:now(),organization:members.organization,visibility:'public-and-curated'};
  }
  return {project,community,packageInfo,fallback};
}
