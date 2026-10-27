import {readFile,mkdir,writeFile,cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {homepage} from '../src/home.mjs';
import {projectPage} from '../src/project.mjs';
import {aboutPage} from '../src/about.mjs';
import {layout} from '../src/layout.mjs';
import {messages,projectPath,prefix} from '../src/i18n.mjs';
import {repositoryOwner} from './project-metadata.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const readJson=async file=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const [data,details,english]=await Promise.all([readJson('content/projects.json'),readJson('content/project-details.json'),readJson('content/projects.en.json')]);
const dist=path.join(root,'dist');
await mkdir(dist,{recursive:true});
await cp(path.join(root,'public'),dist,{recursive:true});
async function output(url,html){const dir=path.join(dist,url);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),html);}
const urls=[];
for(const locale of ['zh','en']) {
  const localized={...data,projects:data.projects.map(p=>{
    if(!details[p.name]||!english[p.name])throw new Error(`Missing bilingual project content: ${p.name}`);
    return {...p,owner:repositoryOwner(p,data.owner),...details[p.name],...(locale==='en'?english[p.name]:{}),searchText:[p.name,p.title,p.description,...p.tags,english[p.name].description,...english[p.name].tags].join(' ')};
  })};
  await output(prefix(locale),homepage(localized,locale));urls.push(prefix(locale));
  await output(`${prefix(locale)}about/`,aboutPage(localized,locale));urls.push(`${prefix(locale)}about/`);
  for(const project of localized.projects){const url=projectPath(project,locale);await output(url,projectPage(project,localized,locale));urls.push(url);}
}
const t=messages.zh;
await writeFile(path.join(dist,'404.html'),layout({title:`404 · ${t.name}`,autoLocale:false,body:`<main id="main" class="not-found container"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>${t.notFound}</h1><p>${t.notFoundText}</p><p>Page not found. Head home to explore .NET open source.</p><a class="button primary" href="/">${t.returnHome} →</a><a class="button secondary" href="/en/" data-set-locale="en">English home →</a></main>`,script:'shared.js'}));
await writeFile(path.join(dist,'projects.json'),JSON.stringify(data));
await writeFile(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+urls.map(url=>{const zh=url.replace(/^\/en\//,'/');return `<url><loc>https://dotnet.org.cn${url}</loc><xhtml:link rel="alternate" hreflang="zh-CN" href="https://dotnet.org.cn${zh}"/><xhtml:link rel="alternate" hreflang="en" href="https://dotnet.org.cn/en${zh}"/></url>`;}).join('')+'</urlset>');
console.log(`Built ${urls.length} bilingual pages, including ${data.projects.length*2} standalone project pages → dist/`);
