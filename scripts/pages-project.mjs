export function selectPagesProject(projects,requested,{preferDomain=false,requireExisting=false}={}) {
  let selected=projects.find(project=>project.name===requested);
  if(preferDomain) {
    const bound=projects.filter(project=>project.domains?.includes('dotnet.org.cn'));
    if(bound.length>1)throw new Error('多个 Pages 项目声明绑定 dotnet.org.cn，请先核对 Cloudflare 自定义域。');
    if(bound.length===1)selected=bound[0];
  }
  if(!selected&&requireExisting)throw new Error('该账户中没有找到指定 Pages 项目，也没有找到绑定 dotnet.org.cn 的 Pages 项目。请核对 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_PAGES_PROJECT。');
  if(selected&&!/^[a-z0-9][a-z0-9-]*$/.test(selected.name))throw new Error('Cloudflare 返回了无效的 Pages 项目名。');
  return selected;
}
