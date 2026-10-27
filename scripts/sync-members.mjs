import {readFile,writeFile} from 'node:fs/promises';
import {createDataService} from '../src/data-service.mjs';

const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const [catalog,members,snapshot]=await Promise.all([read('content/projects.json'),read('content/members.json'),read('content/live-snapshot.json')]);
const service=createDataService({projects:catalog.projects,members,snapshot,token:process.env.GITHUB_TOKEN||''});
const result=await service.community();
snapshot.members=result.members;
snapshot.membersUpdatedAt=result.updatedAt;
await writeFile(new URL('../content/live-snapshot.json',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
console.log(`Refreshed ${result.members.length} public member profiles; ${result.members.filter(member=>member.highlights?.some(item=>item.id==='microsoft-mvp')).length} Microsoft MVP profile badges.`);
