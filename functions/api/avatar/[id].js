export async function onRequestGet({params}){
  if(!/^\d{1,16}$/.test(params.id))return new Response('Invalid avatar',{status:400});
  try{
    const response=await fetch(`https://avatars.githubusercontent.com/u/${params.id}?s=80&v=4`,{cf:{cacheTtl:86400,cacheEverything:true},signal:AbortSignal.timeout(8000)});
    if(!response.ok)return new Response(null,{status:404});
    const type=response.headers.get('Content-Type')||'';
    if(!type.startsWith('image/'))return new Response(null,{status:404});
    return new Response(response.body,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
  }catch{return new Response(null,{status:404});}
}
