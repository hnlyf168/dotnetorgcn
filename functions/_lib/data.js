import catalog from '../../content/projects.json' with {type:'json'};
import members from '../../content/members.json' with {type:'json'};
import snapshot from '../../content/live-snapshot.json' with {type:'json'};
import {createDataService} from '../../src/data-service.mjs';

export async function dataResponse(context,kind){
  const url=new URL(context.request.url),slug=context.params?.slug;
  const people=url.searchParams.get('people')==='1',page=Math.max(1,Math.min(100,Math.floor(Number(url.searchParams.get('page'))||1)));
  const key=new Request(`${url.origin}/__community-cache/v3/${kind}/${slug||'members'}?people=${people?1:0}&page=${page}&auth=${context.env?.GITHUB_READ_TOKEN?'1':'0'}`);
  const cache=typeof caches!=='undefined'?caches.default:null;
  const cached=await cache?.match(key);
  if(cached){const body=await cached.json();return Response.json({...body,cache:'hit'},{headers:responseHeaders(300)});}
  const service=createDataService({projects:catalog.projects,members,snapshot,token:context.env?.GITHUB_READ_TOKEN||''});
  const result=kind==='project'?await service.project(slug,{people,page}):await service.community();
  if(!result)return Response.json({error:'Unknown project'},{status:404,headers:{'Cache-Control':'no-store'}});
  const ttl=result.source==='snapshot'?60:(result.source==='github-actions'?120:(context.env?.GITHUB_READ_TOKEN?300:1800));
  const response=Response.json(result,{headers:responseHeaders(ttl)});
  if(cache&&context.waitUntil)context.waitUntil(cache.put(key,response.clone()));
  return response;
}
function responseHeaders(ttl){return {'Cache-Control':`public, max-age=60, s-maxage=${ttl}, stale-while-revalidate=300`,'X-Content-Type-Options':'nosniff'};}
