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
  let mx=0;
  D.matches.forEach(m=>{ const marg=Math.abs(m.hg-m.ag); if(marg>mx) mx=marg; });
  if(mx<=0) return [];
  const out=[];
  D.matches.forEach(m=>{
    const marg=Math.abs(m.hg-m.ag);
    if(marg===mx){
      const loser = m.hg>m.ag ? m.away : m.home;
      out.push({marg, loser, m, team: D.teams.find(t=>t.team===loser)});
    }
  });
  return out;
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
  const PAL=['#1C49B4','#00B5E2','#00B96E','#96D200','#FF8A40','#FF5442','#F16AB7','#D2DC00','#FFCD00'];
  D.prizes.forEach((p,i)=>{
    const c=el('div','prize'+(p.id==='winner'?' big':''));
    c.style.setProperty('--stripe', PAL[i % PAL.length]);
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
      const list=biggestDefeat();
      if(!list.length){ body=tbd('No thrashings yet'); }
      else list.forEach(b=>{
        body.append(sectionLabel(b.team.flag+' '+b.team.team+' — <span style="color:var(--red)">lost by '+b.marg+'</span> &nbsp;<span style="color:var(--mut);font-weight:600">'+b.m.home.slice(0,3).toUpperCase()+' '+b.m.hg+'-'+b.m.ag+' '+b.m.away.slice(0,3).toUpperCase()+'</span>'));
        body.append(teamOwners(b.team));
      });
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


/* TODAY'S FIXTURES */
function renderFixtures(){
  const g=$('#fixtureGrid'); if(!g) return; g.innerHTML='';
  const fx=D.fixtures||[];
  if(!fx.length){ g.append(el('div','muted-note','No matches today — back tomorrow! \u26bd')); return; }
  const faces=team=>{ const t=D.teams.find(x=>x.team===team); if(!t||!t.owners.length) return '';
    return '<span style="display:inline-flex;margin-left:8px">'+t.owners.map(o=>'<img src="'+(o.avatar||ph)+'" title="'+o.name+(o.league?' ('+o.league+')':'')+'" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.2);margin-left:-5px">').join('')+'</span>'; };
  fx.forEach(f=>{
    const c=el('div'); c.style.cssText='background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:0 5px 14px rgba(20,40,80,.05);padding:12px 14px;display:flex;align-items:center;gap:12px';
    c.innerHTML='<span style="font-family:Roboto;font-weight:700;background:var(--ink);color:#fff;padding:5px 9px;border-radius:5px;font-size:13px;flex:0 0 auto">'+f.time+'</span>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="display:flex;align-items:center;gap:7px;font-weight:700;font-size:14.5px">'+f.homeFlag+' '+f.home+faces(f.home)+'</div>'
      +'<div style="display:flex;align-items:center;gap:7px;font-weight:700;font-size:14.5px;margin-top:6px">'+f.awayFlag+' '+f.away+faces(f.away)+'</div>'
      +'</div>'
      +'<span style="font-family:Roboto;font-weight:700;font-size:11px;color:var(--mut);background:var(--soft);padding:3px 8px;border-radius:5px;flex:0 0 auto">GRP '+f.group+'</span>';
    g.append(c);
  });
}

/* KNOCKOUT BRACKET */
function koFaces(name){ if(!name) return ''; const t=D.teams.find(x=>x.team===name); if(!t||!t.owners.length) return '';
  return '<span style="display:inline-flex;margin-left:6px">'+t.owners.map(o=>'<img src="'+(o.avatar||ph)+'" title="'+o.name+(o.league?' ('+o.league+')':'')+'" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1.5px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,.25);margin-left:-4px">').join('')+'</span>'; }
function koRow(name,flag,score,win,played){
  const r=el('div'); r.style.cssText='display:flex;align-items:center;gap:6px;padding:6px 8px;font-size:13px;'+(win?'font-weight:700;':'')+((played&&!win)?'opacity:.5;':'');
  r.innerHTML=(name?(flag+' <span style="max-width:115px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+name+'</span>'+koFaces(name)):'<span style="color:var(--mut)">TBD</span>')
    +'<span style="margin-left:auto;font-weight:700;min-width:14px;text-align:right">'+(score==null?'':score)+'</span>';
  return r;
}
function renderBracket(){
  const wrap=$('#bracketWrap'); if(!wrap||!D.bracket) return; wrap.innerHTML='';
  const ROUNDS=[['R32','Round of 32'],['R16','Last 16'],['QF','Quarter-finals'],['SF','Semi-finals'],['F','Final']];
  const COLW=206, GAP=46, TIEH=72, STEP=94, PADT=6;
  const n32=D.bracket.R32.length;
  const totalW=ROUNDS.length*COLW+(ROUNDS.length-1)*GAP;
  const totalH=PADT*2+n32*STEP;
  const centers={};
  centers['R32']=D.bracket.R32.map((_,i)=>PADT+i*STEP+STEP/2);
  ['R16','QF','SF','F'].forEach((k,ri)=>{ const prev=ROUNDS[ri][0]; centers[k]=(D.bracket[k]||[]).map((_,j)=>(centers[prev][2*j]+centers[prev][2*j+1])/2); });
  // header labels
  const head=el('div'); head.style.cssText='position:relative;width:'+totalW+'px;height:20px;margin-bottom:8px';
  ROUNDS.forEach(([k,label],r)=>{ const x=r*(COLW+GAP); const lab=el('div');
    lab.style.cssText='position:absolute;left:'+x+'px;width:'+COLW+'px;font-family:Roboto;font-weight:700;text-transform:uppercase;font-size:11.5px;color:var(--blue);letter-spacing:.04em'; lab.textContent=label; head.appendChild(lab); });
  // stage + svg connectors
  const stage=el('div'); stage.style.cssText='position:relative;width:'+totalW+'px;height:'+totalH+'px';
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg'); svg.setAttribute('width',totalW); svg.setAttribute('height',totalH); svg.style.cssText='position:absolute;left:0;top:0;pointer-events:none';
  ROUNDS.forEach(([k],r)=>{ if(r===0) return; const prev=ROUNDS[r-1][0];
    const xPrevR=(r-1)*(COLW+GAP)+COLW, xCur=r*(COLW+GAP), midX=xPrevR+GAP/2;
    (D.bracket[k]||[]).forEach((_,j)=>{ const ay=centers[prev][2*j], by=centers[prev][2*j+1], cy=centers[k][j];
      const d='M'+xPrevR+' '+ay+' H'+midX+' M'+xPrevR+' '+by+' H'+midX+' M'+midX+' '+ay+' V'+by+' M'+midX+' '+cy+' H'+xCur;
      const p=document.createElementNS(NS,'path'); p.setAttribute('d',d); p.setAttribute('stroke','#00B96E'); p.setAttribute('stroke-width','2'); p.setAttribute('fill','none'); svg.appendChild(p); });
  });
  stage.appendChild(svg);
  // cards
  ROUNDS.forEach(([k],r)=>{ const x=r*(COLW+GAP);
    (D.bracket[k]||[]).forEach((t,j)=>{ const cy=centers[k][j];
      const card=el('div'); card.style.cssText='position:absolute;left:'+x+'px;top:'+(cy-TIEH/2)+'px;width:'+COLW+'px;background:#fff;border:1px solid var(--line);border-radius:7px;box-shadow:0 3px 10px rgba(20,40,80,.07);overflow:hidden;z-index:1';
      if(t.when){ const wn=el('div'); wn.style.cssText='font-family:Roboto;font-size:10px;font-weight:700;color:var(--mut);background:var(--soft);padding:3px 8px;text-transform:uppercase;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'; wn.textContent=t.when; card.appendChild(wn); }
      const played=t.hg!=null;
      card.appendChild(koRow(t.home,t.homeFlag,t.hg,t.winner&&t.winner===t.home,played));
      const dv=el('div'); dv.style.cssText='height:1px;background:var(--line)'; card.appendChild(dv);
      card.appendChild(koRow(t.away,t.awayFlag,t.ag,t.winner&&t.winner===t.away,played));
      stage.appendChild(card); });
  });
  wrap.appendChild(head); wrap.appendChild(stage);
  wrap.style.maxHeight='80vh'; wrap.style.overflow='auto';
}

/* RESULTS */
function ytid(u){ if(!u) return null; const m=u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m?m[1]:null; }
function renderResults(){
  const g=$('#resultGrid'); g.innerHTML='';
  const ch=el('a'); ch.href='https://www.youtube.com/channel/UCpcTrCXblq78GZrTUTLWeBw'; ch.target='_blank'; ch.rel='noopener';
  ch.style.cssText='grid-column:1/-1;display:inline-flex;align-items:center;gap:7px;justify-self:start;color:var(--mut);text-decoration:none;font-family:Roboto;font-weight:600;font-size:12.5px;margin-bottom:2px';
  ch.innerHTML='<svg width="20" height="14" viewBox="0 0 28 20" style="flex:0 0 auto"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 5.5l8.5 4.5-8.5 4.5z" fill="#fff"/></svg>Official FIFA World Cup highlights channel';
  g.append(ch);
  const order=[['F','Final'],['SF','Semi-final'],['QF','Quarter-final'],['R16','Last 16'],['R32','Round of 32']];
  let any=false;
  order.forEach(([key,label])=>{ ((D.bracket&&D.bracket[key])||[]).forEach(t=>{
    if(t.hg==null||!t.home||!t.away) return; any=true;
    const c=el('div','match');
    c.append(el('div','mdate',label+' · '+t.date));
    const sc=el('div','sc');
    sc.append(el('div','t', t.homeFlag+' '+t.home));
    sc.append(el('div','res', t.hg+' – '+t.ag));
    sc.append(el('div','t away', t.away+' '+t.awayFlag));
    c.append(sc);
    if(t.winner) c.append(el('div','note', t.winner+' advance'));
    const q=encodeURIComponent(t.home+' vs '+t.away+' FIFA World Cup 2026 highlights');
    const a=el('a'); a.href='https://www.youtube.com/results?search_query='+q; a.target='_blank'; a.rel='noopener'; a.style.cssText='display:block;margin-top:10px;text-decoration:none';
    a.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;color:var(--mut);font-family:Roboto;font-weight:600;font-size:12.5px"><svg width="20" height="14" viewBox="0 0 28 20" style="flex:0 0 auto"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 5.5l8.5 4.5-8.5 4.5z" fill="#fff"/></svg>Highlights</span>';
    c.append(a); g.append(c);
  }); });
  if(!any) g.append(el('div','muted-note','Knockout results will appear here as the games are played ⚽'));
}

/* NAV */
const secs=[['fixtures','📅 Today'],['bracket','🥊 Bracket'],['prizes','🏆 Prizes'],['boot','👟 Golden Boot'],['teams','🌍 Teams'],['finder','🔎 My Picks'],['results','📋 Results']];
const nav=$('#nav');
secs.forEach(([id,lbl])=>{ const b=el('button',null,lbl); b.onclick=()=>document.getElementById(id).scrollIntoView({behavior:'smooth'}); b.dataset.id=id; nav.append(b); });
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.id===e.target.id));}});},{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(([id])=>obs.observe(document.getElementById(id)));

/* BANNER GAME: keepy-uppy — tap the bouncing players, 30s, directors 5x, combos */
(function(){
  const cv=$('#confetti'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const hero=cv.parentElement;
  const DIRECTORS=new Set(['Andrew Tyley','Ian Birtles','Richard Paul','Stephen Barrett','Tracy Meller']);
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
      const r=p.big ? (25+Math.random()*9) : (11+Math.random()*6);
      return { x:r+Math.random()*Math.max(1,W-2*r), y:Math.random()*Math.max(1,H*0.5),
               vx:(Math.random()*2-1)*1.7, vy:Math.random()*2, r, img:cache[p.av], big:p.big };
    });
    for(let i=0;i<3;i++){ const r=16+Math.random()*7;
      balls.push({ x:r+Math.random()*Math.max(1,W-2*r), y:Math.random()*Math.max(1,H*0.5), vx:(Math.random()*2-1)*2.2, vy:Math.random()*2, r, ball:true }); }
  }
  function rs(){ W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight; build(); }
  rs(); window.addEventListener('resize', rs);

  let score=0, best=0, combo=0, lastHit=0, mode='idle', endTime=0; const floaters=[];
  try{ best=parseInt(localStorage.getItem('wcKeepy')||'0',10)||0; }catch(e){}
  cv.style.pointerEvents='auto'; cv.style.cursor='pointer';
  const hiInner=document.querySelector('.hero-inner'); if(hiInner) hiInner.style.pointerEvents='none';

  const CARD='pointer-events:auto;background:rgba(20,40,90,.92);color:#fff;border:2px solid #FFCD00;border-radius:12px;padding:16px 22px;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.35);font-family:Roboto;max-width:92%';
  const ui=el('div'); ui.style.cssText='position:absolute;inset:0;z-index:5;display:flex;align-items:flex-end;justify-content:flex-start;padding:16px;pointer-events:none';
  hero.appendChild(ui);
  function btn(label){ const b=el('button',null,label); b.style.cssText='pointer-events:auto;margin-top:12px;background:#FFCD00;color:#16213a;border:0;border-radius:8px;font-family:Roboto;font-weight:700;text-transform:uppercase;font-size:16px;padding:10px 24px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)'; return b; }
  // ---- shared leaderboard (Netlify function + Blobs) ----
  const LB_URL='/.netlify/functions/leaderboard';
  let topScores=[]; let pname=''; try{ pname=localStorage.getItem('wcName')||''; }catch(e){}
  function top3html(){ if(!topScores.length) return ''; const m=['🥇','🥈','🥉'];
    return '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.3);padding-top:8px;font-size:13px;text-align:left;min-width:170px">'
      +'<div style="font-weight:700;text-transform:uppercase;font-size:11px;opacity:.8;margin-bottom:4px">Office Top 3</div>'
      +topScores.map((s,i)=>(m[i]||'')+' <b>'+s.name+'</b> — '+s.score).join('<br>')+'</div>'; }
  async function lbFetch(){ try{ const r=await fetch(LB_URL); if(r.ok) topScores=await r.json(); }catch(e){} if(mode==='idle') showStart(); }
  async function lbSubmit(name,score){ try{ const r=await fetch(LB_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,score})}); if(r.ok) topScores=await r.json(); }catch(e){} }

  function showStart(){
    ui.innerHTML=''; const c=el('div'); c.style.cssText=CARD;
    c.innerHTML='<div style="font-weight:700;font-size:19px;text-transform:uppercase">⚽ Keepy-Uppy Challenge</div>'
      +'<div style="font-size:12.5px;opacity:.92;margin:6px 0 2px">Tap as many players as you can in 15 seconds.<br>Directors score <b>5×</b> · quick taps build a <b>combo</b>.</div>'
      +'<div style="font-size:12px;opacity:.85;margin-top:4px">Your best: <b>'+best+'</b></div>'
      +top3html();
    const b=btn('▶ Play'); b.onclick=startGame; c.appendChild(b); ui.appendChild(c);
  }
  function showOver(){
    ui.innerHTML=''; const c=el('div'); c.style.cssText=CARD; const nb=score>=best;
    c.innerHTML='<div style="font-weight:700;font-size:20px;text-transform:uppercase;color:#FFCD00">Time!</div>'
      +'<div style="font-size:15px;margin:6px 0">You scored <b style="font-size:22px">'+score+'</b></div>'
      +'<div style="font-size:12px;opacity:.9">'+(nb?'🏆 New personal best!':'Your best: '+best)+'</div>';
    const row=el('div'); row.style.cssText='margin-top:10px;display:flex;gap:6px;justify-content:center';
    const inp=el('input'); inp.placeholder='Your name'; inp.value=pname; inp.maxLength=20;
    inp.style.cssText='pointer-events:auto;border:0;border-radius:6px;padding:8px 10px;font-family:Roboto;font-size:14px;width:130px';
    const sub=el('button',null,'Submit'); sub.style.cssText='pointer-events:auto;background:#FFCD00;color:#16213a;border:0;border-radius:6px;font-family:Roboto;font-weight:700;padding:8px 12px;cursor:pointer';
    const top=el('div'); function paint(){ top.innerHTML=top3html(); }
    paint();
    sub.onclick=async()=>{ const nm=((inp.value||'Anon').trim().slice(0,20))||'Anon'; pname=nm; try{localStorage.setItem('wcName',nm);}catch(e){}
      sub.disabled=true; sub.textContent='…'; await lbSubmit(nm,score); paint(); sub.textContent='Saved ✓'; };
    row.append(inp,sub); c.appendChild(row); c.appendChild(top);
    const again=btn('↺ Play again'); again.onclick=startGame; c.appendChild(again); ui.appendChild(c);
  }
  function startGame(){ score=0; combo=0; lastHit=0; endTime=Date.now()+15000; mode='play'; floaters.length=0; ui.innerHTML=''; }
  function endGame(){ mode='over'; if(score>best){ best=score; try{localStorage.setItem('wcKeepy',String(best));}catch(e){} } showOver(); }
  showStart(); lbFetch();

  function evpos(e){ const r=cv.getBoundingClientRect(); return [ (e.clientX-r.left)*(cv.width/r.width), (e.clientY-r.top)*(cv.height/r.height) ]; }
  function kickAt(mx,my){
    if(mode!=='play') return;
    let hit=null, hd=1e9;
    for(const b of balls){ const d=Math.hypot(b.x-mx,b.y-my); if(d<b.r+22 && d<hd){ hd=d; hit=b; } }
    if(!hit) return;
    const now=Date.now();
    combo = (now-lastHit<1300) ? combo+1 : 1; lastHit=now;
    const pts=(hit.big?5:1)*Math.min(combo,5);
    score+=pts;
    hit.vy=-(9+Math.random()*4); hit.vx+=(hit.x-mx)*0.16+(Math.random()*2-1)*1.4; hit.pop=8;
    floaters.push({x:hit.x, y:hit.y-hit.r, txt:'+'+pts, life:34, big:hit.big});
  }
  cv.addEventListener('click', function(e){ const p=evpos(e); kickAt(p[0],p[1]); });

  function step(b){
    if(b.pop>0) b.pop--;
    b.vy+=G; b.x+=b.vx; b.y+=b.vy;
    if(b.x<b.r){ b.x=b.r; b.vx=Math.abs(b.vx); } else if(b.x>W-b.r){ b.x=W-b.r; b.vx=-Math.abs(b.vx); }
    if(b.y>H-b.r){ b.y=H-b.r; b.vy=-b.vy*REST; const minUp=b.big?5.5:4.5;
      if(Math.abs(b.vy)<minUp) b.vy=-(minUp+Math.random()*3.5);
      b.vx+=(Math.random()*2-1)*0.5; if(Math.abs(b.vx)>3.2) b.vx*=0.6; }
    if(b.y<b.r && b.vy<0){ b.y=b.r; b.vy=Math.abs(b.vy)*REST; }
    const rr=b.r+(b.pop>0?b.pop*0.5:0);
    if(b.ball){ ctx.font=(rr*2.2)+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⚽', b.x, b.y); return; }
    ctx.beginPath(); ctx.arc(b.x,b.y,rr,0,6.28); ctx.closePath(); ctx.fillStyle='#fff'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(b.x,b.y,rr-2,0,6.28); ctx.closePath(); ctx.clip();
    const im=b.img,d=(rr-2)*2;
    if(im&&im.complete&&im.naturalWidth) ctx.drawImage(im,b.x-(rr-2),b.y-(rr-2),d,d);
    else { ctx.fillStyle='#0d3a8f'; ctx.fillRect(b.x-rr,b.y-rr,rr*2,rr*2); }
    ctx.restore();
    if(b.big){ ctx.beginPath(); ctx.arc(b.x,b.y,rr-1,0,6.28); ctx.lineWidth=2.5; ctx.strokeStyle='#FFCD00'; ctx.stroke(); }
  }
  function hud(){
    const now=Date.now();
    if(mode==='play' && now>=endTime) endGame();
    if(mode==='play' && now-lastHit>1300) combo=0;
    for(let k=floaters.length-1;k>=0;k--){ const f=floaters[k]; f.y-=0.9; f.life--; if(f.life<=0){floaters.splice(k,1);continue;}
      ctx.globalAlpha=Math.max(0,f.life/34); ctx.fillStyle=f.big?'#FFCD00':'#fff';
      ctx.font='700 '+(f.big?20:15)+'px Roboto, Arial, sans-serif'; ctx.textAlign='center'; ctx.fillText(f.txt,f.x,f.y); ctx.globalAlpha=1; }
    if(mode==='play'){
      ctx.textBaseline='top'; ctx.textAlign='left'; ctx.fillStyle='#fff';
      ctx.font='700 24px Roboto, Arial, sans-serif'; ctx.fillText('⚽ '+score, 16, 12);
      const left=Math.max(0,Math.ceil((endTime-now)/1000));
      ctx.textAlign='right'; ctx.fillStyle=left<=5?'#FF5442':'#fff'; ctx.fillText('⏱ '+left+'s', W-16, 12);
      if(combo>=2){ ctx.fillStyle='#FFCD00'; ctx.font='700 16px Roboto, Arial, sans-serif'; ctx.fillText('COMBO ×'+Math.min(combo,5), W-16, 44); }
    }
  }
  function loop(){ ctx.clearRect(0,0,W,H); for(const b of balls) step(b); hud(); requestAnimationFrame(loop); }
  loop();
})();


/* FACT OF THE DAY — floating RSHP colour tile, always on */
function renderFact(){
  if(!document.getElementById('factkf')){ var st=el('style'); st.id='factkf';
    st.textContent='@keyframes factfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}'; document.head.appendChild(st); }
  const box=el('div');
  box.style.cssText='position:fixed;right:20px;bottom:20px;z-index:60;width:300px;max-width:calc(100vw - 32px);background:#FF5442;color:#fff;padding:15px 16px 14px;box-shadow:0 16px 38px rgba(0,0,0,.28);font-family:Roboto;animation:factfloat 5.5s ease-in-out infinite';
  const head=el('div'); head.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:8px';
  head.innerHTML='<span style="font-weight:700;text-transform:uppercase;letter-spacing:.07em;font-size:13px">\u26bd Fact of the day</span>'
    +'<span class="factx" title="hide" style="margin-left:auto;cursor:pointer;font-size:18px;line-height:1;opacity:.85">\u00d7</span>';
  box.appendChild(head);
  const f=el('div'); f.style.cssText='font-size:14px;line-height:1.42;font-weight:500'; f.textContent=D.meta.fact||'Check back after the next round of games!';
  box.appendChild(f);
  const gb=topPlayers()[0]; const mg=topTeams('gf')[0];
  if(gb||mg){
    const stat=el('div'); stat.style.cssText='margin-top:11px;padding-top:9px;border-top:1px solid rgba(255,255,255,.4);font-size:12px;font-weight:600;line-height:1.5';
    let h='';
    if(gb) h+='\ud83d\udc5f Golden Boot: '+gb.player+' ('+gb.goals+')<br>';
    if(mg&&mg.gf>0) h+='\ud83c\udfaf Most goals: '+mg.team+' ('+mg.gf+')';
    stat.innerHTML=h; box.appendChild(stat);
  }
  box.addEventListener('click',function(e){ if(e.target.classList.contains('factx')){ box.style.animation='none'; box.style.display='none'; } });
  document.body.appendChild(box);
}


/* HERO POSTER — one official 2026 poster faded behind the banner, rotates daily */
function renderHeroPoster(){
  const hero=document.querySelector('.hero'); if(!hero) return;
  const N=10, i=(new Date().getDate()% N)+1;
  const bg=el('div');
  bg.style.cssText='position:absolute;inset:0;z-index:0;background:url(assets/posters/p'+i+'.jpg) center/cover no-repeat;opacity:.20;pointer-events:none';
  const ov=el('div');
  ov.style.cssText='position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(28,73,180,.55),rgba(28,73,180,.78));pointer-events:none';
  hero.insertBefore(ov,hero.firstChild);
  hero.insertBefore(bg,hero.firstChild);
  const cv=document.getElementById('confetti'); if(cv) cv.style.zIndex='1';
}

/* GO */
renderFixtures(); renderBracket(); renderPrizes(); renderBoot(); renderFilters(); renderTeams(); renderResults(); renderFact(); renderHeroPoster();
