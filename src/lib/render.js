(function(){
const root=window;root.LDV=root.LDV||{};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pc=(a,b)=>b?Math.round(100*a/b):0;
const charts=[];const lazyReg={};
let sims=[];
function C(){return root.LDV.style.C()}
function fnt(w,s){return {family:C().font,weight:w||600,...(s?{size:s}:{})}}
function wrap(s,n){n=n||16;const w=s.split(' '),L=[];let c='';w.forEach(x=>{if((c+' '+x).trim().length>n){L.push(c.trim());c=x}else c=(c+' '+x)});L.push(c.trim());return L}
function chart(id,cfg){const el=$(id);if(!el)return null;const ex=Chart.getChart(el);if(ex)ex.destroy();const c=new Chart(el,cfg);charts.push(c);return c}
function lazy(id,fn){lazyReg[id]={fn,done:false};const d=$(id);if(d&&d.open){lazyReg[id].done=true;fn()}}
function bindToggles(){document.querySelectorAll('details.more').forEach(d=>{if(d._b)return;d._b=1;d.addEventListener('toggle',()=>{const r=lazyReg[d.id];if(d.open&&r&&!r.done){r.done=true;r.fn()}})})}
function monthLabel(m,o){return new Date(m+'-15T12:00:00Z').toLocaleDateString('en-US',Object.assign({month:'short',timeZone:'UTC'},o||{}))}
function fmtDay(d){return new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}
function sec(o){
  const cards=o.cards.map(c=>`<div class="hc ${c[0]}"><b>${c[1]}</b><span>${c[2]}</span></div>`).join('');
  return `<section class="sec" id="${o.id}"><div class="sh"><span class="num">${o.num}</span><div><h2>${o.title}</h2><p class="sub">${o.sub}</p></div></div>
  <div class="cards3">${cards}</div>${o.hero}
  ${o.more?`<details class="more" id="m-${o.id}"><summary>More detail</summary><div class="mb">${o.more}</div></details>`:''}
  <div class="take"><b>Takeaway.</b> ${o.take}</div><p class="src">${o.src}</p></section>`;
}
const card=(title,inner,note)=>`<div class="card"><h3>${title}</h3>${inner}${note?`<p class="note">${note}</p>`:''}</div>`;

/* ===== 01 ===== */
function s01(r,num){
  const big=r.top.slice(0,3).map(t=>t.name).join(', ').replace(/, ([^,]*)$/,' and $1');
  const emp=r.biggestEmployer;
  const html=sec({id:'s-net',num,title:'Your network as a universe',sub:`${r.total} connections, grouped by industry and by employer, with you at the center.`,
   cards:[['a',r.total.toLocaleString(),'connections'],['b',r.top.length,`industry clusters, covering ${r.classified} people`],['c',r.employers.length,`employers with ${r.thr}+ connections`]],
   hero:card('Industries and employers &middot; drag to rearrange, hover for details',`<svg class="net" id="net-svg"></svg><div class="tip" id="net-tip"></div><div class="lg" id="net-lg"></div>`,'Drag any circle to move it; it stays where you drop it. Double-click a circle to let it settle back.'),
   more:`<div class="card"><h3>When each cluster was built</h3><canvas id="net-yr" height="150"></canvas><p class="note">New connections per year, colored by industry cluster, matching the map above.</p></div><div class="card"><h3>How new is each cluster?</h3><canvas id="net-fresh" height="${Math.max(120,r.fresh.length*26)}"></canvas><p class="note">Share of each cluster&rsquo;s connections added since ${r.recentFrom}. A high bar means a cluster you are building now; a low bar means an older, settled one.</p></div>`,
   take:`Your biggest industries are ${big}. ${(()=>{const f=r.fresh.filter(x=>x.count>=10).sort((a,b)=>b.recentPct-a.recentPct),n=f[0],o=f[f.length-1];return f.length>1&&n.recentPct-o.recentPct>=10?`${esc(n.name)} is your newest cluster (${n.recentPct}% added since ${r.recentFrom}) and ${esc(o.name)} your most settled (${o.recentPct}%). `:''})()}${emp?`${esc(emp[0])} is your largest single employer with ${emp[1]} connections. `:''}Your network spans about ${r.distinct.toLocaleString()} different employers.`,
   src:`Source: Connections.csv. Industry is not in LinkedIn's export, so it is inferred from company names and job titles with keyword rules. ${r.unclassified} connections could not be classified and are left out of the map.`});
  const init=()=>{
    const P=C();const COL=P.cat.concat(P.cat);
    $('net-lg').innerHTML=r.top.map((t,i)=>`<span><i style="background:${COL[i]}"></i>${esc(t.name)} (${t.count})</span>`).join('');
    const W=900,H=680,svg=d3.select('#net-svg');svg.selectAll('*').remove();svg.attr('viewBox',`0 0 ${W} ${H}`);const g=svg.append('g');
    const n=r.top.length,ORDER=[];for(let k=0;k<n;k++)ORDER.push(k%2===0?k/2:Math.ceil(n/2)+(k-1)/2);
    const POS=[];ORDER.forEach((ind,k)=>{const a=-Math.PI/2+k/n*2*Math.PI;POS[ind]=[W/2+Math.cos(a)*300,H/2+Math.sin(a)*230]});
    const out=i=>{const dx=POS[i][0]-W/2,dy=POS[i][1]-H/2,l=Math.hypot(dx,dy)||1;return [POS[i][0]+dx/l*95,POS[i][1]+dy/l*95]};
    const nodes=[{id:'ME',k:'me',r:38,fx:W/2,fy:H/2,label:'You'}],links=[];
    r.top.forEach((t,i)=>{nodes.push({id:'I'+i,k:'ind',i,r:10+Math.sqrt(t.count)*3.4,label:t.name,count:t.count});links.push({source:'ME',target:'I'+i,s:200,me:1})});
    r.employers.forEach((e,j)=>{nodes.push({id:'E'+j,k:'co',i:e.ind,r:4+Math.sqrt(e.count)*2.6,label:e.name,count:e.count});links.push({source:'I'+e.ind,target:'E'+j,s:90})});
    const sim=d3.forceSimulation(nodes).force('link',d3.forceLink(links).id(d=>d.id).distance(d=>d.s).strength(d=>d.me?.15:.9)).force('charge',d3.forceManyBody().strength(-120))
      .force('x',d3.forceX(d=>d.k=='me'?W/2:d.k=='co'?out(d.i)[0]+(nodes[1+d.i].fx!=null?nodes[1+d.i].fx-POS[d.i][0]:0):POS[d.i][0]).strength(.35)).force('y',d3.forceY(d=>d.k=='me'?H/2:d.k=='co'?out(d.i)[1]+(nodes[1+d.i].fy!=null?nodes[1+d.i].fy-POS[d.i][1]:0):POS[d.i][1]).strength(.35)).force('collide',d3.forceCollide(d=>d.r+(d.k=='co'?20:10)));
    sims.push(sim);
    const link=g.append('g').selectAll('line').data(links).join('line').attr('stroke',d=>d.me?P.ink:P.grey).attr('stroke-opacity',d=>d.me?.5:.35).attr('stroke-width',d=>d.me?2.5:1);
    const tip=d3.select('#net-tip');
    const node=g.append('g').selectAll('circle').data(nodes).join('circle').attr('r',d=>d.r).attr('fill',d=>d.k=='me'?P.ink:COL[d.i]).attr('stroke','#fff').attr('stroke-width',d=>d.k=='ind'||d.k=='me'?3:1.5)
     .on('mousemove',(e,d)=>{const b=$('net-svg').closest('.card').getBoundingClientRect();tip.style('opacity',1).style('left',(e.clientX-b.left+12)+'px').style('top',(e.clientY-b.top+12)+'px').html(d.k=='me'?`<b>You</b><br>${r.total} connections`:`<b>${esc(d.label)}</b><br>${d.count} connections`)})
     .on('mouseleave',()=>tip.style('opacity',0))
     .style('cursor',d=>d.k=='me'?'default':'grab')
     .on('dblclick',(e,d)=>{if(d.k=='me')return;d.fx=d.fy=null;sim.alpha(.6).restart()})
     .call(d3.drag().filter(e=>!e.button).on('start',(e,d)=>{if(d.k=='me')return;if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y}).on('drag',(e,d)=>{if(d.k=='me')return;d.fx=e.x;d.fy=e.y}).on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0)}));
    const lab=g.append('g').selectAll('text').data(nodes.filter(d=>d.k!='co'||d.count>=Math.max(3,r.thr))).join('text').text(d=>d.label).attr('text-anchor','middle').attr('font-weight',800).attr('font-size',d=>d.k=='me'?18:d.k=='ind'?13:9).attr('fill',d=>d.k=='me'?P.gold:P.ink).attr('paint-order','stroke').attr('stroke',d=>d.k=='me'?'none':'#faf8f1').attr('stroke-width',3).style('pointer-events','none');
    sim.on('tick',()=>{nodes.forEach(d=>{d.x=Math.max(d.r+70,Math.min(W-d.r-70,d.x));d.y=Math.max(d.r+30,Math.min(H-d.r-20,d.y))});
      link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);node.attr('cx',d=>d.x).attr('cy',d=>d.y);
      lab.attr('x',d=>d.x).attr('y',d=>d.k=='me'?d.y+6:d.k=='ind'?(POS[d.i][1]>H/2+20?d.y-d.r-8:d.y+d.r+16):d.y-d.r-4)});
    lazy('m-s-net',()=>{
      chart('net-yr',{type:'bar',data:{labels:r.years,datasets:r.top.map((t,k)=>({label:t.name,data:r.perInd[k],backgroundColor:COL[k],borderWidth:0}))},options:{plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{stacked:true,grid:{display:false},ticks:{maxTicksLimit:12}},y:{stacked:true,grid:{color:'#eee'},title:{display:true,text:'New connections',font:fnt()}}}}});
      chart('net-fresh',{type:'bar',data:{labels:r.fresh.map(f=>wrap(f.name,22)),datasets:[{data:r.fresh.map(f=>f.recentPct),backgroundColor:r.fresh.map((_,k)=>COL[k]),borderWidth:0}]},options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.x}% added since ${r.recentFrom} (${r.fresh[c.dataIndex].recent} of ${r.fresh[c.dataIndex].count})`}}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:'#eee'}},y:{grid:{display:false},ticks:{autoSkip:false,font:fnt(600,11)}}}}});
    });
  };
  return {html,init};
}

/* ===== posting ===== */
function s04(r,num){
  const strength=Math.abs(r.win.r)<.2?'weak or no':Math.abs(r.win.r)<.5?'a moderate':'a strong';
  const lagTxt=`LinkedIn keeps showing a post for weeks, so this score counts new connections in the month you posted and the month after.`;
  const common=r.win.r>=.2?`That fits a common claim that posting more brings more connections: <a href="https://buffer.com/resources/how-often-to-post-on-linkedin/" target="_blank" rel="noopener">Buffer&rsquo;s analysis of over 2 million LinkedIn posts</a> found that accounts that post more often tend to get more reach and followers. Your own history can&rsquo;t prove cause, though, because busy months for posting may also be busy months for everything else.`:`The common advice that posting more brings more connections (Buffer&rsquo;s analysis of <a href="https://buffer.com/resources/how-often-to-post-on-linkedin/" target="_blank" rel="noopener">over 2 million LinkedIn posts</a> points that way) shows up only weakly in your own history.`;
  const fp=p=>p<0.001?'< 0.001':p.toFixed(3);
  const html=sec({id:'s-post',num,title:'Does posting actually work?',sub:`Posts and new connections by month, ${monthLabel(r.months[0],{month:'long',year:'numeric'})} to ${monthLabel(r.months[r.months.length-1],{month:'long',year:'numeric'})}.`,
   cards:[['c','r = '+r.win.r.toFixed(2),'link between posts and new connections in the month of the post plus the month after'],['a',`${r.postMonths.mean} vs ${r.noPostMonths.mean}`,'average new connections in months with a post vs. months without'],['b',r.totalPosts,'posts in total, across '+r.months.length+' months']],
   hero:card('New connections (bars) and posts (dots) by month',`<canvas id="post-tl" height="130"></canvas>`,'Red dots mark months with at least one post; a bigger dot means more posts that month.'),
   more:`<div class="two"><div class="card"><h3>Average new connections by posts in the month</h3><canvas id="post-grp" height="230"></canvas><p class="note" id="post-gn"></p></div><div class="card"><h3>Correlation checks</h3><table class="t" id="post-tbl"></table></div></div>`,
   take:`There is ${strength} link: posting explains about ${Math.round(r.r2*100)}% of the swings in new connections. ${lagTxt} ${common}`,
   src:`Sources: Shares.csv, Connections.csv. LinkedIn\u2019s export does not include how many reactions or comments your posts received, so this compares posting with connections only. Only current connections are counted, so older months are slightly understated. Significance comes from a shuffle test, because both series are sparse counts.`});
  const init=()=>{
    const P=C();
    chart('post-tl',{data:{labels:r.months,datasets:[{type:'bar',label:'New connections',data:r.conns,backgroundColor:P.blue,yAxisID:'y',order:2,barPercentage:1,categoryPercentage:1},{type:'line',label:'Months with posts',data:r.posts.map(v=>v>0?v:null),showLine:false,backgroundColor:P.red,borderColor:P.red,pointBackgroundColor:P.red,pointBorderColor:'#ffffff',pointBorderWidth:2,pointStyle:'circle',pointRadius:r.posts.map(v=>v?5+Math.min(v,4)*2:0),yAxisID:'y2',order:1}]},
      options:{interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{font:fnt(600),usePointStyle:true,pointStyle:'rectRounded'}}},scales:{x:{ticks:{maxTicksLimit:15,callback:function(v){return this.getLabelForValue(v).slice(0,4)}},grid:{display:false}},y:{title:{display:true,text:'New connections',font:fnt()},grid:{color:'#eee'}},y2:{position:'right',min:0,max:Math.max(4,Math.max(...r.posts)+1),title:{display:true,text:'Posts',font:fnt()},grid:{display:false},ticks:{stepSize:1}}}}});
    lazy('m-s-post',()=>{
      const G=Object.entries(r.groups);
      chart('post-grp',{type:'bar',data:{labels:G.map(([k])=>k==='3'?'3+ posts':k==='1'?'1 post':k+' posts'),datasets:[{data:G.map(([,v])=>v.mean),backgroundColor:[P.grey,P.red,P.red,P.red],borderWidth:0}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.y} avg new connections (${G[c.dataIndex][1].n} months)`}}},scales:{y:{grid:{color:'#eee'},title:{display:true,text:'Avg new connections',font:fnt()}},x:{grid:{display:false},ticks:{font:fnt()}}}}});
      $('post-gn').textContent='Months in each group: '+G.map(([k,v])=>`${k}${k==='3'?'+':''} post${k==='1'?'':'s'}: ${v.n}`).join(', ')+'.';
      const R=[['Month of post + next month (the score above)',r.win],['Same month only, all months',r.full],r.since2020?['Same month, 2020 onward',r.since2020]:null,['Posts this month → connections next month',r.lag1],['Connections this month → posts next month',r.rev]].filter(Boolean);
      $('post-tbl').innerHTML=`<tr><th>Test</th><th class="n">r</th><th class="n">p</th></tr>`+R.map(([t,s])=>`<tr><td>${t}</td><td class="n">${s.r.toFixed(2)}</td><td class="n">${fp(s.p)}</td></tr>`).join('');
    });
  };
  return {html,init};
}

/* ===== invitations ===== */
function s06(r,num){
  const inR=pc(r.inAll[1],r.inAll[0]),outR=r.outAll[0]?pc(r.outAll[1],r.outAll[0]):null;
  const ratio=r.outAll[0]?Math.round(r.inAll[0]/r.outAll[0]):null;
  const html=sec({id:'s-inv',num,title:'Inbound vs. outbound connections',sub:`${fmtDay(r.start)} to ${fmtDay(r.end)}, the last six months of the export.`,
   cards:[['a',ratio?`~${ratio}×`:r.inAll[0],ratio?`more people asked to connect with you (${r.inAll[0]}) than you asked (${r.outAll[0]})`:`people asked to connect with you; you sent ${r.outAll[0]}`],['b',inR+'%',`of inbound requests you accepted (${r.inAll[1]} of ${r.inAll[0]})`],['d',outR==null?'n/a':outR+'%',outR==null?'you sent no requests in this window':`of your own requests were accepted (${r.outAll[1]} of ${r.outAll[0]})`]],
   hero:card('Requests per month, with the share you accepted',`<canvas id="inv-tr" height="130"></canvas>`,'Bars count invitations by the month they were sent. The line is the share of that month’s inbound requests you accepted. Recent months can still rise.'),
   more:`<div class="two"><div class="card"><h3>How long you took to accept</h3><canvas id="inv-lag" height="200"></canvas><p class="note" id="inv-ln"></p></div><div class="card"><h3>Acceptance rate</h3><canvas id="inv-rate" height="200"></canvas></div></div>`,
   take:`${ratio&&ratio>=3?'Your network is mostly pull, not push: people find you far more often than you chase them. ':''}You accepted ${inR}% of inbound requests${r.lag.n?`, with a median wait of ${r.lag.median} days${r.lag.later>r.lag.n/3?`. ${r.lag.later} of the ${r.lag.n} you accepted waited more than two weeks, which suggests you accept in bursts${r.batch&&r.batch[1]>=5?` (${r.batch[1]} on a single day, ${fmtDay(r.batch[0])})`:''}`:''}`:''}.`,
   src:`Source: Invitations.csv. A request counts as accepted when the person appears in Connections.csv. The file only lists requests that are recent or pending, so requests that were ignored or withdrawn may not be recorded, which can overstate your own acceptance rate.`});
  const init=()=>{
    const P=C();const rate=r.inTot.map((t,i)=>t?Math.round(100*r.inAcc[i]/t):null);
    chart('inv-tr',{data:{labels:r.months.map(m=>monthLabel(m)),datasets:[{type:'bar',label:'Received',data:r.inTot,backgroundColor:P.blue,yAxisID:'y'},{type:'bar',label:'Sent by you',data:r.outTot,backgroundColor:P.gold,yAxisID:'y'},{type:'line',label:'% of received you accepted',data:rate,borderColor:P.red,backgroundColor:P.red,borderWidth:3,pointRadius:5,tension:.25,yAxisID:'y2'}]},options:{plugins:{legend:{labels:{font:fnt(600)}}},scales:{y:{beginAtZero:true,title:{display:true,text:'Requests',font:fnt()},grid:{color:'#eee'}},y2:{position:'right',min:0,max:100,title:{display:true,text:'% accepted',font:fnt()},grid:{display:false},ticks:{callback:v=>v+'%'}},x:{grid:{display:false},ticks:{font:fnt()}}}}});
    lazy('m-s-inv',()=>{
      chart('inv-lag',{type:'bar',data:{labels:['Within 3 days','4–14 days','More than 2 weeks'],datasets:[{data:[r.lag.within3,r.lag.within14,r.lag.later],backgroundColor:[P.blue,P.gold,P.red],borderWidth:0}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#eee'},title:{display:true,text:'Accepted requests',font:fnt()}},x:{grid:{display:false},ticks:{font:fnt()}}}}});
      $('inv-ln').textContent=`Median wait: ${r.lag.median} days.`+(r.batch?` ${r.batch[1]} requests were accepted on ${fmtDay(r.batch[0])}.`:'');
      chart('inv-rate',{type:'bar',data:{labels:['Your requests accepted','Inbound you accepted'],datasets:[{data:[outR==null?0:outR,inR],backgroundColor:[P.gold,P.blue],borderWidth:0}]},options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y+'%'}}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:'#eee'}},x:{grid:{display:false},ticks:{font:fnt()}}}}});
    });
  };
  return {html,init};
}

/* ===== relationships ===== */
function s07(r,num){
  const p=r.pyramid,pt=a=>pc(a,r.total);
  const html=sec({id:'s-rel',num,title:'Connections vs. conversations',sub:'Every connection, sorted by when you last exchanged a LinkedIn message.',
   cards:[['a',pt(p[1])+'%',`Connecting: have ever exchanged a message with you (${p[1].toLocaleString()} of ${r.total.toLocaleString()})`],['b',pt(p[2])+'%',`Conversing: have ever had a back-and-forth conversation with you (${p[2]})`],['c',p[3],`conversations in the last year. Your working network is closer to ${p[3]} than ${r.total.toLocaleString()}.`]],
   hero:card('Collecting, connecting, conversing',`<div class="lvl"><div><h4>Collecting</h4><b>${r.total.toLocaleString()}</b><span>connections on your list</span></div><div><h4>Connecting</h4><b>${p[1].toLocaleString()}</b><span>have exchanged at least one message with you</span></div><div><h4>Conversing</h4><b>${p[2].toLocaleString()}</b><span>have gone back and forth with you</span></div></div><div class="tiers" id="rel-tiers"></div>`,'The five tiers split everyone by how recently you last exchanged a message. A conversation means both of you have written at least once.'),
   more:`<div class="card"><h3>Each tier, by who did the talking</h3><canvas id="rel-stack" height="150"></canvas><p class="note">The never-messaged connections are left off. A conversation means both of you have sent a message at some point.</p></div><div class="two"><div class="card"><h3>From all names to live relationships</h3><canvas id="rel-fun" height="230"></canvas></div><div class="card"><h3>Connections added each year, by whether you ever messaged</h3><canvas id="rel-yr" height="230"></canvas></div></div>`,
   take:`You have collected ${r.total.toLocaleString()} connections, connected with ${p[1].toLocaleString()} (${pt(p[1])}%) and conversed with ${p[2].toLocaleString()} (${pt(p[2])}%). ${r.two[3]?`The biggest opportunity may be the dormant group: you once had a conversation with ${r.two[3]} of the ${r.counts[3]} dormant connections. `:''}${r.oneWayDormant?`Another ${r.oneWayDormant} connections wrote to you once and never got a reply. `:''}Collecting hasn't slowed: ${r.newYearNever} of the ${r.newYear} people you connected with in the last year have never messaged you.`,
   src:`Source: Connections.csv and messages.csv, matched by profile URL. Only message dates and senders are used; message text is never read. Tiers: Active = last message within 90 days; Some contact = 91 days to a year; Going stale = 1 to 2 years; Dormant = over 2 years. This counts LinkedIn messages only, so coworkers and friends you talk to elsewhere will look like strangers.`});
  const init=()=>{
    const P=C();const col=[P.blue,P.gold,P.grey,P.red,root.LDV.style.mix(P.soft,P.ink,.12)];
    const onc=c=>{const h=c.replace('#','');const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16));return (0.299*v[0]+0.587*v[1]+0.114*v[2])>150?P.ink:'#ffffff'};
    $('rel-tiers').innerHTML=r.cats.map((c,i)=>`<div class="tr" style="background:${col[i]};color:${onc(col[i])}"><b>${r.counts[i]}</b><span>${c}</span><small>${pt(r.counts[i])}% of connections${r.two[i]?` · ${r.two[i]} in conversation`:''}</small></div>`).join('');
    lazy('m-s-rel',()=>{
      chart('rel-stack',{type:'bar',data:{labels:r.cats.slice(0,4),datasets:[{label:'Conversation (both wrote)',data:r.two.slice(0,4),backgroundColor:P.blue},{label:'Only they wrote',data:r.theirs.slice(0,4),backgroundColor:P.gold},{label:'Only you wrote',data:r.mine.slice(0,4),backgroundColor:P.red}]},options:{indexAxis:'y',plugins:{legend:{labels:{font:fnt(600)}}},scales:{x:{stacked:true,grid:{color:'#eee'}},y:{stacked:true,grid:{display:false},ticks:{font:fnt()}}}}});
      chart('rel-fun',{type:'bar',data:{labels:[['Collecting:','all connections'],['Connecting:','ever messaged'],['Conversing:','ever'],['Conversing,','last year'],['Conversing,','last 90 days']],datasets:[{data:p,backgroundColor:[P.soft,P.grey,P.gold,P.blue,P.red],borderWidth:0}]},options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.x} (${pc(c.parsed.x,r.total)}%)`}}},scales:{x:{grid:{color:'#eee'}},y:{grid:{display:false},ticks:{autoSkip:false,font:fnt()}}}}});
      chart('rel-yr',{type:'bar',data:{labels:r.years,datasets:[{label:'Messaged',data:r.yrMsg,backgroundColor:P.blue},{label:'Never messaged',data:r.yrNever,backgroundColor:P.soft}]},options:{plugins:{legend:{labels:{font:fnt(600)}}},scales:{x:{stacked:true,grid:{display:false},ticks:{maxTicksLimit:11}},y:{stacked:true,grid:{color:'#eee'}}}}});
    });
  };
  return {html,init};
}

/* ===== timeline ===== */
function s08(r,num){
  const known=r.known>=r.n/2;
  const html=sec({id:'s-time',num,title:'Connection timeline',sub:`The ${r.n} people you connected with from ${fmtDay(r.start)} to ${fmtDay(r.end)}, anonymized.`,
   cards:[['a',r.n,'connections added'],['b',known?pc(r.theyAsked,r.known)+'%':'n/a',known?`asked you first (${r.theyAsked} of ${r.known})`:'who asked first is not in the export for most of these'],['c',pc(r.messaged,r.n)+'%',`have exchanged a message since connecting (${r.messaged} of ${r.n})`]],
   hero:card('Connected date vs. messages exchanged since',`<svg class="net" id="tl-svg"></svg><div class="tip" id="tl-tip"></div><div class="lg"><span><i style="background:var(--blue)"></i>They asked to connect</span><span><i style="background:var(--gold)"></i>You asked</span><span><i style="background:var(--grey)"></i>Unknown</span><span class="muted">Dot size grows with messages. Hover for details.</span></div>`),
   more:`<div id="tl-list"></div>`,
   take:`${known?`Most people who joined asked first (${r.theyAsked} of ${r.known}). `:''}${r.n-r.messaged} of ${r.n} have no message since connecting${r.twoWay?`, and only ${r.twoWay} have gone back and forth`:''}. Stacks of dots on a single day usually mean you accepted a backlog of requests in one sitting.`,
   src:`Sources: Connections.csv, Invitations.csv, messages.csv. People are numbered, never named. Messages are counted on or after the connected date, in both directions. Notes inside an invitation, email and in-person contact are not counted.`});
  const init=()=>{
    const P=C(),D=r.rows;const W=1000,H=400,m={l:56,r:24,t:20,b:44};
    const svg=d3.select('#tl-svg');svg.selectAll('*').remove();svg.attr('viewBox',`0 0 ${W} ${H}`).style('background','var(--tint)');
    const t0=new Date(r.start+'T00:00:00Z'),t1=new Date(+new Date(r.end+'T00:00:00Z')+4*864e5);
    const x=d3.scaleTime().domain([t0,t1]).range([m.l,W-m.r]);const ymax=Math.max(4,d3.max(D,d=>d.total));const y=d3.scaleLinear().domain([0,ymax]).range([H-m.b,m.t]);
    svg.append('g').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(d3.utcMonth.every(1)).tickFormat(d3.utcFormat('%b')).tickSizeOuter(0)).call(g=>g.selectAll('text').attr('class','ax'));
    svg.append('g').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(Math.min(ymax,7)).tickSizeInner(-(W-m.l-m.r)).tickSizeOuter(0)).call(g=>{g.selectAll('line').attr('stroke','#e6e1d1');g.selectAll('text').attr('class','ax');g.select('.domain').remove()});
    svg.append('text').attr('transform','rotate(-90)').attr('x',-(H/2)).attr('y',14).attr('text-anchor','middle').attr('class','ax').attr('fill',P.ink).text('Messages exchanged since connecting');
    const nodes=D.map(d=>({...d,tx:x(new Date(d.date+'T12:00:00Z')),ty:y(d.total),r:4.5+Math.sqrt(d.total)*3.2}));
    d3.forceSimulation(nodes).force('x',d3.forceX(d=>d.tx).strength(1)).force('y',d3.forceY(d=>d.ty).strength(.35)).force('c',d3.forceCollide(d=>d.r+1)).stop().tick(200);
    const tip=d3.select('#tl-tip');
    svg.append('g').selectAll('circle').data(nodes).join('circle').attr('cx',d=>d.x).attr('cy',d=>Math.min(H-m.b-d.r,d.y)).attr('r',d=>d.r).attr('fill',d=>d.init==='You'?P.gold:d.init==='Them'?P.blue:P.grey).attr('fill-opacity',.85).attr('stroke','#fff').attr('stroke-width',1.5)
     .on('mousemove',(e,d)=>{const b=$('tl-svg').closest('.card').getBoundingClientRect();tip.style('opacity',1).style('left',(e.clientX-b.left+12)+'px').style('top',(e.clientY-b.top+12)+'px').html(`<b>Person #${String(d.id).padStart(2,'0')}</b><br>Connected ${fmtDay(d.date)} · ${d.init==='You'?'you asked':d.init==='Them'?'they asked':'initiator unknown'}<br>${d.mine} from you, ${d.theirs} from them`)})
     .on('mouseleave',()=>tip.style('opacity',0));
    lazy('m-s-time',()=>{
      const by={};D.forEach(d=>{(by[d.date.slice(0,7)]=by[d.date.slice(0,7)]||[]).push(d)});
      $('tl-list').innerHTML=Object.keys(by).sort().reverse().map(k=>`<div class="mo"><span>${monthLabel(k,{month:'long',year:'numeric'})}</span><span>${by[k].length} connected</span></div><div class="lr h"><span>Date</span><span>Person</span><span>Asked</span><span>Messages since</span><span>Last</span></div>`+by[k].map(d=>`<div class="lr"><span>${fmtDay(d.date)}</span><span><b>#${String(d.id).padStart(2,'0')}</b><small>${esc(d.ind.replace('Unclassified','Other / unclassified'))}</small></span><span><span class="pill ${d.init==='You'?'p-lead':'p-intro'}">${d.init==='You'?'You':d.init==='Them'?'Them':'?'}</span></span><span style="font-weight:${d.total?800:600};opacity:${d.total?1:.55}">${d.total?`${d.total} (${d.mine} you, ${d.theirs} them)`:'None'}</span><span>${d.last?fmtDay(d.last):'—'}</span></div>`).join('')).join('');
    });
  };
  return {html,init};
}

/* ===== career stages ===== */
function s10(r,num){
  const fast=r.eras.reduce((a,e)=>e.perYear>a.perYear?e:a),last=r.eras[r.eras.length-1];
  const html=sec({id:'s-layers',num,title:'Your career, stage by stage',sub:r.hasPositions?'Every connection grouped by the year you made it and the job you held at the time.':'Every connection grouped by the year you made it. (No Positions.csv was found, so stages are grouped by years instead of jobs.)',
   cards:[['a',r.total.toLocaleString(),'connections today'],['c',r.peakCount,`in your biggest year, ${r.peakYear}`],['b',Math.round(fast.perYear)+'/yr',`pace in your fastest stage: ${esc(fast.name)}`]],
   hero:card('Network size over time, by career stage',`<div class="lg" id="lay-lg" style="margin:0 0 12px"></div><canvas id="lay-area" height="150"></canvas>`,'Each band is the running total of connections made during that stage. A band stops growing the day the next job begins.'),
   more:`<div class="two"><div class="card"><h3>New connections per year</h3><canvas id="lay-bars" height="230"></canvas></div><div class="card"><h3>Pace: new connections per year in each stage</h3><canvas id="lay-pace" height="230"></canvas></div></div><div class="eras" id="lay-eras" style="margin-top:18px"></div>`,
   take:`Your busiest year was ${r.peakYear}, with ${r.peakCount} new connections. The fastest-growing stage was ${esc(fast.name)} at about ${Math.round(fast.perYear)} a year${last&&last!==fast?`, compared with ${Math.round(last.perYear)} a year in your most recent stage`:''}.`,
   src:`Sources: Connections.csv${r.hasPositions?', Positions.csv':''}. A connection date is when you connected on LinkedIn, not when you met. Only current connections are included, so people who later disconnected are missing and older periods are understated.`});
  const init=()=>{
    const P=C();const EC=P.cat.concat(P.cat);
    $('lay-lg').innerHTML=r.eras.map((e,i)=>`<span><i class="sq" style="background:${EC[i]}"></i>${esc(e.name)}</span>`).join('');
    const ds=(arr,fill)=>r.eras.map((e,i)=>({label:e.name,data:arr[i],backgroundColor:EC[i],borderColor:EC[i],borderWidth:fill?1:0,fill:fill,pointRadius:0,tension:.25}));
    chart('lay-area',{type:'line',data:{labels:r.years,datasets:ds(r.cum,true)},options:{interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{footer:items=>'Total: '+items.reduce((a,i)=>a+i.parsed.y,0)}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:11}},y:{stacked:true,title:{display:true,text:'Connections (running total)',font:fnt()},grid:{color:'#eee'}}}}});
    lazy('m-s-layers',()=>{
      chart('lay-bars',{type:'bar',data:{labels:r.years,datasets:ds(r.cnt,false)},options:{plugins:{legend:{display:false}},scales:{x:{stacked:true,grid:{display:false},ticks:{maxTicksLimit:11}},y:{stacked:true,grid:{color:'#eee'}}}}});
      chart('lay-pace',{type:'bar',data:{labels:r.eras.map(e=>wrap(e.name,18)),datasets:[{data:r.eras.map(e=>e.perYear),backgroundColor:EC.slice(0,r.eras.length),borderWidth:0}]},options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x+' per year'}}},scales:{x:{grid:{color:'#eee'}},y:{grid:{display:false},ticks:{autoSkip:false,font:fnt(600,10)}}}}});
      const fm=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',year:'numeric',timeZone:'UTC'});
      $('lay-eras').innerHTML=r.eras.map((e,i)=>`<div class="e" style="--c:${EC[i]}"><h4>${esc(e.name)}</h4><div class="d">${fm(e.start)} – ${fm(e.end)}${e.sub?' · '+esc(e.sub):''}</div><b>${e.n}</b><small>connections · ${e.perYear}/yr</small></div>`).join('');
    });
  };
  return {html,init};
}


/* ===== mirror: what LinkedIn thinks vs. what you do ===== */
function sm(r,num){
  const chips=(arr,cls)=>arr.map(x=>`<span class="chip ${cls||''}">${esc(x)}</span>`).join('');
  const band=r.fit>=70?'LinkedIn knows you well':r.fit>=40?'LinkedIn knows part of you':'LinkedIn is mostly guessing';
  const diag=r.accuracy<50&&r.coverage>=70?'It has most of what you say about yourself, but pads your profile with guesses that aren’t you.':r.accuracy>=60&&r.coverage<50?'Its guesses are on target, but it’s missing the topics you care about most.':r.accuracy<50&&r.coverage<50?'It misses much of what you do and adds guesses that aren’t you.':r.accuracy<50?'It catches some of what you do, but adds guesses that aren\u2019t you.':'Its picture of you is broadly on target.';
  const matched=r.echoedSample.slice(0,8).map(e=>e.tag),none=r.noTrace.slice(0,10);
  const hero=`<div class="card"><h3>How well does LinkedIn know you?</h3>
   <div class="fit">
    <div class="fit-score"><div class="ring" style="--p:${r.fit}"><b>${r.fit}</b></div><div class="fit-band">${band}</div><small>Fit score, out of 100</small></div>
    <div class="fit-meters">
     <div class="meter-row"><div class="meter-h"><b>Accuracy</b><span>${r.accuracy}%</span></div><div class="meter"><i style="width:${r.accuracy}%"></i></div><small>Share of LinkedIn’s ${r.nTags} guesses that match what you list, write or follow.</small></div>
     <div class="meter-row"><div class="meter-h"><b>Coverage</b><span>${r.coverage}%</span></div><div class="meter"><i style="width:${r.coverage}%"></i></div><small>Share of your ${r.topTerms} most-used topic words that LinkedIn has on file.</small></div>
     <p class="fit-note">${diag}</p>
    </div>
   </div>
   <div class="mirror">
    <div class="mcol"><h4>What LinkedIn thinks</h4>
      <div class="ml">Matches your own words</div><div class="chips">${chips(matched,'g')}</div>
      <div class="ml">No trace in what you do</div><div class="chips">${chips(none,'s')}</div></div>
    <div class="mcol"><h4>What you show</h4>
      <div class="ml">Words LinkedIn has</div><div class="chips">${chips(r.topList.filter(t=>t.known).map(t=>t.term),'g')}</div>
      <div class="ml">Words LinkedIn is missing</div><div class="chips">${r.unknown.length?chips(r.unknown.map(u=>u.term),'miss'):'<span class="note">None of your top words are missing.</span>'}</div></div>
   </div>
   <p class="note">Fit score balances accuracy and coverage, so it is high only when LinkedIn is both right and complete. Filled chips are matches, dashed chips have no trace, and gold chips are missing from LinkedIn’s file.</p></div>`;
  const html=sec({id:'s-mirror',num,title:'What LinkedIn thinks you care about',sub:'LinkedIn’s interest tags for you, tested against your own skills, job titles, posts and follows, and the other way around.',
   cards:[['a',r.fit,'fit score out of 100: how well LinkedIn’s picture matches yours'],['c',r.accuracy+'%',`accuracy: LinkedIn’s ${r.nTags} guesses that match you`],['d',r.coverage+'%','coverage: your top topic words that LinkedIn has']],
   hero,
   more:`<div class="two"><div class="card"><h3>Every interest with no trace</h3><div class="chips">${chips(r.noTrace,'s')}</div>${r.noTraceN>r.noTrace.length?`<p class="note">Showing ${r.noTrace.length} of ${r.noTraceN}.</p>`:''}</div><div class="card"><h3>Where the matches come from</h3><div class="chips">${r.echoedSample.map(e=>`<span class="chip">${esc(e.tag)} <i style="opacity:.6">· ${esc(e.src.replace('your ','').replace('organizations you follow','follows'))}</i></span>`).join('')}</div></div></div>
   <div class="card" style="margin-top:18px"><h3>LinkedIn’s official guesses about you</h3><div class="chips">${r.inferences.map(i=>`<span class="chip">${esc(i.type)}: ${esc(i.value)}</span>`).join('')}</div>${r.segments.length?`<p class="note">Audience segments you are sold as: ${r.segments.map(esc).join(', ')}.</p>`:''}</div>`,
   take:`LinkedIn’s picture of you scores ${r.fit} out of 100 (${band.replace('LinkedIn is ','').replace('LinkedIn ','')}). Its accuracy is ${r.accuracy}%: of the ${r.nTags} interests it assigns you, ${r.echoed} show up in your own skills, titles, posts or follows. Its coverage is ${r.coverage}%: it has ${r.topTerms-r.unknownN} of your ${r.topTerms} most-used topic words${r.unknownN?`, missing ${r.unknown.slice(0,2).map(u=>'“'+esc(u.term)+'”').join(' and ')}`:''}. ${diag} Your profile’s words are how people find you in search, so they are worth getting right.`,
   src:`Sources: Ad_Targeting.csv and Inferences_about_you.csv, compared with Skills.csv, Positions.csv, Profile.csv, your posts and comments, and Company Follows.csv. Your own posts and comments are read on this computer to count words; no sentences are shown. Word matching is approximate, so treat the score as a rough guide.`});
  const init=()=>{lazy('m-s-mirror',()=>{})};
  return {html,init};
}

/* ===== follows ===== */
function sf(r,num){
  const html=sec({id:'s-fol',num,title:'Who you follow',sub:`${r.total} organizations followed since ${new Date(r.first+'T12:00:00Z').getUTCFullYear()}, and how many of them you already have a way into.`,
   cards:[['a',r.total,'organizations followed'],['b',r.last12,'followed in the last 12 months'],['d',r.connPct+'%',`have at least one of your connections working there (${r.withConn} of ${r.total})`]],
   hero:card('When you followed',`<canvas id="fol-yr" height="130"></canvas>`,r.bigDay?`Your biggest day: ${fmtDay(r.bigDay.date)}, when you followed ${r.bigDay.n} organizations at once.`:''),
   more:`<div class="two"><div class="card"><h3>Where you know the most people</h3><canvas id="fol-top" height="260"></canvas><p class="note">Connections whose current employer matches the organization&rsquo;s name. Names that overlap, such as a company and its learning arm, may count the same people.</p></div><div class="card"><h3>Followed, but no one you know there</h3><div class="chips" id="fol-none"></div><p class="note">${r.without} organizations${r.noConn.length<r.without?` (showing the ${r.noConn.length} most recent)`:''}. A ready-made list for introductions.</p></div></div>${r.people?`<div class="card" style="margin-top:18px"><h3>People you follow</h3><div class="chips"><span class="chip g">${fmt0(r.people.total)} in total</span><span class="chip">${fmt0(r.people.active)} active</span><span class="chip">${fmt0(r.people.unfollowed)} unfollowed</span><span class="chip">${fmt0(r.people.muted)} muted</span></div><p class="note">Counts only. The names are never read.</p></div>`:''}`,
   take:`You follow ${r.total} organizations and know someone at ${r.withConn} of them (${r.connPct}%). That leaves ${r.without} you care about enough to follow but have no personal route into${r.last12?`, and you added ${r.last12} of the follows in the last year`:''}. Following shows interest. One conversation with someone there turns it into a relationship.`,
   src:`Source: Company Follows.csv${r.people?' and Member_Follows.csv':''}, with Connections.csv for the overlap. Matching is by company name, so it is approximate. Grouping the organizations by theme needs judgment, so it is one of the starter-kit prompts.`});
  const init=()=>{
    const P=C();
    chart('fol-yr',{data:{labels:r.years,datasets:[{type:'bar',label:'Followed that year',data:r.perYear,backgroundColor:P.blue,yAxisID:'y'},{type:'line',label:'Running total',data:r.cum,borderColor:P.gold,backgroundColor:P.gold,borderWidth:3,pointRadius:3,tension:.25,yAxisID:'y2'}]},options:{plugins:{legend:{labels:{font:fnt(600)}}},scales:{x:{grid:{display:false}},y:{title:{display:true,text:'Followed that year',font:fnt()},grid:{color:'#eee'}},y2:{position:'right',title:{display:true,text:'Running total',font:fnt()},grid:{display:false}}}}});
    lazy('m-s-fol',()=>{
      chart('fol-top',{type:'bar',data:{labels:r.topConn.map(t=>wrap(t.name,22)),datasets:[{data:r.topConn.map(t=>t.n),backgroundColor:P.gold,borderWidth:0}]},options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.x+' connections'}}},scales:{x:{grid:{color:'#eee'}},y:{grid:{display:false},ticks:{autoSkip:false,font:fnt(600,11)}}}}});
      $('fol-none').innerHTML=r.noConn.map(n=>`<span class="chip">${esc(n)}</span>`).join('');
    });
  };
  return {html,init};
}
const fmt0=n=>Number(n).toLocaleString('en-US');

function destroyAll(){charts.forEach(c=>{try{c.destroy()}catch(e){}});charts.length=0;sims.forEach(s=>{try{s.stop()}catch(e){}});sims=[]}
function rerunLazy(){Object.keys(lazyReg).forEach(id=>{const r=lazyReg[id];r.done=false;const d=$(id);if(d&&d.open){r.done=true;r.fn()}})}
root.LDV.render={s01,s04,s06,s07,s08,s10,sf,sm,destroyAll,bindToggles,rerunLazy,lazyReg,setDefaults(){const P=C();Chart.defaults.font.family=P.font;Chart.defaults.color=P.ink;Chart.defaults.layout.padding={left:14,right:10,top:4,bottom:2}}};
})();
