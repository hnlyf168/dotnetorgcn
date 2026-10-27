import { readFile, writeFile } from 'node:fs/promises';
import {synchronizeProject} from './project-metadata.mjs';

const file = new URL('../content/projects.json', import.meta.url);
const data = JSON.parse(await readFile(file,'utf8'));
const headers = { 'User-Agent':'dotnet-org-cn', Accept:'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
data.projects=await Promise.all(data.projects.map(project=>synchronizeProject(project,{defaultOwner:data.owner,headers})));
data.syncedAt = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
await writeFile(file,JSON.stringify(data,null,2)+'\n');
console.log(`已同步 ${data.projects.length} 个项目的实际仓库归属、Star 与 Fork 状态，保留人工整理的双语介绍。`);
