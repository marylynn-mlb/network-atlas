(function(){
const root=typeof globalThis!=='undefined'?globalThis:window;root.LDV=root.LDV||{};
const DAY=864e5;
const mkey=d=>d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');
function monthRange(a,b){const [y0,m0]=a.split('-').map(Number),[y1,m1]=b.split('-').map(Number);const out=[];let y=y0,m=m0;while(y<y1||(y===y1&&m<=m1)){out.push(y+'-'+String(m).padStart(2,'0'));m++;if(m>12){y++;m=1}}return out}
function pearson(x,y){const n=x.length;if(n<3)return 0;const mx=x.reduce((a,b)=>a+b,0)/n,my=y.reduce((a,b)=>a+b,0)/n;let sx=0,sy=0,sxy=0;for(let i=0;i<n;i++){sx+=(x[i]-mx)**2;sy+=(y[i]-my)**2;sxy+=(x[i]-mx)*(y[i]-my)}return sx&&sy?sxy/Math.sqrt(sx*sy):0}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function permP(x,y,r0,N=2000){const R=rng(7),yy=y.slice();let c=0;for(let k=0;k<N;k++){for(let i=yy.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[yy[i],yy[j]]=[yy[j],yy[i]]}if(Math.abs(pearson(x,yy))>=Math.abs(r0))c++}return c/N}
const median=a=>{if(!a.length)return 0;const s=a.slice().sort((p,q)=>p-q),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
const ymd=d=>Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
const iso=d=>d.toISOString().slice(0,10);

/* ---------- industry rules (generic keyword rules; approximate) ---------- */
const IND=[
['Consulting & Independent',/self[- ]?employed|freelanc|^independent\b|independent consultant/i],
['Publishing & Research Info',/publish|journal|editorial|elsevier|springer|wiley|wolters|jstor|ebsco|oclc|proquest|clarivate|ex libris|\bpress\b|ithaka|digital science|mcgraw|houghton|scholastic|macmillan|taylor & francis|cengage learning/i],
['EdTech & Learning',/edtech|e-?learning|learning|educat|academy|tutor|coursera|udemy|\bedx\b|\b2u\b|instructure|canvas|khan|duolingo|byju|chegg|course ?hero|quizlet|skillsoft|pluralsight|kaplan|ixl|ellucian|blackboard|d2l|curriculum|training/i],
['Higher Ed & Libraries',/universit|college|librar|institute of tech|polytechnic|school|campus|\bmit\b|stanford|harvard/i],
['Big Tech & Software',/google|microsoft|\bmeta\b|apple|amazon|adobe|salesforce|oracle|\bibm\b|netflix|uber|lyft|linkedin|twitter|snap|slack|zoom|atlassian|dropbox|stripe|shopify|nvidia|intel|cisco|software|\bai\b|\.ai|cloud|\bdata|tech|systems|digital|labs|saas|\bapp\b|platform|engineering|cyber|analytics/i],
['Finance & Insurance',/bank|capital|financ|fintech|invest|insurance|ventures|equity|credit|mortgage|payments|lending|\bfund|visa|mastercard|paypal|wealth|asset/i],
['Healthcare & Life Sciences',/health|hospital|medic|pharma|clinic|dental|\bbio|therap|\bcare\b|wellness|genom|laborator|biotech/i],
['Media, Arts & Entertainment',/media|film|music|studio|entertainment|\bgam(e|ing)|photograph|design|creative|news|radio|museum|theat|\barts?\b/i],
['Nonprofit, Gov & Associations',/nonprofit|foundation|association|society|government|county|city of|state of|department|council|chamber|federation|\bngo\b|church|ministry|alliance|coalition|commission|agency/i],
['Consulting & Independent',/consult|advis|partners|\bgroup\b|\bllp\b|\blaw\b|legal|recruit|talent|staffing|solutions|services|logistics|accounting|management/i]];
const POSR=[['Higher Ed & Libraries',/professor|librarian|\bdean\b|faculty|lecturer|academic|instructional|adjunct|researcher/i],['Big Tech & Software',/software|engineer|developer|data scien|product manager|\bux\b|\bcto\b/i]];
function classify(company,position){
  const c=(company||'').trim();
  if(c)for(const [n,rx] of IND)if(rx.test(c))return n;
  for(const [n,rx] of POSR)if(rx.test(position||''))return n;
  return c?'Unclassified':'No company listed';
}
function normCompany(c){c=(c||'').trim();if(/self[- ]?employed|freelanc|^independent$/i.test(c))return 'Self-employed / Freelance';return c.replace(/[,.]?\s+(inc|llc|ltd|corp|corporation|co)\.?$/i,'').replace(/\s+/g,' ')}
const SENIOR=/\bvp\b|vice president|\bsvp\b|\bevp\b|head of|chief|\bc[a-z]o\b|director|president|founder|owner|\bpartner\b|general manager|\bgm\b/i;

/* ---------- 00 overview ---------- */
function overview(D){
  const dates=D.connections.map(c=>+c.date),first=dates.length?new Date(Math.min(...dates)):null;
  return {connections:D.connections.length,since:first?first.getUTCFullYear():null,messages:D.messages.length,posts:D.shares.length,invitations:D.invitations.length,now:iso(D.now)};
}

/* ---------- 01 clusters ---------- */
function sec01(D){
  if(D.connections.length<20)return null;
  const rows=D.connections.map(c=>({co:normCompany(c.company),ind:classify(normCompany(c.company),c.position)}));
  const skip=new Set(['Unclassified','No company listed']);
  const cnt={};rows.forEach(r=>{cnt[r.ind]=(cnt[r.ind]||0)+1});
  const top=Object.keys(cnt).filter(k=>!skip.has(k)).sort((a,b)=>cnt[b]-cnt[a]).slice(0,9).map(k=>({name:k,count:cnt[k]}));
  const idx=Object.fromEntries(top.map((t,i)=>[t.name,i]));
  const emp={};rows.forEach(r=>{if(r.co&&r.co!=='Self-employed / Freelance'&&r.ind in idx){const k=idx[r.ind]+'|'+r.co;emp[k]=(emp[k]||0)+1}});
  let thr=3;let employers=Object.entries(emp).filter(([,n])=>n>=thr);
  if(employers.length<4){thr=2;employers=Object.entries(emp).filter(([,n])=>n>=thr)}
  employers=employers.sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,n])=>{const [i,...rest]=k.split('|');return {ind:+i,name:rest.join('|'),count:n}});
  const distinct=new Set(rows.map(r=>r.co).filter(Boolean)).size;
  // when each cluster's connections were added: a second dimension for the map
  const yrs=D.connections.map(c=>c.date.getUTCFullYear()),y0=Math.min(...yrs),y1=D.now.getUTCFullYear(),years=[];for(let y=y0;y<=y1;y++)years.push(y);
  const perInd=top.map(()=>years.map(()=>0));
  D.connections.forEach((c,i)=>{const k=idx[rows[i].ind];if(k!=null)perInd[k][c.date.getUTCFullYear()-y0]++});
  const recentFrom=y1-2;
  const fresh=top.map((t,k)=>{const rec=perInd[k].reduce((s,v,j)=>s+(years[j]>=recentFrom?v:0),0);const med=(()=>{let half=t.count/2,s=0;for(let j=0;j<years.length;j++){s+=perInd[k][j];if(s>=half)return years[j]}return y1})();return {name:t.name,count:t.count,recent:rec,recentPct:t.count?Math.round(100*rec/t.count):0,median:med}});
  return {years,perInd,fresh,recentFrom,total:rows.length,top,employers,thr,classified:top.reduce((a,t)=>a+t.count,0),unclassified:rows.length-top.reduce((a,t)=>a+t.count,0),distinct,
    biggestEmployer:Object.entries(rows.reduce((o,r)=>{if(r.co&&r.co!=='Self-employed / Freelance')o[r.co]=(o[r.co]||0)+1;return o},{})).sort((a,b)=>b[1]-a[1])[0]};
}

/* ---------- 04 posting vs connections ---------- */
function sec04(D){
  if(D.shares.length<5||D.connections.length<30)return null;
  const pm={},cm={};D.shares.forEach(s=>{const k=mkey(s.date);pm[k]=(pm[k]||0)+1});D.connections.forEach(c=>{const k=mkey(c.date);cm[k]=(cm[k]||0)+1});
  const months=monthRange(Object.keys(pm).sort()[0],mkey(D.now));
  const x=months.map(m=>pm[m]||0),y=months.map(m=>cm[m]||0);
  const stat=(a,b)=>{const r=pearson(a,b);return {n:a.length,r:+r.toFixed(3),p:permP(a,b,r)}};
  const full=stat(x,y),lag1=stat(x.slice(0,-1),y.slice(1)),rev=stat(y.slice(0,-1),x.slice(1));
  // posts in a month vs. new connections in that month plus the next (LinkedIn keeps surfacing a post for weeks)
  const y2=y.slice(0,-1).map((v,i)=>v+y[i+1]),win=stat(x.slice(0,-1),y2);
  const since=months.findIndex(m=>m>='2020-01');
  const s20=since>=0&&months.length-since>=24?stat(x.slice(since),y.slice(since)):null;
  const g={};months.forEach((m,i)=>{const k=Math.min(x[i],3);(g[k]=g[k]||[]).push(y[i])});
  const groups=Object.fromEntries(Object.keys(g).sort().map(k=>[k,{n:g[k].length,mean:+(g[k].reduce((a,b)=>a+b,0)/g[k].length).toFixed(2)}]));
  const mean=a=>a.length?a.reduce((p,q)=>p+q,0)/a.length:0;
  const withP=y.filter((_,i)=>x[i]>0),without=y.filter((_,i)=>x[i]===0);
  return {months,posts:x,conns:y,full,lag1,rev,win,since2020:s20,groups,postMonths:{n:withP.length,mean:+mean(withP).toFixed(1)},noPostMonths:{n:without.length,mean:+mean(without).toFixed(1)},r2:+(win.r**2).toFixed(3),totalPosts:D.shares.length};
}

/* ---------- 06 inbound vs outbound ---------- */
function sec06(D){
  if(!D.invitations.length)return null;
  const end=D.now,start=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()-6,end.getUTCDate()));
  const conn={};D.connections.forEach(c=>{conn[c.url]=c.date});
  const W=D.invitations.filter(i=>i.date>=start&&i.date<=new Date(+end+DAY));
  const months=[];for(let k=0;k<6;k++){const d=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+k,1));months.push(mkey(d))}
  months.push(...[]);
  const other=i=>i.dir==='INCOMING'?i.from:i.to;
  const agg=(dir,m)=>{const xs=W.filter(i=>i.dir===dir&&(!m||mkey(i.date)===m));return [xs.length,xs.filter(i=>conn[other(i)]).length]};
  const lastInv=mkey(new Date(Math.max(...W.map(i=>+i.date),+start)));
  const mset=[...new Set([...months,mkey(end)])].sort().filter(m=>m<=lastInv);
  const res={months:mset,inTot:mset.map(m=>agg('INCOMING',m)[0]),inAcc:mset.map(m=>agg('INCOMING',m)[1]),outTot:mset.map(m=>agg('OUTGOING',m)[0]),outAcc:mset.map(m=>agg('OUTGOING',m)[1]),inAll:agg('INCOMING'),outAll:agg('OUTGOING'),start:iso(start),end:iso(end)};
  const acc=W.filter(i=>i.dir==='INCOMING'&&conn[other(i)]);
  const lags=acc.map(i=>Math.max(0,Math.floor((ymd(conn[other(i)])-ymd(i.date))/DAY)));
  res.lag={n:lags.length,within3:lags.filter(l=>l<=3).length,within14:lags.filter(l=>l>3&&l<=14).length,later:lags.filter(l=>l>14).length,median:median(lags)};
  const days={};acc.forEach(i=>{const k=iso(conn[other(i)]);days[k]=(days[k]||0)+1});
  res.batch=Object.entries(days).sort((a,b)=>b[1]-a[1])[0]||null;
  return res;
}

/* ---------- 07 relationship tiers ---------- */
function msgIndex(D){
  const info={};const get=u=>info[u]||(info[u]={a:[],b:[]});
  D.messages.forEach(m=>{if(m.from===D.me){m.to.forEach(r=>{if(r&&r!==D.me)get(r).a.push(m.date)})}else if(m.from)get(m.from).b.push(m.date)});
  return info;
}
function sec07(D){
  if(!D.messages.length||D.connections.length<20||!D.me)return null;
  const info=msgIndex(D),now=D.now;
  const cats=['Active','Some contact','Going stale','Dormant','Never messaged'];
  const rows=D.connections.map(c=>{const i=info[c.url];const all=i?i.a.concat(i.b):[];const last=all.length?new Date(Math.max(...all)):null;const days=last?Math.floor((now-last)/DAY):null;
    const cat=last==null?4:days<=90?0:days<=365?1:days<=730?2:3;
    return {cat,two:!!(i&&i.a.length&&i.b.length),theirs:!!(i&&i.b.length),mine:!!(i&&i.a.length),days,date:c.date}});
  const counts=cats.map((_,k)=>rows.filter(r=>r.cat===k).length);
  const two=cats.map((_,k)=>rows.filter(r=>r.cat===k&&r.two).length);
  const theirs=cats.map((_,k)=>rows.filter(r=>r.cat===k&&!r.two&&r.theirs).length);
  const mine=cats.map((_,k)=>rows.filter(r=>r.cat===k&&!r.two&&!r.theirs&&r.mine).length);
  const y0=Math.min(...rows.map(r=>r.date.getUTCFullYear())),y1=now.getUTCFullYear();const years=[];for(let y=y0;y<=y1;y++)years.push(y);
  const recent=rows.filter(r=>(now-r.date)/DAY<=365);
  return {cats,total:rows.length,counts,two,theirs,mine,years,yrMsg:years.map(y=>rows.filter(r=>r.date.getUTCFullYear()===y&&r.cat<4).length),yrNever:years.map(y=>rows.filter(r=>r.date.getUTCFullYear()===y&&r.cat===4).length),
    pyramid:[rows.length,rows.filter(r=>r.cat<4).length,rows.filter(r=>r.two).length,rows.filter(r=>r.two&&r.cat<=1).length,rows.filter(r=>r.two&&r.cat===0).length],
    newYear:recent.length,newYearNever:recent.filter(r=>r.cat===4).length,oneWayDormant:theirs[1]+theirs[2]+theirs[3]};
}

/* ---------- 08 timeline ---------- */
function sec08(D){
  if(!D.connections.length)return null;
  const end=D.now,start=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()-6,end.getUTCDate()));
  const inv={};D.invitations.forEach(i=>{inv[i.dir==='INCOMING'?i.from:i.to]={dir:i.dir,date:i.date}});
  const info=D.messages.length&&D.me?msgIndex(D):{};
  const rows=D.connections.filter(c=>c.date>=start).sort((a,b)=>b.date-a.date).map((c,k)=>{
    const iv=inv[c.url],i=info[c.url]||{a:[],b:[]};const cd=ymd(c.date);
    const a=i.a.filter(d=>ymd(d)>=cd),b=i.b.filter(d=>ymd(d)>=cd);const all=a.concat(b);
    return {id:k+1,date:iso(c.date),init:iv?(iv.dir==='OUTGOING'?'You':'Them'):'Unknown',mine:a.length,theirs:b.length,total:all.length,last:all.length?iso(new Date(Math.max(...all))):null,ind:classify(normCompany(c.company),c.position)};
  });
  if(rows.length<5)return null;
  return {rows,start:iso(start),end:iso(end),n:rows.length,theyAsked:rows.filter(r=>r.init==='Them').length,messaged:rows.filter(r=>r.total>0).length,twoWay:rows.filter(r=>r.mine>0&&r.theirs>0).length,known:rows.filter(r=>r.init!=='Unknown').length};
}

/* ---------- 10 career layers ---------- */
function sec10(D){
  if(D.connections.length<30)return null;
  const P=D.positions.filter(p=>p.start).sort((a,b)=>a.start-b.start);
  const firstConn=new Date(Math.min(...D.connections.map(c=>+c.date))),now=D.now;
  let eras=[];
  const perRole=P.length<=9;
  P.forEach(p=>{const l=eras[eras.length-1];if(!perRole&&l&&l.company.toLowerCase()===p.company.toLowerCase()){l.titles.push(p.title);l.end=(l.end&&p.end)?(p.end>l.end?p.end:l.end):null}else eras.push({company:p.company,start:p.start,end:p.end,titles:[p.title],role:p.title})});
  const out=[];
  if(!eras.length){
    const y0=firstConn.getUTCFullYear();const step=Math.max(2,Math.ceil((now.getUTCFullYear()-y0+1)/6));
    for(let y=y0;y<=now.getUTCFullYear();y+=step)out.push({name:y+'–'+Math.min(y+step-1,now.getUTCFullYear()),sub:'No job history found, so grouped by years',start:new Date(Date.UTC(y,0,1)),end:new Date(Date.UTC(Math.min(y+step,now.getUTCFullYear()+1),0,1))});
  }else{
    if(+eras[0].start>+firstConn+30*DAY)out.push({name:'Before '+eras[0].company,sub:'Earlier career',start:firstConn,end:eras[0].start});
    eras.forEach((e,i)=>{const nxt=eras[i+1];const t=e.titles.filter(Boolean);out.push({name:perRole&&e.role?e.company+' · '+e.role:e.company,sub:perRole?'':(t.length>1?t[0]+' → '+t[t.length-1]:(t[0]||'')),start:e.start,end:nxt?nxt.start:(e.end||new Date(+now+DAY))})});
    const last=eras[eras.length-1];
    if(last.end&&last.end<new Date(+now-30*DAY))out.push({name:'After '+last.company,sub:'Since the last listed role',start:last.end,end:new Date(+now+DAY)});
  }
  const used=out.slice(-10);
  const e0=out.length>10?out.length-10:0;
  const assign=d=>{let k=-1;used.forEach((e,i)=>{if(d>=e.start)k=i});if(k<0)k=0;return k};
  const y0=firstConn.getUTCFullYear(),y1=now.getUTCFullYear();const years=[];for(let y=y0;y<=y1;y++)years.push(y);
  const cnt=used.map(()=>years.map(()=>0));
  D.connections.forEach(c=>{cnt[assign(c.date)][c.date.getUTCFullYear()-y0]++});
  const cum=cnt.map(row=>{let s=0;return row.map(v=>(s+=v))});
  const eraOut=used.map((e,i)=>{const n=cnt[i].reduce((a,b)=>a+b,0);const s=i===0?Math.min(+firstConn,+e.start):+e.start;const yrs=Math.max(0.25,(Math.min(+e.end,+now)-s)/(365.25*DAY));return {name:e.name,sub:e.sub,start:iso(new Date(Math.min(+e.start,+firstConn)<+e.start&&i===0?firstConn:e.start)),end:iso(new Date(Math.min(+e.end,+now))),n,perYear:+(n/yrs).toFixed(1)}});
  const yt=years.map((_,j)=>cnt.reduce((a,r)=>a+r[j],0));const pk=yt.indexOf(Math.max(...yt));
  return {years,eras:eraOut,cnt,cum,total:D.connections.length,peakYear:years[pk],peakCount:yt[pk],hasPositions:P.length>0};
}

/* ---------- follows ---------- */
function nrmOrg(s){return (s||'').toLowerCase().replace(/[,.&'\u2019\-]/g,' ').replace(/\s+/g,' ').trim().replace(/\s(inc|llc|ltd|corp|corporation|co|company)$/,'').trim()}
function secFol(D){
  if(!D.follows||D.follows.length<5)return null;
  const co={};D.connections.forEach(c=>{const k=nrmOrg(c.company);if(k)co[k]=(co[k]||0)+1});const keys=Object.keys(co);
  const count=name=>{const k=nrmOrg(name);if(!k)return 0;let n=co[k]||0;if(!n&&k.length>=5)for(const c of keys){if(c.length>=5&&(c.startsWith(k+' ')||k.startsWith(c+' ')))n+=co[c]}return n};
  const rows=D.follows.slice().sort((a,b)=>a-b===0?0:a.date-b.date).map(f=>({name:f.org,date:f.date,conn:count(f.org)}));
  const years=[];const y0=rows[0].date.getUTCFullYear(),y1=D.now.getUTCFullYear();for(let y=y0;y<=y1;y++)years.push(y);
  const perYear=years.map(y=>rows.filter(r=>r.date.getUTCFullYear()===y).length);let s=0;const cum=perYear.map(v=>(s+=v));
  const last12=rows.filter(r=>(D.now-r.date)/DAY<=365).length;
  const withConn=rows.filter(r=>r.conn>0),without=rows.filter(r=>r.conn===0);
  const days={};rows.forEach(r=>{const k=r.date.toISOString().slice(0,10);days[k]=(days[k]||0)+1});
  const bigDay=Object.entries(days).sort((a,b)=>b[1]-a[1])[0];
  const mf=D.memberFollows||[];const st=k=>mf.filter(m=>m.status===k).length;
  return {total:rows.length,years,perYear,cum,last12,withConn:withConn.length,without:without.length,connPct:Math.round(100*withConn.length/rows.length),
    topConn:withConn.slice().sort((a,b)=>b.conn-a.conn).slice(0,10).map(r=>({name:r.name,n:r.conn})),noConn:without.slice().reverse().slice(0,40).map(r=>r.name),
    bigDay:bigDay&&bigDay[1]>=5?{date:bigDay[0],n:bigDay[1]}:null,
    people:mf.length?{total:mf.length,active:st('active'),unfollowed:st('unfollow'),muted:st('mute')}:null,first:rows[0].date.toISOString().slice(0,10)};
}

/* ---------- mirror: what LinkedIn thinks vs. what you do ---------- */
const STOP=new Set(('a about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its just me more most my no nor not now of off on once only or other our ours out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours get got make made new one two three may us per via etc like using use used work working well '+
 'opportunity opportunities looking need needs know knows year years even people time great really think help want wants things thing going today love back take come around many lot next first last long good best better always never still much every thank thanks hope happy excited proud join joined team share sharing check read see saw look seen said say says way ways day days week weeks month months part find found give gave let lets might must shall since while within without across along among whether either neither however also than connect connecting connected interested open passionate experienced seeking currently previously focused driven helping helped').split(' '));
const GENERIC=new Set('software management service services solution solutions system systems platform platforms tool tools business digital technology technologies online mobile based general related industry company companies team teams program programs project projects'.split(' '));
function stemOf(w){w=w.toLowerCase().replace(/[^a-z]/g,'');if(w.length>6&&/ing$/.test(w))w=w.slice(0,-3);else if(w.length>5&&/ed$/.test(w))w=w.slice(0,-2);else if(w.length>5&&/ies$/.test(w))w=w.slice(0,-3)+'y';else if(w.length>4&&/s$/.test(w)&&!/ss$/.test(w))w=w.slice(0,-1);return w}
function words(text){return (text.match(/[A-Za-z][A-Za-z'’]*/g)||[]).map(w=>({raw:w.replace(/’/g,"'"),st:stemOf(w.replace(/'s$/i,''))})).filter(x=>x.st.length>=3&&!STOP.has(x.raw.toLowerCase()))}
function secMirror(D){
  if(!D.ad||D.ad.interests.length<10)return null;
  // Text units: each skill, job title, organization name, and each sentence you wrote
  const units=[];
  const addUnit=(text,src)=>{const st=new Set(words(text).map(w=>w.st).filter(s=>!GENERIC.has(s)));if(st.size)units.push({st,src})};
  const sentences=t=>(t||'').split(/[.!?\n]+/).map(s=>s.trim()).filter(s=>s.length>3);
  D.skills.forEach(s=>addUnit(s,'your skills'));
  D.positions.forEach(p=>addUnit(p.title,'your job titles'));
  const pf=D.profile||{};sentences(pf.headline).forEach(s=>addUnit(s,'your headline'));sentences(pf.summary).forEach(s=>addUnit(s,'your summary'));
  D.shares.forEach(x=>sentences(x.text).forEach(s=>addUnit(s,'your posts')));D.comments.forEach(t=>sentences(t).forEach(s=>addUnit(s,'your comments')));
  (D.follows||[]).forEach(f=>addUnit(f.org,'organizations you follow'));
  // Echo test: an interest counts only if all its key words appear together in one unit
  const prio=['your skills','your job titles','your headline','your summary','your posts','your comments','organizations you follow'];
  const echoed=[],noTrace=[];
  D.ad.interests.forEach(tag=>{
    const st=[...new Set(words(tag).map(w=>w.st).filter(s=>!GENERIC.has(s)))];
    if(!st.length)return;
    const hits=units.filter(u=>st.every(s=>u.st.has(s)));
    if(hits.length){const srcs=hits.map(h=>h.src);echoed.push({tag,src:prio.find(p=>srcs.includes(p))||srcs[0]})}else noTrace.push(tag);
  });
  const nTags=echoed.length+noTrace.length;
  // Blind spots: topic words from your skills, titles and profile text that LinkedIn's lists lack
  const li=new Set();[D.ad.interests,D.ad.skills,D.ad.titles,D.ad.industries,D.ad.segments,D.ad.highValue,D.ad.buyer,D.ad.traits].forEach(arr=>arr.forEach(t=>words(t).forEach(w=>{if(!GENERIC.has(w.st))li.add(w.st)})));
  const term={};
  const eligible=(text,wt)=>words(text).forEach(w=>{if(GENERIC.has(w.st))return;const o=term[w.st]||(term[w.st]={n:0,forms:{},elig:false});o.n+=wt;o.elig=true;const lw=w.raw.toLowerCase();o.forms[lw]=(o.forms[lw]||0)+1});
  const extra=(text)=>words(text).forEach(w=>{const o=term[w.st];if(o&&w.raw[0]===w.raw[0].toLowerCase())o.n+=1});
  D.skills.forEach(s=>eligible(s,3));D.positions.forEach(p=>eligible(p.title,2));eligible(pf.headline||'',3);eligible(pf.summary||'',2);
  D.shares.forEach(x=>extra(x.text||''));D.comments.forEach(extra);
  const rows=Object.entries(term).filter(([st,o])=>o.elig&&o.n>=4).map(([st,o])=>({st,term:Object.entries(o.forms).sort((a,b)=>b[1]-a[1])[0][0],n:o.n})).filter(r=>r.term.length>=4).sort((a,b)=>b.n-a.n);
  const top=rows.slice(0,20),unknown=top.filter(r=>!li.has(r.st));
  const accuracy=nTags?Math.round(100*echoed.length/nTags):0,coverage=top.length?Math.round(100*(top.length-unknown.length)/top.length):0,fit=(accuracy+coverage)?Math.round(2*accuracy*coverage/(accuracy+coverage)):0;
  return {nTags,echoed:echoed.length,noTraceN:noTrace.length,echoPct:accuracy,accuracy,coverage,fit,topList:top.slice(0,16).map(r=>({term:r.term,known:li.has(r.st)})),
    echoedSample:echoed.slice(0,14),noTrace:noTrace.slice(0,18),
    topTerms:top.length,unknownN:unknown.length,unknown:unknown.slice(0,12).map(r=>({term:r.term,n:r.n})),
    inferences:D.inferences.filter(x=>!/gender|\bage\b|ethnic|race|religio|sexual|politic|disab|health/i.test(x.type)).slice(0,8).map(x=>({type:x.type,value:x.value})),segments:D.ad.segments.slice(0,8),
    signals:{skills:D.skills.length,posts:D.shares.length+D.comments.length,titles:D.positions.length,follows:(D.follows||[]).length}};
}
root.LDV.an={overview,sec01,sec04,sec06,sec07,sec08,sec10,secFol,secMirror,classify,normCompany};
})();
