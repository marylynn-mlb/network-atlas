(function(){
// Snapshot of the untouched page, used later to build a standalone copy of the report.
const LICENSE_NOTE='<!-- Network Atlas. Copyright 2026 Mary-Lynn Bragg (https://www.linkedin.com/in/marylynn). Licensed under the PolyForm Noncommercial License 1.0.0: https://polyformproject.org/licenses/noncommercial/1.0.0 . Free for noncommercial use with this notice kept. SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0 -->';
const PRISTINE='<!doctype html>\n'+LICENSE_NOTE+'\n'+document.documentElement.outerHTML;
const $=id=>document.getElementById(id);
const L=window.LDV,S=L.style,R=L.render;
const REPORT=window.__REPORT__||null;
let DATA=null,RES=null,NOTES=[],OV=null;
let CARD={layout:'B',headline:'auto'};try{Object.assign(CARD,JSON.parse(localStorage.getItem('ldv-card-v2')||'{}'))}catch(e){}
const MAP={s01:R.s01,s04:R.s04,s06:R.s06,s07:R.s07,s08:R.s08,s10:R.s10,sf:R.sf,sm:R.sm};

/* ---------- AI prompts and starter kit ---------- */
const PRELUDE_PRIVATE="\n\nThis is a private action list for my own use, so you may use names. Save it in a file whose name starts with PRIVATE-, put a note at the top saying it must not be shared or published, and do not send any of it anywhere.";
const PRELUDE="\n\nPrivacy rules: Keep the work on my computer. In your output, never include names, email addresses, phone numbers or message text of other people. Describe people by role, relationship or industry instead. Company names are fine.";
const PROMPTS=[
['inferences','LinkedIn’s inferences vs. your reality','See what LinkedIn thinks it knows about you, and where it is wrong.','Open Inferences_about_you.csv and Ad_Targeting.csv from my LinkedIn data export. What does LinkedIn think it knows about me? Check each official inference against my actual profile, Positions.csv and my real behavior. Then compare LinkedIn’s interest tags and audience segments with what I actually follow (Company Follows.csv) and write about (Shares.csv and Comments.csv): group everything into the same 6 to 9 themes and show the share of each source per theme. Finish with three lists: what LinkedIn gets right, what it misses, and what it can’t see. Build it as one self-contained HTML section with a grouped Chart.js bar chart, three headline cards and a short takeaway.'],
['lost-opportunities','Lost-opportunity messages','Find the messages that deserved a reply and how long they have waited.','Go through messages.csv and find unanswered messages that look like real opportunities: collaboration offers, meeting requests, warm introductions, podcast or speaking invitations. A thread is unanswered when the last message is from someone else. Prioritize threads where the sender followed up or a mutual connection made the introduction, and ignore job applicants, mass sales pitches and expert-network blasts. For each one show how long it has been waiting and one suggested next step. Describe each person by role and relationship, never by name. Output a ranked table with priority icons (!!, !, ·), a type tag and the wait time.'],
['follows','Who you actually follow','Cluster the companies you follow by theme.','Read Company Follows.csv and group the organizations I follow into 6 to 9 themes (for example EdTech, AI, Workforce, Higher Ed, Business, Big Employers). Assign each organization to exactly one theme based on what it actually does, put anything you can’t place confidently in an “Unclear” group, and show how many are in each cluster as a bar chart plus a cluster map. Tell me which themes are bigger than I would expect.'],
['inbox-quality','Inbox quality','How much of your inbound is genuine outreach versus pitches and spam?','Analyze the conversations other people started with me in messages.csv. Read the opening message of each and label it: genuine outreach, sales pitch, spam or mass message, recruiter, or job seeker. Show the percentages overall and per half-year as a 100% stacked bar chart with conversation counts, and call out any spikes and their cause.'],
['job-search','Your job-search signals','What your searches, saved jobs and settings say about where you are headed.','Look at SearchQueries.csv, Jobs/Saved Jobs.csv, SavedJobAlerts.csv and Jobs/Job Seeker Preferences.csv. Group my searches by month and type (job titles, organizations, people), find the phases of my job search, and compare what I save in recent months with what I saved earlier (by function and sector). Then compare my stated job preferences with what I actually do. Leave phone numbers and email addresses out of the output.'],
['targets','Are your targets in your network?','Count how many people you know at the companies you are chasing.','List the organizations I have saved jobs at or searched for, then count how many of my connections (Connections.csv, Company field) work at each. Show which targets have zero connections and which have someone I have actually messaged (messages.csv). Also count senior people in my network in the functions I am targeting. If I plan to share the result, replace company names with short descriptions.']
,['reactivation','Reconnection list','Who to wake up first, with an opening line for each.','Using Connections.csv and messages.csv, find the people I have exchanged messages with in both directions but not in the last year or more (dormant ties). Rank the 15 most worth reconnecting with, considering how substantial our past conversation was (number of messages), how relevant or senior their current role is, and how long it has been. For each, give their name, current role and company, when we last talked, what we talked about in one line (you may read the message text for this, locally), and a short, warm, specific opening message I could send. Output a checklist I can work through, 5 a week.',true]
,['weak-ties','Weak-ties map','The acquaintances most likely to bring you something new.','Find the 15 weak ties in my network most likely to give me new information or opportunities: connections I have rarely or never messaged, who work in a different industry or kind of company than most of my network, and who hold senior or well-connected roles. Explain in one line why each is a good bridge, and suggest one low-effort reason to reach out (a congratulation, a question, something shared). Group them by the gap they could help me cross.',true]
,['hello-drafts','Hello drafts for new connections','Short, warm notes for people you connected with but never spoke to.','List the connections I added in the last 90 days (Connections.csv) with whom I have exchanged no messages (messages.csv). For up to 15 of them, draft a two-sentence hello based on their company and role and on who asked whom (Invitations.csv). Keep the tone warm and low-pressure, with no sales pitch and no ask.',true]
,['posting-plan','Posting plan','Topics and a realistic rhythm, based on what you know and follow.','Look at my posts (Shares.csv) and the months with the most new connections (Connections.csv). Describe what I have posted about and when. Then, using my skills (Skills.csv), my positions (Positions.csv) and the organizations I follow (Company Follows.csv), suggest five post topics and a realistic three-month posting rhythm. Do not mention any other people.',false]

];

const prel=p=>p[4]?PRELUDE_PRIVATE:PRELUDE;
function claudeMd(){
  const st=S.get(),c=st.c;
  return `# Standing instructions for analyzing my LinkedIn export

This folder holds my LinkedIn data export (CSV files). I want visual analyses of it, each as a self-contained HTML file.

## Privacy rules (always)
- Keep the work on this computer. Do not upload files or send data to any outside service other than this assistant itself.
- Never include names, email addresses, phone numbers, profile URLs or message text of other people in any output. Describe people by role, relationship or industry. Company names are fine.
- If I say I plan to share a result, also describe companies in general terms (for example "a large CRM software company") instead of naming them.
- Before you finish, scan your output for personal names and remove any you find.
- Exception: a file whose name starts with PRIVATE- is a personal action list for my own use. It may name people, must say at the top that it is not to be shared, and must never be sent anywhere.

## Output format
- Save each analysis as one self-contained HTML file in an \`output/\` folder.
- Use Chart.js (https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js) for ordinary charts and D3.js (https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js) for network graphs.
- White page background. Body font: ${st.body}. Heading font: ${st.head}, bold. Load both from Google Fonts.
- Use only this palette: ink ${c.ink} for text, borders and dark tiles; accents ${c.gold}, ${c.red}, ${c.blue} and ${c.purple}; neutral ${c.grey}; soft background ${c.soft}.
- Layout: a title with a one-line subtitle, three headline number cards, one main visual, and a short takeaway. End with a one-line note on the source files and any caveats.
- Be honest about uncertainty. Say when something is a judgment call or rests on keyword rules.

## Data notes
- Connections.csv starts with a few lines of notes. The real header is the line that begins with "First Name".
- messages.csv: FROM and SENDER PROFILE URL identify the sender. I am the sender with the most messages.
- Dates come in several formats. Invitations.csv uses M/D/YY, h:mm AM/PM.
- Shares and Comments files may have a numeric suffix in the name (for example Shares_123456.csv).
`;
}
function startHere(){
  return `# Start here

You have a LinkedIn data export and an AI assistant that can read files on your computer (for example Claude Code). This kit gives the assistant standing instructions and ten analyses to run: six that dig deeper, and four that turn your results into an action plan.

## Set up
1. Unzip this kit into the folder that holds your LinkedIn export, so \`CLAUDE.md\` and \`prompts/\` sit next to files like Connections.csv.
2. Open your AI assistant inside that folder.
3. Tell it: "Read START-HERE.md and CLAUDE.md, then run analysis 1."

## The analyses
${PROMPTS.map((p,i)=>`${i+1}. **${p[1]}**${p[4]?' (PRIVATE)':''} (\`prompts/${String(i+1).padStart(2,'0')}-${p[0]}.md\`): ${p[2]}`).join('\n')}

The last four turn your results into a plan. The first three of those are marked PRIVATE: they name real people so you can act on them, so keep those files to yourself.

Run them one at a time and look at each result before moving on.

## Before you share anything
- Read the output for names, small employers that point to one person, or message details.
- Ask the assistant: "Scan this output for any personal names or details that could identify someone, and remove them."
- Your data is only as private as the tools you hand it to. Check your AI tool's data policy.

## Combine them
Each analysis comes out as its own HTML file in \`output/\`. Open them in a browser, or ask the assistant to merge them into one page in the same style.

Made with Network Atlas, built by Mary-Lynn Bragg (https://www.linkedin.com/in/marylynn) with Claude Code. Format adapted from "Visualize Your LinkedIn Data Export" by Logan Currie.
`;
}
async function downloadKit(){
  const z=new JSZip();
  z.file('START-HERE.md',startHere());z.file('CLAUDE.md',claudeMd());
  PROMPTS.forEach((p,i)=>z.file(`prompts/${String(i+1).padStart(2,'0')}-${p[0]}.md`,`# ${p[1]}${p[4]?' (private)':''}\n\n${p[3]}${prel(p)}\n\nSave the result as output/${p[4]?'PRIVATE-':''}${String(i+1).padStart(2,'0')}-${p[0]}.html\n`));
  save(await z.generateAsync({type:'blob'}),'linkedin-ai-starter-kit.zip');
}
function localDate(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function save(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function buildPrompts(){
  $('ai-grid').innerHTML=PROMPTS.map((p,i)=>`<div class="pl"><div class="pl-h"><div><b>${i+1}. ${p[1]}${p[4]?' <span class="tag">private</span>':''}</b><span>${p[2]}</span></div><button class="btn mini" data-i="${i}">Copy</button></div><details><summary>View prompt</summary><pre id="pr-${i}"></pre></details></div>`).join('');
  PROMPTS.forEach((p,i)=>{$('pr-'+i).textContent=p[3]+prel(p)});
  $('ai-grid').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const t=PROMPTS[+b.dataset.i][3]+prel(PROMPTS[+b.dataset.i]);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{b.textContent='Copied!'},()=>{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');b.textContent='Copied!'}catch(x){b.textContent='Copy failed'}ta.remove()});setTimeout(()=>b.textContent='Copy',1800)});
  if($('btn-kit'))$('btn-kit').onclick=downloadKit;
}

/* ---------- standalone report (.html) ---------- */
const SC_END='<'+'/script>';
async function buildReportHTML(){
  const rep={v:1,generated:new Date().toISOString().slice(0,10),overview:L.an.overview(DATA),missing:missingFiles(DATA),notes:NOTES,sections:RES.map(r=>({key:r.key,res:r.res}))};
  const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
  let html=PRISTINE;
  // Put the chart libraries inside the file so it works offline. Fall back to the CDN link if a download fails.
  const tags=[...html.matchAll(/<script src="(https:\/\/cdnjs[^"]+)"><\/script>/g)];
  for(const m of tags){
    if(/jszip/i.test(m[1])){html=html.replace(m[0],()=>'');continue}
    try{const r=await fetch(m[1]);if(!r.ok)throw 0;const t=await r.text();if(/<\/script/i.test(t))throw 0;html=html.replace(m[0],()=>'<script>'+t+SC_END)}catch(e){}
  }
  html=html.replace('<script id="src-lib-csv">',()=>'<script>window.__REPORT__='+json(rep)+';window.__STYLE__='+json(S.get())+';'+SC_END+'\n<script id="src-lib-csv">');
  html=html.replace(/<title>[^<]*<\/title>/,'<title>My LinkedIn data, visualized</title>').replace('<body>','<body class="report">');
  return html;
}
async function downloadReport(){
  const b=$('btn-save'),t=b.textContent;b.textContent='Building…';b.disabled=true;
  try{const html=await buildReportHTML();save(new Blob([html],{type:'text/html'}),'network-atlas-'+localDate()+'.html')}
  catch(e){alert('Could not build the report file: '+e.message)}
  b.textContent=t;b.disabled=false;
}

/* ---------- save a chart as an image ---------- */
function slug(s){return (s||'chart').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)}
function canvasPng(cv,name){
  const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(cv,0,0);
  o.toBlob(b=>save(b,name+'.png'));
}
function svgPng(svg,name){
  const vb=svg.viewBox.baseVal,w=vb.width,h=vb.height,cl=svg.cloneNode(true);
  const a=svg.querySelectorAll('text'),b=cl.querySelectorAll('text');
  a.forEach((t,i)=>{const cs=getComputedStyle(t);b[i].setAttribute('style',`font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};fill:${cs.fill}`)});
  cl.setAttribute('xmlns','http://www.w3.org/2000/svg');cl.setAttribute('width',w*2);cl.setAttribute('height',h*2);cl.removeAttribute('style');
  const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');bg.setAttribute('width',w);bg.setAttribute('height',h);bg.setAttribute('fill',getComputedStyle(svg).backgroundColor||'#fff');cl.insertBefore(bg,cl.firstChild);
  const img=new Image();img.onload=()=>{const o=document.createElement('canvas');o.width=w*2;o.height=h*2;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(img,0,0);o.toBlob(bb=>save(bb,name+'.png'))};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(cl));
}
function addImageButtons(){
  document.querySelectorAll('#results .card').forEach(card=>{
    if(card.querySelector('.png'))return;
    const cv=card.querySelector('canvas'),sv=card.querySelector('svg.net');
    if(!cv&&!sv)return;
    const btn=document.createElement('button');btn.className='png';btn.textContent='Save image';btn.title='Save this chart as a PNG image';card.classList.add('has-img');
    const h=card.querySelector('h3'),sec=card.closest('.sec');const name=(sec?sec.id.replace('s-',''):'chart')+'-'+slug(h?h.textContent:'');
    btn.onclick=()=>{if(sv)svgPng(sv,name);else canvasPng(cv,name)};
    card.appendChild(btn);
  });
}

/* ---------- reading files ---------- */
function status(msg,err){const el=$('status');if(el)el.innerHTML=msg?`<span class="${err?'err':''}">${msg}</span>`:''}
async function fromList(list,files){
  for(const f of list){
    if(/\.zip$/i.test(f.name)){const z=await JSZip.loadAsync(f);for(const name of Object.keys(z.files)){const e=z.files[name];if(e.dir||!/\.csv$/i.test(name))continue;files[name.split('/').pop()]=await e.async('string')}}
    else if(/\.csv$/i.test(f.name))files[f.name]=await f.text();
  }
}
function walk(entry,files){return new Promise(res=>{
  if(entry.isFile){entry.file(async f=>{if(/\.csv$/i.test(f.name))files[f.name]=await f.text();else if(/\.zip$/i.test(f.name))await fromList([f],files);res()},()=>res())}
  else if(entry.isDirectory){const rd=entry.createReader();const all=[];const next=()=>rd.readEntries(async es=>{if(!es.length){for(const e of all)await walk(e,files);res()}else{all.push(...es);next()}},()=>res());next()}
  else res()})}
async function handleDrop(dt){
  const files={};status('Reading your files…');
  const items=[...(dt.items||[])].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean);
  if(items.length){for(const e of items)await walk(e,files)}else await fromList([...dt.files],files);
  run(files);
}
async function handleList(list){const files={};status('Reading your files…');try{await fromList([...list],files);run(files)}catch(e){status('Could not read those files: '+e.message,true)}}

/* ---------- analysis + render ---------- */
function makeEnv(){return {report:!!REPORT}}
function compute(D){
  const A=L.an,out=[],notes=[];
  const add=(key,needs,r)=>{if(r)out.push({key,fn:MAP[key],res:r});else notes.push(needs)};
  add('s01','Network clusters needs Connections.csv with at least 20 connections.',A.sec01(D));
  add('s04',D.found.shares?'Posting vs. connections needs at least 5 posts in Shares.csv.':'Posting vs. connections needs Shares.csv (your posts).',A.sec04(D));
  add('s06','Inbound vs. outbound needs Invitations.csv.',A.sec06(D));
  add('s07','Relationship tiers need messages.csv and Connections.csv.',A.sec07(D));
  add('s08','The connection timeline needs at least 5 recent connections.',A.sec08(D));
  add('s10','Career stages need Connections.csv with at least 30 connections.',A.sec10(D));
  add('sf','Follows need Company Follows.csv with at least 5 organizations.',A.secFol(D));
  add('sm','The LinkedIn-vs-you comparison needs Ad_Targeting.csv from the full export.',A.secMirror(D));
  return {out,notes};
}
function missingFiles(D){return ['Messages','Invitations','Shares','Positions'].filter(k=>!D.found[k.toLowerCase()]).map(k=>k+'.csv')}
function showLoaded(ov,missing){
  $('loaded').style.display='';
  $('loaded').innerHTML=`${REPORT?'':'<div class="savebar"><b>Save your report before you leave.</b> Nothing on this page is stored: if you close it, refresh it or the app is updated, your results disappear. <button class="btn pri" id="btn-save2">Save report (.html)</button></div>'}<div class="box"><b>${REPORT?'Report':'Loaded'}</b><span>${ov.connections.toLocaleString()} connections</span><span>${ov.messages.toLocaleString()} messages</span><span>${ov.posts} posts</span><span>${ov.invitations} invitations</span><span>latest activity in export: ${ov.now}</span>${(missing.length||NOTES.length)?`<span class="miss">${missing.length?'Not found: '+missing.join(', ')+'. ':''}${NOTES.length?'Skipped: '+NOTES.join(' '):''}</span>`:''}</div>`;
}
function run(files){
  const names=Object.keys(files);
  if(!names.length){status('I did not find any CSV files in that. Try the .zip LinkedIn emailed you, or choose the unzipped folder.',true);return}
  const D=L.data.build(files);
  if(!D.found.connections){status('I could not find Connections.csv. Please drop the full export (the .zip or the unzipped folder).',true);return}
  DATA=D;OV=L.an.overview(D);const c=compute(D);RES=c.out;NOTES=c.notes;status('');
  renderAll();
  showLoaded(L.an.overview(D),missingFiles(D));
  $('btn-save').style.display='';
  setTimeout(()=>$('loaded').scrollIntoView({behavior:'smooth'}),50);
}
function renderAll(){
  if(!RES)return;
  const openIds=[...document.querySelectorAll('details.more[open]')].map(d=>d.id);
  R.destroyAll();R.setDefaults();
  const env=makeEnv();
  const built=RES.map((r,i)=>r.fn(r.res,'1.'+String(i+1).padStart(2,'0'),env));
  const band=(cls,kick,h,p)=>`<div class="part ${cls}"><div><small>${kick}</small><h2>${h}</h2><p>${p}</p></div></div>`;
  $('results').innerHTML=band('p1','Part one','Analysis','What your export says about your network, one question at a time.')+built.map(b=>b.html).join('');
  openIds.forEach(id=>{const d=$(id);if(d)d.open=true});
  built.forEach(b=>b.init());
  const rd=L.recs.build(resByKey());let rn=0;
  if(rd.picks.length||!REPORT){$('results').insertAdjacentHTML('beforeend',band('p2','Part two','Recommendations','What to do about it: moves picked from your own numbers, and a kit for going deeper with your own AI.'))}
  if(rd.picks.length){rn++;const holder=document.createElement('div');holder.innerHTML=L.recs.section('2.'+String(rn).padStart(2,'0'),rd,{report:!!REPORT});$('results').appendChild(holder.firstElementChild)}
  R.bindToggles();addImageButtons();renderCard();
  const secs=[...document.querySelectorAll('#results .sec')];
  const an=secs.filter(s=>!s.classList.contains('rc')),rec=secs.filter(s=>s.classList.contains('rc'));
  const link=(s,i,t)=>`<a class="nl" href="#${s}" title="${t}">${i}</a>`;
  $('nav-an').innerHTML='<span class="nlab">Analysis</span>'+an.map((s,i)=>link(s.id,'1.'+String(i+1).padStart(2,'0'),(s.querySelector('h2')||{}).textContent||'')).join('');
  let rl=rec.map((s,i)=>link(s.id,'2.'+String(i+1).padStart(2,'0'),'Recommendations')).join('');
  {const ai=$('s-ai');ai.style.display='';$('ai-num').textContent='2.'+String(rn+1).padStart(2,'0');rl+=link('s-ai','2.'+String(rn+1).padStart(2,'0'),'Go deeper with your own AI')}
  $('nav-rec').innerHTML=rl?'<span class="nlab">Recommendations</span>'+rl:'';
}


/* ---------- summary card ---------- */
function resByKey(){const o={};(RES||[]).forEach(r=>o[r.key]=r.res);return o}
let cardTok=0;
async function renderCard(){
  if(!RES||!OV)return;
  const sec=$('s-card');sec.style.display='';
  const res=resByKey(),f=L.cards.facts(res,OV),cands=L.cards.candidates(f);
  if(!$('card-layouts').childElementCount){$('card-layouts').innerHTML=L.cards.LAYOUTS.map(l=>`<button data-l="${l.id}" title="${l.desc}">${l.name}</button>`).join('')}
  document.querySelectorAll('#card-layouts button').forEach(b=>b.classList.toggle('on',b.dataset.l===CARD.layout));
  $('card-hl').innerHTML=cands.map(c=>`<option value="${c.id}" ${(CARD.headline===c.id)?'selected':''}>${c.label}</option>`).join('');
  const hid=cands.some(c=>c.id===CARD.headline)?CARD.headline:cands[0].id;
  $('card-hl-wrap').style.display=CARD.layout==='B'?'':'none';
  const tok=++cardTok;const lay=await L.cards.render($('card-cv'),CARD.layout,res,OV,{headline:hid});
  if(tok!==cardTok)return;
  $('card-note').textContent=`${lay.name}: ${lay.desc} Saved at ${lay.w}\u00D7${lay.h} pixels.`;
}
function wireCard(){
  $('card-layouts').addEventListener('click',e=>{const b=e.target.closest('button[data-l]');if(!b)return;CARD.layout=b.dataset.l;persistCard();renderCard()});
  $('card-hl').onchange=e=>{CARD.headline=e.target.value;persistCard();renderCard()};
  $('card-dl').onclick=()=>$('card-cv').toBlob(b=>save(b,'linkedin-summary-card-'+CARD.layout.toLowerCase()+'.png'));
}
function persistCard(){try{localStorage.setItem('ldv-card-v2',JSON.stringify(CARD))}catch(e){}}

/* ---------- style drawer ---------- */
let rt=null;const restyle=()=>{S.apply();clearTimeout(rt);rt=setTimeout(renderAll,120)};
function buildDrawer(){
  const st=S.get();
  $('d-pre').innerHTML=S.PRESETS.map(p=>`<button data-p="${p.id}" class="${st.preset===p.id?'on':''}">${p.name}<span class="sw">${['ink','gold','red','blue','purple'].map(k=>`<i style="background:${p.c[k]}"></i>`).join('')}</span></button>`).join('');
  $('d-cols').innerHTML=S.SLOTS.map(([k,n,d])=>`<label><input type="color" data-c="${k}" value="${st.c[k]}"><span>${n}<small>${d}</small></span></label>`).join('');
  const opt=sel=>S.FONTS.map(f=>`<option ${f.n===sel?'selected':''}>${f.n}</option>`).join('');
  $('d-head').innerHTML=opt(st.head);$('d-body').innerHTML=opt(st.body);
  $('d-hp').style.fontFamily='var(--font-head)';
}
function wireDrawer(){
  $('btn-style').onclick=()=>$('drawer').classList.toggle('open');$('d-close').onclick=()=>$('drawer').classList.remove('open');
  $('d-pre').onclick=e=>{const b=e.target.closest('button[data-p]');if(!b)return;S.setPreset(b.dataset.p);buildDrawer();restyle()};
  $('d-cols').addEventListener('input',e=>{const k=e.target.dataset.c;if(!k)return;S.setColor(k,e.target.value);document.querySelectorAll('#d-pre button').forEach(b=>b.classList.remove('on'));restyle()});
  $('d-head').onchange=e=>{S.setFont('head',e.target.value);restyle()};
  $('d-body').onchange=e=>{S.setFont('body',e.target.value);restyle()};
  $('d-reset').onclick=()=>{S.reset();buildDrawer();restyle()};
}

/* ---------- boot ---------- */
S.apply();buildDrawer();wireDrawer();wireCard();
$('btn-save').onclick=downloadReport;document.addEventListener('click',e=>{if(e.target.id==='btn-save2')downloadReport()});
if(REPORT){
  // Opened from a saved report: show the stored results, no upload step.
  document.title='My LinkedIn data, visualized';
  $('hero').innerHTML=`<span class="kick">LinkedIn data export</span><h1>My LinkedIn data, visualized</h1><p class="intro">Generated ${REPORT.generated} from a LinkedIn data export. Charts are interactive: hover for details, drag the network maps, and use <b>Colors &amp; fonts</b> to restyle the report. The AI starter kit is not included in this file; it lives in the <a href="https://marylynn-mlb.github.io/network-atlas/" target="_blank" rel="noopener">Network Atlas app</a>.</p><p class="priv"><b>Privacy.</b> This file holds only summary results: counts, categories and organization names. It contains no names of people and no message text.</p>`;
  RES=REPORT.sections.map(s=>({key:s.key,fn:MAP[s.key],res:s.res}));NOTES=REPORT.notes||[];OV=REPORT.overview;
  // The saved file keeps the AI section and prompt list, but the kit download itself stays in the app.
  buildPrompts();
  const kb=$('btn-kit');kb.outerHTML='<a class="btn pri" href="https://marylynn-mlb.github.io/network-atlas/" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block">Get the kit in the Network Atlas app</a>';
  document.querySelector('#s-ai .kit-main p').insertAdjacentHTML('beforeend',' The download itself lives in the app, not in this saved file. You can still copy any prompt below.');
  renderAll();showLoaded(REPORT.overview,REPORT.missing||[]);
}else{
  buildPrompts();
  $('btn-zip').onclick=()=>$('in-files').click();$('btn-folder').onclick=()=>$('in-folder').click();
  $('in-files').onchange=e=>handleList(e.target.files);$('in-folder').onchange=e=>handleList(e.target.files);
  $('btn-sample').onclick=()=>{status('');run(L.sample.files())};
  const dz=$('drop');
  ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('over')}));
  ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('over')}));
  dz.addEventListener('drop',e=>handleDrop(e.dataTransfer));
  window.addEventListener('dragover',e=>e.preventDefault());window.addEventListener('drop',e=>{if(!dz.contains(e.target)){e.preventDefault();handleDrop(e.dataTransfer)}});
  if(/[?&]sample/.test(location.search))run(L.sample.files());
}
window.LDVapp={run,buildReportHTML,downloadKit,claudeMd,startHere};
})();
