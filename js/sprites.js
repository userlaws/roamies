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
  dog:{name:'Puppy',price:90,voice:'dog',hatY:-2,eyes:{x1:4,x2:9,bg:'l'},
    rows:{0:"................",1:"....ooooooo.....",2:".ooolllllllooo..",3:".oblllllllllbo..",4:".oblllllllllbo..",5:"obblllllllllbbo.",
      6:"obblewlllewlbbo.",7:"obbleellleelbbo.",8:"obbpllnnnllpbbo.",9:".oollllppllloo.o",10:".obbllllplbbbobo"}},
  bunny:{name:'Bunny',price:150,voice:'bunny',
    top:["..oo......oo....",".obbo....obbo...",".obpo....obpo..."],
    rows:{0:".obpo....obpo...",1:".obbo....obbo...",2:".obbbo..obbbo...",9:".obbbbbwwbbbbo..",10:".obbllllllbbbolo",11:".obbllllllbbboo."}},
  bear:{name:'Bear',price:150,voice:'bear',hatY:-1,
    rows:{0:"..oo.......oo...",1:".obbo.....obbo..",2:".obbbooooobbbo..",3:".obbbbbbbbbbbo..",...NO_TAIL,8:".obpbllnnllbpo..",9:".obbbbllllbbbo.."}},
  panda:{name:'Panda',price:180,voice:'panda',hatY:-1,eyes:{x1:4,x2:9,bg:'o',line:'l',ink:'w'},
    rows:{0:"..oo.......oo...",1:".obbo.....obbo..",2:".obbbooooobbbo..",3:".oblllllllllbo..",4:".olllllllllllo..",5:".olloollloollo..",
      6:".oloewlllewolo..",7:".oloeellleeolo..",8:".olplllnlllplo..",9:".olllllllllllo..",10:".obbblllllbbbo..",11:".obbblllllbbbo.."}},
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
  owl:{name:'Owl',price:280,voice:'owl',hatY:-1,pal:{n:'#ff9f1c'},feet:WEB_FEET,eyes:{x1:4,x2:9,bg:'l'},
    rows:{0:".oo.........oo..",1:".obo.......obo..",2:".obbooooooobbo..",3:".obbbbbbbbbbbo..",4:".obbbbbbbbbbbo..",5:".obllllbllllbo..",
      6:".oblewlblewlbo..",7:".obleelnleelbo..",8:".opbllbnbllbpo..",9:".obblllllllbbo..",10:".obblblllblbbo..",11:".obbllblbllbbo.."}},
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
  axolotl:{name:'Axolotl',price:380,voice:'axolotl',hatY:-1,eyes:{x1:4,x2:9},
    feet:{base:"...oo.....oo....",A:"..oo......oo....",B:"....oo...oo.....",sit:"..ooo....ooo....",sleep:"...ooooooooo....",D1:"....o.....o.....",D2:"...o.......o...."},
    rows:{0:"................",1:"p.............p.",2:"pp..ooooooo..pp.",3:".ppobbbbbbbopp..",4:"..obbbbbbbbbo...",5:"ppobbbbbbbbbopp.",
      6:"..obewbbbewbo...",7:".pobeebbbeebop..",8:"ppopbbnnnbbpopp.",9:"p.obbbbbbbbbo.p.",10:"...obblllbbo.o..",11:"...obblllbbooo..",12:"...obbbbbbbo...."}},
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
  mint:{name:'Mint chip',price:70,pal:{o:'#4a2f25',b:'#9be8cf',l:'#edfff8',e:'#33201a',w:'#ffffff',p:'#ff9fb2',n:'#6b4433'}},
  strawberry:{name:'Strawberry',price:80,pal:{o:'#5a2233',b:'#ff8fab',l:'#fff0f3',e:'#3a1420',w:'#ffffff',p:'#ff4d6d',n:'#5a2233'}},
  cocoa:{name:'Cocoa',price:80,pal:{o:'#3b2417',b:'#9a6a48',l:'#ecd6bf',e:'#24140c',w:'#ffffff',p:'#f29f8f',n:'#3b2417'}},
  peach:{name:'Peach',price:90,pal:{o:'#8a3f3a',b:'#ffb7a0',l:'#fff1e3',e:'#4d1f1f',w:'#ffffff',p:'#ff7d7d',n:'#c2553f'}},
  cherry:{name:'Cherry',price:100,pal:{o:'#4a0f14',b:'#e5383b',l:'#ffd6d6',e:'#2b0709',w:'#ffffff',p:'#ffb703',n:'#4a0f14'}},
  grape:{name:'Grape',price:100,pal:{o:'#3a1f5c',b:'#a06bff',l:'#eadcff',e:'#22103a',w:'#ffffff',p:'#ff8fd0',n:'#3a1f5c'}},
  toffee:{name:'Toffee',price:110,pal:{o:'#5a3a22',b:'#d9a566',l:'#fff3d6',e:'#33200f',w:'#ffffff',p:'#f28f7a',n:'#5a3a22'}},
  matcha:{name:'Matcha',price:120,pal:{o:'#2f3d25',b:'#8fbf6a',l:'#e5f2c9',e:'#1f2a18',w:'#ffffff',p:'#f29f9f',n:'#2f3d25'}},
  ocean:{name:'Ocean',price:130,pal:{o:'#0c2c44',b:'#2a9db5',l:'#c9f5ee',e:'#071b2b',w:'#ffffff',p:'#ff8a7a',n:'#0c2c44'}},
  snow:{name:'Snow',price:150,pal:{o:'#5a6478',b:'#f4f7fb',l:'#ffffff',e:'#2a3140',w:'#ffffff',p:'#ffb3c6',n:'#5a6478'}},
  steel:{name:'Steel',price:150,pal:{o:'#2b3240',b:'#9aa7b8',l:'#d9e2ec',e:'#151a22',w:'#7dffb2',p:'#ff5d73',n:'#2b3240'}},
  watermelon:{name:'Watermelon',price:160,pal:{o:'#1e4d2b',b:'#63c56e',l:'#ff7088',e:'#12301b',w:'#ffffff',p:'#ff4f6d',n:'#1e4d2b'}},
  midnight:{name:'Midnight',price:200,pal:{o:'#191c3d',b:'#4b5bd6',l:'#a9b4ff',e:'#0d0f24',w:'#ffffff',p:'#c08bff',n:'#191c3d'}},
  cottoncandy:{name:'Cotton candy',price:220,pal:{o:'#5b3a8a',b:'#ffa6d5',l:'#b8ecff',e:'#3a2260',w:'#ffffff',p:'#7fd0ff',n:'#5b3a8a'}},
  tuxedo:{name:'Tuxedo',price:260,pal:{o:'#0d0d12',b:'#3d3d4a',l:'#ffffff',e:'#3fb75f',w:'#eaffd0',p:'#ff8fab',n:'#ff8fab'}},
  ghost:{name:'Ghost',price:300,alpha:.82,pal:{o:'#7d82ad',b:'#eef1ff',l:'#ffffff',e:'#3d4170',w:'#ffffff',p:'#ffb3c6',n:'#7d82ad'}},
  neon:{name:'Neon',price:320,pal:{o:'#16003b',b:'#ff3fd0',l:'#7df9ff',e:'#16003b',w:'#ffffff',p:'#fff338',n:'#16003b'}},
  ember:{name:'Ember',price:360,pal:{o:'#1a0d0a',b:'#56322a',l:'#f0561d',e:'#ffe27a',w:'#ffffff',p:'#ff8a2f',n:'#ffb04d'}},
  galaxy:{name:'Galaxy',price:420,pal:{o:'#0e0828',b:'#3a2a8c',l:'#8f52e0',e:'#aef4ff',w:'#ffffff',p:'#ff7ad9',n:'#aef4ff'}},
  void:{name:'Void',price:500,pal:{o:'#000000',b:'#1d1d26',l:'#34344a',e:'#ffe14d',w:'#fff6b0',p:'#5b3a8a',n:'#000000'}},
  gold:{name:'Gold',price:null,rarity:'legendary',unlock:'Handed out by the Roamies team',pal:{o:'#6b4a00',b:'#ffcf3f',l:'#fff3b0',e:'#3a2800',w:'#ffffff',p:'#ff9a3d',n:'#6b4a00'}},
  sunset:{name:'Sunset',price:null,rarity:'legendary',unlock:'Reach a 7-day streak',pal:{o:'#3a1c5c',b:'#ff6f6f',l:'#ffc857',e:'#2a1038',w:'#ffffff',p:'#ff3d8b',n:'#3a1c5c'}}
};
/* ---------- hats and face items (y0 is the first row, relative to the top of the cat's head) ---------- */
const HATPAL={y:'#ffd34d',r:'#ff5d73',w:'#ffffff',k:'#2b2738',g:'#7fd6b0',a:'#ff7a90',o:'#ff8a3d',b:'#4b8bff',n:'#8a5a3c',p:'#8b5cf6',e:'#9aa3b2',d:'#3f9b6c',m:'#c93a52',s:'#ffe9c9',t:'#e0a868'};
const HATS={
  egg:{name:'Fried egg',price:40,y0:1,rows:[".....wwwww......","....wwyywww....."]},
  sprout:{name:'Sprout',price:40,y0:-1,rows:["......gg.gg.....",".......ggg......",".......g........",".......g........"]},
  note:{name:'Sticky note',price:50,y0:0,rows:[".....yyyyy......",".....ykkyy......",".....yyyyy......"]},
  cap:{name:'Baseball cap',price:50,y0:0,rows:[".....bbbbb......","....bwbbbbb.....",".rrrbbbbbbbb...."]},
  beanie:{name:'Beanie',price:60,c:'#5fb3a1',y0:-1,rows:[".......w........",".....kkkkk......","....kcccccck....","...kcccccccck..."]},
  flower:{name:'Flower',price:60,y0:0,rows:["..........a.a...","...........y....","..........a.a..."]},
  party:{name:'Party hat',price:70,y0:-3,rows:[".......y........",".......r........","......bbb.......","......rrr.......",".....bbbbb......","....rrrrrrr....."]},
  beret:{name:'Beret',price:70,y0:-1,rows:[".......r........","....rrrrrrr.....","...rrrrrrrrrr...","....mmmmmmmm...."]},
  cheese:{name:'Cheese',price:80,y0:0,rows:[".......yy.......",".....yyyoy......","....yoyyyyy....."]},
  tp:{name:'Paper roll',price:80,y0:-1,rows:[".....wwwww......",".....wekew......",".....wwwwww.....","..........w....."]},
  bow:{name:'Bow',price:90,y0:1,rows:["..........rr.rr.","..........rrkrr.","...........r.r.."]},
  cherrytop:{name:'Cherry on top',price:90,y0:-4,rows:["........d.......",".......d........","......rwr.......","......rrr.......",".....wwwww......","....wwewwww.....","...wwwwwewwww..."]},
  cone:{name:'Traffic cone',price:100,y0:-3,rows:[".......o........","......ooo.......","......www.......",".....ooooo......",".....wwwww......","....ooooooo....."]},
  plunger:{name:'Plunger',price:110,y0:-3,rows:[".......n........",".......n........",".......n........","......rrr.......",".....rrrrr......","....rrrrrrr....."]},
  duckie:{name:'Rubber duck',price:110,y0:-3,rows:[".....yyy........","...ooyky........",".....yyy...y....","....yyyyyyyy....","....yyyyyyyy....",".....yyyyyy....."]},
  propeller:{name:'Propeller cap',price:120,y0:-1,rows:["...eeee.eeee....",".......k........",".....rryybb.....","....rrryybbb...."]},
  grad:{name:'Grad cap',price:120,y0:-1,rows:[".....kkkkkk.....","..eeeeeeeeeeee..","....kkkkkkk..y..","....kkkkkkk..y.."]},
  pumpkin:{name:'Pumpkin',price:130,season:'Spooky',y0:-2,rows:[".......gg.......","....oooooooo....","...ookooookoo...","...ooookkoooo...","....oooooooo...."]},
  chef:{name:'Chef hat',price:130,y0:-3,rows:[".....wwwww......","....wwwwwww.....","....wwwwwww.....",".....wwwww......",".....wewew......",".....wwwww......"]},
  headphones:{name:'Headphones',price:140,c:'#2b2738',y0:-1,rows:["...kkkkkkkkk....","..k.........k...","..k.........k...",".k...........k..",".k...........k..","kk...........kk.","ka...........ak.","ka...........ak.","kk...........kk."]},
  flowercrown:{name:'Flower crown',price:140,y0:1,rows:["...a...w...a....","..ayadwywdaya...","...a.d.w.d.a...."]},
  cowboy:{name:'Cowboy hat',price:150,y0:-1,rows:["......nnn.......",".....nnnnn......",".n...kkkkk...n..","..nnnnnnnnnnn..."]},
  horns:{name:'Horns',price:160,y0:-1,rows:["...r.......r....","..rr.......rr...","..rr.......rr..."]},
  scoop:{name:'Dropped scoop',price:170,y0:-4,rows:[".......t........","......ttt.......","......tnt.......",".....ttttt......","....aaaaaaa.....","...aawaaaaaaa...","...aaaaaaaaaa...","....a...aa......"]},
  halo:{name:'Halo',price:180,y0:-5,rows:["....yyyyyy......","...y......y.....","....yyyyyy......"]},
  pirate:{name:'Pirate hat',price:190,y0:-3,rows:["......kkkk......","....kkkwwkkk....",".k.kkkkwwkkkk.k.",".kkkkkkkkkkkkkk.","..kkkkkkkkkkkk..","...yyyyyyyyyy..."]},
  tophat:{name:'Top hat',price:200,y0:-2,rows:[".....kkkkk......",".....kkkkk......",".....rrrrr......",".....kkkkk......","...kkkkkkkkk...."]},
  wizard:{name:'Wizard hat',price:220,y0:-4,rows:["........p.......",".......pp.......","......pypp......","......pppp......",".....ppyppp.....",".....pppppp.....","...pppppppppp..."]},
  viking:{name:'Viking helmet',price:240,y0:-3,rows:[".s...........s..",".st.........ts..","..tt.eeeee.tt...","...teeeeeeet....","...eeeeeeeee....","...yyyyyyyyy...."]},
  froghood:{name:'Frog hood',price:260,y0:-2,rows:["...ggg...ggg....","..gwkg...gwkg...","..ggggggggggg...",".ggggggggggggg..",".gdddddddddddg.."]},
  umbrella:{name:'Tiny umbrella',price:280,y0:-5,rows:[".......k........",".....wrrrw......","...rwwrrrwwr....","..rrwwrrrwwrr...",".......e........",".......e........",".......e........",".......e........"]},
  unicorn:{name:'Unicorn horn',price:320,y0:-3,rows:[".......w........",".......y........","......ww........","......yy........",".....www........",".....yyy........"]},
  crown:{name:'Crown',price:350,y0:-1,rows:[".....y.y.y......",".....yyyyy......",".....yryry......"]},
  starcrown:{name:'Star crown',price:420,y0:-6,rows:[".......y........","......yyy.......",".....yywyy......","..y...yyy...y...",".yyy...y...yyy..","..y.........y..."]},
  nightcap:{name:'Nightcap',price:null,rarity:'epic',unlock:'Take 10 video breaks',y0:-1,rows:["..........bw....",".......bbbb.....","....bbbbbbb.....","...wwwwwwwww...."]}
};
const FACES={
  rednose:{name:'Clown nose',price:50,y0:8,rows:[".......ar.......",".......rr......."]},
  stache:{name:'Mustache',price:60,y0:9,rows:["....kkk..kkk...."]},
  glasses:{name:'Round glasses',price:70,eye:true,y0:4,rows:["....kkk..kkk....","...kwwwkkwwwk...","...kw..kkw..k...","...kw..kkw..k...","....kkk..kkk...."]},
  mask:{name:'Mask',price:80,y0:8,rows:["...wwwwwwwww....","....wwwwwww....."]},
  patch:{name:'Eye patch',price:100,eye:true,y0:5,rows:["..kkkkkkkkkkk...","....kkk.........","....kkk........."]},
  lollipop:{name:'Lollipop',price:110,y0:7,rows:[".rr.............","rwrr............","rrrrwww.........",".rr............."]},
  shades:{name:'Shades',price:120,eye:true,y0:6,rows:["....kkkkkkkkk...","....kkk...kkk..."]},
  bandana:{name:'Bandana',price:140,y0:8,rows:["..bbbbbbbbbbb...","...bwbbbwbbb....",".....bbwbbb.....",".......bb......."]},
  specs3d:{name:'3D glasses',price:160,eye:true,y0:6,rows:["....wwwwwwwww...","....rrr...bbb..."]},
  bubblegum:{name:'Bubblegum',price:180,y0:8,rows:["......aaa.......",".....awaaa......",".....aaaaa......","......aaa......."]},
  monocle:{name:'Monocle',price:220,eye:true,y0:4,rows:[".........yyy....","........ywwwy...","........yw..y...","........yw..y...",".........yyy....","............y...","............y..."]},
  hearteyes:{name:'Heart eyes',price:260,eye:true,y0:5,rows:["....r.r...r.r...","....rrr...rrr...","....rrr...rrr...",".....r.....r...."]},
  visor:{name:'Laser visor',price:380,eye:true,y0:5,rows:["...eeeeeeeeee...","...erwrrrrrre...","...eeeeeeeeee..."]},
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
  rock:{name:'Pet rock',price:60,pal:{o:'#3d3a4a',b:'#9a97a8',l:'#c5c3d0',e:'#1d1a2b',w:'#ffffff'},rows:["..oooo..",".obllbo.","obbbbbbo","owebwebo","obbbbbbo",".oooooo."]},
  snail:{name:'Snail',price:90,pal:{o:'#4a3327',b:'#ffd9a0',s:'#ff8a5c',t:'#ffc27a',e:'#2b1d22'},rows:["e.e..oooo.","b.b.osssso","bbbosttsso","bbbostssso","obbbbbbbbo",".oooooooo."]},
  bee:{name:'Bee',price:150,hover:40,pal:{k:'#2b2738',y:'#ffd34d',w:'#ffffff',e:'#2b2738'},rows:["....ww.w..","...wwwww..",".yykyyky..","yeykyykyk.",".yykyyky.."]},
  cloud:{name:'Rain cloud',price:180,hover:58,pal:{o:'#8fa3c8',w:'#ffffff',l:'#d6e6ff',e:'#2b2738',b:'#6ec1ff'},rows:["....oooo....","..oowwwwoo..",".owwwwwwwwo.","owwwewwewwwo","owwwwwwwwwwo",".ollllllllo.","..oooooooo..","...b....b...","......b....."]},
  star:{name:'Lucky star',price:240,hover:50,pal:{y:'#ffd34d',o:'#ffb020',e:'#3a2800',p:'#ff9a6b'},rows:["...yy...","..yyyy..","yyyyyyyy",".yeyyey.","..pyyp..",".yyyyyy.",".oy..yo."]},
  slime:{name:'Slime',price:250,pal:{o:'#2f3d25',b:'#8fe36a',e:'#1f2a18'},rows:["..oooo..",".obbbbo.","obebbebo","obbbbbbo","oooooooo"]},
  chick:{name:'Chick',price:250,pal:{o:'#5c4a12',y:'#ffe066',e:'#2b1d22',n:'#ff9f1c'},rows:["..ooo...",".oyyyo..","oyeyyyo.","nyyyyyyo",".oyyyyo.","..o..o.."]},
  fishbowl:{name:'Fishbowl',price:280,pal:{o:'#8fa0b8',l:'#bfe9ff',f:'#ff8a3d',e:'#2b2738',s:'#ffe3a0'},rows:["..oooooo..",".o......o.","ollllllllo","olllfflflo","ollfeffllo","olllfflflo",".osssssso.","..oooooo.."]},
  balloon:{name:'Balloon',price:300,hover:46,pal:{r:'#ff5d73',w:'#ffffff',k:'#2b2738'},rows:[".rrrr.","rrwrrr","rrrrrr",".rrrr.","..rr..","..k...","...k..","..k..."]},
  bat:{name:'Bat',price:300,season:'Spooky',hover:54,pal:{k:'#2b2738',r:'#ff5d73'},rows:["k...kk...k","kk.kkkk.kk","kkkkrkrkkk",".kkkkkkkk.","..k.kk.k.."]},
  mini:{name:'Mini-me',price:350,own:true,rows:[".oooooo.","obbbbbbo","obebbebo","obbbbbbo","obbbbbbo",".oo..oo."]},
  planet:{name:'Tiny planet',price:380,hover:56,pal:{p:'#8b5cf6',l:'#c4a8ff',y:'#ffd34d'},rows:["....pppp....","...pplppp...","..pplppppp.y",".yyyyyyyyyy.","y.pppppppp..","...pppppp...","....pppp...."]},
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
