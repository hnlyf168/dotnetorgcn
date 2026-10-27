import test from 'node:test';
import assert from 'node:assert/strict';
import {applyRepositoryMetadata,synchronizeProject,repositoryUrl} from '../scripts/project-metadata.mjs';

test('repository transfers update the owner and clone command without changing site routes or attribution',()=>{
  const before={name:'Example',owner:'hnlyf168',command:'git clone https://github.com/hnlyf168/Example.git',fork:true,upstream:'https://github.com/upstream/Example',description:'Keep curated content'};
  const after=applyRepositoryMetadata(before,{owner:{login:'donet-org-cn'},stargazers_count:12,fork:true});
  assert.equal(repositoryUrl(after),'https://github.com/donet-org-cn/Example');
  assert.equal(after.command,'git clone https://github.com/donet-org-cn/Example.git');
  assert.equal(after.name,before.name);assert.equal(after.upstream,before.upstream);assert.equal(after.description,before.description);
});
test('metadata lookup follows GitHub redirects instead of assuming all projects belong to one account',async()=>{
  const after=await synchronizeProject({name:'Example'}, {defaultOwner:'hnlyf168',fetcher:async(url,options)=>{
    assert.equal(url,'https://api.github.com/repos/hnlyf168/Example');assert.equal(options.redirect,'follow');
    return {ok:true,status:200,json:async()=>({owner:{login:'donet-org-cn'},stargazers_count:3,fork:false})};
  }});
  assert.equal(after.owner,'donet-org-cn');
});
test('a temporarily unavailable repository preserves curated content',async()=>{
  const project={name:'Example',owner:'hnlyf168'};
  assert.equal(await synchronizeProject(project,{fetcher:async()=>({status:404,ok:false})}),project);
});
test('stable repository IDs continue tracking a transferred project independently of the old owner URL',async()=>{
  const after=await synchronizeProject({name:'Example',repositoryId:12345,owner:'hnlyf168'},{fetcher:async(url)=>{
    assert.equal(url,'https://api.github.com/repositories/12345');
    return {ok:true,status:200,json:async()=>({id:12345,owner:{login:'donet-org-cn'},stargazers_count:9,fork:false})};
  }});
  assert.equal(after.owner,'donet-org-cn');assert.equal(after.repositoryId,12345);
});
