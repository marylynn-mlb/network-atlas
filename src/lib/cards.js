(function(){
const root=window;root.LDV=root.LDV||{};
const mixc=(a,b,t)=>root.LDV.style.mix(a,b,t);
function lum(hex){const h=hex.replace('#','');const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(x=>x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4));return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]}
function onColor(bg,ink){const L=lum(bg);return (1.05)/(L+0.05)>=3?'#ffffff':ink}
function goldOnInk(P){const a=lum(P.gold),b=lum(P.ink);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5?P.gold:'#ffffff'}
const fmt=n=>Number(n).toLocaleString('en-US');

/* ---- facts pulled from the section results ---- */
function facts(res,ov){
  const f={connections:ov.connections,messages:ov.messages,posts:ov.posts,now:ov.now,since:ov.since};
  f.endYear=new Date(ov.now).getUTCFullYear();
  f.years=ov.since?f.endYear-ov.since:null;
  if(res.s07){const r=res.s07;f.everTwoPct=Math.round(100*r.pyramid[2]/r.total);f.everTwo=r.pyramid[2];f.twoLastYear=r.pyramid[3];f.everMsgPct=Math.round(100*r.pyramid[1]/r.total);f.neverPct=100-f.everMsgPct}
  if(res.s06){const r=res.s06;f.inbound=r.inAll[0];f.outbound=r.outAll[0];f.ratio=r.outAll[0]?Math.round(r.inAll[0]/r.outAll[0]):null;f.acceptPct=r.inAll[0]?Math.round(100*r.inAll[1]/r.inAll[0]):null}
  if(res.s10){const r=res.s10;f.peakYear=r.peakYear;f.peakCount=r.peakCount;f.years_=r.years;f.layers=layersFrom(r);f.cum=r.years.map((_,j)=>r.cum.reduce((a,row)=>a+row[j],0));const n=f.cum.length,back=Math.min(5,n-1);f.recentYears=back;f.recentPct=Math.round(100*(f.cum[n-1]-f.cum[n-1-back])/f.cum[n-1])}
  if(res.s04){const p=res.s04;f.postR=p.full.r;f.postMean=p.postMonths.mean;f.noPostMean=p.noPostMean=p.noPostMonths.mean}
  if(res.s01){f.top=res.s01.top}
  if(res.s08){f.recent=res.s08.n;f.recentMsgPct=Math.round(100*res.s08.messaged/res.s08.n)}
  return f;
}

function shortCo(n){
  n=(n||'').replace(/\s*\(.*?\)/g,'').replace(/,\s*(from|an?|the)\s.*$/i,'').replace(/,?\s*(Inc|LLC|Ltd|Corp)\.?$/i,'').split(' / ')[0].trim();
  return n||'';
}
function layersFrom(r){
  // One band per employer: consecutive roles at the same company are merged into a single layer.
  const out=[];
  r.eras.forEach((e,i)=>{
    let key,label;
    if(/^Before /.test(e.name)){key='__before';label='Earlier career'}
    else if(/^After /.test(e.name)){key='__after';label='Since '+shortCo(e.name.replace(/^After /,''))}
    else{const co=e.name.split(' \u00B7 ')[0];key=co.toLowerCase();label=shortCo(co)||e.name}
    const last=out[out.length-1];
    if(last&&last.key===key){last.cum=last.cum.map((v,j)=>v+r.cum[i][j])}
    else out.push({key,name:label,cum:r.cum[i].slice()});
  });
  return out;
}
function tiles(f){
  const t=[];
  t.push([fmt(f.connections),'connections','conn']);
  if(f.years)t.push([String(f.years),'years of building my network','years']);
  if(f.messages)t.push([fmt(f.messages),'messages exchanged','msgs']);
  if(f.everTwo)t.push([fmt(f.everTwo),'conversations with my connections','two']);
  if(f.twoLastYear)t.push([String(f.twoLastYear),'conversations in the last year','twoyr']);
  if(f.inbound&&f.inbound>=10)t.push([fmt(f.inbound),'people asked to connect in six months','demand']);
  else if(f.ratio)t.push(['~'+f.ratio+'\u00D7','more people ask me than I ask','ratio']);
  if(f.peakYear)t.push([String(f.peakCount),'new connections in '+f.peakYear+', my best year','peak']);
  if(f.posts)t.push([String(f.posts),'posts written','posts']);
  return t;
}
function candidates(f){
  const c=[];
  if(f.inbound&&f.inbound>=10)c.push({id:'demand',label:'People reach out to me',text:`${fmt(f.inbound)} people asked to connect with me in the last six months.`,sub:f.ratio?`${f.outbound?'I asked '+f.outbound+'. ':''}About ${f.ratio}\u00D7 more people find me than I chase.`:'',uses:['demand','ratio']});
  if(f.everTwo>=20)c.push({id:'two',label:'Conversations',text:`I\u2019ve had back-and-forth conversations with ${fmt(f.everTwo)} of my ${fmt(f.connections)} connections.`,sub:f.twoLastYear?`${f.twoLastYear} of them in the last year.`:'',uses:['two','twoyr']});
  if(f.postMean&&f.noPostMean&&f.postMean>=1.4*f.noPostMean)c.push({id:'post',label:'Posting pays off',text:`In months when I post, I add about ${(f.postMean/f.noPostMean).toFixed(1).replace('.0','')}\u00D7 as many new connections.`,sub:`${f.postMean.toFixed(1)} vs ${f.noPostMean.toFixed(1)} new connections a month.`,uses:['posts']});
  if(f.recentPct>=40)c.push({id:'recent',label:'Growing fast',text:`${f.recentPct}% of my network joined in the last ${f.recentYears} years.`,sub:f.peakYear?`${f.peakCount} new connections in ${f.peakYear}, my best year.`:'',uses:['peak']});
  c.push({id:'grown',label:'Built over the years',text:`I've built a network of ${fmt(f.connections)} connections over ${f.years||'many'} years.`,sub:f.peakYear?`${f.peakCount} of them joined in ${f.peakYear}, my best year.`:'',uses:['conn','years','peak']});
  return c;
}
function headline(f,id){const c=candidates(f);return c.find(x=>x.id===id)||c[0]}
/* ---- drawing helpers ---- */
function setup(ctx,P){return {head:(w,s)=>`${w} ${s}px ${P.headFam}`,body:(w,s)=>`${w} ${s}px ${P.bodyFam}`}}
function fitText(ctx,str,maxW,fontFn,size,min){let s=size;ctx.font=fontFn(s);while(ctx.measureText(str).width>maxW&&s>(min||20)){s-=2;ctx.font=fontFn(s)}return s}
function wrapLines(ctx,text,maxW){const w=text.split(' '),L=[];let c='';w.forEach(x=>{const t=c?c+' '+x:x;if(ctx.measureText(t).width>maxW&&c){L.push(c);c=x}else c=t});if(c)L.push(c);return L}
function T(ctx,str,x,y,font,color,align){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align||'left';ctx.textBaseline='alphabetic';ctx.fillText(str,x,y)}
function compass(ctx,cx,cy,r,color,hole){
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=r*0.2;ctx.beginPath();ctx.arc(cx,cy,r*0.83,0,7);ctx.stroke();
  const k=r/24;ctx.beginPath();ctx.moveTo(cx+9*k,cy-9*k);ctx.lineTo(cx+3.5*k,cy+3.5*k);ctx.lineTo(cx-9*k,cy+9*k);ctx.lineTo(cx-3.5*k,cy-3.5*k);ctx.closePath();ctx.fill();
  ctx.fillStyle=hole;ctx.beginPath();ctx.arc(cx,cy,r*0.11,0,7);ctx.fill();ctx.restore();
}
function brand(ctx,xRight,y,size,P,color,hole){
  const font=P.bodyFont(800,size);ctx.font=font;const w=ctx.measureText('Network Atlas').width;
  T(ctx,'Network Atlas',xRight,y,font,color,'right');compass(ctx,xRight-w-size*0.9,y-size*0.33,size*0.62,color,hole);
}
function footer(ctx,W,y,P,color,f){T(ctx,'From my LinkedIn data export, '+f.endYear,60,y,P.bodyFont(600,18),color,'left');brand(ctx,W-60,y,20,P,color,mixc(P.soft,'#ffffff',.6))}

/* ---- Card A: scoreboard ---- */
function cardA(ctx,W,H,f,P){
  ctx.fillStyle=mixc(P.soft,'#ffffff',.6);ctx.fillRect(0,0,W,H);
  ctx.fillStyle=P.gold;ctx.fillRect(60,46,420,34);T(ctx,'MY LINKEDIN, BY THE NUMBERS',74,70,P.bodyFont(800,17),onColor(P.gold,P.ink));
  const cols=[P.ink,P.blue,P.red,P.gold,P.purple,P.grey],all=tiles(f),by=k=>all.find(t=>t[2]===k);
  const order=['conn','years',by('demand')?'demand':'ratio','msgs','two','twoyr'].map(by).filter(Boolean);
  const tl=order.concat(all.filter(t=>!order.includes(t))).slice(0,6);
  const x0=60,y0=112,gap=18,tw=(W-120-2*gap)/3,th=(H-y0-92-gap)/2;
  tl.forEach((t,i)=>{const c=i%3,r=Math.floor(i/3),x=x0+c*(tw+gap),y=y0+r*(th+gap);const bg=cols[i];
    ctx.fillStyle=bg;ctx.fillRect(x,y,tw,th);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(x,y+th-8,tw,8);
    const fg=onColor(bg,P.ink);const s=fitText(ctx,t[0],tw-48,P.headFont.bind(null,900),84,40);ctx.font=P.headFont(900,s);
    T(ctx,t[0],x+24,y+th/2+s*0.1,P.headFont(900,s),i===0&&lum(P.gold)>0.2?P.gold:fg);
    const lines=(()=>{ctx.font=P.bodyFont(600,21);return wrapLines(ctx,t[1],tw-48)})();
    lines.slice(0,2).forEach((ln,k)=>T(ctx,ln,x+24,y+th/2+s*0.1+34+k*26,P.bodyFont(600,21),fg));});
  footer(ctx,W,H-34,P,P.grey,f);
}
/* ---- Card B: headline ---- */
function cardB(ctx,W,H,f,P,opt){
  const lw=Math.round(W*0.62);
  ctx.fillStyle=P.ink;ctx.fillRect(0,0,lw,H);ctx.fillStyle=mixc(P.soft,'#ffffff',.6);ctx.fillRect(lw,0,W-lw,H);
  const fg=onColor(P.ink,P.ink);ctx.fillStyle=P.gold;ctx.fillRect(60,70,90,10);
  const hl=headline(f,opt&&opt.headline);let size=70;let lines;
  for(;size>=40;size-=4){ctx.font=P.headFont(900,size);lines=wrapLines(ctx,hl.text,lw-120);if(lines.length*size*1.12<H-360)break}
  lines.forEach((ln,i)=>T(ctx,ln,60,150+size+i*size*1.12,P.headFont(900,size),fg));
  if(hl.sub){ctx.font=P.bodyFont(600,28);wrapLines(ctx,hl.sub,lw-120).slice(0,3).forEach((ln,k)=>T(ctx,ln,60,150+size+lines.length*size*1.12+14+k*36,P.bodyFont(600,28),goldOnInk(P)))}
  T(ctx,'My LinkedIn, by the numbers',60,H-36,P.bodyFont(600,18),mixc(P.ink,'#ffffff',.6));brand(ctx,lw-48,H-36,22,P,goldOnInk(P),P.ink);
  const tl=tiles(f).filter(t=>!hl.uses.includes(t[2])&&!(hl.id!=='grown'&&t[2]==='conn'&&false)).slice(0,3),cs=[P.blue,P.red,P.gold];
  const ph=(H-120-2*16)/3;
  tl.forEach((t,i)=>{const x=lw+36,y=60+i*(ph+16),w=W-lw-72;ctx.fillStyle=cs[i];ctx.fillRect(x,y,w,ph);const fgc=onColor(cs[i],P.ink);
    const s=fitText(ctx,t[0],w-40,P.headFont.bind(null,900),64,36);T(ctx,t[0],x+20,y+ph/2+s*0.1,P.headFont(900,s),fgc);
    ctx.font=P.bodyFont(600,19);wrapLines(ctx,t[1],w-40).slice(0,2).forEach((ln,k)=>T(ctx,ln,x+20,y+ph/2+s*0.1+28+k*23,P.bodyFont(600,19),fgc));});
}
/* ---- Card C: portrait ---- */
function cardC(ctx,W,H,f,P){
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);
  ctx.fillStyle=P.gold;ctx.fillRect(60,46,330,34);T(ctx,'MY NETWORK, '+(f.since||'')+'–'+f.endYear,74,70,P.bodyFont(800,17),onColor(P.gold,P.ink));
  const cx=290,cy=322,R=158,top=(f.top||[]).slice(0,8),cat=[P.blue,P.gold,P.red,P.purple,P.ink,P.grey,mixc(P.blue,'#ffffff',.45),mixc(P.gold,'#ffffff',.45)];
  const mx=Math.max(1,...top.map(t=>t.count));
  top.forEach((t,i)=>{const a=-Math.PI/2+i/top.length*2*Math.PI,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;ctx.strokeStyle=mixc(P.grey,'#ffffff',.3);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke()});
  top.forEach((t,i)=>{const a=-Math.PI/2+i/top.length*2*Math.PI,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R,r=12+Math.sqrt(t.count/mx)*32;ctx.fillStyle=cat[i];ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();
    const nm=t.name.replace(' & ',' &\n').split('\n');const above=Math.sin(a)<-0.2;nm.forEach((ln,k)=>T(ctx,ln,x,above?y-r-8-(nm.length-1-k)*17:y+r+18+k*17,P.bodyFont(700,14),P.ink,'center'))});
  ctx.fillStyle=P.ink;ctx.beginPath();ctx.arc(cx,cy,46,0,7);ctx.fill();T(ctx,'ME',cx,cy+9,P.headFont(900,26),onColor(P.ink,P.ink),'center');
  // growth by career stage: stacked layers with the employer named inside each band
  const gx=590,gy=118,gw=W-gx-60,gh=272,L=f.layers||[],ny=(f.years_||[]).length;
  if(L.length&&ny>1){
    const tot=f.cum,mxv=Math.max(1,...tot),X=j=>gx+j/(ny-1)*gw,Yv=v=>gy+gh-v/mxv*gh;
    const lower=L.map((_,i)=>f.years_.map((_,j)=>L.slice(0,i).reduce((a,l)=>a+l.cum[j],0)));
    const upper=L.map((l,i)=>f.years_.map((_,j)=>lower[i][j]+l.cum[j]));
    const cols=[P.grey,mixc(P.gold,'#ffffff',.25),P.gold,P.red,P.blue,P.ink,P.purple,mixc(P.blue,'#ffffff',.4),mixc(P.red,'#ffffff',.4),mixc(P.purple,'#ffffff',.4)];
    L.forEach((l,i)=>{ctx.beginPath();for(let j=0;j<ny;j++){j?ctx.lineTo(X(j),Yv(upper[i][j])):ctx.moveTo(X(j),Yv(upper[i][j]))}for(let j=ny-1;j>=0;j--)ctx.lineTo(X(j),Yv(lower[i][j]));ctx.closePath();ctx.fillStyle=cols[i%cols.length];ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke()});
    const at=(arr,x)=>{const t=(x-gx)/gw*(ny-1),j=Math.max(0,Math.min(ny-2,Math.floor(t))),u=t-j;return arr[j]*(1-u)+arr[j+1]*u};
    L.forEach((l,i)=>{
      const bg=cols[i%cols.length],fg=onColor(bg,P.ink);
      for(let fs=22;fs>=12;fs-=2){
        ctx.font=P.bodyFont(800,fs);const w=ctx.measureText(l.name).width+16;let best=null;
        for(let cx=gx+w/2;cx<=gx+gw-w/2;cx+=6){
          let ok=true,thin=1e9;
          for(let x=cx-w/2;x<=cx+w/2;x+=6){const th=(at(upper[i],x)-at(lower[i],x))/mxv*gh;if(th<fs*1.35){ok=false;break}thin=Math.min(thin,th)}
          if(ok&&(!best||thin>best.thin))best={cx,thin};
        }
        if(best){const yMid=Yv((at(upper[i],best.cx)+at(lower[i],best.cx))/2);T(ctx,l.name,best.cx,yMid+fs*0.35,P.bodyFont(800,fs),fg,'center');break}
      }
    });
    T(ctx,String(f.years_[0]),gx,gy+gh+28,P.bodyFont(600,18),P.grey);T(ctx,String(f.years_[ny-1]),gx+gw,gy+gh+28,P.bodyFont(600,18),P.grey,'right');
    T(ctx,fmt(mxv),gx+gw,gy-12,P.headFont(900,30),P.ink,'right');
  }
  const tl=tiles(f).filter(t=>t[2]!=='conn').slice(0,3);
  tl.forEach((t,i)=>{const w=(gw-2*16)/3,x=gx+i*(w+16),y=H-190,bg=[P.blue,P.red,P.ink][i];ctx.fillStyle=bg;ctx.fillRect(x,y,w,120);const fg=onColor(bg,P.ink);
    const s=fitText(ctx,t[0],w-28,P.headFont.bind(null,900),48,28);T(ctx,t[0],x+14,y+52,P.headFont(900,s),fg);ctx.font=P.bodyFont(600,15);wrapLines(ctx,t[1],w-28).slice(0,2).forEach((ln,k)=>T(ctx,ln,x+14,y+78+k*19,P.bodyFont(600,15),fg))});
  footer(ctx,W,H-34,P,P.grey,f);
}
/* ---- Card D: story (vertical) ---- */
function cardD(ctx,W,H,f,P){
  ctx.fillStyle=mixc(P.soft,'#ffffff',.6);ctx.fillRect(0,0,W,H);
  ctx.fillStyle=P.gold;ctx.fillRect(70,90,520,48);T(ctx,'MY LINKEDIN, BY THE NUMBERS',90,124,P.bodyFont(800,24),onColor(P.gold,P.ink));
  const tl=tiles(f).slice(0,5),cs=[P.ink,P.blue,P.red,P.gold,P.purple],bh=(H-250-120-4*14)/5;
  tl.forEach((t,i)=>{const y=190+i*(bh+14);ctx.fillStyle=cs[i];ctx.fillRect(70,y,W-140,bh);const fg=onColor(cs[i],P.ink);
    const s=fitText(ctx,t[0],W-140-80,P.headFont.bind(null,900),170,70);T(ctx,t[0],110,y+bh/2+s*0.06,P.headFont(900,s),i===0&&lum(P.gold)>0.2?P.gold:fg);
    ctx.font=P.bodyFont(600,32);wrapLines(ctx,t[1],W-140-80).slice(0,2).forEach((ln,k)=>T(ctx,ln,110,y+bh/2+s*0.06+62+k*38,P.bodyFont(600,32),fg))});
  T(ctx,'From my LinkedIn data export, '+f.endYear,70,H-52,P.bodyFont(600,24),P.grey);brand(ctx,W-70,H-52,28,P,P.ink,mixc(P.soft,'#ffffff',.6));
}
const LAYOUTS=[
 {id:'B',name:'Headline',desc:'One striking finding in big type, with three supporting numbers.',w:1200,h:630,draw:cardB},
 {id:'A',name:'Scoreboard',desc:'Six big numbers on colored tiles. Reads at a glance.',w:1200,h:630,draw:cardA},
 {id:'C',name:'Portrait',desc:'A mini network map and growth curve, with three numbers.',w:1200,h:630,draw:cardC},
 {id:'D',name:'Story',desc:'Tall format for phone stories and mobile feeds.',w:1080,h:1920,draw:cardD}];
async function render(canvas,layoutId,res,ov,opt){
  const st=root.LDV.style,P=st.C();const cs=getComputedStyle(document.documentElement);
  P.headFam=cs.getPropertyValue('--font-head').trim()||'Inter,sans-serif';P.bodyFam=cs.getPropertyValue('--font-body').trim()||'Inter,sans-serif';
  P.headFont=(w,s)=>`${w} ${s}px ${P.headFam}`;P.bodyFont=(w,s)=>`${w} ${s}px ${P.bodyFam}`;
  try{await Promise.all([document.fonts.load(`900 40px ${P.headFam}`),document.fonts.load(`600 20px ${P.bodyFam}`),document.fonts.load(`800 20px ${P.bodyFam}`)])}catch(e){}
  const L=LAYOUTS.find(l=>l.id===layoutId)||LAYOUTS[0];canvas.width=L.w;canvas.height=L.h;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,L.w,L.h);L.draw(ctx,L.w,L.h,facts(res,ov),P,opt);return L;
}
root.LDV.cards={LAYOUTS,render,facts,tiles,headline,candidates};
})();
