/* MOTCHI LIFE — static, offline-capable virtual pet. All times use the device clock. */
(() => {
  'use strict';
  const KEY = 'motchi-life-save-v1';
  const OLD_KEYS = ['motchi-dino-gen1-v1', 'motchi-save-v2'];
  const $ = id => document.getElementById(id);
  const cap = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number(v) || 0));
  const dayKey = at => new Date(at).toLocaleDateString('sv-SE');
  const rand = max => Math.floor(Math.random() * max);
  const pick = arr => arr[rand(arr.length)];
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
  const subjects = [
    {id:'korean',name:'국어',icon:'📖',skill:'speech',question:'“안녕하세요”는 어떤 말일까요?',options:['인사','숫자','색깔'],answer:0},
    {id:'english',name:'영어',icon:'🔤',skill:'speech',question:'“apple”의 뜻은?',options:['사과','학교','물'],answer:0},
    {id:'math',name:'수학',icon:'🔢',skill:'intellect',question:'3 + 4 = ?',options:['6','7','8'],answer:1},
    {id:'science',name:'과학',icon:'🔬',skill:'intellect',question:'식물이 자라는 데 필요한 것은?',options:['빛과 물','돌만','장난감'],answer:0},
    {id:'art',name:'미술',icon:'🎨',skill:'creativity',question:'파랑과 노랑을 섞으면?',options:['초록','빨강','보라'],answer:0},
    {id:'pe',name:'체육',icon:'🏃',skill:'fitness',question:'운동 전 먼저 하면 좋은 것은?',options:['스트레칭','과식','밤새기'],answer:0}
  ];
  const exercises = [
    {id:'walk',name:'산책',icon:'🚶',mins:4,effort:7,fitness:2,stress:-10,dirt:'feet',dirtAmt:7,needs:null},
    {id:'stretch',name:'스트레칭',icon:'🧘',mins:1,effort:3,fitness:1,stress:-7,dirt:'body',dirtAmt:1,needs:null},
    {id:'jump',name:'줄넘기',icon:'🪢',mins:2,effort:13,fitness:4,stress:-4,dirt:'body',dirtAmt:5,needs:'rope'},
    {id:'ball',name:'공놀이',icon:'⚽',mins:3,effort:11,fitness:3,stress:-9,dirt:'hands',dirtAmt:7,needs:'ball'},
    {id:'swim',name:'수영',icon:'🏊',mins:4,effort:16,fitness:5,stress:-8,dirt:'body',dirtAmt:9,needs:'swimGear'}
  ];
  const hygiene = [
    {id:'hands',name:'손 씻기',icon:'🧼',secs:20,part:'hands',gain:42,steps:['비누칠','꼼꼼히 문지르기','헹구기']},
    {id:'face',name:'세수',icon:'💦',secs:30,part:'face',gain:40,steps:['물 묻히기','얼굴 닦기','수건으로 말리기']},
    {id:'teeth',name:'양치',icon:'🪥',secs:45,part:'teeth',gain:44,steps:['치약 바르기','이를 닦기','입 헹구기']},
    {id:'feet',name:'발 씻기',icon:'🦶',secs:40,part:'feet',gain:43,steps:['물 묻히기','발가락 닦기','헹구기']},
    {id:'body',name:'샤워',icon:'🚿',secs:120,part:'body',gain:53,steps:['물 맞기','비누칠','헹구기']}
  ];
  const jobs = [
    {id:'teacher',name:'선생님',icon:'🧑‍🏫',pay:60,stress:9,family:2,skill:'speech',desc:'안정적인 수입, 자녀 학습 보너스'},
    {id:'scientist',name:'과학자',icon:'🧑‍🔬',pay:80,stress:14,family:-1,skill:'intellect',desc:'수입이 높지만 업무 스트레스가 큼'},
    {id:'athlete',name:'운동선수',icon:'🏅',pay:75,stress:11,family:1,skill:'fitness',desc:'체력 보너스, 부상에 주의'},
    {id:'artist',name:'예술가',icon:'🧑‍🎨',pay:65,stress:7,family:2,skill:'creativity',desc:'수입 변동, 창의력 보너스'},
    {id:'merchant',name:'상점 주인',icon:'🛒',pay:65,stress:10,family:1,skill:'life',desc:'상점 할인, 근무 시간이 김'}
  ];
  const shop = [
    {id:'rice',name:'영양밥',icon:'🍚',price:8,type:'food',satiety:23,calories:4,health:2,desc:'든든한 기본 식사'},
    {id:'fruit',name:'과일',icon:'🍎',price:12,type:'food',satiety:12,calories:1,health:4,desc:'가볍고 건강한 간식'},
    {id:'cake',name:'케이크',icon:'🍰',price:18,type:'food',satiety:12,calories:11,health:-1,desc:'행복 +12, 체중과 충치 위험'},
    {id:'salad',name:'샐러드',icon:'🥗',price:14,type:'food',satiety:17,calories:1,health:6,desc:'면역과 건강을 돕는 식사'},
    {id:'medicine',name:'약',icon:'💊',price:24,type:'consumable',desc:'질병 치료에 사용'},
    {id:'soap',name:'비누',icon:'🧼',price:18,type:'gear',desc:'손·몸 씻기 효과 증가'},
    {id:'toothbrush',name:'칫솔',icon:'🪥',price:18,type:'gear',desc:'양치 효과 증가'},
    {id:'ball',name:'공',icon:'⚽',price:60,type:'gear',desc:'공놀이 운동 해금'},
    {id:'rope',name:'줄넘기',icon:'🪢',price:70,type:'gear',desc:'줄넘기 운동 해금'},
    {id:'swimGear',name:'수영 용품',icon:'🥽',price:110,type:'gear',desc:'수영 운동 해금'},
    {id:'book',name:'동화책',icon:'📚',price:55,type:'gear',desc:'국어·말하기 수업 보너스'},
    {id:'scienceKit',name:'과학 키트',icon:'🔭',price:90,type:'gear',desc:'과학 수업 보너스'},
    {id:'dumbbell',name:'도트 아령',icon:'🏋️',price:85,type:'gear',desc:'도전 공격 강화 · 구매 후 업그레이드'},
    {id:'battleRope',name:'전투 줄넘기',icon:'🪢',price:80,type:'gear',desc:'도전 연타 강화 · 구매 후 업그레이드'},
    {id:'battleBook',name:'전투 책',icon:'📘',price:80,type:'gear',desc:'도전 지능 강화 · 구매 후 업그레이드'},
    {id:'bolt',name:'번개 충전',icon:'⚡',price:35,type:'ticket',desc:'미니게임·도전 횟수 1회 충전'},
    {id:'gemPack',name:'보석 교환',icon:'💎',price:250,type:'gemPack',desc:'M코인 250개를 보석 1개로 교환'},
    {id:'flower',name:'꽃 장식',icon:'🌼',price:45,type:'decor',desc:'방을 꾸미고 기분을 높여요'},
    {id:'lamp',name:'작은 조명',icon:'💡',price:70,type:'decor',desc:'집 분위기와 편안함 증가'},
    {id:'room',name:'넓은 방',icon:'🏠',price:300,type:'decor',desc:'성체부터 구매 · 방을 넓혀요'},
    {id:'starCharm',name:'별 부적',icon:'💎',price:4,type:'gem',desc:'행운을 높여 할아버지 대결에 도움'}
  ];
  const traits = ['온순함','호기심','활발함','장난꾸러기','상냥함'];
  const dialogue = [
    {line:'오늘 학교에서 어려운 문제가 나왔어…',choices:[['같이 풀어보자', {intellect:2,bond:5,stress:-3}],['괜찮아, 쉬어도 돼',{bond:4,stress:-8}],['더 공부해!',{intellect:2,stress:8,bond:-3}]]},
    {line:'오늘은 어떤 놀이를 할까?',choices:[['공놀이 하자',{fitness:2,bond:4,energy:-5}],['그림 그리자',{creativity:2,bond:4}],['조금 쉬자',{energy:5,stress:-5}]]},
    {line:'친구랑 다퉜어. 어떡하지?',choices:[['먼저 이야기해봐',{speech:3,bond:3,stress:-3}],['내가 도와줄게',{bond:5,stress:-6}],['그냥 참아',{stress:6,bond:-2}]]},
    {line:'새로운 걸 배우고 싶어!',choices:[['과학 실험 어때?',{intellect:3,stress:2}],['노래를 만들어봐',{creativity:3,speech:1}],['산책하며 찾아보자',{fitness:1,bond:3,stress:-3}]]},
    {line:'오늘 좀 지쳤어…',choices:[['함께 쉬자',{energy:8,stress:-8,bond:3}],['간식 먹을래?',{satiety:7,weight:2,bond:2}],['조금만 더 힘내',{stress:7,bond:-3}]]}
  ];
  const gameNames = [{id:'catch',name:'공 받기',icon:'⚾'},{id:'bricks',name:'벽돌깨기',icon:'🧱'},{id:'jump',name:'줄넘기',icon:'🪢'},{id:'memory',name:'기억력',icon:'🧠'},{id:'quiz',name:'과목 퀴즈',icon:'❓'}];
  function newPet(generation = 1, inherited = null) {
    const now = Date.now();
    return {name:'모찌',born:now,generation,stage:'egg',form:'',alive:true,sex:rand(2)?'암컷':'수컷',trait:pick(traits),genes:inherited||{horn:rand(3),tail:rand(3)},stats:{satiety:86,mood:82,energy:86,stress:9,health:90,immunity:72,bond:35,weight:9},hygiene:{hands:90,face:90,teeth:90,feet:90,body:90},skills:{intellect:0,speech:0,fitness:0,creativity:0,discipline:0,life:0,dodge:0,luck:0},illness:null,careMistakes:0,neglectHours:0,lastCare:now,lastFed:now,lastPlayed:now,poop:0,nextPoop:now+2*HOUR,dirtySince:0,criticalSince:0,sleeping:false,lightOn:true,schoolToday:0,exerciseToday:0,gameToday:0,conversationToday:0,workToday:false,day:dayKey(now),job:null,partner:null,marriedAt:0,child:null,deathAt:0,deathReason:''};
  }
  function fresh() { return {version:2,lastTick:Date.now(),coins:80,gems:0,tickets:30,ticketAt:Date.now(),battle:{stage:1,wave:1},gearLevels:{},selectionDone:false,house:'sunny',pet:newPet(),inventory:{rice:2,fruit:1,medicine:1},family:[],journal:[],sound:true,dailyBonus:dayKey(Date.now()),totalDays:0}; }
  function migrateOld() {
    for (const key of OLD_KEYS) {
      let old; try { old=JSON.parse(localStorage.getItem(key)||'null'); } catch { continue; }
      if(!old || !old.born) continue;
      const state=fresh();
      if(old.dead){state.journal.unshift({at:Date.now(),text:'이전 MOTCHI의 추억을 이어 새 알이 도착했어요.'});return state}
      state.pet.born=old.born;
      state.pet.stats.satiety=cap((old.hunger??3)*25,0,100);
      state.pet.stats.mood=cap((old.happy??3)*25,0,100);
      state.pet.stats.health=cap((old.health??4)*25,0,100);
      state.pet.careMistakes=old.careMistakes||0;
      state.pet.skills.discipline=cap((old.discipline||0)*10);
      state.pet.stats.weight=cap(old.weight||9,4,80);
      state.pet.lightOn=old.light!==false;
      state.pet.poop=old.poop?1:0;
      state.pet.illness=old.sick?'감기':null;
      state.pet.lastCare=Date.now();
      state.lastTick=Date.now();
      state.journal.unshift({at:Date.now(),text:'이전 MOTCHI의 나이와 기본 상태를 가져왔어요.'});
      return state;
    }
    return fresh();
  }
  let state;
  try { state=JSON.parse(localStorage.getItem(KEY)||'null')||migrateOld(); } catch { state=fresh(); }
  state={...fresh(),...state};
  state.battle={stage:1,wave:1,...state.battle};state.gearLevels ||= {};
  const storedPet=state.pet||{};
  if(storedPet.stage&&storedPet.stage!=='egg'&&state.selectionDone===false)state.selectionDone=true;
  state.pet={...newPet(),...storedPet,stats:{...newPet().stats,...storedPet.stats},hygiene:{...newPet().hygiene,...storedPet.hygiene},skills:{...newPet().skills,...storedPet.skills}};
  let tab='care', menuOpen=false, notice='', activity=null, dialogState=null, game=null, audio=null, lastStage=state.pet.stage;
  let reaction=null, reactionTimer=0, hatchUntil=0, lastEggTouch=0, grandpaPending=false;
  function react(kind,text){
    const current={kind,text};reaction=current;clearTimeout(reactionTimer);
    reactionTimer=setTimeout(()=>{if(reaction===current){reaction=null;renderTop()}},2800);
  }
  const p=()=>state.pet;
  function log(text){state.journal.unshift({at:Date.now(),text});state.journal=state.journal.slice(0,80);notice=text;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notice='저장 공간이 부족합니다. 브라우저 데이터를 확인해주세요.'}}
  function tone(freq=620){if(!state.sound)return;try{audio ||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.13)}catch{}}
  function ageMinutes(){return Math.max(0,(Date.now()-p().born)/MIN)}
  function lifeStage(){const m=ageMinutes();return m<5&&(p().eggGauge??100)>0?'egg':m<65?'baby':m<1505?'child':m<5825?'teen':m<14405?'adult':'elder';}
  function stageLabel(id){return ({egg:'알',baby:'베이비',child:'어린이',teen:'청소년',adult:'성체',elder:'노년'})[id]||id}
  function hygieneAvg(){return Math.round(Object.values(p().hygiene).reduce((a,b)=>a+b,0)/5)}
  function canAct(){if(!p().alive){notify('추억 앨범에서 다음 세대를 시작할 수 있어요.','danger');return false}if(p().stage==='egg'){notify('알은 약 5분 뒤 부화해요.','warning');return false}return true}
  function normalize(){const pet=p();for(const key in pet.stats)pet.stats[key]=cap(pet.stats[key]);for(const key in pet.hygiene)pet.hygiene[key]=cap(pet.hygiene[key]);for(const key in pet.skills)pet.skills[key]=cap(pet.skills[key]);pet.stats.weight=cap(pet.stats.weight,4,80);pet.poop=Math.max(0,Math.min(4,pet.poop));}
  function refreshDay(at){const pet=p(),today=dayKey(at);if(pet.day===today)return;pet.day=today;pet.schoolToday=0;pet.exerciseToday=0;pet.gameToday=0;pet.conversationToday=0;pet.workToday=false;state.totalDays++;if(pet.job&&pet.alive)state.coins+=10;if(pet.partner&&pet.alive)pet.stats.bond=cap(pet.stats.bond+2);if(pet.child&&pet.alive)pet.child.bond=cap(pet.child.bond+2);log('새 하루가 시작됐어요. 오늘의 선택이 기다립니다.');}
  function chooseForm(){const pet=p(),s=pet.skills;const care=pet.careMistakes;const best=Object.entries({intellect:s.intellect,fitness:s.fitness,creativity:s.creativity,speech:s.speech}).sort((a,b)=>b[1]-a[1])[0];return care>=8||pet.stats.health<40?'rough':best[0]==='fitness'?'athlete':best[0]==='intellect'?'scholar':best[0]==='creativity'?'artist':'friend';}
  function stageUpdate(){const pet=p(),next=lifeStage();if(next===pet.stage||!pet.alive)return;pet.stage=next;if(next==='baby'){hatchUntil=Date.now()+950;document.querySelector('.world').classList.add('hatching');setTimeout(()=>{document.querySelector('.world').classList.remove('hatching');renderTop()},950)}if(next==='adult')pet.form=chooseForm();if(next==='elder')pet.form=pet.form||chooseForm();log(next==='baby'?'알에서 아기 공룡이 태어났어요!':`${stageLabel(next)} 단계로 성장했어요!`);tone(740);}
  function die(reason){const pet=p();if(!pet.alive)return;pet.alive=false;pet.deathAt=Date.now();pet.deathReason=reason;log(`${pet.name}가 별이 되었어요. (${reason})`);tone(210);save();}
  function runStep(at,stepMs){const pet=p();if(!pet.alive)return;refreshDay(at);const stage=lifeStage();const h=new Date(at).getHours();const night=h>=21||h<8;const schoolBusy=pet.schoolUntil&&at<pet.schoolUntil;const protectedTime=night||schoolBusy||pet.sitterUntil>at;
    if(stage!=='egg'){
      const scale=stepMs/(10*MIN),need=stage==='baby'?1.65:stage==='elder'?1.2:1;
      pet.stats.satiety-=3.5*scale*need*(protectedTime?.25:1);
      pet.stats.mood-=2.1*scale*need*(protectedTime?.3:1);
      pet.stats.energy+=(night?1.3:-1.15)*scale;
      pet.stats.stress+=(pet.stats.satiety<35?1.4:.5)*scale;
      if(night&&!pet.lightOn)pet.stats.stress-=.35*scale;
      if(night&&pet.lightOn)pet.stats.mood-=.22*scale;
      pet.hygiene.hands-=.42*scale;pet.hygiene.face-=.2*scale;pet.hygiene.teeth-=.34*scale;pet.hygiene.feet-=.23*scale;pet.hygiene.body-=.27*scale;
      if(at-pet.lastCare>HOUR&&!protectedTime)pet.neglectHours+=stepMs/HOUR;
      if(pet.neglectHours>=1.5){pet.stats.stress+=2.5*scale;pet.stats.mood-=1.2*scale}
      if(at-pet.lastCare>2*HOUR&&!protectedTime&&Math.floor((at-stepMs-pet.lastCare)/HOUR)<Math.floor((at-pet.lastCare)/HOUR))pet.careMistakes++;
      if(at-pet.lastFed>3*HOUR&&pet.stats.satiety<25)pet.stats.health-=.45*scale;
      if(hygieneAvg()<38)pet.stats.immunity-=.35*scale;
      if(pet.stats.stress>75||pet.stats.energy<20)pet.stats.immunity-=.25*scale;
      if(pet.poop>0)pet.hygiene.body-=.45*scale;
      if(pet.stats.satiety<15||pet.stats.stress>82||hygieneAvg()<25)pet.stats.health-=.48*scale;
      if(pet.illness)pet.stats.health-=.5*scale;
      if(pet.stats.health<20){pet.criticalSince ||= at; if(at-pet.criticalSince>2*HOUR)die(pet.illness?'질병을 치료하지 못함':'건강 악화')}else pet.criticalSince=0;
      if(!pet.illness&&pet.stats.immunity<32&&(hygieneAvg()<45||pet.stats.stress>75))pet.illness=pet.hygiene.teeth<30?'충치':pet.stats.weight>33?'복통':'감기';
      if(pet.stats.weight>34){pet.stats.energy-=.18*scale;pet.stats.health-=.15*scale}
      if(pet.stats.weight<6)pet.stats.health-=.2*scale;
      if(at>=pet.nextPoop){pet.poop=Math.min(4,pet.poop+1);pet.nextPoop=at+(2+rand(3))*HOUR;pet.dirtySince ||= at}
      if(pet.poop>=2&&at-pet.dirtySince>3*HOUR)pet.illness ||= '감염';
      if(pet.stats.satiety<5&&pet.stats.health<30)die('장기간 굶주림');
      if(stage==='elder'&&ageMinutes()>25*1440)die('자연 수명');
      normalize();
    }
  }
  function advance(){const now=Date.now();if(now<state.lastTick){state.lastTick=now;save();return}const awayHours=Math.min(8,(now-state.lastTick)/HOUR),max=14*DAY,start=Math.max(state.lastTick,now-max);let cursor=start;while(cursor<now&&p().alive){const at=Math.min(now,cursor+10*MIN);runStep(at,at-cursor);cursor=at}if(awayHours>=.5&&p().alive&&p().stage!=='egg'){const earned=Math.floor(awayHours*(p().job?7:2));state.coins+=earned;if(has('room')||has('flower')){p().poop=Math.max(0,p().poop-1);p().hygiene.body=cap(p().hygiene.body+5)}if(p().trait==='활발함')p().skills.fitness=cap(p().skills.fitness+Math.floor(awayHours));log(`오프라인 ${Math.round(awayHours*60)}분 · ${earned}M 획득${has('room')||has('flower')?' · 집을 조금 치웠어요':''}`)}state.lastTick=now;refillTickets();stageUpdate();save();}
  function care(reason){p().lastCare=Date.now();p().neglectHours=0;if(p().stats.stress>0)p().stats.stress=cap(p().stats.stress-1);if(reason)log(reason);normalize();save();render();if(p().stage!=='egg'&&p().alive&&!grandpaPending&&Date.now()-(state.lastGrandpaAt||0)>HOUR&&Math.random()<.035&&!battleEngine?.active()){state.lastGrandpaAt=Date.now();save();setTimeout(()=>openDialog('할아버지가 왔어요!','공 받기를 먼저 플레이하세요. 다음에 할아버지가 도전합니다. 이기면 보석을 받아요.',[{label:'대결하기',run:()=>{grandpaPending=true;closeDialog();activityEngine.start('mini','catch')}},{label:'다음에',run:()=>closeDialog()}]),500)}}
  function notify(text,kind=''){notice=text;const el=$('notice');el.textContent=text;el.className='notice '+kind;tone(kind==='danger'?250:kind==='warning'?390:600)}
  function adult(){return ['adult','elder'].includes(p().stage)}
  function inventoryCount(id){return state.inventory[id]||0}
  function has(id){return inventoryCount(id)>0}
  function addItem(id,n=1){state.inventory[id]=(state.inventory[id]||0)+n}
  function spendItem(id){if(!has(id))return false;state.inventory[id]--;if(state.inventory[id]<=0)delete state.inventory[id];return true}
  function price(item){return Math.max(1,Math.round(item.price*(p().job==='merchant'?.85:1)))}
  function refillTickets(){const now=Date.now();state.ticketAt ||= now;if(state.tickets>=30){state.ticketAt=now;return}const gained=Math.floor((now-state.ticketAt)/(5*MIN));if(gained>0){state.tickets=Math.min(30,state.tickets+gained);state.ticketAt+=gained*5*MIN}}
  function buy(id,qty=1){const item=shop.find(x=>x.id===id);if(!item)return;qty=Math.max(1,Math.min(30,Math.floor(qty)));if(item.type==='gear'&&has(id)){const level=state.gearLevels[id]||1,cost=price(item)*level;if(level>=5){notify('도구 최고 레벨입니다.');return}if(state.coins<cost){notify('업그레이드 비용이 부족해요.','warning');return}state.coins-=cost;state.gearLevels[id]=level+1;care(`${item.name} Lv.${level+1} 업그레이드!`);return}if(item.type==='gem'){if(state.gems<item.price){notify('보석이 부족해요.','warning');return}state.gems-=item.price;p().skills.luck=cap(p().skills.luck+8);care('별 부적으로 행운이 8 올랐어요.');return}if(item.id==='room'&&!adult()){notify('넓은 방은 성체부터 살 수 있어요.','warning');return}if(item.type==='ticket'){refillTickets();qty=Math.min(qty,30-state.tickets);if(qty<1){notify('번개가 이미 가득 찼어요.');return}}if(state.coins<price(item)*qty){notify('M코인이 부족해요. 학교·게임·직업 활동으로 벌 수 있어요.','warning');return}if(['gear','decor'].includes(item.type)&&has(id)){notify('이미 가지고 있어요.');return}state.coins-=price(item)*qty;if(item.type==='ticket')state.tickets+=qty;else if(item.type==='gemPack')state.gems+=qty;else addItem(id,['gear','decor'].includes(item.type)?1:qty);if(item.type==='gear')state.gearLevels[id]=1;if(['dumbbell','battleRope','battleBook'].includes(id))state.equippedWeapon=id;if(item.type==='decor'){p().stats.mood=cap(p().stats.mood+5)}care(`${item.name} ${qty}개를 구입했어요.`)}
  function buyPrompt(id){const item=shop.find(x=>x.id===id);if(!item)return;if(['dumbbell','battleRope','battleBook'].includes(id)&&has(id)){openDialog(`${item.icon} ${item.name}`,`Lv.${state.gearLevels[id]||1}/5 · 현재 장착 ${state.equippedWeapon===id?'예':'아니요'}`,[{label:'장착하기',run:()=>{state.equippedWeapon=id;care(`${item.name}을(를) 장착했어요.`);closeDialog()}},{label:`업그레이드 · ${price(item)*(state.gearLevels[id]||1)}M`,run:()=>{buy(id);closeDialog()}}]);return}if(['gear','decor','gem'].includes(item.type)){buy(id);return}let qty=1;function show(){openDialog(`${item.icon} ${item.name}`,`${item.desc}<br><b>수량 ${qty}개 · ${price(item)*qty}M</b>`,[{label:'−',run:()=>{qty=Math.max(1,qty-1);show()}},{label:'＋',run:()=>{qty=Math.min(30,qty+1);show()}},{label:`${qty}개 구매`,run:()=>{buy(id,qty);closeDialog()}}])}show()}
  function feed(id){if(!canAct())return;const item=shop.find(x=>x.id===id&&x.type==='food');if(!item||!spendItem(id)){notify('재고가 없어요. 슈퍼마켓에서 구입하세요.','warning');return}const st=p().stats;const over=st.satiety>80;st.satiety=cap(st.satiety+item.satiety);st.weight=cap(st.weight+item.calories*(over?.9:.35),4,80);st.health=cap(st.health+item.health);st.mood=cap(st.mood+(id==='cake'?12:3));p().hygiene.teeth=cap(p().hygiene.teeth-(id==='cake'?13:5));if(over){st.stress=cap(st.stress+6);if(st.weight>38)p().illness='복통'}p().lastFed=Date.now();react('fed',over?'으… 너무 배불러!':'냠냠! 맛있어!');care(over?'배부른데 더 먹어 속이 불편해 보여요.':`${item.name}을(를) 맛있게 먹었어요.`)}
  function cleanPoop(){if(!canAct())return;if(!p().poop){notify('화장실은 깨끗해요.');return}p().poop=0;p().dirtySince=0;p().hygiene.body=cap(p().hygiene.body+13);react('clean','와, 방이 깨끗해졌어!');care('화장실을 청소했어요.')}
  function rest(){if(!canAct())return;p().stats.energy=cap(p().stats.energy+22);p().stats.stress=cap(p().stats.stress-18);p().stats.mood=cap(p().stats.mood+4);p().lastSleep=Date.now();react('rest','후아… 기운이 난다!');care('잠깐 쉬면서 기운을 되찾았어요.')}
  function lights(){p().lightOn=!p().lightOn;care(p().lightOn?'불을 켰어요.':'불을 끄고 잠잘 준비를 했어요.')}
  function treat(){if(!canAct())return;if(!p().illness){notify('지금은 아프지 않아요.');return}if(!spendItem('medicine')){notify('약이 없어요. 슈퍼마켓에서 구매하세요.','warning');return}const old=p().illness;p().illness=null;p().stats.health=cap(p().stats.health+24);p().stats.immunity=cap(p().stats.immunity+12);p().criticalSince=0;care(`${old} 치료를 했어요. 휴식과 위생 관리도 필요해요.`)}
  function sitter(){if(!canAct())return;if(p().illness||p().stats.satiety<25){notify('아프거나 굶주린 상태에서는 맡길 수 없어요.','warning');return}if(state.coins<25){notify('돌봄교실 이용료 25M이 필요해요.','warning');return}state.coins-=25;p().sitterUntil=Date.now()+8*HOUR;care('돌봄교실에 8시간 맡겼어요.');}
  function work(mode){if(!canAct()||!adult()||!p().job)return;if(p().workToday){notify('오늘은 이미 일을 했어요.','warning');return}const job=jobs.find(x=>x.id===p().job),st=p().stats;let pay=mode==='overtime'?job.pay*1.5:mode==='rest'?0:job.pay;if(job.id==='artist')pay+=rand(31)-15;if(job.id==='athlete')pay+=rand(21)-10;pay=Math.max(0,Math.round(pay));state.coins+=pay;st.stress=cap(st.stress+(mode==='overtime'?job.stress*2:mode==='rest'?-14:job.stress));st.energy=cap(st.energy-(mode==='overtime'?19:mode==='rest'?-8:10));st.bond=cap(st.bond+(mode==='overtime'?-6:mode==='rest'?6:job.family));p().skills[job.skill]=cap(p().skills[job.skill]+(mode==='rest'?0:2));if(p().child)p().child.bond=cap(p().child.bond+(mode==='overtime'?-5:mode==='rest'?5:1));p().workToday=true;care(mode==='rest'?'오늘은 가족과 쉬었어요.':`${job.name} 일로 ${pay}M을 벌었어요.`)}
  function nextGeneration(){const old=p();if(old.alive){notify('다음 세대는 부모의 생애가 끝난 뒤 시작할 수 있어요.','warning');return}state.family.unshift({name:old.name,generation:old.generation,age:Math.floor((old.deathAt-old.born)/DAY),form:old.form||old.stage,job:old.job,partner:old.partner?.name||'',child:old.child?.name||'',reason:old.deathReason,at:old.deathAt});state.family=state.family.slice(0,30);const child=old.child;state.pet=newPet(old.generation+1,child?.genes||old.genes);state.pet.name=child?.name||'모찌';if(child){state.pet.skills[child.inheritedSkill]=8;state.pet.trait=child.trait;state.coins+=Math.min(80,Math.round(state.coins*.1))}log(child?'자녀가 다음 세대를 이어받았어요.':'새로운 알이 도착했어요.');save();render()}

  // Hand-drawn original sprites: dark one-pixel outlines, bright accent pixels, readable faces.
  const sprites={
    egg:[
      '......1111......','.....122221.....','....12222221....','...1222222221...',
      '..122222222221..','..122222222221..','.12222222222221.','.12222222222221.',
      '.12222222222221.','.12222222222221.','.12222222222221.','..122222222221..',
      '..122222222221..','...1222222221...','....11111111....','................'],
    baby:[
      '................','................','......1111......','....11222211....',
      '...1222222221...','..122122221221..','..122122221221..','.12222222222221.',
      '.12222211222221.','..122222222221..','...1222222221...','....11122111....',
      '.....11..11.....','................','................','................'],
    child:[
      '.......11.......','......1551......','.....113311.....','....13333331....',
      '...1333333331...','..133133331331..','..133133331331..','.13333333333331.',
      '.13333311333331.','..133333333331..','...1333333331...','..113333333311..',
      '.13311133111331.','..11..1331..11..','......1111......','................'],
    teen:[
      '......11........','.....1551...11..','....113311.1551.','...133333311331.',
      '..1333333333331.','.13313333133331.','.13313333133331.','133333333333331.',
      '133333311333331.','.1333333333331..','..13333333331...','..113333333311..',
      '.133113333311331.','..11.133331.11..','.....11..11.....','................'],
    scholar:[
      '...11......11...','..1551....1551..','.113311..113311.','1333333113333331',
      '1333333333333331','1331333333331331','1331333333331331','1333333333333331',
      '1333331111333331','1333333333333331','.13333333333331.','..133333333331..',
      '..113333333311..','.13311.33.11331.','..11...11...11..','................'],
    athlete:[
      '.....11..11.....','....15511551....','...1133333311...','..133333333331..',
      '.13313333331331.','.13313333331331.','1333333333333331','1333333113333331',
      '.13333333333331.','..133333333331..','..113333333311..','.133133333331331.','1331.1333331.1331',
      '.11..1333331..11','.....11..11.....','................'],
    artist:[
      '......11........','.....1551.......','....113311..11..','...133333311551.',
      '..1333333331331.','.13313333333331.','.13313333333331.','1333333333333331',
      '1333333113333331','.13333333333331.','..133333333331..','...1133333311...','..1331333331331..',
      '.1331.13331.1331.','..11...11...11..','................'],
    friend:[
      '....11....11....','...1551..1551...','..113311113311..','.13333333333331.',
      '1333333333333331','1331333333331331','1331333333331331','1333333333333331',
      '1333331111333331','.13333333333331.','..133333333331..','...1333333331...','..113333333311..',
      '.13311.33.11331.','..11...11...11..','................'],
    rough:[
      '.....11.........','....1551....11..','...113311..1551.','..1333333111331.',
      '.13333333333331.','.13313333331331.','1333333333333331','1333333333333331',
      '1333331111333331','.13333333333331.','..133333333331..','...1133333311...','..1333333331331..',
      '.13311.3331.1331.','..11....11...11.','................'],
    ghost:[
      '.....111111.....','...1122222211...','..122222222221..','.12222222222221.',
      '.12211222211221.','1222112222112221','1222222222222221','1222221111222221',
      '1222222222222221','.12222222222221.','..122222222221..','...1222222221...','...1212121211...','....1.1.1.1.....','................','................']
  };
  const palette={1:'#243927',2:'#eaf3c7',3:'#4f9b9b',4:'#ee9ea2',5:'#f7d66a'};
  function drawPet(){const cv=$('petCanvas'),ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);const pet=p();let id=!pet.alive?'ghost':pet.stage==='adult'||pet.stage==='elder'?(pet.form||'friend'):pet.stage;const rows=sprites[id]||sprites.baby;const px=6,x0=32,y0=12+(pet.alive&&pet.stage!=='egg'&&Math.floor(Date.now()/700)%2?2:0);const colors={...palette,3:({scholar:'#79aaca',athlete:'#d8877c',artist:'#dab672',friend:'#74bca3',rough:'#9b90bb'})[id]||['#74bca3','#e5a1aa','#91a8d7','#e5bc72','#b8a1c7'][pet.starter||0]};
    const living=pet.alive&&pet.stage!=='egg';
    ctx.save();if(living&&pet.stats.weight>24){ctx.translate(80,0);ctx.scale(pet.stats.weight>38?1.22:1.11,1);ctx.translate(-80,0)}
    rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.'&&colors[c]){ctx.fillStyle=colors[c];ctx.fillRect(x0+x*px,y0+y*px,px,px)}}));
    if(pet.alive&&['scholar','athlete','artist','friend','rough'].includes(id)){ctx.fillStyle=colors[1];if(id==='scholar'){ctx.fillRect(x0+4*px,y0+6*px,4*px,px);ctx.fillRect(x0+10*px,y0+6*px,4*px,px)}if(id==='athlete'){ctx.fillStyle='#f7d66a';ctx.fillRect(x0+4*px,y0+3*px,8*px,px)}if(id==='artist'){ctx.fillStyle='#ee9ea2';ctx.fillRect(x0+3*px,y0+9*px,2*px,px);ctx.fillRect(x0+11*px,y0+9*px,2*px,px)}if(id==='friend'){ctx.fillStyle='#ee9ea2';ctx.fillRect(x0+1*px,y0+5*px,2*px,2*px)}if(id==='rough'){ctx.fillStyle='#f7d66a';ctx.fillRect(x0+12*px,y0+3*px,2*px,px)}}
    if(pet.stage==='egg'&&Math.floor(Date.now()/1000)%2){ctx.fillStyle=palette[1];ctx.fillRect(x0+7*px,y0+5*px,px,px);ctx.fillRect(x0+8*px,y0+6*px,px,px);ctx.fillRect(x0+7*px,y0+7*px,px,px)}
    if(pet.stage==='egg'&&(pet.eggGauge??100)<65){ctx.fillStyle='#405239';ctx.fillRect(x0+8*px,y0+2*px,px,3*px);ctx.fillRect(x0+7*px,y0+5*px,px,px);ctx.fillRect(x0+8*px,y0+6*px,px,2*px);if(pet.eggGauge<30){ctx.fillRect(x0+6*px,y0+8*px,2*px,px);ctx.fillRect(x0+9*px,y0+9*px,px,2*px)}}
    if(living){
      ctx.fillStyle=colors[3];const mark=pet.starter||0;if(mark===1){ctx.fillRect(x0+2*px,y0+2*px,2*px,px);ctx.fillRect(x0+12*px,y0+2*px,2*px,px)}if(mark===2){ctx.fillRect(x0+1*px,y0+7*px,2*px,3*px);ctx.fillRect(x0+13*px,y0+7*px,2*px,3*px)}if(mark===3){ctx.fillRect(x0+7*px,y0,2*px,2*px)}if(mark===4){ctx.fillRect(x0+6*px,y0,4*px,px);ctx.fillRect(x0+7*px,y0-px,2*px,px)}
      if(pet.skills.fitness>=20){ctx.fillStyle='#e7a773';ctx.fillRect(x0+1*px,y0+8*px,2*px,2*px);ctx.fillRect(x0+13*px,y0+8*px,2*px,2*px)}
      if(pet.skills.intellect>=20){ctx.fillStyle='#364d64';ctx.fillRect(x0+4*px,y0+6*px,3*px,px);ctx.fillRect(x0+9*px,y0+6*px,3*px,px);ctx.fillRect(x0+7*px,y0+6*px,2*px,px)}
      if(pet.skills.luck>=20){ctx.fillStyle='#f4d95c';ctx.fillRect(x0+14*px,y0+2*px,px,3*px);ctx.fillRect(x0+13*px,y0+3*px,3*px,px)}
      if(hygieneAvg()<50){ctx.fillStyle='#9c7953';[[3,8],[12,9],[5,12]].forEach(([x,y])=>ctx.fillRect(x0+x*px,y0+y*px,px,px))}
      if(reaction?.kind==='fed'){ctx.fillStyle='#fff7d5';[[7,9],[8,9],[9,10]].forEach(([x,y])=>ctx.fillRect(x0+x*px,y0+y*px,px,px))}
      if(reaction?.kind==='clean'){ctx.fillStyle='#fff6a0';[[0,4],[15,3],[1,12],[14,12]].forEach(([x,y])=>{ctx.fillRect(x0+x*px,y0+y*px,px,px);ctx.fillRect(x0+(x-.5)*px,y0+(y+.5)*px,2*px,2*px)})}
      if(pet.stats.energy<25||reaction?.kind==='rest'){ctx.fillStyle='#405e76';ctx.font='bold 16px monospace';ctx.fillText('Z',x0+14*px,y0+2*px)}
    }
    ctx.restore();
    if(pet.stage==='baby'&&Date.now()<hatchUntil){ctx.fillStyle='#fff8d9';ctx.fillRect(14,64,19,35);ctx.fillRect(20,50,13,14);ctx.fillRect(128,64,19,35);ctx.fillRect(128,50,13,14)}
    if(pet.illness&&pet.alive){ctx.fillStyle='#df6d73';ctx.fillRect(123,17,7,21);ctx.fillRect(123,44,7,7)}
  }
  function statRow(label,value,inverse=false){const shown=cap(value),bad=inverse?shown>75:shown<25,mid=inverse?shown>50:shown<50;return `<div class="meter-row"><b>${label}</b><span class="meter ${bad?'danger':mid?'warn':''}"><i style="width:${shown}%"></i></span><b>${Math.round(shown)}</b></div>`}
  function card(title,desc,action,id,disabled=false,button=''){return `<div class="card"><strong>${title}</strong><small>${desc}</small><button type="button" aria-label="${esc(title.replace(/<[^>]*>/g,''))} ${esc(button)}" data-action="${action}" data-id="${id||''}" ${disabled?'disabled':''}>${esc(title.replace(/<[^>]*>/g,''))}</button></div>`}
  function action(title,desc,act,id,disabled=false){return `<button type="button" class="action" data-action="${act}" data-id="${id||''}" ${disabled?'disabled':''}><span><strong>${title}</strong><small>${desc}</small></span><span class="arrow">›</span></button>`}
  function renderTabs(){const tabs=[['care','🏠 돌보기'],['school','📚 학교'],['play','🎮 놀이'],['life','✨ 생활'],['shop','🛒 상점'],['family','👪 가족'],['album','📖 기록'],['status','📊 상태']];const primary=['care','school','play','shop'];const extra=tabs.filter(([id])=>!primary.includes(id));const button=([id,label])=>`<button type="button" data-tab="${id}" class="${tab===id?'active':''}">${label}</button>`;$('tabs').innerHTML=`<div class="desktop-main">${tabs.map(button).join('')}</div><div class="mobile-main">${tabs.filter(([id])=>primary.includes(id)).map(button).join('')}<button type="button" data-more="1" class="${menuOpen||extra.some(([id])=>id===tab)?'active':''}">☰ 더보기</button></div><div class="mobile-extra" ${menuOpen?'':'hidden'}>${extra.map(button).join('')}</div>`}
  function renderTop(){const pet=p(),st=pet.stats;drawPet();document.querySelector('.world').classList.toggle('room-dirty',pet.alive&&pet.poop>0);document.querySelector('.world').classList.toggle('room-large',has('room'));document.querySelector('.world').dataset.house=state.house||'sunny';const eggBar=$('eggBar');eggBar.hidden=pet.stage!=='egg'||!pet.alive;if(!eggBar.hidden){const left=cap(pet.eggGauge??100);$('eggGauge').style.width=`${left}%`;$('eggGauge').style.background=left>65?'#e95c58':left>30?'#f3a84d':'#f1d66a';eggBar.setAttribute('aria-valuenow',String(Math.round(left)))}$('petName').textContent=pet.name;$('generation').textContent=`${pet.generation}세대 · ${stageLabel(pet.stage)}`;$('coinLabel').textContent=`🪙 ${state.coins}M · 💎${state.gems}`;$('stageLabel').textContent=stageLabel(pet.stage);$('ageLabel').textContent=`${Math.floor(ageMinutes()/1440)}일`;$('clockLabel').textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false});$('foodStat').textContent=`🍚 ${Math.round(st.satiety)}/100`;$('moodStat').textContent=`♥ ${Math.round(st.mood)}/100`;$('energyStat').textContent=`☀ ${Math.round(st.energy)}/100`;$('stressStat').textContent=`스트레스 ${Math.round(st.stress)}/100`;$('challengeLabel').textContent=`${state.battle.stage}-${state.battle.wave===5?'Final':state.battle.wave}`;$('soundButton').textContent=state.sound?'🔊 소리':'🔇 소리';$('sceneBadge').hidden=!(pet.poop||pet.illness||!pet.alive);$('sceneBadge').textContent=!pet.alive?'☆':pet.illness?'!':pet.poop?'♠':'';
    let speech=pet.alive?pet.stage==='egg'?`부화까지 약 ${Math.max(0,Math.ceil(5-ageMinutes()))}분`:pet.illness?`${pet.illness}에 걸렸어…`:st.satiety<25?'배고파!':st.stress>70?'좀 쉬고 싶어…':st.mood<30?'같이 놀자!':pet.skills.speech>60?'오늘은 무엇을 함께 해볼까?':pet.skills.speech>25?'안녕! 같이 놀자!':'삐! 삐!':'별이 되었어요 · 추억 앨범을 확인하세요';$('speech').textContent=pet.alive&&pet.stage!=='egg'&&reaction?reaction.text:speech;
    if(!notice){notice=pet.illness?`${pet.illness} 치료와 휴식이 필요해요.`:st.health<25?'건강이 위중해요. 바로 돌봐주세요.':st.satiety<25?'배고파요. 먹이를 주세요.':st.stress>70?'스트레스가 높아요. 쉬거나 이야기해 주세요.':`오늘의 돌봄은 1~2분이면 충분해요. · ${state.coins}M`}
    const level=st.health<25?'danger':pet.illness||st.satiety<25||st.stress>70?'warning':'';$('notice').textContent=notice;$('notice').className='notice '+level;
  }
  function careView(){const pet=p(),st=pet.stats,items=shop.filter(x=>x.type==='food'&&has(x.id));return `<h2 class="section-title">오늘의 돌봄</h2><p class="subtle">배고픔과 기분을 먼저 살피세요. 바쁜 날은 먹이고 쉬게 하는 것만으로도 도움이 됩니다.</p><div class="cards">${card('🍚 식사',`${Math.round(st.satiety)} / 100 · 보유 ${items.length}종`,'openFood','',!pet.alive)}${card('💬 대화',`오늘 ${pet.conversationToday}/5회`,'talk','',!pet.alive||pet.stage==='egg')}${card('🛌 휴식',`피로 ${100-Math.round(st.energy)} · 스트레스 ${Math.round(st.stress)}`,'rest','',!pet.alive||pet.stage==='egg')}${card('🚽 화장실',`치울 것 ${pet.poop}개`,'cleanPoop','',!pet.alive||pet.stage==='egg')}${card('💡 불',pet.lightOn?'켜짐 · 밤에는 꺼주세요':'꺼짐','lights','',!pet.alive)}${card('💊 치료',pet.illness||'건강함','treat','',!pet.alive||!pet.illness)}</div><h3 class="section-title">지금 상태</h3>${statRow('배고픔',st.satiety)}${statRow('기분',st.mood)}${statRow('에너지',st.energy)}${statRow('스트레스',st.stress,true)}${statRow('건강',st.health)}<p class="subtle">마지막 의미 있는 돌봄: ${Math.max(0,Math.floor((Date.now()-pet.lastCare)/MIN))}분 전</p>`}
  function schoolView(){const pet=p();return `<h2 class="section-title">학교와 공부</h2><p class="subtle">과목을 고르면 캐릭터와 함께 교실로 이동합니다. 답 카드를 직접 끌어 놓아 세 문제를 풀어요. 하루 2과목까지이며, 몰아서 수업하면 피로가 쌓입니다.</p><div class="cards">${subjects.map(s=>card(`${s.icon} ${s.name}`,`${{intellect:'지능',speech:'말하기',fitness:'체력',creativity:'창의력'}[s.skill]} · 오늘 ${pet.schoolToday}/2`,'school',s.id,!pet.alive||['egg','baby'].includes(pet.stage)||pet.schoolToday>=2)).join('')}</div>`}
  function playView(){const pet=p();return `<h2 class="section-title">미니게임 5종 <span class="pill"><img class="bolt-icon" src="./bolt.svg" alt="번개"> ${state.tickets}/30</span></h2><p class="subtle">각 30초 · 번개 1개 소모 · 5분마다 1개 충전. 공 받기는 회피, 줄넘기는 체력, 기억력은 지능을 키워 도전에 도움이 됩니다.</p><div class="cards">${gameNames.map(g=>card(`${g.icon} ${g.name}`,`30초 · 번개 1개 · 다른 능력 성장`,'startGame',g.id,!pet.alive||pet.stage==='egg'||state.tickets<1)).join('')}</div>`}
  function lifeView(){const pet=p();return `<h2 class="section-title">운동 5종</h2><div class="cards">${exercises.map(e=>card(`${e.icon} ${e.name}`,`${e.mins}분 · 체력 +${e.fitness} · ${e.needs&&!has(e.needs)?'도구 필요':'이용 가능'}`,'exercise',e.id,!pet.alive||pet.stage==='egg'||!!(e.needs&&!has(e.needs)))).join('')}</div><h2 class="section-title">위생 5종</h2><div class="cards">${hygiene.map(h=>card(`${h.icon} ${h.name}`,`${h.secs}초 · 현재 ${Math.round(pet.hygiene[h.part])}/100`,'hygiene',h.id,!pet.alive||pet.stage==='egg')).join('')}</div><h2 class="section-title">도움받기</h2><div class="cards">${card('🏫 돌봄교실','25M · 최대 8시간 보호','sitter','',!pet.alive||pet.stage==='egg')}${card('💊 건강 확인',pet.illness||'현재 질병 없음','treat','',!pet.illness)}</div>`}
  function shopView(){return `<h2 class="section-title">슈퍼마켓 <span class="pill">${state.coins}M · 💎${state.gems}</span></h2><p class="subtle">도구는 한 번 산 뒤 레벨을 올립니다. 번개·먹거리는 수량을 골라 구매하세요. 보석은 플레이나 M코인 교환으로 얻으며 현금 결제는 없습니다.</p><div class="cards">${shop.map(item=>card(item.id==='bolt'?'<img class="bolt-icon" src="./bolt.svg" alt=""> 번개 충전':`${item.icon} ${item.name}`,`${item.desc} · ${item.type==='gear'&&has(item.id)?`Lv.${state.gearLevels[item.id]||1}/5 · ${state.equippedWeapon===item.id?'장착 중 · ':''}업그레이드 ${price(item)*(state.gearLevels[item.id]||1)}M`:item.type==='ticket'?`현재 ${state.tickets}/30`:item.type==='gem'?`${item.price}💎`:item.type==='gemPack'?`${price(item)}M → 1💎`: `보유 ${inventoryCount(item.id)}개 · ${price(item)}M`}`,'buy',item.id,(item.type==='gear'&&has(item.id)&&(state.gearLevels[item.id]||1)>=5&&!['dumbbell','battleRope','battleBook'].includes(item.id))||item.type==='decor'&&has(item.id),item.type==='gem'?`${item.price}💎`:`${price(item)}M`)).join('')}</div>`}
  function familyView(){const pet=p(),job=jobs.find(j=>j.id===pet.job);return `<h2 class="section-title">일과 가족</h2><p class="subtle">성체가 되면 직업을 고르고 가족을 꾸릴 수 있습니다. 수입과 함께 피로·스트레스·가족 관계도 달라집니다.</p>${adult()?`<div class="cards">${!job?card('💼 직업 선택','다섯 직업 중 하나를 선택','chooseJob',''):card(`${job.icon} ${job.name}`,`${job.pay}M 기본 수입 · ${job.desc}`,'chooseJob','',false,'직업 변경')}${card('🧰 오늘의 근무',pet.workToday?'오늘 근무 완료':'일하거나 가족과 쉬기','workMenu','',!job||pet.workToday)}${card('💞 배우자',pet.partner?`${pet.partner.name} · 친밀도 ${Math.round(pet.partner.bond)}`:'대화하고 관계를 쌓기','partner','',!pet.alive)}${card('🥚 자녀',pet.child?`${pet.child.name} · 다음 세대 준비 완료`:pet.partner?'결혼 후 자녀를 맞이할 수 있어요':'결혼 후 열림','child','',!pet.alive||!pet.partner)}</div>`:'<p class="subtle">성체가 되면 직업과 가족 메뉴가 열립니다.</p>'}${pet.child?`<div class="row"><span>우리 아이</span><b>${esc(pet.child.name)} · ${esc(pet.child.trait)}</b></div>`:''}`}
  function albumView(){const pet=p();return `<h2 class="section-title">추억 앨범</h2>${!pet.alive?card('🥚 다음 세대 시작',pet.child?'자녀가 부모의 특성을 이어받습니다':'새 알부터 시작합니다','nextGeneration','',false,'새 삶 시작'):''}<div class="stack">${state.family.length?state.family.map(f=>`<div class="row"><span>${esc(f.generation)}세대 ${esc(f.name)} · ${esc(f.form)}</span><b>${f.age}일</b></div>`).join(''):'<p class="subtle">첫 번째 가족 이야기가 진행 중이에요.</p>'}</div><h3 class="section-title">최근 일기</h3>${state.journal.slice(0,20).map(x=>`<div class="log">${new Date(x.at).toLocaleString('ko-KR')} · ${esc(x.text)}</div>`).join('')}`}
  function statusView(){const pet=p(),st=pet.stats,sk=pet.skills;return `<h2 class="section-title">상태와 능력</h2><div class="row"><span>성장 · 성격 · 외형</span><b>${stageLabel(pet.stage)} · ${esc(pet.trait)} · ${esc(pet.form||'미정')}</b></div><div class="row"><span>나이 · 몸무게 · 돌봄 실수</span><b>${Math.floor(ageMinutes()/1440)}일 · ${Math.round(st.weight)}g · ${pet.careMistakes}회</b></div><div class="row"><span>재화 · 도전 진도</span><b>${state.coins}M · 💎${state.gems} · ${state.battle.stage}-${state.battle.wave}</b></div>${statRow('배고픔',st.satiety)}${statRow('행복',st.mood)}${statRow('에너지',st.energy)}${statRow('스트레스',st.stress,true)}${statRow('건강',st.health)}${statRow('면역력',st.immunity)}${statRow('친밀도',st.bond)}<h3 class="section-title">생활 능력</h3>${Object.entries({intellect:'지능',speech:'말하기',fitness:'체력',creativity:'창의력',discipline:'훈육',life:'생활기술',dodge:'회피',luck:'행운'}).map(([k,v])=>statRow(v,sk[k])).join('')}<h3 class="section-title">부위별 청결</h3>${hygiene.map(h=>statRow(h.name,pet.hygiene[h.part])).join('')}<div class="row"><span>현재 질병</span><b>${esc(pet.illness||'없음')}</b></div>`}
  function render(){renderTop();const world=document.querySelector('.world');world.classList.toggle('has-flower',has('flower'));world.classList.toggle('has-lamp',has('lamp'));renderTabs();const views={care:careView,school:schoolView,play:playView,life:lifeView,shop:shopView,bag:bagView,family:familyView,album:albumView,status:statusView};$('screen').innerHTML=(views[tab]||careView)();}
  function openDialog(title,body,choices,closable=true){dialogState={choices};$('dialog').innerHTML=`<h2>${esc(title)}</h2><p>${body}</p><div class="buttons-list">${choices.map((x,i)=>`<button type="button" data-choice="${i}">${esc(x.label)}</button>`).join('')}</div>${closable?'<button type="button" class="secondary close" data-close="1">닫기</button>':''}`;$('dialogLayer').hidden=false;}
  function closeDialog(){$('dialogLayer').hidden=true;dialogState=null;game=null;}
  function chooseStarter(){const options=[['🌱 연두 모찌','온순함'],['🌸 분홍 모찌','상냥함'],['🌊 파랑 모찌','호기심'],['☀️ 노랑 모찌','활발함'],['🌙 보라 모찌','장난꾸러기']];openDialog('첫 모찌를 고르세요','알에서 태어날 다섯 친구 중 한 마리를 선택해요.',options.map(([name,trait],i)=>({label:`${name} · ${trait}`,run:()=>{p().starter=i;p().name=name.slice(3);p().trait=trait;save();chooseHouse()}})),false)}
  function chooseHouse(){openDialog('처음 집을 고르세요','꾸미기 아이템은 나중에 상점에서 추가할 수 있어요.',[{label:'☀️ 햇살집',run:()=>finishHouse('sunny')},{label:'🌿 숲속집',run:()=>finishHouse('forest')},{label:'🌸 분홍집',run:()=>finishHouse('pink')}],false)}
  function finishHouse(id){state.house=id;state.selectionDone=true;save();closeDialog();render()}
  function changeStat(changes){const pet=p();for(const [key,amount] of Object.entries(changes)){if(key in pet.stats)pet.stats[key]=cap(pet.stats[key]+amount,key==='weight'?4:0,key==='weight'?80:100);else if(key in pet.skills)pet.skills[key]=cap(pet.skills[key]+amount);else if(key==='bond')pet.stats.bond=cap(pet.stats.bond+amount)}normalize()}
  function openFood(){if(!canAct())return;const foods=shop.filter(x=>x.type==='food');openDialog('오늘의 식사','배가 어느 정도 찼는지 살펴보고 먹이를 골라주세요.',foods.map(item=>({label:`${item.icon} ${item.name} · ${inventoryCount(item.id)}개`,run:()=>{feed(item.id);closeDialog()}})))}
  function school(id){if(!canAct())return;if(['egg','baby'].includes(p().stage)){notify('어린이가 되면 학교에 갈 수 있어요.');return}if(p().schoolToday>=2){notify('오늘은 수업을 두 번 들었어요. 내일 다시 가요.');return}const s=subjects.find(x=>x.id===id);if(!s)return;openDialog(`${s.icon} ${s.name} 수업`,esc(s.question),s.options.map((answer,i)=>({label:answer,run:()=>{const correct=i===s.answer,bonus=(p().job==='teacher'||(s.id==='korean'&&has('book'))||(s.id==='science'&&has('scienceKit')))?2:0;p().schoolToday++;changeStat({[s.skill]:correct?6+bonus:2,energy:-7,stress:correct?3:7,mood:correct?3:-2});state.coins+=correct?16:6;care(correct?`${s.name} 문제를 맞혔어요! ${s.skill} 능력과 16M 획득`:`${s.name} 문제는 틀렸지만 배웠어요. 6M 획득`);closeDialog()}})))}
  function talk(){if(!canAct())return;if(p().conversationToday>=5){notify('오늘은 대화를 충분히 나눴어요.');return}const scene=pick(dialogue);openDialog('모찌와 대화',`“${esc(scene.line)}”`,scene.choices.map(([label,changes])=>({label,run:()=>{p().conversationToday++;changeStat(changes);changeStat({speech:1,bond:2});care(`대화: ${label}`);closeDialog()}})))}
  function startHygiene(id){if(!canAct())return;const h=hygiene.find(x=>x.id===id);if(!h)return;activity={type:'hygiene',item:h,index:0};showHygiene()}
  function openHygiene(){if(!canAct())return;openDialog('어디를 씻을까요?','생활 속 씻기 동작을 직접 골라 완성하세요.',hygiene.map(h=>({label:`${h.icon} ${h.name} · ${h.secs}초`,run:()=>openHygieneScene(h.id)})))}
  function showHygiene(){const h=activity.item,idx=activity.index;if(idx>=h.steps.length){let gain=h.gain+(has('soap')&&h.part!=='teeth'?10:0)+(has('toothbrush')&&h.part==='teeth'?10:0);p().hygiene[h.part]=cap(p().hygiene[h.part]+gain);if(h.part==='body'){p().hygiene.hands=cap(p().hygiene.hands+10);p().hygiene.feet=cap(p().hygiene.feet+10)}p().stats.stress=cap(p().stats.stress-3);p().skills.life=cap(p().skills.life+1);care(`${h.name} 완료 · 게임 시간 ${h.secs}초`);activity=null;closeDialog();return}
    const options=[h.steps[idx],...h.steps.filter(x=>x!==h.steps[idx])].sort(()=>Math.random()-.5);openDialog(`${h.icon} ${h.name} · ${idx+1}/3`,`다음 동작을 선택하세요. 완료하면 게임 속에서 ${h.secs}초가 흐릅니다.`,options.map(label=>({label,run:()=>{if(label===h.steps[idx]){activity.index++;showHygiene()}else{p().stats.stress=cap(p().stats.stress+1);notify('순서를 다시 생각해봐요.','warning');showHygiene()}}})))}
  function startExercise(id){if(!canAct())return;const e=exercises.find(x=>x.id===id);if(!e)return;if(e.needs&&!has(e.needs)){notify('운동 기구가 필요해요. 슈퍼마켓에서 구입하세요.','warning');return}if(p().stats.energy<15){notify('너무 지쳤어요. 먼저 쉬어주세요.','warning');return}activity={type:'exercise',item:e,step:0,pattern:Array.from({length:3},()=>pick(['A','B','C']))};exerciseStep()}
  function exerciseStep(){const a=activity,e=a.item;if(a.step>=3){const st=p().stats,over=p().exerciseToday>=2;st.energy=cap(st.energy-e.effort*(over?1.5:1));st.stress=cap(st.stress+e.stress+(over?9:0));st.satiety=cap(st.satiety-7);st.weight=cap(st.weight-(over?.3:.7),4,80);st.mood=cap(st.mood+4);p().skills.fitness=cap(p().skills.fitness+e.fitness);p().hygiene[e.dirt]=cap(p().hygiene[e.dirt]-e.dirtAmt);p().exerciseToday++;if(over&&st.energy<20)p().illness='근육통';care(`${e.name} ${e.mins}분 완료! ${over?'과한 운동으로 피로가 쌓였어요.':'체력이 올랐어요.'}`);activity=null;closeDialog();return}const correct=a.pattern[a.step];openDialog(`${e.icon} ${e.name} · 동작 ${a.step+1}/3`,`화면의 리듬 <b>${correct}</b>를 눌러 따라 하세요.`,['A','B','C'].map(key=>({label:`${key} 동작`,run:()=>{if(key===correct){a.step++;exerciseStep()}else{p().stats.energy=cap(p().stats.energy-2);notify('리듬이 달라요. 다시 눌러보세요.','warning');exerciseStep()}}})))}
  function chooseJob(){if(!canAct()||!adult())return;openDialog('직업 선택','직업은 수입·피로·가족 관계에 서로 다른 영향을 줍니다.',jobs.map(j=>({label:`${j.icon} ${j.name} · ${j.pay}M/일 · ${j.desc}`,run:()=>{p().job=j.id;care(`${j.name} 직업을 선택했어요.`);closeDialog()}})))}
  function workMenu(){if(!canAct()||!p().job)return;openDialog('오늘의 근무','일과 휴식 중 하나를 선택하세요. 오늘은 한 번만 결정할 수 있습니다.',[{label:'정상 근무 · 기본 수입',run:()=>{work('normal');closeDialog()}},{label:'야근 · 수입 약 1.5배, 피로·가족 관계 악화',run:()=>{work('overtime');closeDialog()}},{label:'가족과 쉬기 · 수입 0, 스트레스 회복',run:()=>{work('rest');closeDialog()}}])}
  function partnerAction(){if(!canAct()||!adult())return;const pet=p();if(!pet.partner){openDialog('친구 만나기','성체가 된 모찌가 새로운 공룡을 만났어요. 누구와 친해질까요?',[
      {label:'루루 · 조용하고 다정한 공룡',run:()=>{pet.partner={name:'루루',trait:'상냥함',bond:15,meet:Date.now(),married:false};care('루루와 친구가 되었어요.');closeDialog()}},
      {label:'토토 · 활발하고 호기심 많은 공룡',run:()=>{pet.partner={name:'토토',trait:'호기심',bond:15,meet:Date.now(),married:false};care('토토와 친구가 되었어요.');closeDialog()}}
    ]);return}if(pet.partner.married){notify(`${pet.partner.name}와 함께 가족을 돌보고 있어요.`);return}openDialog(`${pet.partner.name}와 만남`,`현재 친밀도 ${Math.round(pet.partner.bond)}/100. 서로 이야기하며 관계를 쌓을 수 있어요.`,[
    {label:'함께 산책하기 · 친밀도 +20',run:()=>{pet.partner.bond=cap(pet.partner.bond+20);changeStat({energy:-5,stress:-6,bond:4});care(`${pet.partner.name}와 산책했어요.`);closeDialog()}},
    {label:'진심을 이야기하기 · 친밀도 +15',run:()=>{pet.partner.bond=cap(pet.partner.bond+15);changeStat({speech:2,bond:4});care(`${pet.partner.name}와 대화했어요.`);closeDialog()}},
    {label:'결혼하기 · 친밀도 60 이상',run:()=>{if(pet.partner.bond<60){notify('친밀도를 60 이상 쌓아주세요.','warning');return}pet.partner.married=true;pet.marriedAt=Date.now();care(`${pet.partner.name}와 결혼했어요!`);closeDialog()}}
  ])}
  function childAction(){const pet=p();if(!canAct()||!adult())return;if(!pet.partner?.married){notify('결혼 후 자녀를 맞이할 수 있어요.','warning');return}if(pet.child){notify(`${pet.child.name}가 가족 앨범에서 다음 세대를 기다리고 있어요.`);return}if(Date.now()-pet.marriedAt<DAY){notify('결혼 후 하루가 지나면 자녀를 맞이할 수 있어요.','warning');return}const inheritedSkill=Object.entries(pet.skills).sort((a,b)=>b[1]-a[1])[0][0];pet.child={name:'아기 모찌',trait:rand(2)?pet.trait:pet.partner.trait,bond:35,genes:{horn:pet.genes.horn,tail:rand(2)?pet.genes.tail:rand(3)},inheritedSkill};care('새로운 알이 가족에게 찾아왔어요!')}
  function useKey(key){if(activityEngine.active()){activityEngine.key(key);return}if($('dialogLayer').hidden){if(key==='A'){const tabs=[...document.querySelectorAll('#tabs button')];const i=tabs.findIndex(b=>b.dataset.tab===tab);tab=tabs[(i+1)%tabs.length].dataset.tab;notice='';render()}else if(key==='B'){const first=$('screen').querySelector('[data-action]:not(:disabled)');if(first)first.click()}else{tab='care';notice='';render()}return}if(game){gameKey(key);return}if(key==='C'){closeDialog();render();return}const buttons=[...$('dialog').querySelectorAll('[data-choice]')];if(!buttons.length)return;dialogState.cursor=key==='A'?((dialogState.cursor||0)+1)%buttons.length:(dialogState.cursor||0);buttons.forEach((b,i)=>b.style.outline=i===dialogState.cursor?'3px solid #157bb3':'none');if(key==='B')buttons[dialogState.cursor].click()}
  function startGame(id){
    if(!canAct())return;
    if(p().stats.energy<10){notify('기운이 부족해요. 조금 쉬고 놀아요.','warning');return}
    const entry=gameNames.find(x=>x.id===id);if(!entry)return;
    game={id,score:0,round:0,lane:1,selected:0,balls:Array.from({length:5},()=>rand(3)),bricks:Array.from({length:3},()=>Array(4).fill(1)),sequence:[],input:0,phase:'play',marker:0,direction:1};
    if(id==='memory')nextMemory();
    if(id==='jump')game.timer=setInterval(()=>{if(!game||game.id!=='jump')return;game.marker+=game.direction;if(game.marker>=6||game.marker<=0)game.direction*=-1;renderGame()},350);
    renderGame();
  }
  function nextMemory(){game.sequence=Array.from({length:Math.min(3+game.round,6)},()=>pick(['A','B','C']));game.input=0;game.phase='show';setTimeout(()=>{if(game?.id==='memory'&&game.phase==='show'){game.phase='play';renderGame()}},2200)}
  function gameText(){
    if(game.id==='catch')return `공은 <b>${['왼쪽','가운데','오른쪽'][game.balls[game.round]]}</b>에 있어요. A/C로 이동하고 B로 받으세요.<div class="mini-board">${[0,1,2].map(i=>`<span>${game.balls[game.round]===i?'●':'·'}<br>${game.lane===i?'▰':'_'}</span>`).join('')}</div>`;
    if(game.id==='bricks')return `A/C로 위치를 옮기고 B로 공을 쏘세요.<div class="mini-board">${game.bricks.map(row=>`<div>${row.map(v=>v?'▣':'　').join(' ')}</div>`).join('')}<div>${[0,1,2,3].map(i=>i===game.selected?'▲':'　').join(' ')}</div></div>`;
    if(game.id==='jump')return `줄이 가운데에 올 때 B를 누르세요.<div class="mini-board">${Array.from({length:7},(_,i)=>i===game.marker?'●':i===3?'▣':'·').join(' ')}</div>`;
    if(game.id==='memory')return game.phase==='show'?`순서를 기억하세요!<div class="mini-board">${game.sequence.join('  ')}</div>`:`기억한 순서대로 A/B/C를 누르세요. (${game.input+1}/${game.sequence.length})`;
    const q=subjects[game.round%subjects.length];return `${esc(q.question)}<div class="mini-board">${q.options.map((v,i)=>`${i===game.selected?'▶':'　'}${esc(v)}`).join('<br>')}</div>A/C 선택 · B 확인`;
  }
  function renderGame(){if(!game)return;const entry=gameNames.find(x=>x.id===game.id);$('dialog').innerHTML=`<h2>${entry.icon} ${entry.name}</h2><p>${game.round+1}/${game.id==='bricks'?8:game.id==='jump'?8:game.id==='memory'?3:5}판 · 점수 ${game.score}</p><p>${gameText()}</p><div class="game-buttons"><button type="button" data-game-key="A">A</button><button type="button" data-game-key="B">B</button><button type="button" data-game-key="C">C</button></div><button type="button" class="secondary close" data-close="1">그만두기</button>`;$('dialogLayer').hidden=false}
  function endGame(){const g=game;if(g?.timer)clearInterval(g.timer);if(!g)return;const reward=Math.round(g.score*(p().gameToday<3?7:3));state.coins+=reward;p().gameToday++;changeStat({mood:Math.min(20,g.score*3+2),energy:-Math.max(3,g.round+2),stress:-Math.min(12,g.score*2),bond:Math.min(8,g.score)});if(g.id==='quiz')changeStat({intellect:Math.min(5,g.score)});if(g.id==='jump'||g.id==='catch')changeStat({fitness:Math.min(5,g.score)});game=null;closeDialog();care(`${gameNames.find(x=>x.id===g.id).name} ${g.score}점 · ${reward}M을 얻었어요.`)}
  function gameKey(key){
    const g=game;if(!g)return;
    if(g.id==='catch'){if(key==='A')g.lane=Math.max(0,g.lane-1);if(key==='C')g.lane=Math.min(2,g.lane+1);if(key==='B'){if(g.lane===g.balls[g.round])g.score++;g.round++;if(g.round>=5){endGame();return}}}
    else if(g.id==='bricks'){if(key==='A')g.selected=Math.max(0,g.selected-1);if(key==='C')g.selected=Math.min(3,g.selected+1);if(key==='B'){let hit=false;for(let row=2;row>=0;row--){if(g.bricks[row][g.selected]){g.bricks[row][g.selected]=0;g.score++;hit=true;break}}if(!hit)tone(190);g.round++;if(g.round>=8||g.bricks.flat().every(v=>!v)){endGame();return}}}
    else if(g.id==='jump'){if(key==='B'){if(g.marker===3)g.score++;g.round++;if(g.round>=8){endGame();return}}}
    else if(g.id==='memory'){if(g.phase==='show')return;if(key===g.sequence[g.input]){g.input++;if(g.input>=g.sequence.length){g.score++;g.round++;if(g.round>=3){endGame();return}nextMemory()}}else{g.round++;if(g.round>=3){endGame();return}nextMemory()}}
    else if(g.id==='quiz'){if(key==='A')g.selected=(g.selected+1)%3;if(key==='C')g.selected=(g.selected+2)%3;if(key==='B'){if(g.selected===subjects[g.round%subjects.length].answer)g.score++;g.selected=0;g.round++;if(g.round>=5){endGame();return}}}
    tone(key==='B'?720:480);renderGame();
  }
  const activityEngine=window.MotchiActivities.create({tone,onCancel:()=>{grandpaPending=false;notice='활동을 중단했어요. 점수와 보상은 저장되지 않았습니다.';render()},onComplete:result=>{
    const pet=p(),st=pet.stats,score=result.score;
    if(result.kind==='mini'){
      const reward=Math.min(140,Math.round(score*(pet.gameToday<3?7:3)));state.coins+=reward;pet.gameToday++;
       const effects={catch:{dodge:Math.min(6,score),mood:5},bricks:{fitness:Math.min(5,score),stress:-6},jump:{fitness:Math.min(6,score),energy:-5},memory:{intellect:Math.min(6,score),stress:-3},quiz:{intellect:Math.min(5,score),speech:2}};
       changeStat({...effects[result.id],mood:Math.min(10,score+2),energy:-Math.max(4,Math.min(18,score+3)),bond:Math.min(8,score)});
       react('play',score>0?'재밌었어! 또 놀자!':'다음엔 더 잘할래!');care(`${gameNames.find(x=>x.id===result.id)?.name||'놀이'} ${score}점 · ${reward}M 획득`);
       if(grandpaPending){grandpaPending=false;const elder=Math.max(0,Math.round(score*(.55+Math.random()*.9-pet.skills.luck*.004)));setTimeout(()=>{openDialog('할아버지 차례',`모찌 ${score}점 · 할아버지가 공을 받는 중… 0점`,[],false);let turn=0;const replay=setInterval(()=>{turn++;const shown=Math.round(elder*turn/8);$('dialog').querySelector('p').textContent=`모찌 ${score}점 · 할아버지 ${shown}점 · ${'⚾'.repeat(Math.min(turn,5))}`;tone(440+turn*30);if(turn>=8){clearInterval(replay);if(score>elder){state.gems++;changeStat({luck:1});care(`할아버지 대결 승리! ${score} 대 ${elder} · 보석 1개 획득`)}openDialog('대결 결과',`내 점수 ${score}점 · 할아버지 ${elder}점<br>${score>elder?'이겼어요! 💎 보석 1개 획득':'아쉽게 졌어요. 행운을 키워 다시 도전해요.'}`,[{label:'확인',run:()=>{closeDialog();render()}}])}},350)},500)}
    }else if(result.kind==='school'){
      const subject=subjects.find(x=>x.id===result.id);pet.schoolToday++;const reward=6+score*8;state.coins+=reward;
      changeStat({[subject.skill]:2+score*2,energy:-8,stress:score>=2?2:6,mood:score>=2?4:0});
      care(`${subject.name} 수업 ${score}/3문제 · ${reward}M 획득`);
    }else if(result.kind==='hygiene'){
      const h=hygiene.find(x=>x.id===result.id);const bonus=(h.part==='teeth'&&has('toothbrush'))||(h.part!=='teeth'&&has('soap'))?10:0;
      pet.hygiene[h.part]=cap(pet.hygiene[h.part]+h.gain+bonus);if(h.part==='body'){pet.hygiene.hands=cap(pet.hygiene.hands+10);pet.hygiene.feet=cap(pet.hygiene.feet+10)}
      changeStat({stress:-4,life:1});react('clean','반짝반짝! 개운해!');care(`${h.name} 완료 · 게임 속 ${h.secs}초가 흘렀어요.`);
    }else if(result.kind==='exercise'){
      const e=exercises.find(x=>x.id===result.id),over=pet.exerciseToday>=2;
      if(score<1){st.energy=cap(st.energy-3);care(`${e.name}을 끝내지 못했어요. 다시 직접 움직여 보세요.`);return}
      st.energy=cap(st.energy-e.effort*(over?1.5:1));st.stress=cap(st.stress+e.stress+(over?9:0));st.satiety=cap(st.satiety-7);st.weight=cap(st.weight-(over?.3:.7),4,80);st.mood=cap(st.mood+4);
      pet.skills.fitness=cap(pet.skills.fitness+e.fitness);pet.skills.power=cap((pet.skills.power||0)+Math.max(1,Math.round(e.fitness*.6)));pet.hygiene[e.dirt]=cap(pet.hygiene[e.dirt]-e.dirtAmt);pet.exerciseToday++;
      if(over&&st.energy<20)pet.illness='근육통';react('rest',over?'헉헉… 너무 힘들어!':'후우! 몸이 가벼워!');care(`${e.name} 직접 플레이 완료 · ${over?'과한 운동으로 피로가 쌓였어요.':'체력이 올랐어요.'}`);
    }
  }});
  function openMiniScene(id){if(!canAct())return;if(p().stats.energy<10){notify('기운이 부족해요. 조금 쉬고 놀아요.','warning');return}refillTickets();if(state.tickets<1){notify('번개가 부족해요. 5분마다 1개 충전되거나 상점에서 살 수 있어요.','warning');return}state.tickets--;save();closeDialog();activityEngine.start('mini',id)}
  function openSchoolScene(id){if(!canAct())return;if(['egg','baby'].includes(p().stage)){notify('어린이가 되면 학교에 갈 수 있어요.');return}if(p().schoolToday>=2){notify('오늘은 수업을 두 번 들었어요. 내일 다시 가요.');return}closeDialog();activityEngine.start('school',id)}
  function openHygieneScene(id){if(!canAct())return;closeDialog();activityEngine.start('hygiene',id)}
  function openExerciseScene(id){if(!canAct())return;const e=exercises.find(x=>x.id===id);if(!e)return;if(e.needs&&!has(e.needs)){notify('운동 기구가 필요해요. 슈퍼마켓에서 구입하세요.','warning');return}if(p().stats.energy<15){notify('너무 지쳤어요. 먼저 쉬어주세요.','warning');return}closeDialog();activityEngine.start('exercise',id)}
  state.battleBoosts={attack:0,speed:0,crit:0,gold:0,...state.battleBoosts};
  const battleUpgradeData=[
    {id:'attack',icon:'💪',name:'공격력',effect:'한 번의 타격 +0.8',cost:25},
    {id:'speed',icon:'💨',name:'연타 속도',effect:'공격 간격 -12ms',cost:35},
    {id:'crit',icon:'✨',name:'치명타',effect:'치명타 확률 +2%',cost:30},
    {id:'gold',icon:'🪙',name:'몬스터 돈',effect:'처치 보상 +8%',cost:30}
  ];
  let battlePendingCoins=0;
  const upgradeCost=item=>Math.round(item.cost*Math.pow(1.55,state.battleBoosts[item.id]||0));
  function renderBattlePanel(){
    const boosts=state.battleBoosts,interval=Math.max(125,215-boosts.speed*12);
    const dps=Math.round((3.3+(p().skills.power||0)*.045+(p().skills.fitness||0)*.015+boosts.attack*.8)*1000/interval);
    $('battleWallet').textContent=`보유 ${state.coins}M · 전투 중 +${battlePendingCoins}M · 기본 DPS 약 ${dps}`;
    $('battleUpgradeCards').innerHTML=battleUpgradeData.map(item=>{
      const level=boosts[item.id]||0,cost=upgradeCost(item);
      return `<div class="battle-upgrade-card"><span class="battle-upgrade-icon">${item.icon}</span><span><strong>${item.name} Lv.${level}</strong><small>${item.effect}</small></span><button type="button" data-battle-upgrade="${item.id}" ${level>=10||state.coins<cost?'disabled':''}>${level>=10?'최대':`${cost}M 강화`}</button></div>`;
    }).join('');
  }
  $('battleUpgradeCards').addEventListener('click',e=>{
    const button=e.target.closest('[data-battle-upgrade]');if(!button)return;
    const item=battleUpgradeData.find(x=>x.id===button.dataset.battleUpgrade);if(!item)return;
    const cost=upgradeCost(item);if(state.battleBoosts[item.id]>=10||state.coins<cost)return;
    state.coins-=cost;state.battleBoosts[item.id]++;save();renderBattlePanel();renderTop();tone(830);
  });
  const battleEngine=window.MotchiBattle.create({snapshot:()=>{const weapon=has(state.equippedWeapon)?state.equippedWeapon:['dumbbell','battleRope','battleBook'].find(has);return {stage:state.battle.stage,wave:state.battle.wave,starter:p().starter||0,fitness:p().skills.fitness,dodge:p().skills.dodge,intellect:p().skills.intellect,energy:p().stats.energy,weapon,weaponLevel:weapon?(state.gearLevels[weapon]||1):0,weaponIcon:weapon==='battleRope'?'🪢':weapon==='battleBook'?'📘':'🏋️'}},tone,onProgress:progress=>{battlePendingCoins=progress.earnedCoins;renderBattlePanel()},onFinish:result=>{
    const loot=Math.max(0,result.earnedCoins||0);state.coins+=loot;
    if(result.quit){state.battle.wave=1;care(`도전을 중단했어요. 처치한 몬스터 보상 ${loot}M을 받았어요.`);return}
    if(result.win){
      const clearBonus=12+result.stage*5+result.wave*3;state.coins+=clearBonus;
      changeStat({fitness:1,dodge:1,energy:-2,stress:2});
      if(result.wave===5){
        if(result.stage===10)state.battle.completed=true;else state.battle.stage++;
        state.battle.wave=1;state.gems+=1;
        care(`${result.stage}-Final 클리어! 몬스터 보상 ${loot}M + 완료 ${clearBonus}M · 보석 1개 획득`);
      }else{
        const gemChance=Math.min(.25,.12+(p().skills.luck||0)*.0013),gemFound=Math.random()<gemChance;
        if(gemFound)state.gems++;
        state.battle.wave++;
        care(`${result.stage}-${result.wave} 클리어! 몬스터 보상 ${loot}M + 완료 ${clearBonus}M${gemFound?' · 보석 1개 발견!':''}`);
        setTimeout(()=>{if(p().alive)battleEngine.start()},900);
      }
    }else{
      state.battle.wave=1;changeStat({energy:-7,stress:5});
      care(`${result.stage}-${result.wave} 실패 · 처치한 몬스터 보상 ${loot}M 획득 · ${result.stage}-1부터 재도전해요.`);
    }
  }});
  function challenge(){if(!canAct())return;refillTickets();if(state.battle.completed){notify('10-Final까지 모두 완료했어요!');return}if(state.tickets<1){notify('번개가 부족해요.','warning');return}state.tickets--;save();battleEngine.start()}
  function dispatchAction(act,id){const actions={openFood,openHygiene,school:openSchoolScene,talk,rest,cleanPoop,lights,treat,sitter,exercise:openExerciseScene,hygiene:openHygieneScene,buy:buyPrompt,chooseJob,workMenu,partner:partnerAction,child:childAction,nextGeneration,startGame:openMiniScene,challenge};if(actions[act])actions[act](id)}
  $('screen').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button&&!button.disabled)dispatchAction(button.dataset.action,button.dataset.id)});
  document.querySelector('.world').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button&&!button.disabled)dispatchAction(button.dataset.action,button.dataset.id)});
  $('tabs').addEventListener('click',e=>{if(e.target.closest('[data-more]')){menuOpen=!menuOpen;renderTabs();return}const button=e.target.closest('[data-tab]');if(button){tab=button.dataset.tab;menuOpen=false;notice='';render()}});
  $('dialog').addEventListener('click',e=>{const gameButton=e.target.closest('[data-game-key]');if(gameButton){gameKey(gameButton.dataset.gameKey);return}const close=e.target.closest('[data-close]');if(close){if(game?.timer)clearInterval(game.timer);closeDialog();render();return}const button=e.target.closest('[data-choice]');if(button&&dialogState){const selected=dialogState.choices[Number(button.dataset.choice)];if(selected){tone(720);selected.run()}}});
  let lastPetTouch=0;
  $('petCanvas').addEventListener('pointerdown',()=>{const now=Date.now(),egg=p().stage==='egg';if(now-lastPetTouch<(egg?90:650))return;lastPetTouch=now;if(egg){lastEggTouch=now;p().eggGauge=cap((p().eggGauge??100)-3.8);if(p().eggGauge===0){stageUpdate();save();render()}else{save();renderTop()}$('speech').textContent=p().stage==='egg'?pick(['삐! 삐!','톡톡…','…!']):'와! 모찌가 태어났어!'}else $('speech').textContent=pick(['삐!','헤헤!','같이 놀자!']);tone(egg?560:740);const scene=document.querySelector('.pet-scene');scene.classList.remove('touched');void scene.offsetWidth;scene.classList.add('touched');setTimeout(()=>scene.classList.remove('touched'),650)});
  $('dialogLayer').addEventListener('click',e=>{if(e.target===$('dialogLayer')){if(game?.timer)clearInterval(game.timer);closeDialog();render()}});
  $('soundButton').addEventListener('click',()=>{state.sound=!state.sound;save();renderTop();if(state.sound)tone(700)});
  window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Enter','Escape','a','b','c','A','B','C'].includes(e.key)){e.preventDefault();if(e.key==='Escape'&&activityEngine.active()){activityEngine.quit();return}const key=({ArrowLeft:'A',ArrowRight:'C',Enter:'B',Escape:'C'})[e.key]||e.key.toUpperCase();useKey(key)}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){advance();render()}else save()});
  window.addEventListener('pagehide',save);
  // v14: The saved pet remains compatible with earlier MOTCHI LIFE releases.
  state.pet.skills.power ??= 0;
  const originalLifeStage=lifeStage;
  lifeStage=function(){
    if(p().alive&&(p().eggGauge??100)>0&&p().stage==='egg')return 'egg';
    const next=originalLifeStage();
    const actions=p().growthActions||0;
    if(p().stage==='baby'&&next!=='baby'&&actions<3)return 'baby';
    if(p().stage==='child'&&['teen','adult','elder'].includes(next)&&actions<8)return 'child';
    if(p().stage==='teen'&&['adult','elder'].includes(next)&&actions<15)return 'teen';
    return next;
  };
  const originalCare=care;
  care=function(reason){if(reason&&!/구입|구매|업그레이드|장착|직업 선택/.test(reason))p().growthActions=(p().growthActions||0)+1;originalCare(reason)};
  const originalCanAct=canAct;
  canAct=function(){if(p().stage==='egg'&&p().alive){notify('알을 터치해 부화 게이지를 줄여주세요.','warning');return false}return originalCanAct()};
  const starterTypes = [
    {name:'콩콩',trait:'든든함',skill:'power',label:'힘',detail:'아령의 한 방과 밀치기에 강해요.',color:'#75bd83',shape:'athlete'},
    {name:'퐁퐁',trait:'날쌤',skill:'dodge',label:'회피',detail:'재빠르게 움직여 공격을 잘 피해요.',color:'#f19cb1',shape:'friend'},
    {name:'몽글',trait:'튼튼함',skill:'fitness',label:'체력',detail:'오래 활동하고 전투를 버텨요.',color:'#89b7dc',shape:'rough'},
    {name:'반짝',trait:'호기심',skill:'intellect',label:'지능',detail:'공부와 책 무기에 강해요.',color:'#f2c370',shape:'scholar'},
    {name:'별콩',trait:'행운',skill:'luck',label:'행운',detail:'뜻밖의 보상과 강타를 잘 찾아요.',color:'#b9a4da',shape:'artist'}
  ];
  let starterIndex=0, shopCategory='food', petDragging=null, worldSoundAt=0;
  const originalRenderTop=renderTop;
  renderTop=function(){
    originalRenderTop();
    const world=document.querySelector('.world'),hour=new Date().getHours();
    world.dataset.time=hour<6?'night':hour<11?'morning':hour<17?'day':hour<20?'sunset':'night';
    $('ageLabel').textContent=`함께한 ${Math.floor(ageMinutes()/1440)+1}일째`;
    if(p().stage==='egg')$('speech').textContent='알을 빠르게 터치하면 금이 가요!';
    if(p().alive&&p().stage!=='egg'&&!petDragging){
      const scene=document.querySelector('.pet-scene');
      scene.style.left=`${cap(p().homeX??50,20,80)}%`;
      scene.style.bottom=`${cap(p().homeY??15,12,27)}%`;
    }
  };
  const originalDrawPet=drawPet;
  drawPet=function(){
    originalDrawPet();
    const pet=p();if(!pet.alive||pet.stage==='egg')return;
    const ctx=$('petCanvas').getContext('2d'),mark=pet.starter||0;
    ctx.fillStyle=['#4d9b59','#e878a1','#4a99be','#e5a241','#8f7ac7'][mark];
    if(mark===0){ctx.fillRect(27,56,17,17);ctx.fillRect(117,56,17,17)}
    if(mark===1){ctx.fillRect(21,42,18,25);ctx.fillRect(121,42,18,25)}
    if(mark===2){ctx.fillRect(18,76,16,24);ctx.fillRect(126,76,16,24)}
    if(mark===3){ctx.fillRect(72,4,16,17);ctx.fillRect(66,10,28,8)}
    if(mark===4){ctx.fillRect(63,0,35,7);ctx.fillRect(72,7,18,10)}
  };
  function renderStarter(){
    const s=starterTypes[starterIndex];
    $('dialog').innerHTML=`<h2>첫 모찌를 고르세요</h2><p>옆으로 밀어서 다섯 친구를 만나보세요.</p><div class="starter-carousel"><button type="button" data-starter-move="-1" aria-label="이전 모찌">❮</button><div class="starter-focus"><canvas id="starterCanvas" width="160" height="160" aria-label="${s.name} 도트 캐릭터"></canvas><strong>${s.name}</strong><small>${s.label} 특화 · ${s.detail}</small><span>${starterIndex+1} / 5</span></div><button type="button" data-starter-move="1" aria-label="다음 모찌">❯</button></div><button type="button" class="primary" data-starter-confirm="1">${s.name}과 시작하기</button>`;
    $('dialogLayer').hidden=false;
    const cv=$('starterCanvas'),ctx=cv.getContext('2d'),rows=sprites[s.shape],px=8;
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,160,160);
    rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='.')return;ctx.fillStyle=c==='1'?'#263c36':c==='5'?'#f5df8b':s.color;ctx.fillRect(16+x*px,16+y*px,px,px)}));
  }
  chooseStarter=function(){starterIndex=cap(p().starter??0,0,4);renderStarter()};
  chooseHouse=function(){openDialog('첫 집을 고르세요','색만 다른 집이 아니라 풍경과 소리가 다른 공간입니다.',[
    {label:'☀️ 햇살집 · 따뜻한 정원',run:()=>finishHouse('sunny')},
    {label:'🌿 정글집 · 덩굴과 큰 잎',run:()=>finishHouse('forest')},
    {label:'🌊 바닷집 · 파도와 조개',run:()=>finishHouse('sea')},
    {label:'🌃 도시집 · 창밖 야경',run:()=>finishHouse('city')},
    {label:'🍬 사탕집 · 달콤한 방',run:()=>finishHouse('pink')}
  ],false)};
  $('dialog').addEventListener('click',e=>{
    const move=e.target.closest('[data-starter-move]');
    if(move){starterIndex=(starterIndex+5+Number(move.dataset.starterMove))%5;renderStarter();tone(620);return}
    if(e.target.closest('[data-starter-confirm]')){
      const s=starterTypes[starterIndex];p().starter=starterIndex;p().name=s.name;p().trait=s.trait;
      p().skills[s.skill]=12;save();chooseHouse();tone(790);
    }
  });
  let carouselTouch=0;
  $('dialog').addEventListener('touchstart',e=>{if(e.target.closest('.starter-carousel'))carouselTouch=e.changedTouches[0].clientX},{passive:true});
  $('dialog').addEventListener('touchend',e=>{if(!e.target.closest('.starter-carousel'))return;const diff=e.changedTouches[0].clientX-carouselTouch;if(Math.abs(diff)>45){starterIndex=(starterIndex+5+(diff<0?1:-1))%5;renderStarter();tone(620)}},{passive:true});
  const originalOpenDialog=openDialog;
  openDialog=function(title,body,choices,closable=true){
    originalOpenDialog(title,body,choices,closable);
    if(title.includes('할아버지가 왔어요')){
      $('dialog').classList.add('grandpa-dialog');
      $('dialog').querySelector('p').insertAdjacentHTML('beforebegin','<div class="grandpa-arrival"><img src="./grandpa.svg" alt="도트 할아버지"><span>모찌야, 놀자꾸나!</span></div>');
    }else $('dialog').classList.remove('grandpa-dialog');
  };
  const shopGroups={food:'음식',exercise:'운동',game:'게임',battle:'전투',care:'생활',decor:'꾸미기'};
  const originalStatusView=statusView;
  statusView=function(){return originalStatusView().replace('<h3 class="section-title">생활 능력</h3>','<h3 class="section-title">생활 능력</h3>'+statRow('힘',p().skills.power||0))};
  const shopGroup=item=>item.type==='food'?'food':item.id==='bolt'||item.id==='gemPack'||item.id==='starCharm'?'game':['dumbbell','battleRope','battleBook'].includes(item.id)?'battle':['ball','rope','swimGear'].includes(item.id)?'exercise':item.type==='decor'?'decor':'care';
  shopView=function(){const items=shop.filter(item=>shopGroup(item)===shopCategory);return `<h2 class="section-title">슈퍼마켓 <span class="pill">${state.coins}M · 💎${state.gems}</span></h2><div class="shop-categories">${Object.entries(shopGroups).map(([id,label])=>`<button type="button" data-shop-category="${id}" class="${id===shopCategory?'active':''}">${label}</button>`).join('')}</div><div class="cards">${items.map(item=>card(`${item.icon} ${item.name}`,`${item.desc} · ${item.type==='gear'&&has(item.id)?`Lv.${state.gearLevels[item.id]||1}/5 · ${state.equippedWeapon===item.id?'장착 중 · ':''}업그레이드 가능`:item.type==='ticket'?`${state.tickets}/30`:item.type==='gem'?`${item.price}💎`:item.type==='gemPack'?`${price(item)}M → 1💎`:`보유 ${inventoryCount(item.id)}개`} · ${item.type==='gem'?item.price+'💎':price(item)+'M'}`,'buy',item.id,(item.type==='gear'&&has(item.id)&&(state.gearLevels[item.id]||1)>=5&&!['dumbbell','battleRope','battleBook'].includes(item.id))||item.type==='decor'&&has(item.id))).join('')}</div>`};
  function bagView(){
    const owned=shop.filter(item=>inventoryCount(item.id)>0);
    return `<h2 class="section-title">🎒 가방 <span class="pill">${owned.length}종</span></h2><p class="subtle">구입한 음식·도구·꾸미기 물건을 여기서 확인하고 사용해요.</p><div class="bag-resources"><span>🪙 ${state.coins}M</span><span>💎 ${state.gems}</span><span>⚡ ${state.tickets}/30</span></div><div class="cards">${owned.map(item=>{
      const equipped=state.equippedWeapon===item.id;
      const usable=item.type==='food'||item.id==='medicine'||['dumbbell','battleRope','battleBook'].includes(item.id);
      const action=usable?`<button type="button" data-bag-use="${item.id}">${item.type==='food'?'먹기':item.id==='medicine'?'치료하기':equipped?'장착 중':'장착하기'}</button>`:`<span class="bag-passive">${item.type==='decor'?'집에 배치됨':'보유 효과 적용 중'}</span>`;
      return `<div class="card"><strong>${item.icon} ${esc(item.name)}</strong><small>${esc(item.desc)} · ${item.type==='gear'?`Lv.${state.gearLevels[item.id]||1}`:`${inventoryCount(item.id)}개`}</small>${action}</div>`;
    }).join('')||'<p class="subtle">아직 물건이 없어요. 상점에서 구매하면 여기에 들어옵니다.</p>'}</div>`;
  }
  renderTabs=function(){
    const main=[['care','🏠','집'],['school','📚','학교'],['play','🎮','놀이'],['shop','🛒','상점'],['bag','🎒','가방']];
    const extra=[['life','✨','생활'],['family','👪','가족'],['album','📖','기록']];
    const button=([id,icon,label])=>`<button type="button" data-tab="${id}" class="${tab===id?'active':''}" aria-label="${label}"><span aria-hidden="true">${icon}</span><small>${label}</small></button>`;
    $('tabs').innerHTML=`<div class="mobile-main compact-dock">${main.map(button).join('')}<button type="button" data-more="1" class="${menuOpen||extra.some(([id])=>id===tab)?'active':''}" aria-expanded="${menuOpen}"><span aria-hidden="true">☰</span><small>더보기</small></button></div><div class="mobile-extra compact-extra" ${menuOpen?'':'hidden'}>${extra.map(button).join('')}</div>`;
  };
  $('screen').addEventListener('click',e=>{
    const button=e.target.closest('[data-bag-use]');if(!button)return;
    const id=button.dataset.bagUse;
    if(shop.some(item=>item.id===id&&item.type==='food'))feed(id);
    else if(id==='medicine')treat();
    else if(['dumbbell','battleRope','battleBook'].includes(id)){state.equippedWeapon=id;care(`${shop.find(item=>item.id===id).name} 장착!`)}
    render();
  });
  $('profileButton').addEventListener('click',()=>{
    const panel=$('profilePanel'),open=panel.hidden;
    panel.hidden=!open;$('profileButton').setAttribute('aria-expanded',String(open));
    if(open){panel.innerHTML=statusView();tone(640)}
  });
  const previousRenderTop=renderTop;
  renderTop=function(){
    previousRenderTop();
    const avatar=$('profileAvatar'),ctx=avatar.getContext('2d');
    ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,40,40);ctx.drawImage($('petCanvas'),0,0,160,128,0,4,40,32);
    if(!$('profilePanel').hidden)$('profilePanel').innerHTML=statusView();
  };
  $('screen').addEventListener('click',e=>{const b=e.target.closest('[data-shop-category]');if(b){shopCategory=b.dataset.shopCategory;render();tone(520)}});
  const originalNextGeneration=nextGeneration;
  nextGeneration=function(){originalNextGeneration();p().skills.power??=0;save()};
  const petCanvas=$('petCanvas'),petScene=document.querySelector('.pet-scene'),world=document.querySelector('.world');
  petCanvas.style.touchAction='none';
  petCanvas.addEventListener('pointerdown',e=>{
    e.stopImmediatePropagation();
    petCanvas.setPointerCapture?.(e.pointerId);
    petDragging={x:e.clientX,y:e.clientY,moved:false};
  },true);
  petCanvas.addEventListener('pointermove',e=>{
    if(!petDragging||p().stage==='egg'||!p().alive)return;
    if(Math.hypot(e.clientX-petDragging.x,e.clientY-petDragging.y)<9&&!petDragging.moved)return;
    petDragging.moved=true;const box=world.getBoundingClientRect();petScene.style.transition='none';
    petScene.style.left=`${cap((e.clientX-box.left)/box.width*100,20,80)}%`;
    petScene.style.bottom=`${cap((box.bottom-e.clientY)/box.height*100-13,12,27)}%`;
  });
  petCanvas.addEventListener('pointerup',e=>{
    if(!petDragging)return;const moved=petDragging.moved;petDragging=null;
    if(moved){p().homeX=parseFloat(petScene.style.left);p().homeY=parseFloat(petScene.style.bottom);petScene.style.transition='left .9s ease,bottom .9s ease';react('move','여기서 놀아볼게!');tone(460);save();renderTop();return}
    if(p().stage==='egg'){
      lastEggTouch=Date.now();p().eggGauge=cap((p().eggGauge??100)-3.8);if(p().eggGauge===0)stageUpdate();
      $('speech').textContent=p().stage==='egg'?pick(['삐! 삐!','톡톡…','…!']):'와! 모찌가 태어났어!';save();renderTop();
    }else{react('touch',pick(['삐삐!','헤헤, 간지러워!','나랑 놀자!']));petScene.classList.remove('touched');void petScene.offsetWidth;petScene.classList.add('touched');renderTop()}
    tone(p().stage==='egg'?560:740);
  });
  petCanvas.addEventListener('pointercancel',()=>{petDragging=null;petScene.style.transition='left .9s ease,bottom .9s ease'});
  function softTone(freq,duration=.22,volume=.012,type='sine'){
    if(!state.sound||document.hidden)return;
    try{audio ||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime;o.type=type;o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g).connect(audio.destination);o.start(at);o.stop(at+duration+.01)}catch{}
  }
  function ambientTick(){if(!state.sound||document.hidden||activityEngine.active()||battleEngine.active())return;const now=Date.now();if(now-worldSoundAt<4200)return;worldSoundAt=now;const house=state.house;
    if(house==='forest'){softTone(900,.11,.004);setTimeout(()=>softTone(1080,.1,.003),140)}
    else if(house==='sea'){softTone(170,.75,.003);setTimeout(()=>softTone(130,.75,.002),250)}
    else if(house==='city'){softTone(260,.16,.003,'triangle')}
    else if(house==='pink'){softTone(660,.18,.004);setTimeout(()=>softTone(830,.18,.003),240)}
    else softTone(480,.3,.003);
  }
  window.MotchiBattleExtras=()=>({power:p().skills.power||0,health:p().stats.health,stress:p().stats.stress,satiety:p().stats.satiety,mood:p().stats.mood,luck:p().skills.luck,petName:p().name,attackBoost:state.battleBoosts.attack,attackSpeedBoost:state.battleBoosts.speed,critBoost:state.battleBoosts.crit,goldBoost:state.battleBoosts.gold});
  setInterval(()=>{if(!p().alive||p().stage==='egg'||petDragging||activityEngine.active()||battleEngine.active()||document.hidden)return;p().homeX=cap((p().homeX??50)+(Math.random()-.5)*20,20,80);p().homeY=cap((p().homeY??15)+(Math.random()-.5)*7,12,27);petScene.style.transition='left 2.8s ease,bottom 2.8s ease';renderTop()},4800);
  setInterval(ambientTick,2300);
  let musicStep=0;
  setInterval(()=>{
    if(!state.sound||document.hidden||!audio||audio.state!=='running')return;
    const battle=battleEngine.active(),active=activityEngine.active();
    const notes=battle?[196,262,330,392,330,262,220,294]:active?[294,370,440,370,330,392,440,494]:[262,330,392,330,294,349,392,330];
    const note=notes[musicStep++%notes.length];softTone(note,battle?.18:.3,battle?.006:.004,'triangle');
  },battleEngine.active()?450:850);
  advance();render();if(!state.selectionDone)chooseStarter();
  setInterval(()=>{if(p().stage!=='egg'||!p().alive||Date.now()-lastEggTouch<400||!Number.isFinite(p().eggGauge)||p().eggGauge>=100)return;p().eggGauge=cap(p().eggGauge+.3);renderTop()},200);
  setInterval(()=>{advance();render()},30000);
  if('serviceWorker' in navigator&&location.protocol!=='file:'&&!['localhost','127.0.0.1'].includes(location.hostname))navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();
