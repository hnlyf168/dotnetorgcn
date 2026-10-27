import test from 'node:test';
import assert from 'node:assert/strict';
import {createDataService,publicUser} from '../src/data-service.mjs';

const project={name:'Example',title:'Example',owner:'organization',repositoryId:42,stars:2,communityData:true};
const members={organization:'organization',members:[{id:1,login:'maintainer',name:'Maintainer',bio:{zh:'社区介绍',en:'Community bio'},areas:['.NET']}]};
const document={repositoryId:42,stars:30,forks:3,issues:4,pushedAt:'2026-10-20T01:00:00Z',updatedAt:'2026-10-27T01:00:00Z',complete:true,users:Array.from({length:30},(_,i)=>({id:i+1,login:`person-${i}`,email:'private@example.com',permissions:{admin:true}}))};
const reply=data=>Response.json(data);

test('published repository data paginates supporters without retaining private profile fields or sending credentials',async()=>{
  const service=createDataService({projects:[project],members,token:'test-server-token',fetcher:async(url,options)=>{
    assert.equal(url,'https://raw.githubusercontent.com/organization/Example/community-data/stargazers.json');
    assert.equal(options.headers.Authorization,undefined);return reply(document);
  }});
  const first=await service.project('example',{people:true}),second=await service.project('example',{people:true,page:2});
  assert.equal(first.source,'github-actions');assert.equal(first.stars,30);assert.equal(first.stargazers.users.length,24);assert.equal(first.stargazers.hasMore,true);
  assert.equal(second.stargazers.users.length,6);assert.equal(second.stargazers.hasMore,false);assert.equal(second.stargazers.users[0].login,'person-24');
  assert.ok(!JSON.stringify(first).includes('private@example.com'));assert.ok(!JSON.stringify(first).includes('test-server-token'));assert.ok(!JSON.stringify(first).includes('permissions'));
  assert.equal(await service.project('../other'),null);
});

test('an identity mismatch cannot replace curated metadata and failed endpoints preserve the last public snapshot',async()=>{
  const service=createDataService({projects:[project],members,snapshot:{generatedAt:'2026-10-20T01:00:00Z',projects:{example:{stars:17,stargazers:{users:[publicUser({id:8,login:'cached'})]}}}},fetcher:async url=>{
    if(url.includes('raw.githubusercontent.com'))return reply({...document,repositoryId:99});
    return new Response(null,{status:503});
  }});
  const result=await service.project('example',{people:true});assert.equal(result.stars,17);assert.equal(result.source,'snapshot');assert.equal(result.stargazers.users[0].login,'cached');assert.equal(result.stargazers.hasMore,false);
  const next=await service.project('example',{people:true,page:2});assert.deepEqual(next.stargazers.users,[]);
});

test('private repositories are never returned by the live endpoint',async()=>{
  const service=createDataService({projects:[{...project,communityData:false}],members,fetcher:async()=>reply({private:true,owner:{login:'organization'}})});
  assert.equal(await service.project('example',{people:true}),null);
});

test('NuGet resolves an exact package ID and returns downloads and version dependencies separately',async()=>{
  const service=createDataService({projects:[],members,fetcher:async url=>{
    if(url.includes('/query?'))return reply({data:[{id:'Example.Other',version:'99.0',totalDownloads:900},{id:'Example',version:'1.2.0-preview.1',totalDownloads:1234}]});
    return reply({catalogEntry:{dependencyGroups:[{targetFramework:'net10.0',dependencies:[{id:'Dependency',range:'[2.0, )'}]},{targetFramework:'net9.0',dependencies:[{id:'Dependency',range:'[2.0, )'}]}]}});
  }});
  const info=await service.packageInfo('Example',{dependencies:true});assert.equal(info.downloads,1234);assert.equal(info.version,'1.2.0-preview.1');assert.equal(info.prerelease,true);assert.equal(info.dependencies.length,1);assert.equal(info.dependencies[0].id,'Dependency');assert.equal(info.dependenciesAvailable,true);
});

test('NuGet does not fetch catalog URLs outside the NuGet service',async()=>{
  const service=createDataService({projects:[],members,fetcher:async url=>{
    assert.ok(new URL(url).hostname.endsWith('nuget.org'));
    return reply(url.includes('/query?')?{data:[{id:'Example',version:'1.0',totalDownloads:3}]}:{catalogEntry:'https://other.example/private'});
  }});
  const info=await service.packageInfo('Example',{dependencies:true});assert.equal(info.dependenciesAvailable,false);assert.equal(info.downloads,3);
});

test('member discovery merges public memberships with curated introductions without revealing membership roles',async()=>{
  const service=createDataService({projects:[],members,fetcher:async url=>{
    if(url.includes('/public_members?'))return reply([{id:1,login:'maintainer',role:'admin'},{id:2,login:'public-developer',email:'hidden@example.com'}]);
    const login=url.split('/').pop();return reply({id:login==='maintainer'?1:2,login,name:'Public name',bio:'Public bio',role:'admin',email:'hidden@example.com'});
  }});
  const result=await service.community();assert.equal(result.members.length,2);assert.equal(result.members[0].bio.en,'Community bio');assert.equal(result.members[0].publicMembership,true);
  assert.ok(!JSON.stringify(result).includes('admin'));assert.ok(!JSON.stringify(result).includes('hidden@example.com'));assert.equal(publicUser({id:1,login:'../evil'}),null);
});
