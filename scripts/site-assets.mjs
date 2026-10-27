import {createHash} from 'node:crypto';
import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

// Keep the entire module graph together: relative imports resolve within one release.
export async function packageSiteAssets(publicDir,dist){
  const names=(await readdir(publicDir)).filter(name=>/\.(js|css)$/.test(name)).sort();
  const files=await Promise.all(names.map(async name=>({name,bytes:Buffer.from((await readFile(path.join(publicDir,name),'utf8')).replace(/\r\n/g,'\n'))})));
  const hash=createHash('sha256');
  for(const {name,bytes} of files)hash.update(name).update('\0').update(bytes).update('\0');
  const prefix=`/assets/site-${hash.digest('hex').slice(0,20)}/`;
  const directory=path.join(dist,prefix);
  await mkdir(directory,{recursive:true});
  await Promise.all(files.map(({name,bytes})=>writeFile(path.join(directory,name),bytes)));
  const namesSet=new Set(names);
  return html=>html.replace(/\b(src|href)="\/([^"/]+\.(?:js|css))"/g,(match,attribute,name)=>namesSet.has(name)?`${attribute}="${prefix}${name}"`:match);
}
