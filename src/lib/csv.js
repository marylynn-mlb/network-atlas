(function(){
const root=typeof globalThis!=='undefined'?globalThis:window;root.LDV=root.LDV||{};
function parseCSV(text){
  if(text.charCodeAt(0)===0xFEFF)text=text.slice(1);
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=c}
    else if(c==='"')q=true;
    else if(c===','){row.push(cell);cell=''}
    else if(c==='\n'){row.push(cell);rows.push(row);row=[];cell=''}
    else if(c!=='\r')cell+=c;
  }
  if(cell.length||row.length){row.push(cell);rows.push(row)}
  return rows;
}
// Some LinkedIn files (Connections.csv) start with a few notes lines. Find the real header row.
function toObjects(rows,headerStart){
  let h=0;
  if(headerStart){h=rows.findIndex(r=>r[0]&&r[0].trim().toLowerCase()===headerStart.toLowerCase());if(h<0)h=0}
  if(!rows[h])return [];
  const head=rows[h].map(s=>s.trim());
  return rows.slice(h+1).filter(r=>r.some(x=>x&&x.trim())).map(r=>{const o={};head.forEach((k,i)=>{o[k]=r[i]===undefined?'':r[i]});return o});
}
function toCSV(rows){return rows.map(r=>r.map(v=>{v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')).join('\n')}
root.LDV.csv={parseCSV,toObjects,toCSV};
})();
