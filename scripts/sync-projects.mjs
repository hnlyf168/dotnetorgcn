import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../content/projects.json', import.meta.url);
const data = JSON.parse(await readFile(file,'utf8'));
const headers = { 'User-Agent':'dotnet-org-cn', Accept:'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const repos = [];
for (let page=1;;page++) {
  const response = await fetch(`https://api.github.com/users/${data.owner}/repos?per_page=100&page=${page}`, { headers, signal:AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: 同步失败，原有项目数据未修改。`);
  const batch = await response.json();
  repos.push(...batch);
  if(batch.length < 100) break;
}
for (const project of data.projects) {
  const repo = repos.find(item=>item.name===project.name);
  if(!repo) { console.warn(`仓库不可见，保留已有介绍: ${project.name}`); continue; }
  project.stars = repo.stargazers_count;
  project.fork = repo.fork;
}
data.syncedAt = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
await writeFile(file,JSON.stringify(data,null,2)+'\n');
const additions = repos.filter(repo=>!data.projects.some(project=>project.name===repo.name));
console.log(`已同步 ${data.projects.length} 个项目的 Star 与 Fork 状态，保留人工整理的中文介绍。`);
if(additions.length) console.log(`发现尚未收录的仓库，请审核后添加介绍: ${additions.map(repo=>repo.name).join(', ')}`);
