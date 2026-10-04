(function(){
const root=window;root.LDV=root.LDV||{};
const SLOTS=[['ink','Ink','Text, borders and dark tiles'],['gold','Accent 1','Highlights and big numbers'],['red','Accent 2','Calls to attention'],['blue','Accent 3','Primary chart color'],['purple','Accent 4','Fourth chart color'],['grey','Neutral','Muted text and axes'],['soft','Soft','Backgrounds and takeaways']];
const PRESETS=[
 {id:'bold',name:'Bold',c:{ink:'#062a30',gold:'#cca300',red:'#ed4319',blue:'#275273',purple:'#46004E',grey:'#8b8d92',soft:'#e1d9c1'}},
 {id:'sage',name:'Sage & Gold',c:{ink:'#2f3e3f',gold:'#b8943d',red:'#9a6a6a',blue:'#5a8384',purple:'#7a6a8a',grey:'#8a7060',soft:'#ebe5d6'}},
 {id:'ocean',name:'Ocean',c:{ink:'#0b2545',gold:'#f4a259',red:'#e63946',blue:'#13315c',purple:'#5b8e7d',grey:'#8da9c4',soft:'#e3edf4'}},
 {id:'berry',name:'Berry',c:{ink:'#2b0a3d',gold:'#f2a900',red:'#d81b60',blue:'#5e35b1',purple:'#00897b',grey:'#9a8fa6',soft:'#f1e3f5'}},
 {id:'forest',name:'Forest',c:{ink:'#1b3a2d',gold:'#e0a458',red:'#c8553d',blue:'#2d6a4f',purple:'#6a4c93',grey:'#8a9a8f',soft:'#e6eee0'}},
 {id:'access',name:'High contrast',c:{ink:'#000000',gold:'#7a5c00',red:'#b3001b',blue:'#00468c',purple:'#5a1a8c',grey:'#4d4d4d',soft:'#e6e6e6'}},
 {id:'news',name:'Newsprint',c:{ink:'#111111',gold:'#d4a017',red:'#c0392b',blue:'#1f3a5f',purple:'#555555',grey:'#8c8c8c',soft:'#ececec'}}];
const FONTS=[
 {n:'Inter',f:"'Inter',sans-serif",g:'Inter:wght@400;600;800;900'},
 {n:'DM Sans',f:"'DM Sans',sans-serif",g:'DM+Sans:wght@400;600;800;900'},
 {n:'Space Grotesk',f:"'Space Grotesk',sans-serif",g:'Space+Grotesk:wght@400;600;700'},
 {n:'Poppins',f:"'Poppins',sans-serif",g:'Poppins:wght@400;600;800;900'},
 {n:'Work Sans',f:"'Work Sans',sans-serif",g:'Work+Sans:wght@400;600;800;900'},
 {n:'IBM Plex Sans',f:"'IBM Plex Sans',sans-serif",g:'IBM+Plex+Sans:wght@400;600;700'},
 {n:'Source Sans 3',f:"'Source Sans 3',sans-serif",g:'Source+Sans+3:wght@400;600;800;900'},
 {n:'Lora',f:"'Lora',serif",g:'Lora:wght@400;600;700'},
 {n:'Merriweather',f:"'Merriweather',serif",g:'Merriweather:wght@400;700;900'},
 {n:'Playfair Display',f:"'Playfair Display',serif",g:'Playfair+Display:wght@400;700;900'},
 {n:'Roboto Slab',f:"'Roboto Slab',serif",g:'Roboto+Slab:wght@400;600;900'},
 {n:'JetBrains Mono',f:"'JetBrains Mono',monospace",g:'JetBrains+Mono:wght@400;700;800'}];
const KEY=window.__REPORT__?'ldv-style-report':'ldv-style-v1';
let state={preset:'bold',c:Object.assign({},PRESETS[0].c),head:'Inter',body:'Inter'};
if(window.__STYLE__&&window.__STYLE__.c)state=Object.assign(state,window.__STYLE__,{c:Object.assign({},PRESETS[0].c,window.__STYLE__.c)});
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.c)state=Object.assign(state,s,{c:Object.assign({},PRESETS[0].c,s.c)})}catch(e){}
const loaded=new Set();
function loadFont(name){const f=FONTS.find(x=>x.n===name);if(!f||loaded.has(name))return;loaded.add(name);const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+f.g+'&display=swap';document.head.appendChild(l)}
function lum(hex){const h=hex.replace('#','');const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(x=>x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4));return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]}
function contrast(a,b){const A=lum(a),B=lum(b);return (Math.max(A,B)+0.05)/(Math.min(A,B)+0.05)}
function on(bg,ink){return contrast(bg,'#ffffff')>=3?'#ffffff':ink}
function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));const A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v*(1-t)+B[i]*t).toString(16).padStart(2,'0')).join('')}
function apply(){
  const r=document.documentElement.style,c=state.c;
  const map={ink:'--green',gold:'--gold',red:'--red',blue:'--blue',purple:'--purple',grey:'--grey',soft:'--beige'};
  Object.keys(map).forEach(k=>r.setProperty(map[k],c[k]));
  ['gold','red','blue','purple','grey','soft','ink'].forEach(k=>r.setProperty('--on-'+k,on(c[k],c.ink)));
  r.setProperty('--num',contrast(c.gold,c.ink)>=3?c.gold:'#ffffff');
  const tt=col=>contrast(col,'#ffffff')>=3?col:mix(col,c.ink,.45);
  [['blue',c.blue],['gold',c.gold],['red',c.red],['purple',c.purple]].forEach(([k,v])=>r.setProperty('--'+k+'-t',tt(v)));
  r.setProperty('--tint',mix(c.soft,'#ffffff',.6));
  const hf=FONTS.find(f=>f.n===state.head)||FONTS[0],bf=FONTS.find(f=>f.n===state.body)||FONTS[0];
  loadFont(hf.n);loadFont(bf.n);
  r.setProperty('--font-head',hf.f);r.setProperty('--font-body',bf.f);
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
}
function C(){const c=state.c;return Object.assign({},c,{cat:[c.blue,c.gold,c.red,c.purple,c.ink,c.grey,mix(c.blue,'#ffffff',.45),mix(c.gold,'#ffffff',.45),mix(c.red,'#ffffff',.45),mix(c.purple,'#ffffff',.45)],font:(FONTS.find(f=>f.n===state.body)||FONTS[0]).f.split(',')[0].replace(/'/g,'')})}
root.LDV.style={SLOTS,PRESETS,FONTS,get:()=>state,C,apply,mix,
  setPreset(id){const p=PRESETS.find(x=>x.id===id);if(p){state.preset=id;state.c=Object.assign({},p.c)}apply()},
  setColor(k,v){state.c[k]=v;state.preset='custom';apply()},
  setFont(which,n){state[which]=n;apply()},
  reset(){state={preset:'bold',c:Object.assign({},PRESETS[0].c),head:'Inter',body:'Inter'};apply()}};
})();
