(function(){
const root=window;root.LDV=root.LDV||{};
const fmt=n=>Number(n).toLocaleString('en-US');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Rule-based recommendations. Each rule looks at the section results and returns a card with a score, or null. */
function rules(res){
  const out=[];
  const r7=res.s07,r6=res.s06,r4=res.s04,r1=res.s01;

  // 1. Wake up dormant ties
  if(r7){
    const d=r7.two[2]+r7.two[3];
    if(d>=3)out.push({id:'dormant',score:d>=10?90:60,title:'Wake up your dormant ties',
      why:`${fmt(d)} ${d===1?'person':'people'} you once had a conversation with have been quiet for a year or more.`,
      steps:['Pick 5 of them this week, starting with the ones you remember best.','Send a short, specific note: what reminded you of them, what you’ve been up to. No ask.','Repeat with 5 more next month.'],
      effort:'About 20 minutes a week',
      weak:'Dormant ties are weak ties with history. They know and trust you, but they now move in different circles, so they’re a rich source of fresh information with little awkwardness.'});
  }
  // 2. Say hello to new connections
  if(r7&&r7.newYear>=10&&r7.newYearNever/r7.newYear>=0.4){
    out.push({id:'hello',score:85,title:'Say hello to your new connections',
      why:`${fmt(r7.newYearNever)} of the ${fmt(r7.newYear)} people you connected with in the last year have never exchanged a message with you.`,
      steps:['Message 3 new connections this week, ideally within a few days of connecting.','Mention why you accepted or what you have in common, and ask one easy question.','Skip pitches. A line of context beats a paragraph.'],
      effort:'About 10 minutes, twice a week',
      weak:'Every new connection starts as a weak tie. A short hello is what turns an acquaintance into someone who thinks of you.'});
  }
  // 3. Initiate more
  if(r6&&r6.inAll[0]>=20){
    const inn=r6.inAll[0],outn=r6.outAll[0],ratio=outn?inn/outn:inn;
    if(ratio>=6){
      const rate=outn?Math.round(100*r6.outAll[1]/outn):null;
      out.push({id:'initiate',score:rate!=null&&rate>=50?80:65,title:'Reach out first, on purpose',
        why:`${fmt(inn)} people asked to connect with you in six months, and you asked ${fmt(outn)}.${rate!=null?` ${rate}% of your own requests were accepted.`:''}`,
        steps:['Each month, send 3 personalized requests to people you admire but don’t know yet.','Aim outside your usual circle: a different employer, industry or country.','Add a one-line note saying why you want to connect.'],
        effort:'About 15 minutes a month',
        weak:'Choosing who to connect with, instead of only accepting, is how you build weak ties that reach beyond your current circle.'});
    }
  }
  // 4. Posting
  if(r4){
    const p12=r4.posts.slice(-12).reduce((a,b)=>a+b,0);
    const a=r4.postMonths.mean,b=r4.noPostMonths.mean;
    if(a>=1.3*b&&b>0)out.push({id:'post',score:p12<=6?75:50,title:'Post a little more consistently',
      why:`In months when you post you add ${a.toFixed(1)} new connections, against ${b.toFixed(1)} in other months. You posted ${p12} time${p12===1?'':'s'} in the last 12 months.`,
      steps:['Aim for one post a month for three months.','Share something you learned or a small win, not an announcement.','Count your new connections after three months and compare.'],
      effort:'About an hour a month',
      weak:'A post reaches the weak ties who never message you. That quiet audience is where much of its value comes from.'});
    else out.push({id:'posttest',score:55,title:'Test whether posting helps you',
      why:`Your history shows only a weak link between posting and growth (r = ${r4.win.r.toFixed(2)}), and you posted ${p12} time${p12===1?'':'s'} in the last 12 months.`,
      steps:['Post once a month for three months, on a topic you actually know.','Note new connections and replies each month.','Keep going only if you see a difference.'],
      effort:'About an hour a month',
      weak:'Posts are one of the few ways to be seen by weak ties without writing to each of them.'});
  }
  // 5. Diversify
  if(r1&&r1.top&&r1.top.length>=4){
    const tot=r1.top.reduce((a,t)=>a+t.count,0),t3=r1.top.slice(0,3).reduce((a,t)=>a+t.count,0),share=Math.round(100*t3/tot);
    if(share>=55)out.push({id:'diversify',score:60,title:'Build a bridge to a new cluster',
      why:`${share}% of your classified connections sit in just three industries: ${r1.top.slice(0,3).map(t=>esc(t.name)).join(', ')}.`,
      steps:['Pick one industry or role outside those three that you’re curious about.','Connect with 5 people there and follow 3 organizations.','Look for people who work between your world and theirs.'],
      effort:'About an hour in total',
      weak:'New ideas travel across the gaps between groups. People who bridge two clusters give you information your own circle does not have.'});
  }
  // 6. Accept faster
  if(r6&&r6.lag.n>=10&&r6.lag.later/r6.lag.n>=0.35){
    out.push({id:'accept',score:55,title:'Answer connection requests weekly',
      why:`${r6.lag.later} of the ${r6.lag.n} requests you accepted waited more than two weeks (median wait ${r6.lag.median} days).`,
      steps:['Set one weekly 10-minute slot for new requests.','Accept the ones that fit, let the rest go, and send a one-line reply to the best few.'],
      effort:'About 10 minutes a week',
      weak:'Accepting promptly is the first moment a weak tie forms. A quick yes with a short note starts the relationship warm.'});
  }
  // 6b. Turn follows into introductions
  if(res.sf&&res.sf.without>=10){
    out.push({id:'followwarm',score:70,title:'Turn your follows into introductions',
      why:`You follow ${fmt(res.sf.without)} organizations where you don\u2019t yet know anyone.`,
      steps:['Pick the 3 that matter most to you.','Find one person at each, ideally through a mutual connection, and send a short, curious note.','Ask for 15 minutes of their time, not for a job.'],
      effort:'About 30 minutes a month',
      weak:'Following shows you care about an organization. One conversation with someone there turns that interest into a real tie, and it is a tie outside your usual circle.'});
  }
  // 6c. Teach LinkedIn what you care about
  if(res.sm&&(res.sm.accuracy<=40||res.sm.unknownN>=2)){
    const m=res.sm;
    out.push({id:'keywords',score:68,title:'Teach LinkedIn what you care about',
      why:`${100-m.echoPct}% of the ${fmt(m.nTags)} interests LinkedIn assigns you show no trace in your skills, titles, posts or follows${m.unknownN?`, and ${m.unknownN} of your own most-used topic words (like ${m.unknown.slice(0,2).map(u=>'\u201C'+esc(u.term)+'\u201D').join(' and ')}) are missing from what it has on file`:''}.`,
      steps:['Work your missing topic words into your headline, About section and skills.','Review the interests LinkedIn has assigned you in its privacy and advertising settings, and remove the ones that aren\u2019t you.','Follow and post about the topics you want to be known for.'],
      effort:'About 30 minutes',
      weak:'Keywords decide who finds you. Recruiters and distant contacts reach you through search, so the words on your profile are how weak ties discover you.'});
  }
  // 7. Keep the core warm
  if(r7&&r7.pyramid[4]<=40){
    out.push({id:'core',score:40,title:'Keep your close circle warm',
      why:`${fmt(r7.pyramid[4])} ${r7.pyramid[4]===1?'person is':'people are'} in your active circle (conversations in the last 90 days).`,
      steps:['Name the 10 people who matter most to you this year.','Put a recurring monthly coffee or call on the calendar with 3 of them.'],
      effort:'About an hour a month',
      weak:'Close ties give support and trust, and weak ties give reach. You need both, so don’t let the core go quiet.'});
  }
  return out.sort((a,b)=>b.score-a.score);
}

function tiers(res){
  const r=res.s07;if(!r)return null;
  const p=r.pyramid,total=p[0],close=p[3],dormant=Math.max(0,p[2]-p[3]),weak=Math.max(0,total-p[2]);
  return {total,close,dormant,weak,n:[close,dormant,weak]};
}

function build(res){
  const all=rules(res);
  return {picks:all.slice(0,3),more:all.slice(3),tiers:tiers(res)};
}
function recHtml(r,i){
  return `<div class="rec"><div class="rec-n">${i}</div><div class="rec-b">
   <h3>${r.title}</h3>
   <p class="rec-why"><b>Your data:</b> ${r.why}</p>
   <ol>${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   <div class="rec-meta"><span class="chip g">${r.effort}</span></div>
   <p class="rec-weak"><span class="wkb">Weak ties</span> ${r.weak}</p></div></div>`;
}
function section(num,data,opts){
  opts=opts||{};
  const t=data.tiers;
  const strip=t?`<div class="wk-strip">
    <div class="wk-bar"><i style="flex:${Math.max(t.close,1)};background:var(--blue)"></i><i style="flex:${Math.max(t.dormant,1)};background:var(--gold)"></i><i style="flex:${Math.max(t.weak,1)};background:var(--soft2,var(--beige))"></i></div>
    <div class="wk-legend"><div><b>${fmt(t.close)}</b><span>Close ties</span><small>conversations in the last year</small></div><div><b>${fmt(t.dormant)}</b><span>Dormant ties</span><small>you had a conversation, but not lately</small></div><div><b>${fmt(t.weak)}</b><span>Weak ties</span><small>connected, with little or no conversation</small></div></div></div>`:'';
  const aiLink=opts.report?`<div class="rec-ai"><b>Want a plan with names?</b> The Network Atlas app has a starter kit with private prompts that build your reconnection list, a weak-ties map and drafts of hello messages. <a href="#s-ai">About the starter kit</a></div>`:`<div class="rec-ai"><b>Want a plan with names?</b> The starter kit in the next section includes private prompts that build your reconnection list, a weak-ties map and drafts of hello messages. They need an AI assistant, so read the privacy note there first. <a href="#s-ai">Go to the starter kit</a></div>`;
  return `<section class="sec rc" id="s-recs"><div class="sh"><span class="num">${num}</span><div><h2>${data.picks.length===1?'One move':'Three moves'} to strengthen your network</h2><p class="sub">Picked from your own numbers above. Each one is built around weak ties: the acquaintances and old contacts who connect you to people and information you don’t already have.</p></div></div>
   <div class="wk-box"><h3>Why weak ties?</h3><p>In 1973 the sociologist Mark Granovetter found that people more often hear about jobs and ideas from acquaintances than from close friends, because close friends know the same things you do. A 2022 experiment on about 20 million LinkedIn users reached a similar answer: moderately weak ties, neither the closest nor the most distant, were the most helpful for finding jobs.</p>${strip}</div>
   <div class="recs">${data.picks.map((r,i)=>recHtml(r,i+1)).join('')}</div>
   ${data.more.length?`<details class="more" id="m-s-recs"><summary>More ideas</summary><div class="mb"><div class="recs">${data.more.map((r,i)=>recHtml(r,data.picks.length+i+1)).join('')}</div></div></details>`:''}
   ${aiLink}
   <p class="src">These suggestions come from simple rules applied to your numbers. They are ideas worth trying, not predictions. Weak-tie research: Granovetter, <i>The Strength of Weak Ties</i> (1973); Rajkumar et al., <i>A causal test of the strength of weak ties</i>, Science (2022).</p></section>`;
}
root.LDV.recs={build,section};
})();
