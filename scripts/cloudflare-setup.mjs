// Credentials are read only from the process environment and never written to disk.
import {appendFile} from 'node:fs/promises';
import {selectPagesProject} from './pages-project.mjs';
const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
let project = process.env.CLOUDFLARE_PAGES_PROJECT || 'dotnet-org-cn';
const args = new Set(process.argv.slice(2));
if(!token || !account) {
  console.error('请先在当前终端设置 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID。详见 docs/CLOUDFLARE.md。');
  process.exit(1);
}
if(!/^[a-f0-9]{32}$/i.test(account)) throw new Error('Account ID 应为 32 位十六进制字符串，请勿使用 Zone ID。');
if(!/^[a-z0-9][a-z0-9-]*$/.test(project)) throw new Error('项目名仅支持小写字母、数字和连字符。');
const base = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`;
async function api(url, method='GET', body, envelope=false) {
  const response = await fetch(url, {method, headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}, ...(body?{body:JSON.stringify(body)}:{}), signal:AbortSignal.timeout(30000)});
  const data = await response.json();
  if(!response.ok || !data.success) throw new Error(`Cloudflare 请求失败 (HTTP ${response.status}): ${(data.errors||[]).map(error=>`${error.code}: ${error.message}`).join('; ')}`);
  return envelope?data:data.result;
}
try {
  const projects=[];
  for(let page=1;;page++){
    const response=await api(page===1?base:`${base}?page=${page}`,'GET',undefined,true);
    projects.push(...response.result);
    if(!response.result_info?.total_pages||page>=response.result_info.total_pages)break;
  }
  let selected=selectPagesProject(projects,project,{preferDomain:args.has('--prefer-domain'),requireExisting:args.has('--require-existing')});
  if(selected)project=selected.name;
  if(!selected && args.has('--create')) {
    selected = await api(base,'POST',{name:project,production_branch:'main'});
    console.log(`已创建 Direct Upload Pages 项目: ${selected.name}`);
  } else if(!selected) {
    console.log(`凭据可访问 Pages。项目 ${project} 尚未创建。执行 npm run cloudflare:setup -- --create 创建。`);
    process.exit(0);
  }
  console.log(`Pages 项目: ${selected.name} · ${selected.subdomain || '首次发布后生成 pages.dev 地址'}`);
  const productionBranch=selected.production_branch||'main';
  if(!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(productionBranch))throw new Error('现有 Pages 项目的生产分支名称需要核对。');
  console.log(`Production branch: ${productionBranch}`);
  if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`project_name=${selected.name}\nproduction_branch=${productionBranch}\n`);
  if(args.has('--domain')) {
    const url = `${base}/${project}/domains`;
    const domains = await api(url);
    let domain = domains.find(item=>item.name==='dotnet.org.cn');
    if(!domain) domain = await api(url,'POST',{name:'dotnet.org.cn'});
    console.log(`自定义域名: ${domain.name} · 状态: ${domain.status}`);
    console.log('请在 Pages → 自定义域检查 DNS 与证书状态；本脚本不会修改已有 DNS 记录。');
  }
  if(args.has('--inspect-domain')) {
    const apiRoot='https://api.cloudflare.com/client/v4';
    try {
      const zones=await api(`${apiRoot}/zones?name=dotnet.org.cn`);
      const zone=zones.find(item=>item.name==='dotnet.org.cn'&&item.account?.id===account);
      if(!zone)console.log('DOMAIN_DIAGNOSTIC: 该 Token 可见范围内没有找到本账户的 dotnet.org.cn DNS 区域。');
      else {
        const records=await api(`${apiRoot}/zones/${zone.id}/dns_records?name=dotnet.org.cn`);
        console.log('DOMAIN_DIAGNOSTIC: '+JSON.stringify(records.filter(record=>['A','AAAA','CNAME'].includes(record.type)).map(record=>({type:record.type,name:record.name,content:record.content}))));
      }
    } catch(error) {console.log(`DOMAIN_DIAGNOSTIC: DNS 查询权限不足或不可用：${error.message}`);}
    try {
      const domains=await api(`${apiRoot}/accounts/${account}/workers/domains`);
      console.log('DOMAIN_DIAGNOSTIC: '+JSON.stringify(domains.filter(domain=>domain.hostname==='dotnet.org.cn').map(domain=>({hostname:domain.hostname,service:domain.service}))));
    } catch(error) {console.log(`DOMAIN_DIAGNOSTIC: Worker 域名查询权限不足或不可用：${error.message}`);}
  }
  console.log('可执行 npm run deploy 发布。已存在的项目会复用，不会删除或重建。');
} catch(error) { console.error(error.message);process.exitCode=1; }
