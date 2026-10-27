// An interactive map of real project links. The canvas is purely decorative.
const art=document.querySelector('.hero-art'),canvas=document.querySelector('#orb'),ctx=canvas?.getContext('2d');
if(art&&ctx){
 const plane=canvas.parentElement,motion=matchMedia('(prefers-reduced-motion: reduce)'),nodes=[...art.querySelectorAll('[data-nexus-node]')];
 const title=art.querySelector('[data-nexus-title]'),info=art.querySelector('[data-nexus-info]'),initial=[title.textContent,info.textContent];
 let width=0,height=0,visible=true,frame=0,time=0,lastDraw=0,active=-1;
 const positions=[[.15,.27],[.81,.30],[.82,.69],[.48,.88],[.14,.68],[.48,.12]];
 const dust=Array.from({length:42},(_,i)=>({x:((i*317)%997)/997,y:((i*613)%991)/991,r:i%5===0?1.3:.7}));
 function curve(t,start,c1,c2,end){const s=1-t;return [s*s*s*start[0]+3*s*s*t*c1[0]+3*s*t*t*c2[0]+t*t*t*end[0],s*s*s*start[1]+3*s*s*t*c1[1]+3*s*t*t*c2[1]+t*t*t*end[1]];}
 function draw(){
  ctx.clearRect(0,0,width,height);const center=[width*.48,height*.5];
  const glow=ctx.createRadialGradient(center[0],center[1],0,center[0],center[1],width*.55);glow.addColorStop(0,'rgba(159,140,255,.12)');glow.addColorStop(.5,'rgba(159,140,255,.025)');glow.addColorStop(1,'rgba(159,140,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  for(const star of dust){ctx.beginPath();ctx.arc(star.x*width,star.y*height,star.r,0,Math.PI*2);ctx.fillStyle=`rgba(171,174,204,${.15+.14*Math.sin(time*.0003+star.x*18)})`;ctx.fill();}
  for(let i=0;i<positions.length;i++){
   const [x,y]=positions[i],end=[x*width,y*height],c1=[center[0]+(x-.48)*width*.65,center[1]],c2=[center[0]+(x-.48)*width*.35,end[1]];
   ctx.beginPath();ctx.moveTo(...center);ctx.bezierCurveTo(...c1,...c2,...end);ctx.lineWidth=active===i?1.3:.8;ctx.strokeStyle=active===i?'rgba(188,248,121,.8)':'rgba(157,140,213,.27)';ctx.stroke();
   const t=((time*.000055+i*.167)%1),point=curve(t,center,c1,c2,end);ctx.beginPath();ctx.arc(point[0],point[1],active===i?2.3:1.5,0,Math.PI*2);ctx.fillStyle=active===i?'#bcf879':'#b5a0ef';ctx.shadowBlur=active===i?16:8;ctx.shadowColor=ctx.fillStyle;ctx.fill();ctx.shadowBlur=0;
  }
  // A thin open hexagonal perimeter holds the network together.
  ctx.beginPath();positions.forEach(([x,y],i)=>i?ctx.lineTo(x*width,y*height):ctx.moveTo(x*width,y*height));ctx.closePath();ctx.setLineDash([2,8]);ctx.lineWidth=.7;ctx.strokeStyle='rgba(159,140,255,.14)';ctx.stroke();ctx.setLineDash([]);
 }
 function resize(){const box=plane.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=box.width;height=box.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function animate(now){frame=0;if(!visible||document.hidden||motion.matches)return;if(now-lastDraw>32){time=now;draw();lastDraw=now;}frame=requestAnimationFrame(animate);}
 function start(){cancelAnimationFrame(frame);if(visible&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(animate);else draw();}
 function select(node){active=node?Number(node.dataset.nexusNode):-1;title.textContent=node?.dataset.nodeTitle||initial[0];info.textContent=node?.dataset.nodeInfo||initial[1];draw();}
 for(const node of nodes){node.addEventListener('pointerenter',()=>select(node));node.addEventListener('focus',()=>select(node));node.addEventListener('blur',()=>select(null));node.addEventListener('pointerleave',()=>{if(document.activeElement!==node)select(null);});}
 art.addEventListener('pointermove',event=>{if(motion.matches||!matchMedia('(hover:hover)').matches)return;const box=art.getBoundingClientRect();art.style.setProperty('--tilt-x',((event.clientX-box.left)/box.width-.5)*6+'deg');art.style.setProperty('--tilt-y',((event.clientY-box.top)/box.height-.5)*-6+'deg');});
 art.addEventListener('pointerleave',()=>{art.style.setProperty('--tilt-x','0deg');art.style.setProperty('--tilt-y','0deg');});
 new ResizeObserver(resize).observe(plane);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();},{threshold:.03}).observe(art);
 motion.addEventListener('change',()=>{art.style.setProperty('--tilt-x','0deg');art.style.setProperty('--tilt-y','0deg');start();});document.addEventListener('visibilitychange',start);resize();start();
}

for(const card of document.querySelectorAll('.project-card'))card.addEventListener('pointermove',event=>{const bounds=card.getBoundingClientRect();card.style.setProperty('--pointer-x',event.clientX-bounds.left+'px');card.style.setProperty('--pointer-y',event.clientY-bounds.top+'px');});
