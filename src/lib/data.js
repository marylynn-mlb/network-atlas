(function(){
const root=typeof globalThis!=='undefined'?globalThis:window;root.LDV=root.LDV||{};
const csv=root.LDV.csv;
const MON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const DAY=864e5;
function norm(u){u=(u||'').trim().toLowerCase().split('?')[0].replace(/\/+$/,'');return u.replace('http://','https://').replace('://linkedin.com','://www.linkedin.com')}
function parseConnDate(s){const m=/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(s||'');if(!m)return null;const mon=MON.indexOf(m[2].toLowerCase());if(mon<0)return null;return new Date(Date.UTC(+m[3],mon,+m[1],12))}
function parseInvDate(s){const m=/(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(s||'');if(m){let y=+m[3];if(y<100)y+=2000;let h=+m[4];const ap=(m[6]||'').toUpperCase();if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;return new Date(Date.UTC(y,+m[1]-1,+m[2],h,+m[5]))}const d=new Date(s);return isNaN(d)?null:d}
function parseIso(s){if(!s)return null;let t=s.trim().replace(/ UTC$/,'Z').replace(' ','T');if(!/Z$|[+-]\d\d:?\d\d$/.test(t))t+='Z';const d=new Date(t);return isNaN(d)?null:d}
function parseMonYear(s){const m=/([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(s||'');if(!m)return null;const mon=MON.indexOf(m[1].toLowerCase());if(mon<0)return null;return new Date(Date.UTC(+m[2],mon,1,12))}
function parseFollowDate(s){const m=/([A-Za-z]{3})\s+(\d{1,2})\s+(\d\d):(\d\d):(\d\d)\s+\w+\s+(\d{4})/.exec(s||'');if(!m)return null;const mon=MON.indexOf(m[1].toLowerCase());if(mon<0)return null;return new Date(Date.UTC(+m[6],mon,+m[2],+m[3],+m[4],+m[5]))}
function pick(files,rx){const k=Object.keys(files).find(n=>rx.test(n));return k?files[k]:null}
function table(files,rx,header){const t=pick(files,rx);return t==null?null:csv.toObjects(csv.parseCSV(t),header)}
function build(files,opts){
  opts=opts||{};
  const out={found:{}};
  const cr=table(files,/^connections\.csv$/i,'First Name');
  out.found.connections=!!cr;
  out.connections=(cr||[]).map(r=>({first:r['First Name'],last:r['Last Name'],url:norm(r['URL']),company:(r['Company']||'').trim(),position:(r['Position']||'').trim(),date:parseConnDate(r['Connected On'])})).filter(c=>c.date);
  const ir=table(files,/^invitations\.csv$/i);
  out.found.invitations=!!ir;
  out.invitations=(ir||[]).map(r=>({dir:(r['Direction']||'').toUpperCase(),date:parseInvDate(r['Sent At']),from:norm(r['inviterProfileUrl']),to:norm(r['inviteeProfileUrl'])})).filter(i=>i.date&&(i.dir==='INCOMING'||i.dir==='OUTGOING'));
  const mr=table(files,/^messages\.csv$/i);
  out.found.messages=!!mr;
  out.messages=(mr||[]).map(r=>({conv:r['CONVERSATION ID'],date:parseIso(r['DATE']),from:norm(r['SENDER PROFILE URL']),to:(r['RECIPIENT PROFILE URLS']||'').split(',').map(norm).filter(Boolean),folder:r['FOLDER']})).filter(m=>m.date);
  const shareKeys=Object.keys(files).filter(n=>/^shares(_\d+)?\.csv$/i.test(n));
  out.found.shares=shareKeys.length>0;
  out.shares=[];
  shareKeys.forEach(k=>csv.toObjects(csv.parseCSV(files[k])).forEach(r=>{const d=parseIso(r['Date']);if(d)out.shares.push({date:d,text:r['ShareCommentary']||''})}));
  const pr=table(files,/^positions\.csv$/i);
  out.found.positions=!!pr;
  out.positions=(pr||[]).map(r=>({company:(r['Company Name']||'').trim(),title:(r['Title']||'').trim(),start:parseMonYear(r['Started On']),end:parseMonYear(r['Finished On'])})).filter(p=>p.company);
  const cKeys=Object.keys(files).filter(n=>/^comments(_\d+)?\.csv$/i.test(n));
  out.comments=[];cKeys.forEach(k=>csv.toObjects(csv.parseCSV(files[k])).forEach(r=>{if(r['Message'])out.comments.push(r['Message'])}));
  const sk=table(files,/^skills\.csv$/i);out.skills=(sk||[]).map(r=>(r['Name']||'').trim()).filter(Boolean);
  const pf=table(files,/^profile\.csv$/i);const p0=(pf&&pf[0])||{};
  out.profile={first:(p0['First Name']||'').trim(),last:(p0['Last Name']||'').trim(),headline:(p0['Headline']||'').trim(),summary:(p0['Summary']||'').trim(),industry:(p0['Industry']||'').trim()};
  const adr=table(files,/^ad_targeting\.csv$/i);const a0=(adr&&adr[0])||null;
  const L=k=>a0?(a0[k]||'').split(';').map(s=>s.trim()).filter(Boolean):[];
  out.found.ad=!!a0;
  out.ad=a0?{interests:L('Member Interests'),skills:L('Member Skills'),titles:L('Job Titles'),industries:L('Company Industries'),segments:L('Standard Audience Segments'),highValue:L('High Value Audience Segments'),traits:L('Member Traits'),buyer:L('Buyer Groups'),groups:L('Member Groups')}:null;
  const inf=table(files,/^inferences_about_you\.csv$/i);out.inferences=(inf||[]).map(r=>({category:(r['Category']||'').trim(),type:(r['Type of inference']||'').trim(),value:(r['Inference']||'').trim()})).filter(r=>r.type);
  const fr=table(files,/^company[ _]follows\.csv$/i);
  out.found.follows=!!fr;
  out.follows=(fr||[]).map(r=>({org:(r['Organization']||'').trim(),date:parseFollowDate(r['Followed On'])})).filter(f=>f.org&&f.date);
  const mfKeys=Object.keys(files).filter(n=>/^member_follows(_\d+)?\.csv$/i.test(n));
  out.found.memberFollows=mfKeys.length>0;
  out.memberFollows=[];
  mfKeys.forEach(k=>csv.toObjects(csv.parseCSV(files[k])).forEach(r=>{const d=parseIso(r['Date']);out.memberFollows.push({date:d,status:(r['Status']||'').trim().toLowerCase()})}));
  // Who am I? The profile URL that sends the most messages, else the most common invitation party.
  const cnt={};out.messages.forEach(m=>{if(m.from)cnt[m.from]=(cnt[m.from]||0)+1});
  let me=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
  if(!me){const c2={};out.invitations.forEach(i=>{const k=i.dir==='INCOMING'?i.to:i.from;if(k)c2[k]=(c2[k]||0)+1});me=Object.keys(c2).sort((a,b)=>c2[b]-c2[a])[0]}
  out.me=me||'';
  // "Today" = the latest date anywhere in the export (unless overridden).
  let now=0;[out.connections,out.invitations,out.messages,out.shares,out.follows].forEach(a=>a.forEach(x=>{if(x.date&&+x.date>now)now=+x.date}));
  out.now=opts.now||new Date(now||Date.now());
  return out;
}
root.LDV.data={build,norm,DAY};
})();
