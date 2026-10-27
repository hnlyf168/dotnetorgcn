import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import './build.mjs';

const root = resolve('dist');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.zip':'application/zip', '.webmanifest':'application/manifest+json', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8' };
const port = Number(process.env.PORT || 4321);
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if(pathname.startsWith('/api/')){
      const request=new Request(`http://127.0.0.1:${port}${req.url}`);
      let module,params={};
      const project=pathname.match(/^\/api\/projects\/([^/]+)$/),avatar=pathname.match(/^\/api\/avatar\/(\d+)$/);
      if(project){module=await import('../functions/api/projects/[slug].js');params.slug=project[1];}
      else if(avatar){module=await import('../functions/api/avatar/[id].js');params.id=avatar[1];}
      else if(pathname==='/api/community')module=await import('../functions/api/community.js');
      if(!module){res.writeHead(404).end();return;}
      const response=await module.onRequestGet({request,params,env:{GITHUB_READ_TOKEN:process.env.GITHUB_READ_TOKEN||''},waitUntil:()=>{}});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' }).end(body);
  } catch { res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' }).end(await readFile(resolve(root,'404.html'))); }
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
