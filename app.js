/* RSHP World Cup 2026 Sweepstake — app logic. Reads window.WCDATA from data.js. */
const D = window.WCDATA;
const $ = s => document.querySelector(s);
const el = (t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const ph = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%23dfe7f0'/><text x='50%25' y='56%25' font-size='34' text-anchor='middle' fill='%2398a8bc'>?</text></svg>";
function img(o){const i=el('img');i.src=o&&o.avatar?o.avatar:ph;i.onerror=()=>i.src=ph;i.alt=o?o.name:'';return i;}
function first(n){return (n||'').split(' ')[0];}

/* hero chips + footer */
$('#heroChips').append(
  el('span','chip','📅 Updated <b>'+D.meta.updated+'</b>'),
  el('span','chip','🎬 '+D.meta.stage),
  el('span','chip','💷 <b>£480</b> in prizes')
);
$('#footMeta').textContent = D.meta.stage+' — '+D.meta.note;

/* derived */
const playersSorted = [...D.players].sort((a,b)=>b.goals-a.goals);
const maxGoals = playersSorted.length ? playersSorted[0].goals : 0;
function biggestDefeat(){
  let best=null;
  D.matches.forEach(m=>{
    const marg=Math.abs(m.hg-m.ag);
    if(marg<=0) return;
    const loser = m.hg>m.ag ? m.away : m.home;
    if(!best || marg>best.marg){ best={marg,loser,m}; }
  });
  if(!best) return null;
  best.team = D.teams.find(t=>t.team===best.loser);
  return best;
}
function topTeams(key){
  const mx=Math.max(...D.teams.map(t=>t[key]));
  return mx>0 ? D.teams.filter(t=>t[key]===mx) : [];
}
function topPlayers(){
  return maxGoals>0 ? playersSorted.filter(p=>p.goals===maxGoals) : [];
}

/* small builders */
function tbd(txt){ const d=el('div','tbd'); d.innerHTML='⏳ '+txt; return d; }
function sectionLabel(t){ const d=el('div'); d.style.cssText='font-weight:700;font-size:13px;margin:2px 2px 6px'; d.innerHTML=t; return d; }
function dualOwners(p){
  const w=el('div','dual');
  [['l1','league1','L1'],['l2','league2','L2']].forEach(([cls,k,lbl])=>{
    const o=p.owners[k]; const r=el('div','miniown');
    r.append(el('span','lg '+cls,lbl), img(o), el('span','nm',o.name+(o.paid===false?' ⚠':'')));
    w.append(r);
  });
  return w;
}
function teamOwners(t){
  const w=el('div','dual');
  if(!t.owners.length){ const r=el('div','miniown'); r.append(el('span','lg','—'),el('span','nm','Unclaimed')); w.append(r); return w; }
  t.owners.forEach(o=>{
    const r=el('div','miniown');
    if(o.league) r.append(el('span','lg '+(o.league==='L1'?'l1':'l2'),o.league));
    r.append(img(o), el('span','nm',o.name+(o.paid===false?' ⚠':'')));
    w.append(r);
  });
  return w;
}

/* PRIZE BOARD */
function renderPrizes(){
  const g=$('#prizeGrid'); g.innerHTML='';
  D.prizes.forEach(p=>{
    const c=el('div','prize'+(p.id==='winner'?' big':''));
    const h=el('div','ph');
    h.append(el('span','pe',p.emoji), el('span','pt',p.title), el('span','amt',p.amount));
    c.append(h, el('div','pd',p.desc));
    let body=el('div');
    if(p.metric==='player'){
      const leaders=topPlayers();
      if(!leaders.length){ body=tbd('No goals yet — wide open!'); }
      else leaders.forEach(lead=>{
        body.append(sectionLabel(lead.flag+' '+lead.player+' — <span style="color:var(--green)">'+lead.goals+' goal'+(lead.goals>1?'s':'')+'</span>'));
        body.append(dualOwners(lead));
      });
    } else if(p.metric==='team_gf' || p.metric==='team_ga' || p.metric==='team_reds'){
      const key = p.metric==='team_gf'?'gf' : p.metric==='team_ga'?'ga':'reds';
      const tt=topTeams(key);
      const empty = {team_gf:'No goals yet',team_ga:'Nobody shipping goals yet',team_reds:'No red cards yet — behave yourselves'}[p.metric];
      const word  = {gf:'scored',ga:'conceded',reds:'red cards'}[key];
      const colour= key==='gf' ? 'var(--green)' : 'var(--red)';
      if(!tt.length){ body=tbd(empty); }
      else tt.forEach(t=>{
        const val = key==='reds' ? (t.reds+' red card'+(t.reds>1?'s':'')) : (t[key]+' '+word);
        body.append(sectionLabel(t.flag+' '+t.team+' — <span style="color:'+colour+'">'+val+'</span>'));
        body.append(teamOwners(t));
      });
    } else if(p.metric==='defeat'){
      const b=biggestDefeat();
      if(!b){ body=tbd('No thrashings yet'); }
      else{
        body.append(sectionLabel(b.team.flag+' '+b.team.team+' — <span style="color:var(--red)">lost by '+b.marg+'</span> &nbsp;<span style="color:var(--mut);font-weight:600">'+b.m.home.slice(0,3).toUpperCase()+' '+b.m.hg+'-'+b.m.ag+' '+b.m.away.slice(0,3).toUpperCase()+'</span>'));
        body.append(teamOwners(b.team));
      }
    } else if(p.metric==='team'){
      body=tbd(p.id==='winner'?'To be decided — final is 19 July':'Decided at the final');
    } else if(p.metric==='judged'){
      body=tbd('Awarded at the end — keep an eye on the underdogs');
    } else if(p.metric==='judged_player'){
      body=tbd("BBC's pick at the tournament's end");
    }
    c.append(body);
    g.append(c);
  });
}

/* GOLDEN BOOT (drafted players only) */
function renderBoot(){
  const L=$('#bootList'); L.innerHTML='';
  const scored=playersSorted.filter(p=>p.goals>0);
  if(!scored.length){ L.append(el('div','muted-note','No goals from drafted players yet — the race is on! ⚽')); return; }
  scored.forEach((p,i)=>{
    const r=el('div','row');
    const rk=el('div','rk'+(i<3?' g'+(i+1):''), i+1);
    const pl=el('div','pl');
    const z=el('div'); z.style.flex='1'; z.style.minWidth='0';
    z.append(el('div','nm',p.flag+' '+p.player), el('div','ct',p.country));
    const bar=el('div','bar'); bar.style.width=Math.max(14,(p.goals/maxGoals)*100)+'%';
    z.append(bar); pl.append(z);
    const ow=el('div','owners');
    const i1=img(p.owners.league1); i1.title=p.owners.league1.name+' · League 1';
    const i2=img(p.owners.league2); i2.title=p.owners.league2.name+' · League 2';
    ow.append(i1, el('span','gtag l1','1'), i2, el('span','gtag l2','2'));
    const gv=el('div','goals', p.goals+'<small>goal'+(p.goals>1?'s':'')+'</small>');
    const right=el('div'); right.style.cssText='display:flex;align-items:center;gap:14px';
    right.append(ow,gv);
    r.append(rk,pl,right);
    L.append(r);
  });
}

/* TEAMS */
let teamFilter='all';
const groups=[...new Set(D.teams.map(t=>t.group))].sort();
function renderFilters(){
  const f=$('#teamFilters'); f.innerHTML='';
  const mk=(id,label)=>{ const b=el('button',teamFilter===id?'on':'',label); b.onclick=()=>{teamFilter=id;renderFilters();renderTeams();}; return b; };
  f.append(mk('all','🌍 All 48'), mk('alive','✅ Still in'), mk('out','❌ Knocked out'));
  groups.forEach(g=>f.append(mk('G'+g,'Group '+g)));
}
function standings(g){
  const st={};
  D.teams.filter(t=>t.group===g).forEach(t=>{ st[t.team]={t,P:0,W:0,Dr:0,L:0,GF:0,GA:0,Pts:0}; });
  D.matches.forEach(m=>{
    const a=st[m.home], b=st[m.away];
    if(!a||!b) return;                 // only intra-group (group-stage) matches
    a.P++; b.P++; a.GF+=m.hg; a.GA+=m.ag; b.GF+=m.ag; b.GA+=m.hg;
    if(m.hg>m.ag){ a.W++; a.Pts+=3; b.L++; }
    else if(m.hg<m.ag){ b.W++; b.Pts+=3; a.L++; }
    else { a.Dr++; b.Dr++; a.Pts++; b.Pts++; }
  });
  return Object.values(st).sort((x,y)=> y.Pts-x.Pts || (y.GF-y.GA)-(x.GF-x.GA) || y.GF-x.GF || x.t.team.localeCompare(y.t.team));
}
function groupTable(g){
  const rows=standings(g);
  const wrap=el('div'); wrap.style.cssText='grid-column:1/-1;overflow-x:auto;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:0 6px 18px rgba(20,40,80,.06)';
  const tbl=el('table'); tbl.style.cssText='width:100%;border-collapse:collapse;font-size:13.5px;min-width:560px';
  const head=el('tr'); head.style.cssText='background:var(--blue);color:#fff;text-transform:uppercase;font-size:11px;letter-spacing:.03em';
  ['Team','P','W','D','L','GF','GA','GD','Pts'].forEach((h,i)=>{ const th=el('th',null,h); th.style.cssText='padding:9px 8px;font-weight:700;text-align:'+(i===0?'left':'center'); head.appendChild(th); });
  tbl.appendChild(head);
  rows.forEach((s,idx)=>{
    const out=s.t.status==='out';
    const tr=el('tr');
    tr.style.cssText='border-top:1px solid var(--line);'+(idx<2?'background:rgba(0,185,110,.09);':'')+(out?'opacity:.45;':'')+(idx===1?'border-bottom:2px solid var(--green);':'');
    const td0=el('td'); td0.style.cssText='padding:7px 8px';
    const cell=el('div'); cell.style.cssText='display:flex;align-items:center;gap:8px';
    cell.innerHTML='<span style="width:16px;color:var(--mut);font-weight:700;text-align:center">'+(idx+1)+'</span>'+s.t.flag+' <b style="white-space:nowrap">'+s.t.team+'</b>';
    const ow=el('span'); ow.style.cssText='display:inline-flex;gap:3px;margin-left:4px';
    s.t.owners.forEach(o=>{ const im=img(o); im.style.cssText='width:20px;height:20px;border-radius:50%;object-fit:cover;border:1.5px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,.25)'; im.title=o.name+(o.league?' ('+o.league+')':''); ow.appendChild(im); });
    cell.appendChild(ow); td0.appendChild(cell); tr.appendChild(td0);
    const gd=s.GF-s.GA;
    [s.P,s.W,s.Dr,s.L,s.GF,s.GA,(gd>0?'+':'')+gd].forEach(v=>{ const td=el('td',null,String(v)); td.style.cssText='padding:7px 8px;text-align:center;color:var(--mut)'; tr.appendChild(td); });
    const tp=el('td',null,'<b>'+s.Pts+'</b>'); tp.style.cssText='padding:7px 8px;text-align:center;color:var(--blue);font-size:15px'; tr.appendChild(tp);
    tbl.appendChild(tr);
  });
  wrap.appendChild(tbl);
  const cap=el('div'); cap.style.cssText='padding:8px 10px;font-size:11px;color:var(--mut);border-top:1px solid var(--line)';
  cap.innerHTML='Group '+g+' · top 2 qualify (green line); the 8 best 3rd-placed teams also advance';
  wrap.appendChild(cap);
  return wrap;
}
function renderTeams(){
  const grid=$('#teamGrid'); grid.innerHTML='';
  if(teamFilter.startsWith('G')){ grid.appendChild(groupTable(teamFilter.slice(1))); return; }
  let list=[...D.teams];
  if(teamFilter==='alive') list=list.filter(t=>t.status!=='out');
  else if(teamFilter==='out') list=list.filter(t=>t.status==='out');
  else if(teamFilter.startsWith('G')) list=list.filter(t=>t.group===teamFilter.slice(1));
  list.sort((a,b)=> a.group.localeCompare(b.group) || a.team.localeCompare(b.team));
  if(!list.length){ grid.append(el('div','muted-note','No teams here yet.')); return; }
  list.forEach(t=>{
    const c=el('div','team'+(t.status==='out'?' out':''));
    c.append(el('div','fl',t.flag));
    const ti=el('div','ti');
    ti.append(el('div','tn',t.team+' <span class="grp">'+t.group+'</span>'));
    const ow=el('div','ow');
    if(!t.owners.length){ ow.append(el('span',null,'Unclaimed')); }
    else { t.owners.forEach(o=>ow.append(img(o))); ow.append(el('span',null,t.owners.map(x=>first(x.name)).join(' & '))); }
    ti.append(ow); c.append(ti);
    if(t.played>0) c.append(el('div','gd','<b>'+t.gf+'</b>:'+t.ga));
    grid.append(c);
  });
}

/* FINDER */
function buildIndex(){
  const map={};
  const add=(name,ent)=>{(map[name]=map[name]||{name,paid:ent.paid,avatar:ent.avatar,entries:[]}).entries.push(ent);};
  D.players.forEach(p=>{
    add(p.owners.league1.name,{type:'L1',tag:'L1',v:p.flag+' '+p.player,g:p.goals,paid:p.owners.league1.paid,avatar:p.owners.league1.avatar});
    add(p.owners.league2.name,{type:'L2',tag:'L2',v:p.flag+' '+p.player,g:p.goals,paid:p.owners.league2.paid,avatar:p.owners.league2.avatar});
  });
  D.teams.forEach(t=>t.owners.forEach(o=>add(o.name,{type:'TM',tag:(o.league?o.league+' ':'')+'Team',v:t.flag+' '+t.team,g:null,paid:o.paid,avatar:o.avatar})));
  return map;
}
const PEOPLE=buildIndex();
function renderFinder(q){
  const out=$('#finderOut'); out.innerHTML='';
  q=(q||'').trim().toLowerCase();
  if(!q) return;
  const hits=Object.values(PEOPLE).filter(p=>p.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name)).slice(0,8);
  if(!hits.length){ out.append(el('div','muted-note','No match — try a first name.')); return; }
  hits.forEach(p=>{
    const c=el('div','pcard');
    const top=el('div','top');
    top.append(img(p));
    top.append(el('div',null,'<div class="nm">'+p.name+(p.paid===false?'<span class="unpaid">unpaid</span>':'')+'</div><div style="font-size:12px;color:var(--mut)">'+p.entries.length+' entr'+(p.entries.length>1?'ies':'y')+'</div>'));
    c.append(top);
    const ents=el('div','ents');
    const ord={L1:0,L2:1,TM:2};
    p.entries.sort((a,b)=>ord[a.type]-ord[b.type]);
    p.entries.forEach(e=>{
      const r=el('div','ent');
      r.append(el('span','tag '+(e.type==='TM'?'tm':e.type.toLowerCase()), e.tag));
      r.append(el('span','v',e.v));
      if(e.g!=null && e.g>0) r.append(el('span','g',e.g+'⚽'));
      ents.append(r);
    });
    c.append(ents); out.append(c);
  });
}
$('#finderInput').addEventListener('input',e=>renderFinder(e.target.value));

/* RESULTS */
function ytid(u){ if(!u) return null; const m=u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m?m[1]:null; }
function renderResults(){
  const g=$('#resultGrid'); g.innerHTML='';
  // link to the official highlights channel
  const ch=el('a'); ch.href='https://www.youtube.com/channel/UCpcTrCXblq78GZrTUTLWeBw'; ch.target='_blank'; ch.rel='noopener';
  ch.style.cssText='grid-column:1/-1;display:inline-flex;align-items:center;gap:7px;justify-self:start;color:var(--mut);text-decoration:none;font-family:Roboto;font-weight:600;font-size:12.5px;margin-bottom:2px';
  ch.innerHTML='<svg width="20" height="14" viewBox="0 0 28 20" style="flex:0 0 auto"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 5.5l8.5 4.5-8.5 4.5z" fill="#fff"/></svg>Official FIFA World Cup highlights channel';
  g.append(ch);
  [...D.matches].reverse().forEach(m=>{
    const c=el('div','match');
    c.append(el('div','mdate',m.date));
    const sc=el('div','sc');
    sc.append(el('div','t','<span class="fl">'+m.homeFlag+'</span> '+m.home));
    sc.append(el('div','res',m.hg+' – '+m.ag));
    sc.append(el('div','t away',m.away+' <span class="fl">'+m.awayFlag+'</span>'));
    c.append(sc);
    if(m.note) c.append(el('div','note',m.note));
    const q=encodeURIComponent(m.home+' vs '+m.away+' FIFA World Cup 2026 highlights');
    const url=m.video || ('https://www.youtube.com/results?search_query='+q);
    const vid=ytid(m.video);
    const a=el('a'); a.href=url; a.target='_blank'; a.rel='noopener'; a.style.cssText='display:block;margin-top:10px;text-decoration:none';
    if(vid){
      a.innerHTML='<div style="position:relative;border-radius:8px;overflow:hidden"><img src="https://img.youtube.com/vi/'+vid+'/mqdefault.jpg" style="width:100%;display:block" alt="highlights"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="background:rgba(255,0,0,.9);color:#fff;width:48px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">▶</span></div></div>';
    } else {
      a.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;color:var(--mut);font-family:Roboto;font-weight:600;font-size:12.5px"><svg width="20" height="14" viewBox="0 0 28 20" style="flex:0 0 auto"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 5.5l8.5 4.5-8.5 4.5z" fill="#fff"/></svg>Highlights</span>';
    }
    c.append(a);
    g.append(c);
  });
}

/* NAV */
const secs=[['prizes','🏆 Prizes'],['boot','👟 Golden Boot'],['teams','🌍 Teams'],['finder','🔎 My Picks'],['results','📋 Results']];
const nav=$('#nav');
secs.forEach(([id,lbl])=>{ const b=el('button',null,lbl); b.onclick=()=>document.getElementById(id).scrollIntoView({behavior:'smooth'}); b.dataset.id=id; nav.append(b); });
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.id===e.target.id));}});},{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(([id])=>obs.observe(document.getElementById(id)));

/* BANNER: bouncing-ball staff heads — whole office bounces like footballs, directors are bigger */
(function(){
  const cv=$('#confetti'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const DIRECTORS=new Set(['Andrew Tyley','Ian Birtles','Richard Paul','Stephen Barrett','Tracy Meller']);
  // collect every unique staff member (with a photo) from the data
  const seen=new Map();
  const add=o=>{ if(o && o.avatar && !seen.has(o.name)) seen.set(o.name,o.avatar); };
  D.players.forEach(p=>{ add(p.owners.league1); add(p.owners.league2); });
  D.teams.forEach(t=>t.owners.forEach(add));
  const people=[...seen.entries()].map(([name,av])=>({name,av,big:DIRECTORS.has(name)}));
  const cache={};
  people.forEach(p=>{ if(!cache[p.av]){ const i=new Image(); i.src=p.av; cache[p.av]=i; } });
  let W=0,H=0,balls=[];
  const G=0.26, REST=0.84;
  function build(){
    balls=people.map(p=>{
      const r=p.big ? (24+Math.random()*9) : (9+Math.random()*6);
      return { x:r+Math.random()*Math.max(1,W-2*r), y:Math.random()*Math.max(1,H*0.5),
               vx:(Math.random()*2-1)*1.7, vy:Math.random()*2, r, img:cache[p.av], big:p.big };
    });
    // toss in a few classic footballs for good measure
    for(let i=0;i<3;i++){
      const r=15+Math.random()*7;
      balls.push({ x:r+Math.random()*Math.max(1,W-2*r), y:Math.random()*Math.max(1,H*0.5),
        vx:(Math.random()*2-1)*2.2, vy:Math.random()*2, r, ball:true });
    }
  }
  function rs(){ W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight; build(); }
  rs(); window.addEventListener('resize', rs);
  function step(b){
    b.vy+=G; b.x+=b.vx; b.y+=b.vy;
    if(b.x<b.r){ b.x=b.r; b.vx=Math.abs(b.vx); }
    else if(b.x>W-b.r){ b.x=W-b.r; b.vx=-Math.abs(b.vx); }
    if(b.y>H-b.r){
      b.y=H-b.r; b.vy=-b.vy*REST;
      const minUp=b.big?5.5:4.5;                 // keep them bouncing, never settle
      if(Math.abs(b.vy)<minUp) b.vy=-(minUp+Math.random()*3.5);
      b.vx+=(Math.random()*2-1)*0.5;
      if(Math.abs(b.vx)>3.2) b.vx*=0.6;
    }
    if(b.y<b.r && b.vy<0){ b.y=b.r; b.vy=Math.abs(b.vy)*REST; }
    if(b.ball){
      // a proper football
      ctx.save();
      ctx.shadowColor='rgba(0,0,0,.28)'; ctx.shadowBlur=5; ctx.shadowOffsetY=2;
      ctx.font=(b.r*2.2)+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('⚽', b.x, b.y);
      ctx.restore();
      return;
    }
    // shadow + white ring
    ctx.save();
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,6.28); ctx.closePath();
    ctx.shadowColor='rgba(0,0,0,.28)'; ctx.shadowBlur=5; ctx.shadowOffsetY=2;
    ctx.fillStyle='#ffffff'; ctx.fill();
    ctx.restore();
    // face
    ctx.save();
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r-2,0,6.28); ctx.closePath(); ctx.clip();
    const im=b.img,d=(b.r-2)*2;
    if(im&&im.complete&&im.naturalWidth) ctx.drawImage(im,b.x-(b.r-2),b.y-(b.r-2),d,d);
    else { ctx.fillStyle='#0d3a8f'; ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2); }
    ctx.restore();
    // directors get a gold ring so they stand out
    if(b.big){ ctx.beginPath(); ctx.arc(b.x,b.y,b.r-1,0,6.28); ctx.lineWidth=2.5; ctx.strokeStyle='#FFCD00'; ctx.stroke(); }
  }
  function loop(){ ctx.clearRect(0,0,W,H); for(const b of balls) step(b); requestAnimationFrame(loop); }
  loop();
})();


/* FACT OF THE DAY — side tab */
function renderFact(){
  const blue='var(--blue)';
  const tab=el('div',null,'⚽ Fact of the day');
  tab.style.cssText='position:fixed;right:0;top:34%;z-index:60;background:'+blue+';color:#fff;writing-mode:vertical-rl;transform:rotate(180deg);padding:24px 14px;border-radius:12px 0 0 12px;font-family:Roboto;font-weight:700;font-size:17px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;box-shadow:-4px 4px 18px rgba(0,0,0,.28);user-select:none;border:3px solid var(--yellow);border-right:0;animation:factpulse 2.2s ease-in-out infinite';
  const panel=el('div');
  panel.style.cssText='position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:61;width:320px;max-width:calc(100vw - 28px);background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 16px 44px rgba(20,40,80,.28);padding:16px 16px 14px;display:none';
  // auto stats
  const gb=topPlayers()[0];
  const mg=topTeams('gf')[0];
  const bw=biggestDefeat();
  let stats='';
  if(gb) stats+='<div style="margin-bottom:5px">👟 <b>Golden Boot:</b> '+gb.flag+' '+gb.player+' ('+gb.goals+') \u2014 '+gb.owners.league1.name.split(" ")[0]+' / '+gb.owners.league2.name.split(" ")[0]+'</div>';
  if(mg&&mg.gf>0) stats+='<div style="margin-bottom:5px">🎯 <b>Most goals:</b> '+mg.flag+' '+mg.team+' ('+mg.gf+') \u2014 '+mg.owners.map(function(o){return o.name.split(" ")[0];}).join(" & ")+'</div>';
  if(bw){ const w=(bw.m.hg>bw.m.ag)?bw.m.home:bw.m.away; stats+='<div>💥 <b>Biggest win:</b> '+bw.m.home+' '+bw.m.hg+'-'+bw.m.ag+' '+bw.m.away+'</div>'; }
  panel.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px">'
    +'<span style="font-family:Roboto;font-weight:700;text-transform:uppercase;font-size:13px;color:'+blue+';letter-spacing:.04em">⚽ Fact of the day</span>'
    +'<span class="factx" style="margin-left:auto;cursor:pointer;color:var(--mut);font-size:18px;line-height:1">×</span></div>'
    +'<div style="font-size:14px;line-height:1.45;margin-bottom:12px">'+(D.meta.fact||'Check back after tonight\'s games!')+'</div>'
    +'<div style="border-top:1px solid var(--line);padding-top:9px"><div style="font-size:10.5px;text-transform:uppercase;color:var(--mut);font-weight:700;margin-bottom:6px">By the numbers</div>'
    +'<div style="font-size:12.5px;line-height:1.5">'+(stats||'No games played yet.')+'</div></div>'
    +'<div style="font-size:10.5px;color:var(--mut);margin-top:10px">Updated '+D.meta.updated+'</div>';
  let open=false;
  const toggle=function(v){ open=(v!==undefined)?v:!open; panel.style.display=open?'block':'none'; tab.style.display=open?'none':'block'; };
  tab.onclick=function(){toggle(true);};
  panel.addEventListener('click',function(e){ if(e.target.classList.contains('factx')) toggle(false); });
  if(!document.getElementById('factkf')){var st=el('style');st.id='factkf';st.textContent='@keyframes factpulse{0%,100%{box-shadow:-4px 4px 18px rgba(0,0,0,.28)}50%{box-shadow:-5px 5px 28px rgba(28,73,180,.75)}}';document.head.appendChild(st);}
  document.body.append(tab,panel);
  if(window.innerWidth>760) setTimeout(function(){toggle(true);},600);
}

/* GO */
renderPrizes(); renderBoot(); renderFilters(); renderTeams(); renderResults(); renderFact();
