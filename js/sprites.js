// Roamies sprites and item art. Shared by the desktop overlay and the app window.
// Every sprite is 16 px wide, faces left, and is flipped when the pet faces right.
// A pet's look is { char, skin, hat, face, buddy }: any character can wear any hat and face item, and any color
// (but for the few that keep to colors of their own: see skins, under characters).
// (sprite() sees to it that each of those thousands of combinations can be made out: see "making sure" below.)
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
const WING_FEET={base:"....oo...oo.....",A:"...oo....oo.....",B:"....oo..oo......",sit:"...ooo...ooo....",sleep:"....ooooooo.....",D1:".....o...o......",D2:"....o.....o....."};
/* ---------- characters ----------
   rows:  body rows that differ from the cat        top:   extra rows above the head (long ears)
   eyes:  where the 2x2 eyes sit and what they are drawn on, so blinking works on any face
   hatY:  how far hats move up or down to sit on this head
   Some characters don't just walk (pet.js acts on these):
   hover: how far off the ground it floats, in screen pixels at the normal size    fin:   it swims: only its fin shows while it travels
   alt:   the rows of a second frame, and altOn says when it shows: 'beat' all the time, `beat` times a second (wings,
          a flame), 'scare' while it is held or falling (the puffer blows up), 'happy' (the toast pops up)
   trail: what it leaves in the air behind it ('cloud': puffs of it)    ink, fire, lamp, climber, leap: see pet.js
   quick: how many times as fast it walks    dust: the color of what it kicks up as it goes    tough: a long drop doesn't hurt it
   size:  how many times as big it is drawn    sun: it grows with the day, and is at its biggest at noon
   And one doesn't wear every color:
   skins: the only colors it comes in    coat:  its own colors, which it wears as Classic and in place of any other */
// What the people out of each of the anime packs have in common (see the end of CHARS).
const HEAD={price:null,hatY:-2,eyes:{bg:'s',ink:'i'}};
const SHINOBI={...HEAD,season:'Naruto',unlock:'Fill the Naruto pack',climber:true};
const SWORD={...HEAD,season:'SAO',unlock:'Fill the Sword Art Online pack'};
const SINS={...HEAD,season:'Sins',unlock:'Fill the Seven Deadly Sins pack'};
const AIR={...HEAD,season:'Avatar',unlock:'Fill the Avatar pack'};
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
      6:".obeewweeewwbo..",7:".obeewweeewwbo..",8:".obeeewwwweebo..",9:".obbbbbbbbbbbo..",10:".ooooooooooooo..",11:"...obblllbbo....",12:"...obbplpbbo...."}},
  capy:{name:'Capy',price:260,voice:'capy',hatY:-1,
    rows:{0:"................",1:"..oo.......oo...",2:".obooooooooobo..",3:".obbbbbbbbbbbo..",8:".opblllllllbpo..",9:".obblnlllnlbbo..",10:".obblllolllbbo..",11:".obbbbbbbbbbbo.."}},
  cactus:{name:'Cactus',price:280,voice:'cactus',hatY:-1,pal:{t:'#c96f4a'},eyes:{x1:5,x2:8},feet:WING_FEET,
    rows:{0:".......p........",1:"......pwp.......",2:"....ooopooo.....",3:"...obbbbbbbo....",4:"...obblbbbbo.o..",5:"...obbbbbbboobo.",6:".o.obewbewboobo.",7:"oboobeebeebbbbo.",8:"oboopbbnbbpooo..",9:"obbbbbbbbbbo....",10:".ooobblbbbbo....",11:"..ottttttttto...",12:"...ottttttto...."}},
  crab:{name:'Crab',price:300,voice:'crab',hatY:1,blushRow:9,eyes:{y:5,x1:4,x2:10},
    feet:{base:".o.o.o....o.o.o.",A:"o.o.o......o.o.o",B:"..o.o.o..o.o.o..",sit:".oo.o......o.oo.",sleep:"...oooooooooo...",D1:"o.o.o......o.o.o",D2:"..o.o.o..o.o.o.."},
    rows:{0:"................",1:"................",2:"................",3:"................",4:"...oooo..oooo...",5:"...oewo..oewo...",6:"o.ooeeo..oeeoo.o",7:"oboobbboobbboobo",8:"ooobbbbbbbbbbooo",9:"..obpbbnnbbpbo..",10:"..obbllllllbbo..",11:"..obbbbbbbbbbo..",12:"...oooooooooo..."}},
  dino:{name:'Dino',price:320,voice:'dino',hatY:-1,
    rows:{0:"...o...o...o....",1:"..opo.opo.opo...",2:"..opooopooopoo..",3:".obbbbbbbbbbbo..",8:".obbbbnbbnbbbo..",9:".owowowowowowo.o"}},
  toasty:{name:'Toasty',price:340,voice:'toasty',hatY:-2,pal:{t:'#e8b877'},altOn:'happy',
    feet:{base:"...ooo...ooo....",A:"...ooo....ooo...",B:"....ooo..ooo....",sit:"..oooo...oooo...",sleep:"...ooooooooo....",D1:"....oo...oo.....",D2:"...oo.....oo...."},
    rows:{0:"................",1:"...oooo.oooo....",2:"...otto.otto....",3:".ooottooottooo..",4:".obbbbbbbbbbbo..",5:".obbbbbbbbbbbooo",9:".obbbbbbbbbbbo..",10:".obbllllllbbbo..",11:".obbllllllbbbo..",12:".ooooooooooooo.."},
    alt:{0:"...oooo.oooo....",1:"...otto.otto....",2:"...otto.otto....",5:".obbbbbbbbbbbo..",7:".obbbeebbbeebooo"}},
  octo:{name:'Octo',price:360,voice:'octo',hatY:-2,ink:true,
    feet:{base:"..oo.oo.oo.oo...",A:".oo..oo.oo..oo..",B:"..oo.oo..oo.oo..",sit:".ooo.oo.oo.ooo..",sleep:".ooooooooooooo..",D1:"..o..o...o..o...",D2:"...o..o.o..o...."},
    rows:{0:"................",1:"....ooooooo.....",2:"..oobbbbbbboo...",3:".obbwbbbbbbbbo..",9:".obbbbbbbbbbbo..",10:".obbbbbbbbbbbo..",11:".obbobbobbobbo..",12:".opbopbopbopbo.."}},
  puffer:{name:'Puffer',price:380,voice:'puffer',eyes:{x1:4,x2:9},hover:10,altOn:'scare',trail:'bubble',
    feet:{base:"......ooo.......",A:".....ooo........",B:".......ooo......",sit:"......ooo.......",sleep:"......ooo.......",D1:"....o...o...o...",D2:"....o...o...o..."},
    rows:{0:"................",1:".....o.o.o......",2:".....ooooo......",3:"...oobbbbboo....",4:"..obbbbbbbbbo...",5:"..obbbbbbbbbo...",6:"..obewbbbewbo...",7:"olobeebbbeebolo.",8:".oobpllnllpboo..",9:"..oblllllllbo...",10:"..oblllllllbo...",11:"...obbbbbbbo....",12:"....ooooooo....."},
    alt:{0:"....o...o...o...",1:"...ooooooooo....",2:"o.obbbbbbbbbo.o.",3:".obbbbbbbbbbbo..",4:"oobbbbbbbbbbboo.",5:".obbbbbbbbbbbo..",6:".obbewbbbewbbo..",7:"oobbeebbbeebboo.",8:".obbpllnllpbbo..",9:"ooblllllllllboo.",10:".oblllllllllbo..",11:"o.oblllllllbo.o.",12:"...ooooooooo....",13:"....o...o...o..."}},
  jelly:{name:'Jelly',price:400,voice:'jelly',hatY:-2,hover:16,altOn:'beat',beat:2,
    feet:{base:"..b..p.b.p..b...",A:".b..p..b..p..b..",B:"...b.p.b.p.b....",sit:"..b..p.b.p..b...",sleep:"................",D1:".b..p..b..p..b..",D2:"...b.p.b.p.b...."},
    rows:{0:"................",1:"....ooooooo.....",2:"..oobbbbbbboo...",3:".obbwbbbbbbbbo..",4:".obwbbbbbbbbbo..",9:".obbbbbbbbbbbo..",10:"..ooooooooooo...",11:"...b.p.b.p.b....",12:"..b.p..b..p.b..."},
    alt:{11:"....bp.b.pb.....",12:"....bp.b.pb.....",13:".....b.p.b......"}},
  moth:{name:'Moth',price:420,voice:'moth',hatY:-1,eyes:{x1:5,x2:8},hover:30,altOn:'beat',beat:10,lamp:true,feet:WING_FEET,
    rows:{0:"..o.........o...",1:"...o.......o....",2:"....ooooooo.....",3:"oo.obbbbbbbo.oo.",4:"oloobbbbbbboolo.",5:"ollobbbbbbbollo.",6:"olpobewbewboplo.",7:"ollobeebeebollo.",8:"oloopbbnbbpoolo.",9:"olloblllllbollo.",10:".oooblllllbooo..",11:"...obbbbbbbo....",12:"....obbbbbo....."},
    alt:{3:"...obbbbbbbo....",4:"...obbbbbbbo....",5:".ooobbbbbbbooo..",9:"olloblllllbollo.",10:"olooblllllboolo.",11:".oo.obbbbbo.oo.."}},
  shark:{name:'Shark',price:450,voice:'shark',hatY:-1,fin:true,
    feet:{base:"..oo.......oo...",A:".oo........oo...",B:"...oo.....oo....",sit:".ooo.......ooo..",sleep:"..ooooooooooo...",D1:"...o.......o....",D2:"..o.........o..."},
    rows:{0:".........o......",1:"........obo.....",2:".......obbo.....",3:"..oooooobbooo...",8:".obpbbbbbbbbpo..",9:".obewewewewebo.o"}},
  wisp:{name:'Wisp',price:480,voice:'wisp',eyes:{x1:4,x2:9,bg:'l'},hover:12,altOn:'beat',beat:5,trail:'spark',
    feet:{base:"................",A:".......o........",B:"......o.o.......",sit:"................",sleep:"................",D1:".......o........",D2:"................"},
    rows:{0:".......o........",1:"......obo.......",2:".....obbo.......",3:".....obbbo..o...",4:"....obblbbo.....",5:"...obblllbbo....",6:"..obewlllewbo...",7:"..obeellleebo...",8:"..obpllnllpbo...",9:"..oblllllllbo...",10:"...oblllllbo....",11:"....obbbbbo.....",12:".....ooooo......"},
    alt:{0:"........o.......",1:".......obo......",2:"......obbo......",3:"..o..obbbo......",13:".......o........"}},
  dragon:{name:'Dragon',price:500,voice:'dragon',hatY:-1,eyes:{x1:5,x2:8},hover:26,altOn:'beat',beat:7,fire:true,feet:WING_FEET,
    rows:{0:"....o.....o.....",1:"...olo...olo....",2:"...olooooolo....",3:"o..obbbbbbbo..o.",4:"oo.obbbbbbbo.oo.",5:"oloobbbbbbboolo.",6:"ollobewbewbollo.",7:".ooobeebeebooo..",8:"...opbnbnbpo....",9:"...obbbbbbbo.o..",10:"...oblllllbooo..",11:"...oblllllbbo...",12:"....obbbbbo....."},
    alt:{3:"...obbbbbbbo....",4:"...obbbbbbbo....",5:".ooobbbbbbbooo..",6:"ollobewbewbollo.",7:"oloobeebeeboolo.",8:"oo.opbnbnbpo.oo."}},
  monkey:{name:'Monkey',price:270,voice:'monkey',hatY:-2,eyes:{x1:4,x2:9,bg:'l'},climber:true,
    feet:{base:"...ooo...ooo....",A:"...ooo....ooo...",B:"....ooo..ooo....",sit:"..oooo...oooo...",sleep:"...ooooooooo....",D1:"....oo...oo.....",D2:"...oo.....oo...."},
    rows:{0:"................",1:"....ooooooo.....",2:"...obbbbbbbo....",3:"..obbbbbbbbbo...",4:"oooblllblllbooo.",5:"opoblllllllbopo.",6:"opolewlllewlopo.",7:"oooleellleelooo.",
      8:"..olpllnllplo...",9:"..obllooollbo..o",10:"..obbblllbbbo..o",11:"..obbblllbbbo.o.",12:"...obbbbbbbooo.."}},
  gorilla:{name:'Gorilla',price:460,voice:'gorilla',hatY:-2,pal:{t:'#d5dde7',c:'#7fe7ff'},eyes:{x1:5,x2:8,bg:'l'},leap:true,
    coat:{o:'#14141b',b:'#3b3c49',l:'#8f93a3',e:'#14141b',w:'#ffffff',p:'#c98b8b',n:'#14141b'},
    skins:['cocoa','toffee','steel','snow','tuxedo','ember','copper','midnight','void','gold','diamond'],
    feet:{base:"ooo.oo...oo.ooo.",A:"ooo.oo....oo.ooo",B:"ooo..oo..oo.ooo.",sit:"oooooo...oooooo.",sleep:"ooooooooooooooo.",D1:".o...o...o...o..",D2:"o...o.....o...o."},
    rows:{0:"................",1:".....ooooo......",2:"...oobbbbboo....",3:"..obbbbbbbbbo...",4:".obbbbbbbbbbbo..",5:".obbooooooobbo..",6:"obbblewlewlbbbo.",7:"obbbleeleelbbbo.",
      8:"oobbllnlnllbboo.",9:"obblllllllllbbo.",10:"obbllooooollbbo.",11:"obotttccctttobo.",12:"obotttttttttobo."}},
  // The characters that come out of packs (game.mjs: PACKS). None is ever for sale.
  batty:{name:'Batty',price:null,rarity:'legendary',season:'Halloween',unlock:'Fill the Halloween pack in October',voice:'batty',hatY:-1,eyes:{x1:5,x2:8},hover:28,altOn:'beat',beat:8,feet:WING_FEET,
    rows:{0:"...o.......o....",1:"...oo.....oo....",2:"...obooooobo....",3:"o..obbbbbbbo..o.",4:"oo.obbbbbbbo.oo.",5:"oboobbbbbbboobo.",6:"obbobewbewbobbo.",7:"obbobeebeebobbo.",
      8:"obooobwnwbooobo.",9:"oo.obblllbbo.oo.",10:"o..obblllbbo..o.",11:"...obbbbbbbo....",12:"....obbbbbo....."},
    alt:{3:"...obbbbbbbo....",4:"...obbbbbbbo....",5:".ooobbbbbbbooo..",9:"oboobblllbboobo.",10:"oo.obblllbbo.oo.",11:"o..obbbbbbbo..o."}},
  reindeer:{name:'Reindeer',price:null,rarity:'legendary',season:'Christmas',unlock:'Fill the Christmas pack in December',voice:'reindeer',hatY:-2,pal:{n:'#ff3b3b',t:'#a8794f'},
    top:["..t.t.....t.t...","..ttt.....ttt...","...t.......t...."],
    rows:{0:"...t.......t....",1:"...tooooooot....",2:"oo.obbbbbbbo.oo.",3:"oboobbbbbbboobo.",4:".oobbbbbbbbboo..",8:".obpbllnnllbpo..",9:".obbbbllllbbbo..",10:".obbllllllbbboo.",11:".obbllllllbbbo.."}},
  // Santa wears red until he is given another color: his suit and hat take it, his beard stays white.
  santa:{name:'Santa',price:null,rarity:'legendary',season:'Christmas',unlock:'Fill the Christmas pack in December',voice:'santa',hatY:-3,eyes:{bg:'l'},
    coat:{o:'#4a0f14',b:'#d8303a',l:'#ffe0c4',e:'#2b1d22',w:'#ffffff',p:'#f2777a',n:'#e58a6f'},
    rows:{0:"......oooo......",1:"....oobbbboo....",2:"...obbbbbbbbooo.",3:"..obbbbbbbbbowwo",4:".owwwwwwwwwwwoo.",5:".olllllllllllo..",6:".olllewlllewlo..",7:".ollleellleelo..",
      8:".owpwwwnnwwpwo..",9:".owwwwwwwwwwwo..",10:".obbwwwwwwwbbo..",11:".obbbwwwwwbbbo.."}},
  // The Naruto pack (game.mjs: PACKS): seven heads on one small body. s is skin, h hair, i the iris,
  // t and c a headband's cloth and plate: all their own, whatever color is worn. What a color changes is b, what
  // they wear, and each has a coat of its own for Classic. The two packs after it are drawn the same way.
  naruto:{...SHINOBI,name:'Naruto',rarity:'legendary',voice:'naruto',quick:1.3,pal:{h:'#ffd23f',s:'#ffdcb5',i:'#2a7fff',t:'#27407a',c:'#c9d3df',m:'#c98a5a',k:'#1c1c26'},coat:{o:'#3a2410',b:'#ff8a1f',l:'#ff8a1f',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#3a2410'},
    rows:{0:"...o.o.o.o.o....",1:"..ohohohohoho...",2:"..ohhhhhhhhho...",3:".ohhhhhhhhhhho..",4:".otttcccccttto..",5:".ossssssssssso..",6:".osssiwsssiwso..",7:".omssiisssiimo..",8:".osmsssssssmso..",9:".okkbbbbbbbkko..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  sasuke:{...SHINOBI,name:'Sasuke',rarity:'epic',voice:'sasuke',fire:true,pal:{h:'#1c2238',s:'#ffe3c9',i:'#16161d'},coat:{o:'#141a30',b:'#3f55a8',l:'#3f55a8',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#141a30'},
    rows:{0:"..........o.o...",1:"....oooooohoho..",2:"..oohhhhhhhhho..",3:".ohhhhhhhhhhho..",4:".ohhhsshsshhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".obbbbsssbbbbo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  sakura:{...SHINOBI,name:'Sakura',rarity:'epic',voice:'sakura',pal:{h:'#ff8fb5',s:'#ffdcb5',i:'#3fb75f',t:'#d8303a',c:'#c9d3df'},coat:{o:'#5a1a2a',b:'#d8303a',l:'#d8303a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#5a1a2a'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".otttcccccttto..",4:".ohhhssssshhho..",5:".ohsssssssssho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".obbbbbbbbbbbo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  kakashi:{...SHINOBI,name:'Kakashi',rarity:'epic',voice:'kakashi',pal:{h:'#e2e8ef',s:'#ffe3c9',i:'#2b2738',t:'#27407a',c:'#aab4c2',m:'#2a3550'},coat:{o:'#1f2a1c',b:'#5f8a4f',l:'#5f8a4f',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#1f2a1c'},
    rows:{0:"......o.o.o.o...",1:".....ohohohoho..",2:"..ooohhhhhhhho..",3:".ohhhhhhhhhhho..",4:".otttcccccttto..",5:".ossssssssssso..",6:".osssiwsssiwso..",7:".ommmiimmmiimo..",8:".ommmmmmmmmmmo..",9:".ommbbbbbbbmmo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  hinata:{...SHINOBI,name:'Hinata',rarity:'epic',voice:'hinata',pal:{h:'#2a2f5a',s:'#ffe9d6',i:'#cfc8ee'},coat:{o:'#3a3058',b:'#cdbfe8',l:'#cdbfe8',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#3a3058'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhhhhhhhho..",5:".ohhhhhhhhhhho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".obbbbwwwbbbbo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  itachi:{...SHINOBI,name:'Itachi',rarity:'legendary',voice:'itachi',fire:true,pal:{h:'#1f1f2b',s:'#ffe3c9',i:'#e0262b',t:'#27407a',c:'#c9d3df',r:'#d8303a'},coat:{o:'#0b0b12',b:'#1c1c26',l:'#1c1c26',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#0b0b12'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".otttccoccttto..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssososssho..",9:".obbbbbbbbbbbo..",10:".obbrrbbbbbbbo..",11:".obbbbbbrrbbbo.."}},
  konan:{...SHINOBI,name:'Konan',rarity:'epic',voice:'konan',dust:'#ffffff',pal:{h:'#6a6fd8',s:'#f2ece2',i:'#e8a23a',r:'#d8303a'},coat:{o:'#0b0b12',b:'#1c1c26',l:'#1c1c26',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#0b0b12'},
    rows:{0:"..........ww....",1:"....oooooowwo...",2:"..oohhhhhhwwo...",3:".ohhhhhhhhhhho..",4:".ohhhhhssshhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpsssossspho..",9:".obbbbbbbbbbbo..",10:".obbrrbbbbbbbo..",11:".obbbbbbrrbbbo.."}},
  // The fox is in no pack and has no price: it is handed out from the admin console (locks.mjs: EXCLUSIVE).
  kurama:{name:'Kurama',price:null,rarity:'legendary',voice:'kurama',hatY:-1,fire:true,leap:true,tails:9,   // nine tails, fanned out behind it: drawTails
    coat:{o:'#3a1408',b:'#f07a1f',l:'#ffd9a8',e:'#d8262b',w:'#ffffff',p:'#3a1408',n:'#3a1408'},top:["..o.........o...",".obo.......obo.."],
    rows:{0:".obo.......obo..",1:".obbo.....obbo..",2:".obbbooooobbbo..",3:".obbbbbbbbbbbo..",4:".obbbbbbbbbbbo..",5:".obppbbbbbppbo..",6:".obbpewbbpewbo..",7:".obbpeebbpeebo..",
      8:".obnbbbnnbbnbo..",9:".obbbbbbbbbbbo..",10:".obbllllllbbbo..",11:".obbllllllbbbo.."}},
  // The Sword Art Online pack.
  kirito:{...SWORD,name:'Kirito',rarity:'legendary',voice:'kirito',quick:1.5,pal:{h:'#1a1a22',s:'#ffe3c9',i:'#3a3a48',c:'#c9d3df'},coat:{o:'#07070c',b:'#22222e',l:'#22222e',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#07070c'},
    rows:{0:"................",1:"...o.ooooo.o....",2:"..ohohhhhhoho...",3:".ohhhhhhhhhhho..",4:".ohhhshhshhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".obbbbbcbbbbbo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  asuna:{...SWORD,name:'Asuna',rarity:'legendary',voice:'asuna',quick:1.7,dust:'#ffd9ec',pal:{h:'#e8935a',s:'#ffdcb5',i:'#c9772f',r:'#d8303a'},coat:{o:'#6a3a2a',b:'#f6f2ee',l:'#f6f2ee',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#6a3a2a'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhhshhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".ohbbbrbbbbbho..",10:".ohbbbrbbbbbho..",11:".ohrrrrrrrrrho.."}},
  leafa:{...SWORD,name:'Leafa',rarity:'epic',voice:'leafa',hover:22,trail:'spark',pal:{h:'#ffe066',s:'#ffdcb5',i:'#3fb75f'},coat:{o:'#1f4a2a',b:'#4fae5a',l:'#4fae5a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#1f4a2a'},
    rows:{0:"..........ww....",1:"....oooooowwo...",2:"..oohhhhhhwwo...",3:".ohhhhhhhhhhho..",4:".ohhhhhshhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".ohbbwwwwwbbho..",10:".ohbbbbbbbbbho..",11:".ohbbbbbbbbbho.."}},
  sinon:{...SWORD,name:'Sinon',rarity:'epic',voice:'sinon',pal:{h:'#7fd6cf',s:'#ffe9d6',i:'#3fb7c9',k:'#2b2738'},coat:{o:'#2a3320',b:'#6f8a4f',l:'#6f8a4f',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#2a3320'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhshhhhhho..",5:".ohkssssssskho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".owwwwwwwwwwwo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  yui:{...SWORD,name:'Yui',rarity:'epic',voice:'yui',size:.78,hover:14,trail:'spark',pal:{h:'#22222c',s:'#ffe9d6',i:'#4a4a58'},coat:{o:'#5a3a4a',b:'#f4c9dc',l:'#f4c9dc',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#5a3a4a'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhhhhhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".ohbbbbbbbbbho..",10:".ohbbbbbbbbbho..",11:".ohbbbbbbbbbho.."}},
  eugeo:{...SWORD,name:'Eugeo',rarity:'epic',voice:'eugeo',dust:'#bfe9ff',pal:{h:'#e8c078',s:'#ffdcb5',i:'#3fae7a'},coat:{o:'#1a2a50',b:'#3f6fc0',l:'#3f6fc0',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#1a2a50'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhshhhhhho..",5:".ohsssssssssho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".obbbbbwbbbbbo..",10:".obbbbwwwbbbbo..",11:".obbbbbbbbbbbo.."}},
  alice:{...SWORD,name:'Alice',rarity:'legendary',voice:'alice',dust:'#ffd34d',pal:{h:'#ffe27a',s:'#ffdcb5',i:'#2a6fd8',k:'#3a4fb0'},coat:{o:'#5a3a08',b:'#f0b429',l:'#f0b429',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#5a3a08'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhwwwwwhhho..",4:".ohhhhhshhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".ohbbbbkbbbbho..",10:".ohbbbbbbbbbho..",11:".ohbbbbbbbbbho.."}},
  strea:{...SWORD,name:'Strea',rarity:'epic',voice:'strea',leap:true,pal:{h:'#c8a8e8',s:'#ffdcb5',i:'#d8364a'},coat:{o:'#2a1a3a',b:'#6a3f8a',l:'#6a3f8a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#2a1a3a'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhhhshhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".ohbbbbbbbbbho..",10:".ohbbbbbbbbbho..",11:".ohbbbbbbbbbho.."}},
  rain:{...SWORD,name:'Rain',rarity:'epic',voice:'rain',pal:{h:'#d8364a',s:'#ffdcb5',i:'#c9772f'},coat:{o:'#0b0b12',b:'#26262e',l:'#26262e',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#0b0b12'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohwhwhwhwhwho..",4:".ohhhhhhhhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".obbbwwwwwbbbo..",10:".obbbwwwwwbbbo..",11:".obbbbbbbbbbbo.."}},
  seven:{...SWORD,name:'Seven',rarity:'epic',voice:'seven',size:.85,pal:{h:'#d9dde6',s:'#ffe9d6',i:'#c94f9a',k:'#3a4fb0'},coat:{o:'#1a2a50',b:'#3f6fc0',l:'#3f6fc0',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#1a2a50'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".okkkkkkkkkkko..",4:".ohhhhhshhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".ohbbbbbbbbbho..",10:".ohbbbbbbbbbho..",11:".ohbbbbbbbbbho.."}},
  // The Seven Deadly Sins pack.
  meliodas:{...SINS,name:'Meliodas',rarity:'legendary',voice:'meliodas',size:.85,leap:true,quick:1.3,pal:{h:'#ffe04d',s:'#ffdcb5',i:'#3fb75f',k:'#22222c',g:'#3fb75f'},coat:{o:'#3a2a1a',b:'#f6f2ee',l:'#f6f2ee',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#3a2a1a'},
    rows:{0:"...o.o.o.o.o....",1:"..ohohohohoho...",2:"..ohhhhhhhhho...",3:".ohhhhhhhhhhho..",4:".ohhshhhshhhho..",5:".ohsssssssssho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohsssssssssho..",9:".okkbbbgbbbkko..",10:".okkbbbbbbbkko..",11:".okkbbbbbbbkko.."}},
  diane:{...SINS,name:'Diane',rarity:'epic',voice:'diane',size:1.35,leap:true,pal:{h:'#6a4a3a',s:'#ffdcb5',i:'#8a6fd8'},coat:{o:'#5a2a08',b:'#f08a2a',l:'#f08a2a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#5a2a08'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:"hohhhhhshhhhhoh.",5:"hohhssssssshhoh.",6:"hohssiwsssiwhoh.",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".obbbbbbbbbbbo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  ban:{...SINS,name:'Ban',rarity:'epic',voice:'ban',tough:true,pal:{h:'#cfe6f2',s:'#ffe9d6',i:'#d8364a',r:'#c0392b'},coat:{o:'#3a0f10',b:'#b3262b',l:'#b3262b',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#3a0f10'},
    rows:{0:"......o.o.o.o...",1:".....ohohohoho..",2:"..ooohhhhhhhho..",3:".ohhhhhhhhhhho..",4:".ohhshhshhshho..",5:".ossssssssssso..",6:".osssiwsssiwso..",7:".osssiisssiiso..",8:".osrssssssssso..",9:".obbbsssssbbbo..",10:".obbbsssssbbbo..",11:".obbbbbbbbbbbo.."}},
  king:{...SINS,name:'King',rarity:'epic',voice:'king',hover:18,trail:'spark',pal:{h:'#d8843a',s:'#ffdcb5',i:'#c9772f',y:'#f0a02a'},coat:{o:'#16403a',b:'#3f9b8a',l:'#3f9b8a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#16403a'},
    rows:{0:"................",1:"...o.ooooo.o....",2:"..ohohhhhhoho...",3:".ohhhhhhhhhhho..",4:".ohhhhhshhhhho..",5:".ohsssssssssho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".oyyyyyyyyyyyo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  gowther:{...SINS,name:'Gowther',rarity:'epic',voice:'gowther',pal:{h:'#d8508a',s:'#ffe9d6',i:'#c9a020',g:'#f0c040',k:'#8a5ac0'},coat:{o:'#4a3a5a',b:'#f2eef6',l:'#f2eef6',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#4a3a5a'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhhhhhhhho..",5:".ossgggssgggso..",6:".ossgiwgsgiwgo..",7:".ossgiigsgiigo..",8:".ossgggssgggso..",9:".obbbbbkbbbbbo..",10:".obbbbbkbbbbbo..",11:".obbbbbbbbbbbo.."}},
  merlin:{...SINS,name:'Merlin',rarity:'epic',voice:'merlin',hover:12,trail:'spark',pal:{h:'#22222c',s:'#ffe9d6',i:'#e8a23a'},coat:{o:'#1f1438',b:'#5a3a8a',l:'#5a3a8a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#1f1438'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhhshhhhhho..",5:".ohhssssssshho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".owwwwwwwwwwwo..",10:".obbbbbbbbbbbo..",11:".obbbbbbbbbbbo.."}},
  escanor:{...SINS,name:'Escanor',rarity:'legendary',voice:'escanor',sun:true,pal:{h:'#e88a3a',s:'#f0c8a0',i:'#3a7fd8'},coat:{o:'#2a3a20',b:'#4f8a4a',l:'#4f8a4a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#2a3a20'},
    rows:{0:"................",1:"...o.ooooo.o....",2:"..ohohhhhhoho...",3:".ohhhhhhhhhhho..",4:".ohhhhhhhhshho..",5:".ossssssssssso..",6:".osssiwsssiwso..",7:".osssiisssiiso..",8:".ossshhshhssso..",9:".ossssssssssso..",10:".ossssssssssso..",11:".obbbbbbbbbbbo.."}},
  // The Avatar pack (game.mjs: PACKS). Three people drawn like the ones above (a is Aang's arrow, d the shaved sides
  // of Sokka's head), and the two animals they travel with, which fly: Appa big and slow with clouds behind him,
  // Momo small, on wings that beat.
  aang:{...AIR,name:'Aang',rarity:'legendary',voice:'aang',quick:1.4,leap:true,dust:'#e6f4ff',pal:{s:'#ffdcb5',a:'#5fb0e8',i:'#4f5562',y:'#f2b632'},coat:{o:'#5a2a12',b:'#e2603a',l:'#e2603a',e:'#2b2738',w:'#ffffff',p:'#f29a9a',n:'#5a2a12'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oosssaassoo...",3:".osssssaasssso..",4:".ossssaaaassso..",5:".osssssaasssso..",6:".osssiwsssiwso..",7:".osssiisssiiso..",8:".ospssssssspso..",9:".oyyyyyyyyyyyo..",10:".oyybbbbbbbyyo..",11:".obbbbbbbbbbbo.."}},
  katara:{...AIR,name:'Katara',rarity:'epic',voice:'katara',dust:'#7fc4ff',pal:{h:'#4a2e22',s:'#c98d62',i:'#3f8fe0',k:'#8fd0ff',c:'#2f4f9a'},coat:{o:'#1f2a50',b:'#6f8fd8',l:'#6f8fd8',e:'#2b2738',w:'#ffffff',p:'#e07a6a',n:'#1f2a50'},
    rows:{0:"................",1:"....ooooooo.....",2:"..oohhhhhhhoo...",3:".ohhhhhhhhhhho..",4:".ohhhssssshhho..",5:".ohkssssssskho..",6:".ohssiwsssiwho..",7:".ohssiisssiiho..",8:".ohpssssssspho..",9:".obbbccwccbbho..",10:".obbbbbwbbbbho..",11:".owwwwwwwwwwko.."}},
  sokka:{...AIR,name:'Sokka',rarity:'epic',voice:'sokka',pal:{h:'#4a2e22',d:'#8f6044',s:'#c98d62',i:'#3f8fe0'},coat:{o:'#16213f',b:'#4a66b0',l:'#4a66b0',e:'#2b2738',w:'#ffffff',p:'#e07a6a',n:'#16213f'},
    rows:{0:".......ooo......",1:"....ooohhho.....",2:"..ooddhhhddoo...",3:".odddhhhhhdddo..",4:".osssshhhsssso..",5:".ossssssssssso..",6:".osssiwsssiwso..",7:".osssiisssiiso..",8:".ossssssssssso..",9:".obbbwwwwwbbbo..",10:".obbbbwwbbbbbo..",11:".obbbbbbbbbbbo.."}},
  appa:{name:'Appa',price:null,rarity:'legendary',season:'Avatar',unlock:'Fill the Avatar pack',voice:'appa',hatY:-2,size:1.5,hover:40,trail:'cloud',altOn:'beat',beat:3,eyes:{x1:4,x2:9},pal:{a:'#9a735a',t:'#d8c7a0'},
    coat:{o:'#5a4a3c',b:'#f3ecdc',l:'#ffffff',e:'#2b1d22',w:'#ffffff',p:'#f2b0a0',n:'#3a2a22'},
    feet:{base:"..o.o.o..o.o.o..",A:"..o.o.o...o.o.o.",B:"...o.o.o.o.o.o..",sit:".ooo.oo..oo.ooo.",sleep:"..oooooooooooo..",D1:"...o.o.o.o.o.o..",D2:".o.o.o....o.o.o."},
    rows:{0:"oo...........oo.",1:"oto..ooooo..oto.",2:"ottoobaaabootto.",3:".otbbbaaabbbto..",4:".obbbaaaaabbbo..",5:".obbbbaaabbbbo..",6:".obbewbabewbbo..",7:".obbeebbbeebbo..",8:".obbbbnnnbbbbo..",9:".obbbbbbbbbbbooo",10:".obbllllllbbbbao",11:".obbllllllbbbooo"},
    alt:{9:".obbbbbbbbbbbo..",10:".obbllllllbbbooo",11:".obbllllllbbbbao",12:"..obbbbbbbbbbooo"}},
  momo:{name:'Momo',price:null,rarity:'epic',season:'Avatar',unlock:'Fill the Avatar pack',voice:'momo',hatY:-2,size:.8,hover:30,altOn:'beat',beat:7,feet:WING_FEET,eyes:{x1:5,x2:8,bg:'d',ink:'g'},pal:{d:'#4a362c',g:'#9be03a',m:'#e2d3bd'},
    coat:{o:'#3a2a22',b:'#f4efe6',l:'#ffffff',e:'#1d1a2b',w:'#ffffff',p:'#c98f7a',n:'#1d1a2b'},
    rows:{0:".oo.........oo..",1:"oppo.ooooo.oppo.",2:"oppoobbbbbooppo.",3:"oppobbbbbbboppo.",4:".ooobbbbbbbooo..",5:"o..obdddddbo..o.",6:"oo.odgedgedo.oo.",7:"omoodggdggdoomo.",8:"ommodblnlbdommo.",9:"ommoobbbbboommo.",10:"oo.obblllbbo.oo.",11:"o..obblllbbo..o.",12:"....obbbbbo....."},
    alt:{5:"...obdddddbo....",6:"...odgedgedo....",7:"...odggdggdo....",8:"...odblnlbdo....",9:".ooobbbbbbbooo..",10:"omoobblllbboomo.",11:"oo.obblllbbo.oo.",12:"o...obbbbbo...o."}}
};
function eyesOf(C){ return Object.assign({y:6,x1:5,x2:10,bg:'b',line:'o',ink:'e'},C.eyes); }
// Whether a character is on its second frame right now. t: a clock in seconds. mood: 'scare', 'happy' or nothing.
function altNow(C,t,mood){ return !!C.alt&&(C.altOn==='beat'?Math.floor(t*C.beat)%2===1:C.altOn===mood); }
// Builds the 14 body rows for a pose. Expressions only touch the eye pixels, so every character can make them.
// A pose with "+" on the end ("walkA+") is that pose on the character's second frame.
function frameRows(name,C){
  const alt=name.endsWith('+')&&C.alt; if(name.endsWith('+')) name=name.slice(0,-1);
  const r=BASE.map(s=>s.split(''));
  for(const k in C.rows) r[k]=C.rows[k].split('');
  if(alt) for(const k in alt) if(k<13) r[k]=alt[k].split('');
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
  if(alt&&alt[13]) r[13]=alt[13].split('');
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
  gold:{name:'Gold',price:null,rarity:'legendary',unlock:'Collect 12 colors',fx:'sheen',pal:{o:'#6b4a00',b:'#ffcf3f',l:'#fff3b0',e:'#3a2800',w:'#ffffff',p:'#ff9a3d',n:'#6b4a00'}},
  sunset:{name:'Sunset',price:null,rarity:'legendary',unlock:'Reach a 7-day streak',pal:{o:'#3a1c5c',b:'#ff6f6f',l:'#ffc857',e:'#2a1038',w:'#ffffff',p:'#ff3d8b',n:'#3a1c5c'}},
  copper:{name:'Copper',price:240,pal:{o:'#3a1c10',b:'#c8713a',l:'#7fd1ae',e:'#22100a',w:'#ffffff',p:'#ffd08a',n:'#3a1c10'}},
  toxic:{name:'Toxic',price:280,pal:{o:'#1c2b0a',b:'#b6ff3b',l:'#f4ffc2',e:'#1c2b0a',w:'#ffffff',p:'#a14bff',n:'#1c2b0a'}},
  handheld:{name:'Handheld',price:300,pal:{o:'#0f380f',b:'#8bac0f',l:'#c4dc4a',e:'#0f380f',w:'#e0f0a0',p:'#306230',n:'#0f380f'}},
  aurora:{name:'Aurora',price:340,pal:{o:'#12243a',b:'#2bd9a8',l:'#b79cff',e:'#0a1626',w:'#ffffff',p:'#ff8ad8',n:'#12243a'}},
  deepsea:{name:'Deep sea',price:380,pal:{o:'#051a2e',b:'#0f4c75',l:'#3fe0d0',e:'#b6fff5',w:'#ffffff',p:'#ff5fa2',n:'#3fe0d0'}},
  blueprint:{name:'Blueprint',price:440,pal:{o:'#e8f1ff',b:'#2456c9',l:'#3f74e6',e:'#e8f1ff',w:'#2456c9',p:'#7fb0ff',n:'#e8f1ff'}},
  darkmatter:{name:'Dark matter',price:null,rarity:'legendary',unlock:'Collect every color',fx:'plasma',pal:{o:'#05020a',b:'#0d0620',l:'#3a0f78',e:'#ffffff',w:'#ff7ae6',p:'#ff3df2',n:'#e9ccff'}},
  diamond:{name:'Diamond',price:null,rarity:'legendary',unlock:'Collect 22 colors',fx:'facet',pal:{o:'#2a5d8f',b:'#bfeaff',l:'#f2fcff',e:'#12324f',w:'#ffffff',p:'#ff9fd6',n:'#2a5d8f'}},
  brew:{name:"Witch's brew",price:null,rarity:'epic',season:'Halloween',unlock:'Fill the Halloween pack in October',fx:'bubbles',pal:{o:'#12081f',b:'#4a1f7a',l:'#7be04a',e:'#ffb02e',w:'#fff3b0',p:'#ff7a1f',n:'#b8ff7a'}},
  snowglobe:{name:'Snow globe',price:null,rarity:'epic',season:'Christmas',unlock:'Fill the Christmas pack in December',fx:'snow',pal:{o:'#0f2a4a',b:'#2f7fc4',l:'#a8dcff',e:'#0a1b30',w:'#ffffff',p:'#ff8fb0',n:'#0f2a4a'}},
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
  grad:{name:'Grad cap',price:120,c:'#565070',y0:-1,rows:[".....cccccc.....","..eeeeeeeeeeee..","....ccccccc..y..","....ccccccc..y.."]},
  pumpkin:{name:'Pumpkin',price:130,season:'Spooky',y0:-2,rows:[".......gg.......","....oooooooo....","...ookooookoo...","...ooookkoooo...","....oooooooo...."]},
  chef:{name:'Chef hat',price:130,y0:-3,rows:[".....wwwww......","....wwwwwww.....","....wwwwwww.....",".....wwwww......",".....wewew......",".....wwwww......"]},
  headphones:{name:'Headphones',price:140,c:'#565070',y0:-1,rows:["...eeeeeeeee....","..e.........e...","..e.........e...",".e...........e..",".e...........e..","cc...........cc.","ca...........ac.","ca...........ac.","cc...........cc."]},
  flowercrown:{name:'Flower crown',price:140,y0:1,rows:["...a...w...a....","..ayadwywdaya...","...a.d.w.d.a...."]},
  cowboy:{name:'Cowboy hat',price:150,y0:-1,rows:["......nnn.......",".....nnnnn......",".n...kkkkk...n..","..nnnnnnnnnnn..."]},
  horns:{name:'Horns',price:160,y0:-1,rows:["...r.......r....","..rr.......rr...","..rr.......rr..."]},
  scoop:{name:'Dropped scoop',price:170,y0:-4,rows:[".......t........","......ttt.......","......tnt.......",".....ttttt......","....aaaaaaa.....","...aawaaaaaaa...","...aaaaaaaaaa...","....a...aa......"]},
  halo:{name:'Halo',price:180,y0:-5,rows:["....yyyyyy......","...y......y.....","....yyyyyy......"]},
  pirate:{name:'Pirate hat',price:190,c:'#565070',y0:-3,rows:["......cccc......","....cccwwccc....",".c.ccccwwcccc.c.",".cccccccccccccc.","..cccccccccccc..","...yyyyyyyyyy..."]},
  tophat:{name:'Top hat',price:200,c:'#565070',y0:-2,rows:[".....ccccc......",".....ccecc......",".....rrrrr......",".....ccccc......","...ccccccccc...."]},
  wizard:{name:'Wizard hat',price:220,y0:-4,rows:["........p.......",".......pp.......","......pypp......","......pppp......",".....ppyppp.....",".....pppppp.....","...pppppppppp..."]},
  viking:{name:'Viking helmet',price:240,y0:-3,rows:[".s...........s..",".st.........ts..","..tt.eeeee.tt...","...teeeeeeet....","...eeeeeeeee....","...yyyyyyyyy...."]},
  froghood:{name:'Frog hood',price:260,y0:-2,rows:["...ggg...ggg....","..gwkg...gwkg...","..ggggggggggg...",".ggggggggggggg..",".gdddddddddddg.."]},
  umbrella:{name:'Tiny umbrella',price:280,y0:-5,rows:[".......k........",".....wrrrw......","...rwwrrrwwr....","..rrwwrrrwwrr...",".......e........",".......e........",".......e........",".......e........"]},
  unicorn:{name:'Unicorn horn',price:320,y0:-3,rows:[".......w........",".......y........","......ww........","......yy........",".....www........",".....yyy........"]},
  crown:{name:'Crown',price:350,y0:-1,rows:[".....y.y.y......",".....yyyyy......",".....yryry......"]},
  starcrown:{name:'Star crown',price:420,y0:-6,rows:[".......y........","......yyy.......",".....yywyy......","..y...yyy...y...",".yyy...y...yyy..","..y.........y..."]},
  nightcap:{name:'Nightcap',price:null,rarity:'epic',unlock:'Take 10 video breaks',y0:-1,rows:["..........bw....",".......bbbb.....","....bbbbbbb.....","...wwwwwwwww...."]},
  yuzu:{name:'Yuzu',price:150,y0:-2,rows:["........d.......",".......dd.......","......oooo......",".....oyoooo.....",".....oooooo....."]},
  boat:{name:'Paper boat',price:170,y0:-2,rows:[".......w........","......www.......","..wwwwwwwwwww...","...weeeeeeew....","....wwwwwww....."]},
  ramen:{name:'Ramen bowl',price:210,y0:-3,rows:["..n...n.........","...n..n.........","....yyyyyyy.....","...wwwwwwwww....","...wrwrwrwrw....","....wwwwwww....."]},
  lure:{name:'Angler lure',price:250,y0:-4,rows:["...kkkkkk.......","..k......k......",".k........k.....","yyy.......k.....","ywy.......k.....","yyy.......k.....","..........k....."]},
  storm:{name:'Storm cloud',price:300,y0:-5,rows:["....wwww........","..wwwwwwwww.....",".wwwwwwwwwwww...","..eeeeeeeeee....",".......yy.......","......yy........",".......y........"]},
  sword:{name:'Stuck sword',price:360,y0:-4,rows:[".......y........",".......n........",".....yyyyy......","......wee.......","......wee.......","......wee.......","......wee......."]},
  bubble:{name:'Bubble helmet',price:400,y0:-3,rows:["....wwwwwww.....","..ww.......ww...",".w..ww.......w..","w.w...........w.","w.............w.","w.............w.","w.............w.","w.............w.","w.............w.","w.............w.","w.............w.","w.............w.","w.............w.",".eeeeeeeeeeeee.."]},
  witch:{name:'Witch hat',price:null,rarity:'rare',season:'Halloween',unlock:'Fill the Halloween pack in October',c:'#54437f',y0:-4,rows:[".........c......",".......ccc......","......cccc......","......cccc......",".....ooyyoo.....",".....cccccc.....","..cccccccccccc.."]},
  santa:{name:'Santa hat',price:null,rarity:'rare',season:'Christmas',unlock:'Fill the Christmas pack in December',y0:-2,rows:["..........ww....",".......rrrww....",".....rrrrrr.....","....rrrrrrrr....","...wwwwwwwwww..."]},
  band:{name:'Leaf headband',price:null,rarity:'rare',season:'Naruto',unlock:'Fill the Naruto pack',y0:3,pal:{t:'#4b8bff',d:'#3f6fe0',c:'#c9d3df',w:'#ffffff',e:'#8f9bb0',k:'#4a556e'},rows:[".tttwccccettt...",".dddckkccedddt..",".............dt.","..............t."]}
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
  bandage:{name:'Bandage',price:null,rarity:'rare',unlock:'Drop your pet from way up high 10 times',y0:3,rows:[".........w.w....","..........w.....",".........w.w...."]},
  fangs:{name:'Fangs',price:150,y0:9,rows:["......w..w......","......w..w......"]},
  paci:{name:'Pacifier',price:170,y0:8,rows:[".....aaaaaa.....",".....aawwaa.....","......ayya......",".......yy......."]},
  tears:{name:'Waterworks',price:200,eye:true,y0:8,rows:[".....bb...bb....",".....bw...bw....",".....bb...bb....","......b....b...."]},
  thirdeye:{name:'Third eye',price:240,y0:3,rows:["......kkkk......",".....kwppwk.....","......kkkk......"]},
  beard:{name:'Wizard beard',price:280,y0:9,rows:["..wwwwwwwwwww...","..wwewwwwewww...","...wwwewwwww....","....wwwwwww.....",".....wwwww......"]},
  snorkel:{name:'Snorkel',price:320,eye:true,c:'#9fe3ff',y0:1,rows:[".............oo.",".............o..",".............o..","...kkkkkkkkkko..","...kccckkccck...","...kc..kkc..k...","...kc..kkc..k...","....kkk..kkk...."]},
  starry:{name:'Starstruck',price:400,eye:true,y0:5,rows:[".....y.....y....","....yyy...yyy...","....yyy...yyy...",".....y.....y...."]},
  skull:{name:'Skull mask',price:null,rarity:'epic',season:'Halloween',unlock:'Fill the Halloween pack in October',eye:true,y0:4,rows:["...wwwwwwwww....","..wwwwwwwwwww...","..www..www..w...","..www..www..w...","..wwwwwkkwwww...","...wkwkwkwkw...."]},
  scarf:{name:'Cozy scarf',price:null,rarity:'epic',season:'Christmas',unlock:'Fill the Christmas pack in December',y0:9,pal:{r:'#d8303a',m:'#a3202c',w:'#ffffff'},rows:[".rrwrrrwrrrwrr..",".mmwmmmwmmmwmm..","..rwr...........","..w.w..........."]},
  ninjamask:{name:'Ninja mask',price:null,rarity:'epic',season:'Naruto',unlock:'Fill the Naruto pack',eye:true,y0:7,pal:{h:'#454a61',m:'#2a2c3e'},rows:["..mm.......m....","..hhhhhhhhhhh...","..mmmmmmmmmmm...","..mmmmmmmmmmm...","...mmmmmmmmm...."]}
};
// True only for ids that are really in a catalog. A friend's copy can send any text as an outfit,
// and plain lookups would happily find things like "constructor".
const has=(catalog,id)=>typeof id==='string'&&Object.hasOwn(catalog,id);
// Whether a character can be seen in a color. Classic always can: on a character with a coat, it is the coat.
const wears=(ch,skin)=>skin==='classic'||!has(CHARS,ch)||!CHARS[ch].skins||CHARS[ch].skins.includes(skin);
// The colors a character is drawn in. ch and skin must be real ids.
function palOf(ch,skin){ const C=CHARS[ch]; return Object.assign({},C.coat&&(skin==='classic'||!wears(ch,skin))?C.coat:SKINS[skin].pal,C.pal); }
/* ---------- making sure what a pet wears can be seen ----------
   Any character wears any color with any hat and face item, so sooner or later a white mask lands on a white face
   and black glasses on a black cat. Two things keep every combination readable:
   - tint: where an item's color would melt into the body right next to it, the item's pixels along that edge are
     shaded toward the pet's outline, or lifted toward white, until they stand out. A mask stays white on an orange
     cat and gets a soft grey edge on a snow-white one; a pumpkin on an orange cat keeps its orange and gains a
     darker line where it meets the head. Worked out once for each character + color + item, on the standing pose,
     so an item never changes shade from one frame to the next. A color that moves has no one body color to go by:
     there an item has to stand out from all but one of five shades the body goes through, dark to light (shadesOf).
   - rim: whatever sticks out past the body gets the body's own outline, as the pet itself has. A white chef hat
     shows on a white window, and a hat reads as part of the pet instead of something floating near it. */
const SEE=27;            // colors closer than this (see apart) blur together on a pet this small
const CLEAR=.6;          // an item color is fine when this share of the body around it is clearly another color
const labs=new Map();
function labOf(hex){
  let v=labs.get(hex); if(v) return v;
  const n=parseInt(hex.slice(1),16), lin=c=>{c/=255; return c>.04045?Math.pow((c+.055)/1.055,2.4):c/12.92;};
  const r=lin(n>>16&255), g=lin(n>>8&255), b=lin(n&255), f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
  const x=f((r*.4124+g*.3576+b*.1805)/.95047), y=f(r*.2126+g*.7152+b*.0722), z=f((r*.0193+g*.1192+b*.9505)/1.08883);
  v=[116*y-16,500*(x-y),200*(y-z)]; labs.set(hex,v); return v;
}
// How different two colors look, 0 (the same) to about 100 (black and white).
function apart(a,b){ const p=labOf(a), q=labOf(b); return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]); }
function mix(a,b,t){
  const m=parseInt(a.slice(1),16), n=parseInt(b.slice(1),16), ch=s=>Math.round((m>>s&255)+((n>>s&255)-(m>>s&255))*t);
  return '#'+(1<<24|ch(16)<<16|ch(8)<<8|ch(0)).toString(16).slice(1);
}
const AROUND=[[-1,0],[1,0],[0,-1],[0,1]];
// The body as "x,y" -> color.
function bodyPixels(C,pal,frame){
  const g=new Map(), put=(rows,y0)=>rows.forEach((row,ri)=>{for(let i=0;i<16;i++){const k=row[i]; if(k&&k!=='.') g.set(i+','+(PAD+y0+ri),pal[k]||'#f0f');}});
  if(C.top) put(C.top,-C.top.length);
  put(frameRows(frame,C),0);
  return g;
}
// Where a hat's or a face item's pixels land on a character: [x, y, palette key].
// Hats sit on the head. Glasses and patches follow the eyes; mustaches and masks stay at the mouth.
function itemPixels(item,isHat,C){
  const E=eyesOf(C), dy=isHat?item.y0+(C.hatY||0):item.y0+(item.eye?E.y-6:0), dx=!isHat&&item.eye?Math.round((E.x1-5+E.x2-10)/2):0, out=[];
  item.rows.forEach((row,ri)=>{for(let i=0;i<16;i++){const k=row[i]; if(k&&k!=='.') out.push([i+dx,PAD+dy+ri,k]);}});
  return out;
}
const inkOf=(item,k)=>(item.pal&&item.pal[k])||(k==='c'?item.c:HATPAL[k])||'#f0f';   // an item may bring colors of its own (pal)
const tints=new Map();
// How an item is drawn on this character in this color: { ink: palette key -> color, for the keys that had to
// change, edge: the "x,y" of the item's pixels that touch the body, which are the ones drawn in those colors }.
function tintOf(ch,skin,kind,id){
  const key=ch+'|'+skin+'|'+kind+'|'+id; let t=tints.get(key); if(t) return t;
  t={ink:{},edge:new Set()};
  const C=CHARS[ch], pal=palOf(ch,skin), item=(kind==='hat'?HATS:FACES)[id], fx=SKINS[skin].fx;
  const body=bodyPixels(C,fx?Object.assign({},pal,{b:'~',l:'~l'}):pal,'base'), px=itemPixels(item,kind==='hat',C), mine=new Set(px.map(q=>q[0]+','+q[1])), next={};
  // For each of the item's colors: the body colors showing right beside it. The outline doesn't count: it is
  // dark on every pet, and a dark hat resting on it is not a hat that can't be seen.
  for(const [x,y,k] of px) for(const [dx,dy] of AROUND){ const n=(x+dx)+','+(y+dy), c=body.get(n); if(c&&c!==pal.o&&!mine.has(n)){ (next[k]=next[k]||[]).push(c[0]==='~'?shadesOf(fx,c==='~l'):[c]); t.edge.add(x+','+y); } }
  for(const k in next){
    const beside=next[k], share=c=>beside.filter(shades=>shades.filter(o=>apart(c,o)>=SEE).length>=Math.max(1,shades.length-1)).length/beside.length, ink=inkOf(item,k);
    if(beside.length<2||share(ink)>=CLEAR) continue;
    let best=ink, got=share(ink);
    for(const step of [.3,.5,.7]){
      for(const to of [pal.o,'#ffffff']){ const c=mix(ink,to,step), v=share(c); if(v>got+.001){ best=c; got=v; } }
      if(got>=CLEAR) break;
    }
    // Still lost: a body that is light where its outline is light too (a pale face in a pale color) leaves nothing
    // to shade toward. Plain dark ink, or nearly white, as far as it takes.
    if(got<CLEAR) for(const step of [.5,.7,.9]){
      for(const to of ['#1d1a2b','#ffffff']){ const c=mix(ink,to,step), v=share(c); if(v>got+.001){ best=c; got=v; } }
      if(got>=CLEAR) break;
    }
    t.ink[k]=best;
  }
  tints.set(key,t); return t;
}
// The cells around the pet that are open air: empty, and reachable from the edge of the picture. The hole in a
// halo is empty too, but it isn't open air, so it stays a hole.
function openAir(taken){
  const air=new Set(), todo=[[-1,-1]], free=(x,y)=>x>=-1&&x<=SPR_W&&y>=-1&&y<=SPR_H&&!taken.has(x+','+y)&&!air.has(x+','+y);
  air.add('-1,-1');
  while(todo.length){ const [x,y]=todo.pop(); for(const [dx,dy] of AROUND) if(free(x+dx,y+dy)){ air.add((x+dx)+','+(y+dy)); todo.push([x+dx,y+dy]); } }
  return air;
}
/* ---------- colors that move ----------
   A color with fx has no flat body: each body pixel is worked out from where it is and what time it is, and the
   picture is drawn again every tick. Its pal still holds a still body (b, l): tints and "own" buddies go by that. */
function ramp(stops,k){
  k=clamp(k,0,1);
  for(let i=1;i<stops.length;i++) if(k<=stops[i][0]){ const [p,a]=stops[i-1], [q,b]=stops[i]; return mix(a,b,(k-p)/(q-p)); }
  return stops[stops.length-1][1];
}
const PLASMA=[[0,'#06030c'],[.3,'#1c0840'],[.55,'#5b16b0'],[.78,'#c21fd0'],[1,'#f25ae0']];
const GOLD=[[0,'#d99a1c'],[.45,'#ffc934'],[.8,'#ffe27a'],[1,'#fff3b8']];
const ICE=[[0,'#8fd0f5'],[.45,'#bfeaff'],[.8,'#e6f8ff'],[1,'#f7fdff']];
// The same number, 0 to 1, every time for the same two whole numbers: what makes a facet or a snowflake stay put.
const noise=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
// Specks drifting through a body, each column at a pace of its own: down (dir 1) or up (-1). True where one is now.
const speck=(x,y,t,dir,share)=>noise(x,Math.floor(y-dir*t*(1.6+2*noise(x,9))))>1-share;
const FX={
  // Dark matter: black, with purple and pink energy drifting through it and the odd flash of blue.
  // x, y: the pixel, counted from the top left of the body. lift: how much brighter (the belly).
  plasma(x,y,t,lift){
    const n=(Math.sin(x*.55+t*1.1)+Math.sin(y*.6-t*.8)+Math.sin((x+y)*.35+t*.6)+Math.sin(Math.hypot(x-8,y-7)*.7-t*1.4))/8+.5;
    const c=ramp(PLASMA,(n-.38)/.42+lift), m=Math.sin(x*.4-t*.5+2)+Math.sin(y*.45+t*.9);
    return m>1.15?mix(c,'#2f6bff',Math.min(.65,(m-1.15)*.9)):c;
  },
  // Gold: polished metal. A slow glow moves through it, and every few seconds a band of light crosses the pet.
  sheen(x,y,t,lift){
    const c=ramp(GOLD,.42+lift*1.8+.14*Math.sin(y*.8+x*.3+t*.7)), d=((x+y*.6-t*9)%38+38)%38;
    return d<3?mix(c,'#fffbe6',d>=1&&d<2?.9:.5):c;
  },
  // Diamond: cut into facets, each catching the light in its own time, a few of them violet, and a glint now and then.
  facet(x,y,t,lift){
    const a=Math.floor((x+y)/3), b=Math.floor((x-y+48)/3), h=noise(a,b);
    if(noise(x*3+Math.floor(t*2.5),y*5)>.97) return '#ffffff';
    const c=ramp(ICE,.12+.76*(.5+.5*Math.sin(h*6.283+t*1.3))+lift);
    return noise(a+7,b+3)>.74?mix(c,'#d6c4ff',.45):c;
  },
  // Witch's brew: a purple potion with green bubbles coming up through it.
  bubbles(x,y,t,lift){
    const c=lift?mix('#7be04a','#5fc934',.5+.5*Math.sin(x*.7+t*.9)):mix('#4a1f7a','#35145c',.5+.5*Math.sin(y*.6-t*.8));
    return speck(x,y,t,-1,.13)?(lift?'#d9ffb0':'#9dff5c'):c;
  },
  // Snow globe: winter blue, lighter up top, and snow coming down inside it.
  snow(x,y,t,lift){
    const c=lift?mix('#a8dcff','#8fcdf7',.5+.5*Math.sin(x*.6+t*.7)):mix('#3a8fd6','#215f9f',clamp(y/13+.1*Math.sin(x*.5+t*.6),0,1));
    return speck(x,y,t,1,.15)?'#ffffff':c;
  }
};
// What a moving color's body (or its belly) looks like, near enough, whatever the time: five shades from the darkest
// it gets to the lightest, leaving out the odd glint. Tints go by these.
const shades=new Map();
function shadesOf(fx,belly){
  const key=fx+(belly?'|l':''); let v=shades.get(key); if(v) return v;
  const seen=[];
  for(const t of [0,1.7,3.4,5.1]) for(let y=0;y<13;y++) for(let x=0;x<16;x++) seen.push(FX[fx](x,y,t,belly?LIFT:0));
  seen.sort((a,b)=>labOf(a)[0]-labOf(b)[0]);
  v=[.1,.3,.5,.7,.9].map(k=>seen[Math.floor(seen.length*k)]); shades.set(key,v); return v;
}
const LIFT=.22;         // how much lighter a moving color's belly is
const FX_MS=90;         // how long one picture of a moving color lasts
const fxTick=()=>Math.floor((typeof performance==='undefined'?0:performance.now())/FX_MS);
const cache=new Map();
function sprite(look,frame){
  const ch=has(CHARS,look.char)?look.char:'cat', skin=has(SKINS,look.skin)&&wears(ch,look.skin)?look.skin:'classic';
  const hat=has(HATS,look.hat)?HATS[look.hat]:null, face=has(FACES,look.face)?FACES[look.face]:null;
  const key=[ch,skin,frame,hat?look.hat:'',face?look.face:''].join('|');
  const fx=SKINS[skin].fx, tick=fx?fxTick():0;
  let c=cache.get(key); if(c&&c.tick===tick) return c;
  c=document.createElement('canvas'); c.width=SPR_W; c.height=SPR_H; c.tick=tick;
  const x=c.getContext('2d'); const C=CHARS[ch]; const pal=palOf(ch,skin);
  // A moving color's body is marked here and colored at the very end, so what the pet wears is laid out as usual.
  const px=bodyPixels(C,fx?Object.assign({},pal,{b:'~',l:'~l'}):pal,frame), worn=new Set();
  const wear=(item,kind,id)=>{ const t=tintOf(ch,skin,kind,id); for(const [i,y,k] of itemPixels(item,kind==='hat',C)){ const cell=i+','+y; px.set(cell,(t.edge.has(cell)&&t.ink[k])||inkOf(item,k)); worn.add(cell); } };
  if(face) wear(face,'face',look.face);
  if(hat) wear(hat,'hat',look.hat);
  if(worn.size){
    const air=openAir(px);
    for(const cell of worn){ const [i,y]=cell.split(',').map(Number); for(const [dx,dy] of AROUND){ const n=(i+dx)+','+(y+dy); if(air.has(n)) px.set(n,pal.o); } }
  }
  for(const [cell,color] of px){ const [i,y]=cell.split(',').map(Number); if(i<0||i>=SPR_W||y<0||y>=SPR_H) continue; x.fillStyle=color[0]==='~'?FX[fx](i,y-PAD,tick*.11,color==='~l'?LIFT:0):color; x.fillRect(i,y,1,1); }
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
  heart:{name:'Heart',price:null,rarity:'epic',unlock:'Add your first friend',hover:50,pal:{r:'#ff5d73',w:'#ffffff'},rows:[".rr.rr.","rwrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."]},
  egg:{name:'Egg',price:260,pal:{o:'#5a4a3a',w:'#fff8ea',g:'#c9b79a',e:'#2b1d22',n:'#ff9f1c'},rows:["..oooo..",".owwwwo.","ogwgwgwo","owgwgwgo","owewwewo","owwwwwwo",".owwwwo.","..oooo..","..n..n.."]},
  skyfish:{name:'Sky fish',price:290,hover:36,pal:{o:'#8a3a12',f:'#ff8a3d',y:'#ffd34d',e:'#2b2738'},rows:["..oooo....",".offyfo.oo","ofefffoofo","offffffffo",".offffoofo","..oooo..oo"]},
  plane:{name:'Paper plane',price:320,hover:62,pal:{o:'#5a6478',w:'#ffffff',e:'#b9c4d6'},rows:["........oo",".....ooowo","..ooowwweo","oowwwwweo.","..oooewo..",".....oeo..","......o..."]},
  shadow:{name:'Shadow',price:340,pal:{o:'#0b0b12',b:'#22222e',e:'#ffffff'},rows:[".oooooo.","obbbbbbo","obebbebo","obbbbbbo","obbbbbbo",".o.oo.o."]},
  moon:{name:'Moon',price:370,hover:60,pal:{o:'#8a6a12',y:'#ffe27a',e:'#3a2800'},rows:["...ooo..","..oyyo..",".oyyo...",".oyeo...",".oyyo..o",".oyyyooo","..oyyyyo","...oooo."]},
  drone:{name:'Drone',price:420,hover:58,pal:{e:'#9aa3b2',k:'#2b2738',b:'#7fe7ff',r:'#ff5d73'},rows:["eee.....eee",".k.......k.",".kkkkkkkkk.","..kkbrbkk..","...kkkkk...","....k.k...."]},
  cursor:{name:'Lost cursor',price:450,hover:44,pal:{k:'#2b2738',w:'#ffffff',e:'#2b2738'},rows:["k.......","kk......","kwk.....","kwwk....","kwwwk...","kwwwwk..","kwewewk.","kwwwkkkk","kwkkwk..","kk.kwwk.","....kk.."]},
  jack:{name:"Jack-o'-lantern",price:null,rarity:'rare',season:'Halloween',unlock:'Fill the Halloween pack in October',pal:{o:'#6b3208',b:'#ff8a2a',y:'#ffe14d',g:'#3f9b6c'},rows:["....gg....","..oooooo..",".obbbbbbo.","obyybbyybo","obbbbbbbbo","obybyybybo",".obbbbbbo.","..oooooo.."]},
  snowman:{name:'Snowman',price:null,rarity:'rare',season:'Christmas',unlock:'Fill the Christmas pack in December',pal:{o:'#6f7f9a',w:'#ffffff',e:'#2b2738',n:'#ff9f1c',r:'#ff5d73',k:'#2b2738'},rows:["..kkkk..",".kkkkkk.",".owwwwo.",".oewewo.","nnwwwwo.",".rrrrrr.","owwwwwwo","owwkwwwo","owwkwwwo",".oooooo."]},
  shuriken:{name:'Shuriken',price:null,rarity:'rare',season:'Naruto',unlock:'Fill the Naruto pack',hover:44,spin:7,pal:{o:'#2b2738',e:'#9aa3b2',w:'#eef3f8',d:'#6b7488',k:'#2b2738'},
    rows:[".....o.....","....owo....","....owo....","...oweeo...",".oowweeeoo.","owweekeeddo",".ooeeeddoo.","...oeddo...","....odo....","....odo....",".....o....."],
    alt:[".o.......o.","owo.....oeo",".owoo.ooeo.","..owwoeeo..","..owweeeo..","...oekeo...","..oeeeddo..","..oddoddo..",".odoo.oodo.","odo.....odo",".o.......o."]},
  // These belong to somebody: they come along with their owner out of the Seven Deadly Sins pack (also, in PACKS).
  // King's staff comes in two versions, green and gold; the player picks which one to wear.
  rhitta:{name:'Rhitta',price:null,rarity:'epic',season:'Sins',unlock:'Win Escanor in the Seven Deadly Sins pack: it comes with him',hover:46,pal:{o:'#4a3420',y:'#e0a526',l:'#fff3b0',s:'#c9d3da',B:'#2f6fd1'},rows:["......o.....","...oooy.....",".ooyyoyo....","ossyooy.....","osyyo.y.....","slyo..y.....","lsyo..y.....","ssyo..y.....","olyyo.y.....","ossyooB.....",".ooyyoBo....","...oooB.....","......o....."]},
  chastiefol:{name:'Chastiefol',price:null,rarity:'epic',season:'Sins',unlock:'Win King in the Seven Deadly Sins pack: it comes with him',hover:40,pal:{o:'#1f2b25',s:'#e6edf2',k:'#4d5a66',a:'#1d2a24',y:'#e0b040',g:'#2fa36b',m:'#aab4bc'},rows:["..s..",".sks.","akyka",".aka.","..m..","..m..","..g..","..g..","..m..","..m..","..m..","..m..","..o.."]},
  chastiefolgold:{name:'Gold Chastiefol',price:null,rarity:'epic',season:'Sins',unlock:'Win King in the Seven Deadly Sins pack: it comes with him',hover:40,pal:{o:'#1f2b25',L:'#fff3b0',G:'#ffd34d',y:'#e0b040',N:'#b8860b',Y:'#e0a526'},rows:["..L..",".LGL.","NGyGN",".NGN.","..Y..","..Y..","..N..","..N..","..Y..","..Y..","..Y..","..Y..","..o.."]},
  // Sokka's: it comes along with him out of the Avatar pack, and turns over and over as it flies.
  boomerang:{name:'Boomerang',price:null,rarity:'rare',season:'Avatar',unlock:'Win Sokka in the Avatar pack: it comes with him',hover:42,spin:6,pal:{o:'#1f2a50',b:'#7fa8d8',l:'#d6e8fa'},
    rows:[".oo.....","obbo....","oblo....","oblo....","obloooo.","obllbbbo",".obbbbbo","..ooooo."],
    alt:["..ooooo.",".obbbbbo","obllbbbo","obloooo.","oblo....","oblo....","obbo....",".oo....."]}
};
// Tails: a fan of them behind a character that says how many (`tails`). They reach well past the sides of its own
// picture, which is why they are not part of it: whoever draws the pet draws these first, with the pet's feet at
// 0,0 of the context and px to a pixel. t: seconds, for the sway.
//   tailCells works the fan out on a grid of the pet's own pixels: "x,y" -> 'o' (outline), 'd' (fur) or 'l' (tip).
//   Each tail is laid over the ones before it with an outline of its own, the outer ones first and the middle last,
//   so every one can be told from its neighbours all the way out.
const TAIL_FPS=10, tailsNow=new Map();
function tailCells(n,t){
  const tick=Math.floor((t||0)*TAIL_FPS), was=tailsNow.get(n); if(was&&was.tick===tick) return was.cells;
  const cells=new Map(), mid=(n-1)/2, order=[...Array(n).keys()].sort((a,b)=>Math.abs(b-mid)-Math.abs(a-mid));
  for(const i of order){
    const f=n>1?i/(n-1):.5, rest=(202-224*f)*Math.PI/180, len=13.5+3.5*Math.sin(f*Math.PI);
    const up=(Math.PI/2-rest)*.42, sway=Math.sin(tick/TAIL_FPS*1.7+i*1.3)*.2, own=new Map(), steps=Math.ceil(len*3);
    let x=0, y=-5;
    for(let s=0;s<=steps;s++){
      const u=s/steps, a=rest+(up+sway)*u*u, r=.55+1.15*Math.sin(Math.PI*Math.pow(u,1.5));   // thin where it leaves the body, bushy further out, a point at the end
      for(let cy=Math.floor(y-r)-1;cy<=Math.ceil(y+r);cy++) for(let cx=Math.floor(x-r)-1;cx<=Math.ceil(x+r);cx++)
        if(Math.hypot(cx+.5-x,cy+.5-y)<=r){ const key=cx+','+cy; if(u>.8||!own.has(key)) own.set(key,u>.8?'l':'d'); }
      x+=Math.cos(a)*len/steps; y-=Math.sin(a)*len/steps;
    }
    for(const key of own.keys()){ const [cx,cy]=key.split(',').map(Number); for(const [dx,dy] of AROUND){ const nb=(cx+dx)+','+(cy+dy); if(!own.has(nb)) cells.set(nb,'o'); } }
    for(const [key,k] of own) cells.set(key,k);
  }
  tailsNow.set(n,{tick,cells}); return cells;
}
// The cells that show above the feet, as [x, y, kind], made once per tick of the fan rather than parsed every frame.
const tailsDrawn=new Map();
function tailList(n,t){
  const tick=Math.floor((t||0)*TAIL_FPS), was=tailsDrawn.get(n);
  if(was&&was.tick===tick) return was.list;
  const list=[];
  for(const [key,k] of tailCells(n,t)){ const [x,y]=key.split(',').map(Number); if(y<0) list.push([x,y,k]); }
  tailsDrawn.set(n,{tick,list}); return list;
}
function drawTails(ctx,look,px,t){
  const ch=look&&has(CHARS,look.char)?look.char:'cat', n=CHARS[ch].tails; if(!n) return;
  const pal=palOf(ch,has(SKINS,look.skin)&&wears(ch,look.skin)?look.skin:'classic'), ink={o:pal.o,d:mix(pal.b,pal.o,.3),l:pal.l};
  for(const [x,y,k] of tailList(n,t)){ ctx.fillStyle=ink[k]; ctx.fillRect(x*px,y*px,px,px); }
}
// Draws a buddy with its feet at (x, y). "own" buddies borrow the pet's colors.
function drawBuddy(ctx,id,x,y,px,flip,look){
  if(!has(BUDDIES,id)) return;
  const b=BUDDIES[id], pal=b.own?palOf(look&&has(CHARS,look.char)?look.char:'cat',look&&has(SKINS,look.skin)?look.skin:'classic'):b.pal;
  // spin: a buddy with a second picture (alt) shows the two in turn, this many times a second.
  const rows=b.alt&&Math.floor((typeof performance==='undefined'?0:performance.now())*b.spin/1000)%2?b.alt:b.rows, w=rows[0].length, h=rows.length;
  ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1);
  for(let r=0;r<h;r++)for(let i=0;i<w;i++){const k=rows[r][i]; if(k==='.')continue; ctx.fillStyle=pal[k]||'#f0f'; ctx.fillRect((i-w/2)*px,(r-h)*px,px,px);}
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
