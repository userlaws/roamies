// Roamies sprites and item art. Shared by the desktop overlay and the app window.
// Every sprite is 16 px wide, faces left, and is flipped when the pet faces right.
// A pet's look is { char, skin, hat, face, buddy }: any character can wear any color, hat and face item.
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const PAD=9;            // empty rows above the body, room for ears and tall hats
const SPR_W=16, SPR_H=PAD+14;
/* ---------- body: 14 rows. Letters are palette keys: o outline, b body, l light, e eye, w white, p pink, n nose ---------- */
const BASE=[
"...o.......o....",
"..obo.....obo...",
"..obbo...obbo...",
".obbbbooobbbbo..",
".obbbbbbbbbbbo..",
".obbbbbbbbbbbo..",
".obbbewbbbewbo..",
".obbbeebbbeebo..",
".obpbbbnnbbbpo..",
".obbbbbbbbbbbo.o",
".obbllllllbbbobo",
".obbllllllbbbbo.",
"..obbbbbbbbbbo..",
"..oo.oo...oo.oo."];
// Feet for each pose. Characters can bring their own set.
const FEET={base:BASE[13],A:"..oo.oo...oo.oo.",B:"...oo.oo.oo.oo..",sit:".oooo.....oooo..",sleep:"..oooooooooooo..",D1:"...o..o..o..o...",D2:".o..o.....o..o.."};
const WEB_FEET={base:"..nnn....nnn....",A:"..nnn.....nnn...",B:"...nnn...nnn....",sit:".nnnn....nnnn...",sleep:"..oooooooooooo..",D1:"...n..n..n..n...",D2:".n..n.....n..n.."};
const NO_TAIL={9:".obbbbbbbbbbbo..",10:".obbllllllbbbo..",11:".obbllllllbbbo.."};
/* ---------- characters ----------
   rows:  body rows that differ from the cat        top:   extra rows above the head (long ears)
   eyes:  where the 2x2 eyes sit and what they are drawn on, so blinking works on any face
   hatY:  how far hats move up or down to sit on this head */
const CHARS={
  cat:{name:'Cat',price:0,voice:'cat',rows:{}},
  bunny:{name:'Bunny',price:150,voice:'bunny',
    top:["..oo......oo....",".obbo....obbo...",".obpo....obpo..."],
    rows:{0:".obpo....obpo...",1:".obbo....obbo...",2:".obbbo..obbbo...",9:".obbbbbwwbbbbo..",10:".obbllllllbbbolo",11:".obbllllllbbboo."}},
  bear:{name:'Bear',price:150,voice:'bear',hatY:-1,
    rows:{0:"..oo.......oo...",1:".obbo.....obbo..",2:".obbbooooobbbo..",3:".obbbbbbbbbbbo..",...NO_TAIL,8:".obpbllnnllbpo..",9:".obbbbllllbbbo.."}},
  duck:{name:'Duck',price:200,voice:'duck',hatY:-1,pal:{n:'#ff9f1c'},feet:WEB_FEET,
    rows:{0:"................",1:".......oo.......",2:"....oooobooo....",3:"...obbbbbbbbo...",4:"..obbbbbbbbbbo..",5:"..obbbbbbbbbbo..",
      6:"..obbewbbbewbo..",7:"..obbeebbbeebo..",8:"..opbnnnnnbbpo..",9:"..obbbnnnbbbbo..",10:"..obbllllllbboo.",11:"..obbllllllbbo..",12:"...obbbbbbbbo..."}},
  frog:{name:'Frog',price:200,voice:'frog',eyes:{y:2,x1:3,x2:10},blushRow:7,
    rows:{0:"..oooo...oooo...",1:".obbbbo.obbbbo..",2:".obewbo.obewbo..",3:".obeebooobeebo..",6:".obbbbbbbbbbbo..",7:".obpbbbbbbbbpo..",8:".obbnnnnnnnbbo..",...NO_TAIL}},
  fox:{name:'Fox',price:250,voice:'fox',
    rows:{0:"..o.........o...",1:".olo.......olo..",2:".olbo.....oblo..",3:".obbbooooobbbo..",7:".olbbeebbbeelo..",8:".ollbbbnnbbllo..",10:".obbllllllbbbolo"}},
  penguin:{name:'Penguin',price:250,voice:'penguin',hatY:-2,pal:{n:'#ff9f1c'},feet:WEB_FEET,eyes:{bg:'l'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oobbbbbbboo...",3:".obbbbbbbbbbbo..",4:".obblllblllbbo..",5:".oblllllllllbo..",
      6:".obllewlllewbo..",7:".oblleellleebo..",8:".oblpllnnllpbo..",9:".oblllllllllbo..",10:".oblllllllllbo..",11:".obbllllllllbo.."}},
  blob:{name:'Blob',price:300,voice:'blob',hatY:-1,
    feet:{base:".ooooooooooooo..",A:"oooooooooooooo..",B:".oooooooooooooo.",sit:".ooooooooooooo..",sleep:".ooooooooooooo..",D1:"..oo..ooo..oo...",D2:"...oo.ooo.oo...."},
    rows:{0:"................",1:"................",2:".....oooooo.....",3:"...oobbbbbboo...",4:"..obbwbbbbbbbo..",9:"obbbbbbbbbbbbbo.",10:"obbbbbbbbbbbbbo.",11:"obbbbbbbbbbbbbo.",12:"obbbbbbbbbbbbbo."}},
  shroom:{name:'Shroom',price:300,voice:'shroom',hatY:-3,eyes:{bg:'l'},
    feet:{base:"..oooooooooooo..",A:"..ooo.oooooooo..",B:"..oooooooo.ooo..",sit:"..oooooooooooo..",sleep:"..oooooooooooo..",D1:"..ooo.oooooooo..",D2:"..oooooooo.ooo.."},
    rows:{0:"....ooooooo.....",1:"..oobbbbbbboo...",2:".obblbbbbblbbo..",3:"obbbbllbbbbbbbo.",4:"ooooooooooooooo.",5:"..ollllllllllo..",
      6:"..ollewlllewlo..",7:"..olleellleelo..",8:"..olpllnnllplo..",9:"..ollllllllllo..",10:"..ollllllllllo..",11:"..ollllllllllo..",12:"..ollllllllllo.."}},
  boo:{name:'Boo',price:350,voice:'boo',hatY:-2,
    feet:{base:".oo.ooo.ooo.oo..",A:"..oo.ooo.ooo.o..",B:".o.ooo.ooo.ooo..",sit:".oo.ooo.ooo.oo..",sleep:".ooooooooooooo..",D1:"..oo.ooo.ooo.o..",D2:".o.ooo.ooo.ooo.."},
    rows:{0:"................",1:"....ooooooo.....",2:"..oobbbbbbboo...",3:".obbbbbbbbbbbo..",8:".obpbbbeebbbpo..",9:".obbbbbeebbbbo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo..",12:".obbbbbbbbbbbo.."}},
  alien:{name:'Alien',price:350,voice:'alien',hatY:-1,
    feet:{base:"....oo...oo.....",A:"...oo.....oo....",B:".....oo.oo......",sit:"...ooo...ooo....",sleep:"....ooooooo.....",D1:".....o...o......",D2:"....o.....o....."},
    rows:{0:"..p.........p...",1:"...o.......o....",2:"....ooooooo.....",3:"..oobbbbbbboo...",4:".obbbbbewbbbbo..",5:".obbbbbeebbbbo..",
      9:".obbbbbbbbbbbo..",10:"..oobbbbbbboo...",11:"....obblbbo.....",12:"....obbbbbo....."}},
  robot:{name:'Robot',price:400,voice:'robot',hatY:-1,pal:{p:'#ff5d73'},eyes:{bg:'e',line:'w',ink:'w'},
    feet:{base:"...ooo...ooo....",A:"...ooo....ooo...",B:"....ooo..ooo....",sit:"..oooo...oooo...",sleep:"...ooooooooo....",D1:"....oo...oo.....",D2:"...oo.....oo...."},
    rows:{0:".......p........",1:".......o........",2:".ooooooooooooo..",3:".obbbbbbbbbbbo..",4:".obooooooooobo..",5:".obeeeeeeeeebo..",
      6:".obeewweeewwbo..",7:".obeewweeewwbo..",8:".obeeewwwweebo..",9:".obbbbbbbbbbbo..",10:".ooooooooooooo..",11:"...obblllbbo....",12:"...obbplpbbo...."}}
};
function eyesOf(C){ return Object.assign({y:6,x1:5,x2:10,bg:'b',line:'o',ink:'e'},C.eyes); }
// Builds the 14 body rows for a pose. Expressions only touch the eye pixels, so every character can make them.
function frameRows(name,C){
  const r=BASE.map(s=>s.split(''));
  for(const k in C.rows) r[k]=C.rows[k].split('');
  const E=eyesOf(C), F=Object.assign({},FEET,C.feet);
  const set=(y,x,k)=>{ if(r[y]&&x>=0&&x<16) r[y][x]=k; };
  const both=(fn)=>{ fn(E.x1); fn(E.x2); };
  const lid=()=>both(x=>{ set(E.y,x,E.bg); set(E.y,x+1,E.bg); });
  const shut=()=>both(x=>{ set(E.y+1,x,E.line); set(E.y+1,x+1,E.line); });
  const feet=(k)=>{ r[13]=F[k].split(''); };
  feet('base');
  switch(name){
    case 'blink': lid(); shut(); break;
    case 'happy': {
      lid(); shut();
      const row=r[C.blushRow||8], was=row.slice();
      was.forEach((k,i)=>{ if(k!=='p') return; if(was[i-1]===E.bg) row[i-1]='p'; if(was[i+1]===E.bg) row[i+1]='p'; });
      break;
    }
    case 'walkA': feet('A'); break;
    case 'walkB': feet('B'); break;
    case 'sit': feet('sit'); break;
    case 'sleep': lid(); shut(); feet('sleep'); break;
    case 'grumpy': lid(); both(x=>{ set(E.y-1,x-1,E.line); set(E.y-1,x,E.line); }); break;
    case 'ouch':   // squeezed-shut ">" "<" eyes
      both(x=>{ set(E.y,x-1,E.ink); set(E.y,x,E.bg); set(E.y,x+1,E.ink); set(E.y+1,x-1,E.bg); set(E.y+1,x,E.ink); set(E.y+1,x+1,E.bg); });
      break;
    case 'dangle': feet('D1'); break;
    case 'dangle2': feet('D2'); break;
  }
  return r;
}
/* ---------- colors ---------- */
const SKINS={
  classic:{name:'Classic',price:0,pal:{o:'#3b2a2f',b:'#f4a259',l:'#ffe3c2',e:'#2b1d22',w:'#ffffff',p:'#f2777a',n:'#3b2a2f'}},
  sky:{name:'Sky',price:60,pal:{o:'#1f3a5f',b:'#6ec1ff',l:'#e3f4ff',e:'#10243d',w:'#ffffff',p:'#ff9fb2',n:'#1f3a5f'}},
  banana:{name:'Banana',price:60,pal:{o:'#5c4a12',b:'#ffd84d',l:'#fff6c7',e:'#3a2e08',w:'#ffffff',p:'#ff9a6b',n:'#5c4a12'}},
  strawberry:{name:'Strawberry',price:80,pal:{o:'#5a2233',b:'#ff8fab',l:'#fff0f3',e:'#3a1420',w:'#ffffff',p:'#ff4d6d',n:'#5a2233'}},
  cocoa:{name:'Cocoa',price:80,pal:{o:'#3b2417',b:'#9a6a48',l:'#ecd6bf',e:'#24140c',w:'#ffffff',p:'#f29f8f',n:'#3b2417'}},
  cherry:{name:'Cherry',price:100,pal:{o:'#4a0f14',b:'#e5383b',l:'#ffd6d6',e:'#2b0709',w:'#ffffff',p:'#ffb703',n:'#4a0f14'}},
  grape:{name:'Grape',price:100,pal:{o:'#3a1f5c',b:'#a06bff',l:'#eadcff',e:'#22103a',w:'#ffffff',p:'#ff8fd0',n:'#3a1f5c'}},
  matcha:{name:'Matcha',price:120,pal:{o:'#2f3d25',b:'#8fbf6a',l:'#e5f2c9',e:'#1f2a18',w:'#ffffff',p:'#f29f9f',n:'#2f3d25'}},
  snow:{name:'Snow',price:150,pal:{o:'#5a6478',b:'#f4f7fb',l:'#ffffff',e:'#2a3140',w:'#ffffff',p:'#ffb3c6',n:'#5a6478'}},
  steel:{name:'Steel',price:150,pal:{o:'#2b3240',b:'#9aa7b8',l:'#d9e2ec',e:'#151a22',w:'#7dffb2',p:'#ff5d73',n:'#2b3240'}},
  midnight:{name:'Midnight',price:200,pal:{o:'#191c3d',b:'#4b5bd6',l:'#a9b4ff',e:'#0d0f24',w:'#ffffff',p:'#c08bff',n:'#191c3d'}},
  ghost:{name:'Ghost',price:300,alpha:.82,pal:{o:'#7d82ad',b:'#eef1ff',l:'#ffffff',e:'#3d4170',w:'#ffffff',p:'#ffb3c6',n:'#7d82ad'}},
  void:{name:'Void',price:500,pal:{o:'#000000',b:'#1d1d26',l:'#34344a',e:'#ffe14d',w:'#fff6b0',p:'#5b3a8a',n:'#000000'}},
  gold:{name:'Gold',price:null,rarity:'legendary',unlock:'Reach a 7-day streak',pal:{o:'#6b4a00',b:'#ffcf3f',l:'#fff3b0',e:'#3a2800',w:'#ffffff',p:'#ff9a3d',n:'#6b4a00'}}
};
/* ---------- hats and face items (y0 is the first row, relative to the top of the cat's head) ---------- */
const HATPAL={y:'#ffd34d',r:'#ff5d73',w:'#ffffff',k:'#2b2738',g:'#7fd6b0',a:'#ff7a90',o:'#ff8a3d',b:'#4b8bff',n:'#8a5a3c',p:'#8b5cf6',e:'#9aa3b2'};
const HATS={
  egg:{name:'Fried egg',price:40,y0:1,rows:[".....wwwww......","....wwyywww....."]},
  sprout:{name:'Sprout',price:40,y0:-1,rows:["......gg.gg.....",".......ggg......",".......g........",".......g........"]},
  note:{name:'Sticky note',price:50,y0:0,rows:[".....yyyyy......",".....ykkyy......",".....yyyyy......"]},
  beanie:{name:'Beanie',price:60,c:'#5fb3a1',y0:-1,rows:[".......w........",".....kkkkk......","....kcccccck....","...kcccccccck..."]},
  flower:{name:'Flower',price:60,y0:0,rows:["..........a.a...","...........y....","..........a.a..."]},
  party:{name:'Party hat',price:70,y0:-3,rows:[".......y........",".......r........","......bbb.......","......rrr.......",".....bbbbb......","....rrrrrrr....."]},
  cheese:{name:'Cheese',price:80,y0:0,rows:[".......yy.......",".....yyyoy......","....yoyyyyy....."]},
  tp:{name:'Paper roll',price:80,y0:-1,rows:[".....wwwww......",".....wekew......",".....wwwwww.....","..........w....."]},
  bow:{name:'Bow',price:90,y0:1,rows:["..........rr.rr.","..........rrkrr.","...........r.r.."]},
  cone:{name:'Traffic cone',price:100,y0:-3,rows:[".......o........","......ooo.......","......www.......",".....ooooo......",".....wwwww......","....ooooooo....."]},
  plunger:{name:'Plunger',price:110,y0:-3,rows:[".......n........",".......n........",".......n........","......rrr.......",".....rrrrr......","....rrrrrrr....."]},
  propeller:{name:'Propeller cap',price:120,y0:-1,rows:["...eeee.eeee....",".......k........",".....rryybb.....","....rrryybbb...."]},
  pumpkin:{name:'Pumpkin',price:130,season:'Spooky',y0:-2,rows:[".......gg.......","....oooooooo....","...ookooookoo...","...ooookkoooo...","....oooooooo...."]},
  chef:{name:'Chef hat',price:130,y0:-3,rows:[".....wwwww......","....wwwwwww.....","....wwwwwww.....",".....wwwww......",".....wewew......",".....wwwww......"]},
  headphones:{name:'Headphones',price:140,c:'#2b2738',y0:-1,rows:["...kkkkkkkkk....","..k.........k...","..k.........k...",".k...........k..",".k...........k..","kk...........kk.","ka...........ak.","ka...........ak.","kk...........kk."]},
  cowboy:{name:'Cowboy hat',price:150,y0:-1,rows:["......nnn.......",".....nnnnn......",".n...kkkkk...n..","..nnnnnnnnnnn..."]},
  horns:{name:'Horns',price:160,y0:-1,rows:["...r.......r....","..rr.......rr...","..rr.......rr..."]},
  halo:{name:'Halo',price:180,y0:-5,rows:["....yyyyyy......","...y......y.....","....yyyyyy......"]},
  tophat:{name:'Top hat',price:200,y0:-2,rows:[".....kkkkk......",".....kkkkk......",".....rrrrr......",".....kkkkk......","...kkkkkkkkk...."]},
  wizard:{name:'Wizard hat',price:220,y0:-4,rows:["........p.......",".......pp.......","......pypp......","......pppp......",".....ppyppp.....",".....pppppp.....","...pppppppppp..."]},
  crown:{name:'Crown',price:350,y0:-1,rows:[".....y.y.y......",".....yyyyy......",".....yryry......"]},
  nightcap:{name:'Nightcap',price:null,rarity:'epic',unlock:'Take 10 video breaks',y0:-1,rows:["..........bw....",".......bbbb.....","....bbbbbbb.....","...wwwwwwwww...."]}
};
const FACES={
  stache:{name:'Mustache',price:60,y0:9,rows:["....kkk..kkk...."]},
  mask:{name:'Mask',price:80,y0:8,rows:["...wwwwwwwww....","....wwwwwww....."]},
  patch:{name:'Eye patch',price:100,eye:true,y0:5,rows:["..kkkkkkkkkkk...","....kkk.........","....kkk........."]},
  shades:{name:'Shades',price:120,eye:true,y0:6,rows:["....kkkkkkkkk...","....kkk...kkk..."]},
  specs3d:{name:'3D glasses',price:160,eye:true,y0:6,rows:["....wwwwwwwww...","....rrr...bbb..."]},
  bandage:{name:'Bandage',price:null,rarity:'rare',unlock:'Drop your pet from way up high 10 times',y0:3,rows:[".........w.w....","..........w.....",".........w.w...."]}
};
// True only for ids that are really in a catalog. A friend's copy can send any text as an outfit,
// and plain lookups would happily find things like "constructor".
const has=(catalog,id)=>typeof id==='string'&&Object.hasOwn(catalog,id);
const cache=new Map();
function sprite(look,frame){
  const ch=has(CHARS,look.char)?look.char:'cat', skin=has(SKINS,look.skin)?look.skin:'classic';
  const hat=has(HATS,look.hat)?HATS[look.hat]:null, face=has(FACES,look.face)?FACES[look.face]:null;
  const key=[ch,skin,frame,hat?look.hat:'',face?look.face:''].join('|');
  let c=cache.get(key); if(c) return c;
  c=document.createElement('canvas'); c.width=SPR_W; c.height=SPR_H;
  const x=c.getContext('2d'); const C=CHARS[ch]; const pal=Object.assign({},SKINS[skin].pal,C.pal); const E=eyesOf(C);
  const put=(rows,y0,dx,color)=>rows.forEach((row,ri)=>{for(let i=0;i<16;i++){const k=row[i]; if(!k||k==='.')continue; x.fillStyle=color(k)||'#f0f'; x.fillRect(i+dx,PAD+y0+ri,1,1);}});
  if(C.top) put(C.top,-C.top.length,0,k=>pal[k]);
  put(frameRows(frame,C),0,0,k=>pal[k]);
  // Glasses and patches follow the eyes; mustaches and masks stay at the mouth.
  if(face) put(face.rows,face.y0+(face.eye?E.y-6:0),face.eye?Math.round((E.x1-5+E.x2-10)/2):0,k=>HATPAL[k]);
  if(hat) put(hat.rows,hat.y0+(C.hatY||0),0,k=>k==='c'?hat.c:HATPAL[k]);
  cache.set(key,c); return c;
}

/* ---------- buddies: a little follower that trails behind the pet ---------- */
const BUDDIES={
  slime:{name:'Slime',price:250,pal:{o:'#2f3d25',b:'#8fe36a',e:'#1f2a18'},rows:["..oooo..",".obbbbo.","obebbebo","obbbbbbo","oooooooo"]},
  chick:{name:'Chick',price:250,pal:{o:'#5c4a12',y:'#ffe066',e:'#2b1d22',n:'#ff9f1c'},rows:["..ooo...",".oyyyo..","oyeyyyo.","nyyyyyyo",".oyyyyo.","..o..o.."]},
  balloon:{name:'Balloon',price:300,hover:46,pal:{r:'#ff5d73',w:'#ffffff',k:'#2b2738'},rows:[".rrrr.","rrwrrr","rrrrrr",".rrrr.","..rr..","..k...","...k..","..k..."]},
  bat:{name:'Bat',price:300,season:'Spooky',hover:54,pal:{k:'#2b2738',r:'#ff5d73'},rows:["k...kk...k","kk.kkkk.kk","kkkkrkrkkk",".kkkkkkkk.","..k.kk.k.."]},
  mini:{name:'Mini-me',price:350,own:true,rows:[".oooooo.","obbbbbbo","obebbebo","obbbbbbo","obbbbbbo",".oo..oo."]},
  ufo:{name:'UFO',price:400,hover:60,pal:{o:'#2b2738',b:'#7fe7ff',e:'#9aa3b2',y:'#ffd34d'},rows:["...oooo...","..obbbbo..","oooooooooo","oeyeeyeeyo",".oooooooo."]},
  heart:{name:'Heart',price:null,rarity:'epic',unlock:'Add your first friend',hover:50,pal:{r:'#ff5d73',w:'#ffffff'},rows:[".rr.rr.","rwrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."]}
};
// Draws a buddy with its feet at (x, y). "own" buddies borrow the pet's colors.
function drawBuddy(ctx,id,x,y,px,flip,look){
  if(!has(BUDDIES,id)) return;
  const b=BUDDIES[id], pal=b.own?SKINS[look&&has(SKINS,look.skin)?look.skin:'classic'].pal:b.pal;
  const w=b.rows[0].length, h=b.rows.length;
  ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1);
  for(let r=0;r<h;r++)for(let i=0;i<w;i++){const k=b.rows[r][i]; if(k==='.')continue; ctx.fillStyle=pal[k]||'#f0f'; ctx.fillRect((i-w/2)*px,(r-h)*px,px,px);}
  ctx.restore();
}

/* ---------- the catalog: what can be worn, and how rare it is ---------- */
const KINDS={char:CHARS,skin:SKINS,hat:HATS,face:FACES,buddy:BUDDIES};
const RARITIES=['common','rare','epic','legendary'];
function rarityOf(item){
  if(item.rarity) return item.rarity;
  const p=item.price||0;
  return p>=350?'legendary':p>=200?'epic':p>=100?'rare':'common';
}

/* item pixel art */
const ART={
  food:{pal:{o:'#3b2a2f',b:'#7ec8e3',e:'#1d1a2b'},rows:["..oooo...oo",".obbbbo.obo","obebbbbobbo",".obbbbo.obo","..oooo...oo"]},
  ball:{pal:{o:'#3b2a2f',r:'#ff5d73',w:'#ffffff'},rows:["..oooo..",".orrrro.","orwrrrro","orrrrrro","owwwwwwo","orrrrrro",".orrrro.","..oooo.."]},
  gift:{pal:{o:'#3b2a2f',b:'#7fd6b0',y:'#ffd34d'},rows:["..yy..yy..","...yyyy...","oooooyoooo","obbbbybbbo","oooooyoooo",".obbbybbo.",".obbbybbo.",".obbbybbo.",".oooooooo."]}
};
function drawArt(ctx,name,x,y,px,rot){
  const a=ART[name]; const w=a.rows[0].length, h=a.rows.length;
  ctx.save(); ctx.translate(x,y-h*px/2); if(rot) ctx.rotate(rot);
  for(let r=0;r<h;r++)for(let i=0;i<w;i++){const ch=a.rows[r][i]; if(ch==='.')continue; ctx.fillStyle=a.pal[ch]; ctx.fillRect(Math.round((i-w/2)*px),Math.round((r-h/2)*px),Math.ceil(px),Math.ceil(px));}
  ctx.restore();
}
const HEART=[".rr.rr.","rrrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."];
const STAR=["..y..",".yyy.","yyyyy",".yyy.","..y.."];
const NOTE=["..kk","..kk","..k.","kkk.","kkk."];
