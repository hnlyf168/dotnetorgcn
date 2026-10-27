import {mkdir,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';
import {brandMark,brandName} from '../src/brand-mark.mjs';

const output=resolve('public/brand');
await mkdir(output,{recursive:true});
const color=brandMark({title:brandName.zh,size:1024});
const light=brandMark({variant:'light',title:brandName.zh,size:1024});
const dark=brandMark({variant:'dark',title:brandName.zh,size:1024});
const colorLight=brandMark({variant:'color-light',title:brandName.zh,size:1024});
await Promise.all([
  writeFile(resolve(output,'logo-symbol.svg'),color),
  writeFile(resolve(output,'logo-light.svg'),light),
  writeFile(resolve(output,'logo-dark.svg'),dark),
  writeFile(resolve(output,'logo-color-light.svg'),colorLight)
]);

const symbol=variant=>brandMark({variant,size:100}).replace(/<svg[^>]*>/,'').replace('</svg>','');
const appIcon=(size,inset=.13)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#090c12"/><g transform="translate(${inset*100} ${inset*100}) scale(${1-2*inset})">${symbol('color')}</g></svg>`;
await writeFile(resolve(output,'favicon.svg'),appIcon(64,.07));

const channel=process.env.PLAYWRIGHT_CHANNEL||'msedge';
const browser=await chromium.launch({headless:true,channel});
const page=await browser.newPage({viewport:{width:1024,height:1024},deviceScaleFactor:1});
async function raster(name,svg,size){
  await page.setViewportSize({width:size,height:size});
  await page.setContent(`<html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{display:block;width:100%;height:100%}</style></head><body>${svg}</body></html>`);
  await page.screenshot({path:resolve(output,name),omitBackground:true});
}

try{
  await raster('logo-1024.png',color,1024);
  await raster('logo-color-light-1024.png',colorLight,1024);
  await raster('logo-square-1024.png',appIcon(1024),1024);
  await raster('nuget-icon.png',appIcon(256,.12),256);
  await raster('nuget-icon-128.png',appIcon(128,.12),128);
  await raster('github-avatar.png',appIcon(512,.17),512);
  for(const size of [180,192,512])await raster(`website-icon-${size}.png`,appIcon(size,.12),size);
  const faviconFrames=[];
  for(const size of [16,32]){
    const name=`favicon-${size}.png`;await raster(name,appIcon(size,.02),size);
    faviconFrames.push({size,data:await readFile(resolve(output,name))});
  }
  // Modern ICO containers may embed PNG frames without a platform image library.
  const header=Buffer.alloc(6+16*faviconFrames.length);header.writeUInt16LE(1,2);header.writeUInt16LE(faviconFrames.length,4);
  let offset=header.length;
  for(const [index,frame] of faviconFrames.entries()){
    const pos=6+16*index;header[pos]=frame.size;header[pos+1]=frame.size;header.writeUInt16LE(1,pos+4);header.writeUInt16LE(32,pos+6);header.writeUInt32LE(frame.data.length,pos+8);header.writeUInt32LE(offset,pos+12);offset+=frame.data.length;
  }
  await writeFile(resolve(output,'favicon.ico'),Buffer.concat([header,...faviconFrames.map(frame=>frame.data)]));

  for(const name of ['logo-1024.png','logo-color-light-1024.png','nuget-icon.png','github-avatar.png']){
    const bytes=await readFile(resolve(output,name));
    const pixels=await page.evaluate(async base64=>{
      const img=new Image();img.src='data:image/png;base64,'+base64;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
      const context=canvas.getContext('2d');context.drawImage(img,0,0);
      const data=context.getImageData(0,0,img.width,img.height).data;
      let markRadius=0;
      for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){
        const i=(y*img.width+x)*4;
        if(data[i+3]>200&&Math.abs(data[i]-9)+Math.abs(data[i+1]-12)+Math.abs(data[i+2]-18)>100)markRadius=Math.max(markRadius,Math.hypot(x-img.width/2,y-img.height/2));
      }
      return {cornerAlpha:data[3],centerAlpha:data[(Math.floor(img.height/2)*img.width+Math.floor(img.width/2))*4+3],markRadius,width:img.width};
    },bytes.toString('base64'));
    if(pixels.cornerAlpha!==0||pixels.centerAlpha!==255)throw new Error('Unexpected transparency: '+name);
    if(name==='github-avatar.png'&&pixels.markRadius>pixels.width*.42)throw new Error('Logo exceeds circular crop safe area');
    console.log(JSON.stringify({pixelValidation:name,...pixels}));
  }

  const contact=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680"><rect width="1200" height="680" fill="#090c12"/><text x="50" y="54" fill="#f3f5f8" font-family="Segoe UI,sans-serif" font-size="24" font-weight="600">.NET Chinese Open Source Community</text><text x="50" y="87" fill="#8b96a8" font-family="Consolas,monospace" font-size="13">CODE BRACKETS / N BRIDGE / CONNECTION DOT</text><rect x="50" y="130" width="320" height="320" rx="22" fill="#141a24"/><g transform="translate(90 170) scale(2.4)">${symbol('color')}</g><circle cx="600" cy="290" r="160" fill="#141a24"/><g transform="translate(480 170) scale(2.4)">${symbol('light')}</g><rect x="830" y="130" width="320" height="320" rx="22" fill="#f3f5f8"/><g transform="translate(870 170) scale(2.4)">${symbol('dark')}</g><text x="50" y="486" fill="#9f8cff" font-family="Consolas,monospace" font-size="14">PRIMARY / TRANSPARENT</text><text x="440" y="486" fill="#9f8cff" font-family="Consolas,monospace" font-size="14">MONO / CIRCLE CROP</text><text x="830" y="486" fill="#9f8cff" font-family="Consolas,monospace" font-size="14">MONO / LIGHT SURFACE</text><text x="50" y="555" fill="#8b96a8" font-family="Consolas,monospace" font-size="13">SMALL SIZES</text>${[24,32,48,64].map((size,i)=>`<g transform="translate(${50+i*140} 580) scale(${size/100})">${symbol('color')}</g><text x="${90+i*140}" y="612" fill="#8b96a8" font-family="Consolas,monospace" font-size="12">${size}px</text>`).join('')}<text x="830" y="610" fill="#bcf879" font-family="Consolas,monospace" font-size="13">#9F8CFF / #BCF879</text></svg>`;
  await writeFile(resolve(output,'contact-sheet.svg'),contact);
  await page.setViewportSize({width:1200,height:680});
  await page.setContent(`<html><body style="margin:0">${contact}</body></html>`);
  await page.screenshot({path:resolve(output,'contact-sheet.png')});
  const lightContact=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360"><rect width="900" height="360" fill="#ffffff"/><text x="36" y="44" fill="#182235" font-family="Segoe UI,sans-serif" font-size="20" font-weight="600">COLOR ON LIGHT / .NET COMMUNITY</text><g transform="translate(28 82) scale(2.25)">${symbol('color-light')}</g><text x="320" y="105" fill="#182235" font-family="Consolas,monospace" font-size="13">WHITE-SURFACE VARIANT</text>${[24,32,48,64].map((size,index)=>`<g transform="translate(${320+index*135} 145) scale(${size/100})">${symbol('color-light')}</g><text x="${320+index*135}" y="242" fill="#536173" font-family="Consolas,monospace" font-size="13">${size}px</text>`).join('')}<text x="320" y="300" fill="#7252c3" font-family="Consolas,monospace" font-size="13">#7252C3</text><text x="455" y="300" fill="#182235" font-family="Consolas,monospace" font-size="13">#182235</text><text x="590" y="300" fill="#3f741f" font-family="Consolas,monospace" font-size="13">#3F741F</text></svg>`;
  await writeFile(resolve(output,'contact-sheet-color-light.svg'),lightContact);
  await page.setViewportSize({width:900,height:360});
  await page.setContent(`<html><body style="margin:0">${lightContact}</body></html>`);
  await page.screenshot({path:resolve(output,'contact-sheet-color-light.png')});
}finally{await browser.close();}

const usage=await readFile('docs/BRAND.md','utf8');
await writeFile(resolve(output,'README.md'),usage);

// A small ZIP writer using uncompressed entries keeps the export reproducible and dependency-free.
function crc32(bytes){let crc=0xffffffff;for(const value of bytes){crc^=value;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
const zipFiles=(await readdir(output)).filter(name=>!name.endsWith('.zip')&&!name.startsWith('contact-sheet'));
const chunks=[],directory=[];let position=0;
for(const name of zipFiles.sort()){
  const data=await readFile(resolve(output,name)),filename=Buffer.from(name),crc=crc32(data),local=Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(0x21,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(filename.length,26);
  chunks.push(local,filename,data);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(0x21,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(data.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(filename.length,28);central.writeUInt32LE(position,42);directory.push(central,filename);position+=local.length+filename.length+data.length;
}
const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(zipFiles.length,8);end.writeUInt16LE(zipFiles.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(position,16);
await writeFile(resolve(output,'dotnet-community-brand-kit.zip'),Buffer.concat([...chunks,central,end]));

for(const filename of (await readdir(output)).filter(name=>name.endsWith('.png'))){
  const data=await readFile(resolve(output,filename));
  if(data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid PNG: '+filename);
  const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
  console.log(JSON.stringify({filename,width,height,bytes:data.length,colorType:data[25]}));
}
const nuget=await readFile(resolve(output,'nuget-icon.png'));if(nuget.length>=1024*1024)throw new Error('NuGet icon exceeds 1 MB');
console.log('Brand exports and ZIP written to public/brand/.');
await copyFile(resolve(output,'favicon.svg'),resolve('public/favicon.svg'));
await copyFile(resolve(output,'favicon.ico'),resolve('public/favicon.ico'));
