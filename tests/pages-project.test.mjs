import test from 'node:test';
import assert from 'node:assert/strict';
import {selectPagesProject} from '../scripts/pages-project.mjs';

test('the existing domain selects the actual site when the configured name is wrong',()=>{
  const projects=[{name:'another-project',domains:['another.example']},{name:'actual-site',domains:['dotnet.org.cn']}];
  assert.equal(selectPagesProject(projects,'incorrect-name',{preferDomain:true,requireExisting:true}).name,'actual-site');
  assert.equal(selectPagesProject(projects,'another-project',{preferDomain:true,requireExisting:true}).name,'actual-site');
});
test('an explicit existing project is retained when the account has no matching domain',()=>{
  const projects=[{name:'requested',domains:[]}];
  assert.equal(selectPagesProject(projects,'requested',{preferDomain:true,requireExisting:true}).name,'requested');
});
test('missing or ambiguous targets stop deployment instead of creating or replacing a site',()=>{
  assert.throws(()=>selectPagesProject([],'missing',{preferDomain:true,requireExisting:true}),/CLOUDFLARE_ACCOUNT_ID/);
  assert.throws(()=>selectPagesProject([{name:'one',domains:['dotnet.org.cn']},{name:'two',domains:['dotnet.org.cn']}],'one',{preferDomain:true}),/多个/);
});
