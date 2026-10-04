(function(){
const root=window;root.LDV=root.LDV||{};
const csv=()=>root.LDV.csv;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function files(){
  const R=rng(42),pick=a=>a[Math.floor(R()*a.length)],NOW=Date.UTC(2026,9,3);
  const DAY=864e5,MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cos=['Northwind Learning','Brightpath Education','Atlas University','Summit College','Harbor Software','Cloudline Systems','Nimbus Cloud','Quartz Analytics','Helio Health','Granite Bank','Meridian Capital','Lumen Publishing','Orchard Press','Foundry Media','Beacon Foundation','Civic Alliance','Compass Consulting','Pioneer Advisors','Northwind Learning','Brightpath Education','Harbor Software','Atlas University','Self-employed','Freelance','Lumen Publishing','Cloudline Systems','Summit College'];
  const pos=['Product Manager','Director of Partnerships','Software Engineer','Professor','Librarian','Account Executive','Founder','Head of Growth','Program Manager','Designer','Consultant','VP of Customer Success','Data Analyst','Recruiter','Marketing Director'];
  const me='https://www.linkedin.com/in/sample-user';
  // connections: denser in later years
  const conns=[];const N=430;
  for(let i=0;i<N;i++){const t=Math.pow(R(),0.65);const y0=Date.UTC(2008,0,1);const d=y0+t*(NOW-y0-DAY);conns.push({i,d:Math.floor(d/DAY)*DAY+12*36e5,co:pick(cos),pos:pick(pos),url:'https://www.linkedin.com/in/person-'+(1000+i)})}
  conns.sort((a,b)=>a.d-b.d);
  // bursts (conference weeks)
  conns.forEach(c=>{const dt=new Date(c.d);if(dt.getUTCFullYear()>=2022&&R()<.18){const moved=Date.UTC(dt.getUTCFullYear(),R()<.5?3:9,10+Math.floor(R()*6),12);if(moved<NOW-DAY)c.d=moved}});
  conns.sort((a,b)=>a.d-b.d);
  const fmtC=d=>{const x=new Date(d);return x.getUTCDate()+' '+MON[x.getUTCMonth()]+' '+x.getUTCFullYear()};
  const cRows=[['Notes:'],['"When exporting your connection data, you may notice that some of the email addresses are missing."'],[''],['First Name','Last Name','URL','Email Address','Company','Position','Connected On']].concat(conns.map((c,i)=>['Pat'+i,'Sample',c.url,'',c.co,c.pos,fmtC(c.d)]));
  // invitations for last ~10 months
  const inv=[['From','To','Sent At','Message','Direction','inviterProfileUrl','inviteeProfileUrl']];
  const fmtI=d=>{const x=new Date(d);let h=x.getUTCHours();const ap=h>=12?'PM':'AM';h=h%12||12;return (x.getUTCMonth()+1)+'/'+x.getUTCDate()+'/'+String(x.getUTCFullYear()).slice(2)+', '+h+':'+String(x.getUTCMinutes()).padStart(2,'0')+' '+ap};
  conns.filter(c=>c.d>NOW-300*DAY).forEach(c=>{const out=R()<.1;const sent=Math.min(NOW-DAY,c.d-Math.floor(R()*(out?2:14))*DAY-3*36e5);inv.push([out?'Sample User':'Pat Sample',out?'Pat Sample':'Sample User',fmtI(sent),'',out?'OUTGOING':'INCOMING',out?me:c.url,out?c.url:me])});
  for(let i=0;i<55;i++){const sent=NOW-Math.floor(R()*180)*DAY-5*36e5;inv.push(['Stranger'+i,'Sample User',fmtI(sent),'','INCOMING','https://www.linkedin.com/in/stranger-'+i,me])}
  // messages
  const msg=[['CONVERSATION ID','CONVERSATION TITLE','FROM','SENDER PROFILE URL','TO','RECIPIENT PROFILE URLS','DATE','SUBJECT','CONTENT','FOLDER','ATTACHMENTS']];
  const fmtM=d=>new Date(d).toISOString().slice(0,19).replace('T',' ')+' UTC';
  let cid=0;
  conns.forEach(c=>{const r=R();if(r>.28)return;cid++;const k='conv'+cid;const n=1+Math.floor(R()*5);const mutual=R()<.55;const start=c.d+Math.floor(R()*20)*DAY;const span=Math.floor(R()*400)*DAY;
    for(let j=0;j<n;j++){const t=Math.min(NOW-DAY,start+span*(j/Math.max(1,n-1)));const mine=mutual?(j%2===1):false;
      msg.push([k,'',mine?'Sample User':'Pat Sample',mine?me:c.url,mine?'Pat Sample':'Sample User',mine?c.url:me,fmtM(t),'','(text not used)','INBOX',''])}});
  for(let i=0;i<60;i++){cid++;const t=NOW-Math.floor(R()*900)*DAY;msg.push(['conv'+cid,'','Stranger'+i,'https://www.linkedin.com/in/stranger-'+i,'Sample User',me,fmtM(t),'','(text not used)','INBOX',''])}
  // shares
  const POSTS=['Excited to share what our team learned about helping working adults build new skills. Partnerships matter more than any single program.','Three lessons from a year of growth strategy: listen first, test small, and measure learning outcomes.','Proud of our customer success team for supporting universities through a hard semester. Great teams make hard work easier.','Reflecting on a decade in education technology. The best products start with a real conversation with a teacher.','Hiring for a partnerships role. If you care about workforce training and employer relationships, let us talk.'];
  const sh=[['Date','ShareLink','ShareCommentary','SharedUrl','MediaUrl','Visibility']];
  for(let i=0;i<34;i++){const y=2013+Math.floor(R()*14);const m=Math.floor(R()*12);const d=Date.UTC(y,m,1+Math.floor(R()*27),15);if(d<NOW-DAY)sh.push([fmtM(d).replace(' UTC',''),'',pick(POSTS),'','','MEMBER_NETWORK'])}
  // positions
  const P=[['Company Name','Title','Description','Location','Started On','Finished On'],['Orchard Press','Associate Editor','','','Jan 2009','Mar 2013'],['Harbor Software','Account Manager','','','Apr 2013','Aug 2017'],['Northwind Learning','Director of Partnerships','','','Sep 2017','Jun 2022'],['Brightpath Education','VP of Growth','','','Jul 2022','']];
  // follows
  const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const fmtF=d=>{const x=new Date(d);const p=n=>String(n).padStart(2,'0');return DN[x.getUTCDay()]+' '+MON[x.getUTCMonth()]+' '+p(x.getUTCDate())+' '+p(x.getUTCHours())+':'+p(x.getUTCMinutes())+':'+p(x.getUTCSeconds())+' UTC '+x.getUTCFullYear()};
  const orgs=['Northwind Learning','Brightpath Education','Atlas University','Summit College','Harbor Software','Cloudline Systems','Nimbus Cloud','Quartz Analytics','Helio Health','Granite Bank','Meridian Capital','Lumen Publishing','Orchard Press','Foundry Media','Beacon Foundation','Civic Alliance','Compass Consulting','Pioneer Advisors','Aster Robotics','Willow Labs','Tidewater Energy','Juniper Foods','Cobalt Mobility','Redwood Ventures','Sable Design','Fjord Analytics','Mosaic Health','Lantern Learning','Keystone Capital','Polar Cloud','Ember Media','Quill Press','Vantage Systems','Harvest Foundation','Bluebird Education','Ironwood Software','Delta Logistics','Sage Wellness','Aurora AI','Pebble Labs'];
  const fol=[['Organization','Followed On']];
  orgs.forEach((o,i)=>{const d=NOW-Math.floor(Math.pow(R(),1.8)*3000)*DAY;fol.push([o,fmtF(d)])});
  const mfol=[['Date','Status','FullName']];
  for(let i=0;i<30;i++){const st=R()<.7?'Active':R()<.6?'Unfollow':'Mute';mfol.push([fmtM(NOW-Math.floor(R()*1500)*DAY).replace(' UTC',''),st,'Person '+i])}
  const skills=[['Name'],['Partnerships'],['Customer Success'],['Growth Strategy'],['Educational Technology'],['Higher Education'],['Project Management'],['Business Development'],['Account Management'],['Workforce Development'],['Product Management'],['Strategic Planning'],['Training']];
  const profile=[['First Name','Last Name','Headline','Summary','Industry'],['Sample','User','Director of Partnerships | Education and workforce learning','I build partnerships between education providers and employers. I care about workforce training, customer success and helping working adults learn new skills.','Higher Education']];
  const ad=[['Member Interests','Member Skills','Job Titles','Company Industries','Standard Audience Segments','High Value Audience Segments','Member Traits','Buyer Groups'],[
    'Digital Marketing; Call Center Software; Corporate Finance; Market Research; E-Learning; Higher Education; Project Management; Customer Relationship Management; Cloud Management Software; Student Loans; Digital Banking; Advertising Strategies; Strategic Management; Human Resources Software; Content Strategy; Startups; Data Science; Video Conferencing Software; Remote Working; Sales Software; Education; Business Plan; Workplace Wellness; B2B Marketing',
    'Brand Strategy; Strategic Planning; Product Marketing; Customer Education; Partnership Development; Business Growth Strategies; Program Management; Educational Equity',
    'Operations Manager; Program Specialist; Head of Marketing; Director of Customer Success; Director of Growth',
    'Education; Technology, Information and Internet; Higher Education',
    'Tech Go to Market Leaders; Brand and Marketing Architects; Growth Drivers; Senior Education Influencers',
    'Senior Tech Decision Makers; Working Professionals','Mac; Career Changers','Marketing Software; Sales Software; Education Software']];
  const inf=[['Category','Type of inference','Description','Inference'],['Career inferences','Freelancer','Based on your profile.','true'],['Career inferences','Human resources professional','Based on your industry.','No'],['Inferred personal characteristics','Inferred gender','Based on your first name.','FEMALE'],['Job search inferences','Interested in a new job','Based on searches.','true']];
  const T=a=>csv().toCSV(a)+'\n';
  return {'Connections.csv':T(cRows),'Invitations.csv':T(inv),'messages.csv':T(msg),'Shares.csv':T(sh),'Positions.csv':T(P),'Company Follows.csv':T(fol),'Skills.csv':T(skills),'Profile.csv':T(profile),'Ad_Targeting.csv':T(ad),'Inferences_about_you.csv':T(inf),'Member_Follows_000.csv':T(mfol)};
}
root.LDV.sample={files};
})();
