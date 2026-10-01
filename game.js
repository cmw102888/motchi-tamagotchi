/* MOTCHI LIFE ? static, offline-capable virtual pet. All times use the device clock. */
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
    {id:'korean',name:'����',icon:'??',skill:'speech',question:'���ȳ��ϼ��䡱�� � ���ϱ��?',options:['�λ�','����','����'],answer:0},
    {id:'english',name:'����',icon:'??',skill:'speech',question:'��apple���� ����?',options:['���','�б�','��'],answer:0},
    {id:'math',name:'����',icon:'??',skill:'intellect',question:'3 + 4 = ?',options:['6','7','8'],answer:1},
    {id:'science',name:'����',icon:'??',skill:'intellect',question:'�Ĺ��� �ڶ�� �� �ʿ��� ����?',options:['���� ��','����','�峭��'],answer:0},
    {id:'art',name:'�̼�',icon:'??',skill:'creativity',question:'�Ķ��� ����� ������?',options:['�ʷ�','����','����'],answer:0},
    {id:'pe',name:'ü��',icon:'??',skill:'fitness',question:'� �� ���� �ϸ� ���� ����?',options:['��Ʈ��Ī','����','�����'],answer:0}
  ];
  const exercises = [
    {id:'walk',name:'��å',icon:'??',mins:4,effort:7,fitness:2,stress:-10,dirt:'feet',dirtAmt:7,needs:null},
    {id:'stretch',name:'��Ʈ��Ī',icon:'??',mins:1,effort:3,fitness:1,stress:-7,dirt:'body',dirtAmt:1,needs:null},
    {id:'jump',name:'�ٳѱ�',icon:'??',mins:2,effort:13,fitness:4,stress:-4,dirt:'body',dirtAmt:5,needs:'rope'},
    {id:'ball',name:'������',icon:'?',mins:3,effort:11,fitness:3,stress:-9,dirt:'hands',dirtAmt:7,needs:'ball'},
    {id:'swim',name:'����',icon:'??',mins:4,effort:16,fitness:5,stress:-8,dirt:'body',dirtAmt:9,needs:'swimGear'}
  ];
  const hygiene = [
    {id:'hands',name:'�� �ı�',icon:'??',secs:20,part:'hands',gain:42,steps:['��ĥ','�Ĳ��� ��������','�󱸱�']},
    {id:'face',name:'����',icon:'??',secs:30,part:'face',gain:40,steps:['�� ������','�� �۱�','�������� ������']},
    {id:'teeth',name:'��ġ',icon:'??',secs:45,part:'teeth',gain:44,steps:['ġ�� �ٸ���','�̸� �۱�','�� �󱸱�']},
    {id:'feet',name:'�� �ı�',icon:'??',secs:40,part:'feet',gain:43,steps:['�� ������','�߰��� �۱�','�󱸱�']},
    {id:'body',name:'����',icon:'??',secs:120,part:'body',gain:53,steps:['�� �±�','��ĥ','�󱸱�']}
  ];
  const jobs = [
    {id:'teacher',name:'������',icon:'?????',pay:60,stress:9,family:2,skill:'speech',desc:'�������� ����, �ڳ� �н� ���ʽ�'},
    {id:'scientist',name:'������',icon:'?????',pay:80,stress:14,family:-1,skill:'intellect',desc:'������ ������ ���� ��Ʈ������ ŭ'},
    {id:'athlete',name:'�����',icon:'??',pay:75,stress:11,family:1,skill:'fitness',desc:'ü�� ���ʽ�, �λ� ����'},
    {id:'artist',name:'������',icon:'?????',pay:65,stress:7,family:2,skill:'creativity',desc:'���� ����, â�Ƿ� ���ʽ�'},
    {id:'merchant',name:'���� ����',icon:'??',pay:65,stress:10,family:1,skill:'life',desc:'���� ����, �ٹ� �ð��� ��'}
  ];
  const shop = [
    {id:'rice',name:'�����',icon:'??',price:8,type:'food',satiety:23,calories:4,health:2,desc:'����� �⺻ �Ļ�'},
    {id:'fruit',name:'����',icon:'??',price:12,type:'food',satiety:12,calories:1,health:4,desc:'������ �ǰ��� ����'},
    {id:'cake',name:'����ũ',icon:'??',price:18,type:'food',satiety:12,calories:11,health:-1,desc:'�ູ +12, ü�߰� ��ġ ����'},
    {id:'salad',name:'������',icon:'??',price:14,type:'food',satiety:17,calories:1,health:6,desc:'�鿪�� �ǰ��� ���� �Ļ�'},
    {id:'medicine',name:'��',icon:'??',price:24,type:'consumable',desc:'���� ġ�ῡ ���'},
    {id:'soap',name:'��',icon:'??',price:18,type:'gear',desc:'�ա��� �ı� ȿ�� ����'},
    {id:'toothbrush',name:'ĩ��',icon:'??',price:18,type:'gear',desc:'��ġ ȿ�� ����'},
    {id:'ball',name:'��',icon:'?',price:60,type:'gear',desc:'������ � �ر�'},
    {id:'rope',name:'�ٳѱ�',icon:'??',price:70,type:'gear',desc:'�ٳѱ� � �ر�'},
    {id:'swimGear',name:'���� ��ǰ',icon:'??',price:110,type:'gear',desc:'���� � �ر�'},
    {id:'book',name:'��ȭå',icon:'??',price:55,type:'gear',desc:'������ϱ� ���� ���ʽ�'},
    {id:'scienceKit',name:'���� ŰƮ',icon:'??',price:90,type:'gear',desc:'���� ���� ���ʽ�'}
  ];
  const traits = ['�¼���','ȣ���','Ȱ����','�峭�ٷ���','�����'];
  const dialogue = [
    {line:'���� �б����� ����� ������ ���Ծ',choices:[['���� Ǯ���', {intellect:2,bond:5,stress:-3}],['������, ��� ��',{bond:4,stress:-8}],['�� ������!',{intellect:2,stress:8,bond:-3}]]},
    {line:'������ � ���̸� �ұ�?',choices:[['������ ����',{fitness:2,bond:4,energy:-5}],['�׸� �׸���',{creativity:2,bond:4}],['���� ����',{energy:5,stress:-5}]]},
    {line:'ģ���� ������. �����?',choices:[['���� �̾߱��غ�',{speech:3,bond:3,stress:-3}],['���� �����ٰ�',{bond:5,stress:-6}],['�׳� ����',{stress:6,bond:-2}]]},
    {line:'���ο� �� ���� �;�!',choices:[['���� ���� �?',{intellect:3,stress:2}],['�뷡�� ������',{creativity:3,speech:1}],['��å�ϸ� ã�ƺ���',{fitness:1,bond:3,stress:-3}]]},
    {line:'���� �� ���ƾ',choices:[['�Բ� ����',{energy:8,stress:-8,bond:3}],['���� ������?',{satiety:7,weight:2,bond:2}],['���ݸ� �� ����',{stress:7,bond:-3}]]}
  ];
  const gameNames = [{id:'catch',name:'�� �ޱ�',icon:'?'},{id:'bricks',name:'��������',icon:'??'},{id:'jump',name:'�ٳѱ�',icon:'??'},{id:'memory',name:'����',icon:'??'},{id:'quiz',name:'���� ����',icon:'?'}];
  function newPet(generation = 1, inherited = null) {
    const now = Date.now();
    return {name:'����',born:now,generation,stage:'egg',form:'',alive:true,sex:rand(2)?'����':'����',trait:pick(traits),genes:inherited||{horn:rand(3),tail:rand(3)},stats:{satiety:86,mood:82,energy:86,stress:9,health:90,immunity:72,bond:35,weight:9},hygiene:{hands:90,face:90,teeth:90,feet:90,body:90},skills:{intellect:0,speech:0,fitness:0,creativity:0,discipline:0,life:0},illness:null,careMistakes:0,neglectHours:0,lastCare:now,lastFed:now,lastPlayed:now,poop:0,nextPoop:now+2*HOUR,dirtySince:0,criticalSince:0,sleeping:false,lightOn:true,schoolToday:0,exerciseToday:0,gameToday:0,conversationToday:0,workToday:false,day:dayKey(now),job:null,partner:null,marriedAt:0,child:null,deathAt:0,deathReason:''};
  }
  function fresh() { return {version:1,lastTick:Date.now(),coins:80,pet:newPet(),inventory:{rice:2,fruit:1,medicine:1},family:[],journal:[],sound:true,dailyBonus:dayKey(Date.now()),totalDays:0}; }
  function migrateOld() {
    for (const key of OLD_KEYS) {
      let old; try { old=JSON.parse(localStorage.getItem(key)||'null'); } catch { continue; }
      if(!old || !old.born) continue;
      const state=fresh();
      if(old.dead){state.journal.unshift({at:Date.now(),text:'���� MOTCHI�� �߾��� �̾� �� ���� �����߾��.'});return state}
      state.pet.born=old.born;
      state.pet.stats.satiety=cap((old.hunger??3)*25,0,100);
      state.pet.stats.mood=cap((old.happy??3)*25,0,100);
      state.pet.stats.health=cap((old.health??4)*25,0,100);
      state.pet.careMistakes=old.careMistakes||0;
      state.pet.skills.discipline=cap((old.discipline||0)*10);
      state.pet.stats.weight=cap(old.weight||9,4,80);
      state.pet.lightOn=old.light!==false;
      state.pet.poop=old.poop?1:0;
      state.pet.illness=old.sick?'����':null;
      state.pet.lastCare=Date.now();
      state.lastTick=Date.now();
      state.journal.unshift({at:Date.now(),text:'���� MOTCHI�� ���̿� �⺻ ���¸� �����Ծ��.'});
      return state;
    }
    return fresh();
  }
  let state;
  try { state=JSON.parse(localStorage.getItem(KEY)||'null')||migrateOld(); } catch { state=fresh(); }
  state={...fresh(),...state};
  const storedPet=state.pet||{};
  state.pet={...newPet(),...storedPet,stats:{...newPet().stats,...storedPet.stats},hygiene:{...newPet().hygiene,...storedPet.hygiene},skills:{...newPet().skills,...storedPet.skills}};
  let tab='care', menuOpen=false, notice='', activity=null, dialogState=null, game=null, audio=null, lastStage=state.pet.stage;
  const p=()=>state.pet;
  function log(text){state.journal.unshift({at:Date.now(),text});state.journal=state.journal.slice(0,80);notice=text;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notice='���� ������ �����մϴ�. ������ �����͸� Ȯ�����ּ���.'}}
  function tone(freq=620){if(!state.sound)return;try{audio ||=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.08);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.09)}catch{}}
  function ageMinutes(){return Math.max(0,(Date.now()-p().born)/MIN)}
  function lifeStage(){const m=ageMinutes();return m<5?'egg':m<65?'baby':m<1505?'child':m<5825?'teen':m<14405?'adult':'elder';}
  function stageLabel(id){return ({egg:'��',baby:'���̺�',child:'���',teen:'û�ҳ�',adult:'��ü',elder:'���'})[id]||id}
  function hygieneAvg(){return Math.round(Object.values(p().hygiene).reduce((a,b)=>a+b,0)/5)}
  function canAct(){if(!p().alive){notify('�߾� �ٹ����� ���� ���븦 ������ �� �־��.','danger');return false}if(p().stage==='egg'){notify('���� �� 5�� �� ��ȭ�ؿ�.','warning');return false}return true}
  function normalize(){const pet=p();for(const key in pet.stats)pet.stats[key]=cap(pet.stats[key]);for(const key in pet.hygiene)pet.hygiene[key]=cap(pet.hygiene[key]);for(const key in pet.skills)pet.skills[key]=cap(pet.skills[key]);pet.stats.weight=cap(pet.stats.weight,4,80);pet.poop=Math.max(0,Math.min(4,pet.poop));}
  function refreshDay(at){const pet=p(),today=dayKey(at);if(pet.day===today)return;pet.day=today;pet.schoolToday=0;pet.exerciseToday=0;pet.gameToday=0;pet.conversationToday=0;pet.workToday=false;state.totalDays++;if(pet.job&&pet.alive)state.coins+=10;if(pet.partner&&pet.alive)pet.stats.bond=cap(pet.stats.bond+2);if(pet.child&&pet.alive)pet.child.bond=cap(pet.child.bond+2);log('�� �Ϸ簡 ���۵ƾ��. ������ ������ ��ٸ��ϴ�.');}
  function chooseForm(){const pet=p(),s=pet.skills;const care=pet.careMistakes;const best=Object.entries({intellect:s.intellect,fitness:s.fitness,creativity:s.creativity,speech:s.speech}).sort((a,b)=>b[1]-a[1])[0];return care>=8||pet.stats.health<40?'rough':best[0]==='fitness'?'athlete':best[0]==='intellect'?'scholar':best[0]==='creativity'?'artist':'friend';}
  function stageUpdate(){const pet=p(),next=lifeStage();if(next===pet.stage||!pet.alive)return;pet.stage=next;if(next==='adult')pet.form=chooseForm();if(next==='elder')pet.form=pet.form||chooseForm();log(next==='baby'?'�˿��� �Ʊ� ������ �¾���!':`${stageLabel(next)} �ܰ�� �����߾��!`);tone(740);}
  function die(reason){const pet=p();if(!pet.alive)return;pet.alive=false;pet.deathAt=Date.now();pet.deathReason=reason;log(`${pet.name}�� ���� �Ǿ����. (${reason})`);tone(210);save();}
  function runStep(at,stepMs){const pet=p();if(!pet.alive)return;refreshDay(at);const stage=lifeStage();const h=new Date(at).getHours();const night=h>=21||h<8;const schoolBusy=pet.schoolUntil&&at<pet.schoolUntil;const protectedTime=night||schoolBusy||pet.sitterUntil>at;
    if(stage!=='egg'){
      const scale=stepMs/(10*MIN),need=stage==='baby'?1.65:stage==='elder'?1.2:1;
      pet.stats.satiety-=3.5*scale*need*(protectedTime?.25:1);
      pet.stats.mood-=2.1*scale*need*(protectedTime?.3:1);
      pet.stats.energy+=(night?1.3:-0.35)*scale;
      pet.stats.stress+=(pet.stats.satiety<35?.75:.13)*scale;
      if(night&&!pet.lightOn)pet.stats.stress-=.35*scale;
      if(night&&pet.lightOn)pet.stats.mood-=.22*scale;
      pet.hygiene.hands-=.42*scale;pet.hygiene.face-=.2*scale;pet.hygiene.teeth-=.34*scale;pet.hygiene.feet-=.23*scale;pet.hygiene.body-=.27*scale;
      if(at-pet.lastCare>HOUR&&!protectedTime)pet.neglectHours+=stepMs/HOUR;
      if(pet.neglectHours>=1.5){pet.stats.stress+=1.1*scale;pet.stats.mood-=.5*scale}
      if(at-pet.lastCare>2*HOUR&&!protectedTime&&Math.floor((at-stepMs-pet.lastCare)/HOUR)<Math.floor((at-pet.lastCare)/HOUR))pet.careMistakes++;
      if(at-pet.lastFed>3*HOUR&&pet.stats.satiety<25)pet.stats.health-=.45*scale;
      if(hygieneAvg()<38)pet.stats.immunity-=.35*scale;
      if(pet.stats.stress>75||pet.stats.energy<20)pet.stats.immunity-=.25*scale;
      if(pet.poop>0)pet.hygiene.body-=.45*scale;
      if(pet.stats.satiety<15||pet.stats.stress>82||hygieneAvg()<25)pet.stats.health-=.48*scale;
      if(pet.illness)pet.stats.health-=.5*scale;
      if(pet.stats.health<20){pet.criticalSince ||= at; if(at-pet.criticalSince>2*HOUR)die(pet.illness?'������ ġ������ ����':'�ǰ� ��ȭ')}else pet.criticalSince=0;
      if(!pet.illness&&pet.stats.immunity<32&&(hygieneAvg()<45||pet.stats.stress>75))pet.illness=pet.hygiene.teeth<30?'��ġ':pet.stats.weight>33?'����':'����';
      if(pet.stats.weight>34){pet.stats.energy-=.18*scale;pet.stats.health-=.15*scale}
      if(pet.stats.weight<6)pet.stats.health-=.2*scale;
      if(at>=pet.nextPoop){pet.poop=Math.min(4,pet.poop+1);pet.nextPoop=at+(2+rand(3))*HOUR;pet.dirtySince ||= at}
      if(pet.poop>=2&&at-pet.dirtySince>3*HOUR)pet.illness ||= '����';
      if(pet.stats.satiety<5&&pet.stats.health<30)die('��Ⱓ ���ָ�');
      if(stage==='elder'&&ageMinutes()>25*1440)die('�ڿ� ����');
      normalize();
    }
  }
  function advance(){const now=Date.now();if(now<state.lastTick){state.lastTick=now;save();return}const max=14*DAY,start=Math.max(state.lastTick,now-max);let cursor=start;while(cursor<now&&p().alive){const at=Math.min(now,cursor+10*MIN);runStep(at,at-cursor);cursor=at}state.lastTick=now;stageUpdate();save();}
  function care(reason){p().lastCare=Date.now();p().neglectHours=0;if(p().stats.stress>0)p().stats.stress=cap(p().stats.stress-1);if(reason)log(reason);normalize();save();render();}
  function notify(text,kind=''){notice=text;const el=$('notice');el.textContent=text;el.className='notice '+kind;tone(kind==='danger'?250:kind==='warning'?390:600)}
  function adult(){return ['adult','elder'].includes(p().stage)}
  function inventoryCount(id){return state.inventory[id]||0}
  function has(id){return inventoryCount(id)>0}
  function addItem(id,n=1){state.inventory[id]=(state.inventory[id]||0)+n}
  function spendItem(id){if(!has(id))return false;state.inventory[id]--;if(state.inventory[id]<=0)delete state.inventory[id];return true}
  function price(item){return Math.max(1,Math.round(item.price*(p().job==='merchant'?.85:1)))}
  function buy(id){const item=shop.find(x=>x.id===id);if(!item)return;if(state.coins<price(item)){notify('M������ �����ؿ�. �б������ӡ����� Ȱ������ �� �� �־��.','warning');return}if(item.type==='gear'&&has(id)){notify('�̹� ������ �ִ� ��������.');return}state.coins-=price(item);addItem(id);care(`${item.name}��(��) �����߾��.`)}
  function feed(id){if(!canAct())return;const item=shop.find(x=>x.id===id&&x.type==='food');if(!item||!spendItem(id)){notify('����� �����. ���۸��Ͽ��� �����ϼ���.','warning');return}const st=p().stats;const over=st.satiety>80;st.satiety=cap(st.satiety+item.satiety);st.weight=cap(st.weight+item.calories*(over?.9:.35),4,80);st.health=cap(st.health+item.health);st.mood=cap(st.mood+(id==='cake'?12:3));p().hygiene.teeth=cap(p().hygiene.teeth-(id==='cake'?13:5));if(over){st.stress=cap(st.stress+6);if(st.weight>38)p().illness='����'}p().lastFed=Date.now();care(over?'��θ��� �� �Ծ� ���� ������ ������.':`${item.name}��(��) ���ְ� �Ծ����.`)}
  function cleanPoop(){if(!canAct())return;if(!p().poop){notify('ȭ����� �����ؿ�.');return}p().poop=0;p().dirtySince=0;p().hygiene.body=cap(p().hygiene.body+13);care('ȭ����� û���߾��.')}
  function rest(){if(!canAct())return;p().stats.energy=cap(p().stats.energy+22);p().stats.stress=cap(p().stats.stress-18);p().stats.mood=cap(p().stats.mood+4);p().lastSleep=Date.now();care('��� ���鼭 ����� ��ã�Ҿ��.')}
  function lights(){p().lightOn=!p().lightOn;care(p().lightOn?'���� �׾��.':'���� ���� ���� �غ� �߾��.')}
  function treat(){if(!canAct())return;if(!p().illness){notify('������ ������ �ʾƿ�.');return}if(!spendItem('medicine')){notify('���� �����. ���۸��Ͽ��� �����ϼ���.','warning');return}const old=p().illness;p().illness=null;p().stats.health=cap(p().stats.health+24);p().stats.immunity=cap(p().stats.immunity+12);p().criticalSince=0;care(`${old} ġ�Ḧ �߾��. �޽İ� ���� ������ �ʿ��ؿ�.`)}
  function sitter(){if(!canAct())return;if(p().illness||p().stats.satiety<25){notify('�����ų� ���ָ� ���¿����� �ñ� �� �����.','warning');return}if(state.coins<25){notify('�������� �̿�� 25M�� �ʿ��ؿ�.','warning');return}state.coins-=25;p().sitterUntil=Date.now()+8*HOUR;care('�������ǿ� 8�ð� �ð���.');}
  function work(mode){if(!canAct()||!adult()||!p().job)return;if(p().workToday){notify('������ �̹� ���� �߾��.','warning');return}const job=jobs.find(x=>x.id===p().job),st=p().stats;let pay=mode==='overtime'?job.pay*1.5:mode==='rest'?0:job.pay;if(job.id==='artist')pay+=rand(31)-15;if(job.id==='athlete')pay+=rand(21)-10;pay=Math.max(0,Math.round(pay));state.coins+=pay;st.stress=cap(st.stress+(mode==='overtime'?job.stress*2:mode==='rest'?-14:job.stress));st.energy=cap(st.energy-(mode==='overtime'?19:mode==='rest'?-8:10));st.bond=cap(st.bond+(mode==='overtime'?-6:mode==='rest'?6:job.family));p().skills[job.skill]=cap(p().skills[job.skill]+(mode==='rest'?0:2));if(p().child)p().child.bond=cap(p().child.bond+(mode==='overtime'?-5:mode==='rest'?5:1));p().workToday=true;care(mode==='rest'?'������ ������ �������.':`${job.name} �Ϸ� ${pay}M�� �������.`)}
  function nextGeneration(){const old=p();if(old.alive){notify('���� ����� �θ��� ���ְ� ���� �� ������ �� �־��.','warning');return}state.family.unshift({name:old.name,generation:old.generation,age:Math.floor((old.deathAt-old.born)/DAY),form:old.form||old.stage,job:old.job,partner:old.partner?.name||'',child:old.child?.name||'',reason:old.deathReason,at:old.deathAt});state.family=state.family.slice(0,30);const child=old.child;state.pet=newPet(old.generation+1,child?.genes||old.genes);state.pet.name=child?.name||'����';if(child){state.pet.skills[child.inheritedSkill]=8;state.pet.trait=child.trait;state.coins+=Math.min(80,Math.round(state.coins*.1))}log(child?'�ڳడ ���� ���븦 �̾�޾Ҿ��.':'���ο� ���� �����߾��.');save();render()}

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
  function drawPet(){const cv=$('petCanvas'),ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);const pet=p();let id=!pet.alive?'ghost':pet.stage==='adult'||pet.stage==='elder'?(pet.form||'friend'):pet.stage;const rows=sprites[id]||sprites.baby;const px=6,x0=32,y0=12+(pet.alive&&pet.stage!=='egg'&&Math.floor(Date.now()/700)%2?2:0);const colors={...palette,3:({scholar:'#79aaca',athlete:'#d8877c',artist:'#dab672',friend:'#74bca3',rough:'#9b90bb'})[id]||palette[3]};
    rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.'&&colors[c]){ctx.fillStyle=colors[c];ctx.fillRect(x0+x*px,y0+y*px,px,px)}}));
    if(pet.alive&&['scholar','athlete','artist','friend','rough'].includes(id)){ctx.fillStyle=colors[1];if(id==='scholar'){ctx.fillRect(x0+4*px,y0+6*px,4*px,px);ctx.fillRect(x0+10*px,y0+6*px,4*px,px)}if(id==='athlete'){ctx.fillStyle='#f7d66a';ctx.fillRect(x0+4*px,y0+3*px,8*px,px)}if(id==='artist'){ctx.fillStyle='#ee9ea2';ctx.fillRect(x0+3*px,y0+9*px,2*px,px);ctx.fillRect(x0+11*px,y0+9*px,2*px,px)}if(id==='friend'){ctx.fillStyle='#ee9ea2';ctx.fillRect(x0+1*px,y0+5*px,2*px,2*px)}if(id==='rough'){ctx.fillStyle='#f7d66a';ctx.fillRect(x0+12*px,y0+3*px,2*px,px)}}
    if(pet.stage==='egg'&&Math.floor(Date.now()/1000)%2){ctx.fillStyle=palette[1];ctx.fillRect(x0+7*px,y0+5*px,px,px);ctx.fillRect(x0+8*px,y0+6*px,px,px);ctx.fillRect(x0+7*px,y0+7*px,px,px)}
    if(pet.illness&&pet.alive){ctx.fillStyle='#df6d73';ctx.fillRect(123,17,7,21);ctx.fillRect(123,44,7,7)}
  }
  function statRow(label,value,inverse=false){const shown=cap(value),bad=inverse?shown>75:shown<25,mid=inverse?shown>50:shown<50;return `<div class="meter-row"><b>${label}</b><span class="meter ${bad?'danger':mid?'warn':''}"><i style="width:${shown}%"></i></span><b>${Math.round(shown)}</b></div>`}
  function card(title,desc,action,id,disabled=false,button='����'){return `<div class="card"><strong>${title}</strong><small>${desc}</small><button type="button" data-action="${action}" data-id="${id||''}" ${disabled?'disabled':''}>${button}</button></div>`}
  function action(title,desc,act,id,disabled=false){return `<button type="button" class="action" data-action="${act}" data-id="${id||''}" ${disabled?'disabled':''}><span><strong>${title}</strong><small>${desc}</small></span><span class="arrow">?</span></button>`}
  function renderTabs(){const tabs=[['care','?? ������'],['school','?? �б�'],['play','?? ����'],['life','? ��Ȱ'],['shop','?? ����'],['family','?? ����'],['album','?? ���'],['status','?? ����']];const primary=['care','school','play','shop'];const extra=tabs.filter(([id])=>!primary.includes(id));const button=([id,label])=>`<button type="button" data-tab="${id}" class="${tab===id?'active':''}">${label}</button>`;$('tabs').innerHTML=`<div class="desktop-main">${tabs.map(button).join('')}</div><div class="mobile-main">${tabs.filter(([id])=>primary.includes(id)).map(button).join('')}<button type="button" data-more="1" class="${menuOpen||extra.some(([id])=>id===tab)?'active':''}">? ������</button></div><div class="mobile-extra" ${menuOpen?'':'hidden'}>${extra.map(button).join('')}</div>`}
  function renderTop(){const pet=p(),st=pet.stats;drawPet();$('petName').textContent=pet.name;$('generation').textContent=`${pet.generation}���� �� ${stageLabel(pet.stage)}`;$('coinLabel').textContent=`?? ${state.coins}M`;$('stageLabel').textContent=stageLabel(pet.stage);$('ageLabel').textContent=`${Math.floor(ageMinutes()/1440)}��`;$('clockLabel').textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false});$('foodStat').textContent=`?? ${Math.round(st.satiety/25)}/4`;$('moodStat').textContent=`�� ${Math.round(st.mood/25)}/4`;$('energyStat').textContent=`? ${Math.round(st.energy/25)}/4`;$('soundButton').textContent=state.sound?'?? �Ҹ�':'?? �Ҹ�';$('sceneBadge').hidden=!(pet.poop||pet.illness||!pet.alive);$('sceneBadge').textContent=!pet.alive?'��':pet.illness?'!':pet.poop?'��':'';
    let speech=pet.alive?pet.stage==='egg'?`��ȭ���� �� ${Math.max(0,Math.ceil(5-ageMinutes()))}��`:pet.illness?`${pet.illness}�� �ɷȾ`:st.satiety<25?'�����!':st.stress>70?'�� ���� �;':st.mood<30?'���� ����!':pet.skills.speech>60?'������ ������ �Բ� �غ���?':pet.skills.speech>25?'�ȳ�! ���� ����!':'��! ��!':'���� �Ǿ���� �� �߾� �ٹ��� Ȯ���ϼ���';$('speech').textContent=speech;
    if(!notice){notice=pet.illness?`${pet.illness} ġ��� �޽��� �ʿ��ؿ�.`:st.health<25?'�ǰ��� �����ؿ�. �ٷ� �����ּ���.':st.satiety<25?'����Ŀ�. ���̸� �ּ���.':st.stress>70?'��Ʈ������ ���ƿ�. ���ų� �̾߱��� �ּ���.':`������ ������ 1~2���̸� ����ؿ�. �� ${state.coins}M`}
    const level=st.health<25?'danger':pet.illness||st.satiety<25||st.stress>70?'warning':'';$('notice').textContent=notice;$('notice').className='notice '+level;
  }
  function careView(){const pet=p(),st=pet.stats,items=shop.filter(x=>x.type==='food'&&has(x.id));return `<h2 class="section-title">������ ����</h2><p class="subtle">����İ� ����� ���� ���Ǽ���. �ٻ� ���� ���̰� ���� �ϴ� �͸����ε� ������ �˴ϴ�.</p><div class="cards">${card('?? �Ļ�',`${Math.round(st.satiety)} / 100 �� ���� ${items.length}��`,'openFood','',!pet.alive)}${card('?? ��ȭ',`���� ${pet.conversationToday}/5ȸ`,'talk','',!pet.alive||pet.stage==='egg')}${card('?? �޽�',`�Ƿ� ${100-Math.round(st.energy)} �� ��Ʈ���� ${Math.round(st.stress)}`,'rest','',!pet.alive||pet.stage==='egg')}${card('?? ȭ���',`ġ�� �� ${pet.poop}��`,'cleanPoop','',!pet.alive||pet.stage==='egg')}${card('?? ��',pet.lightOn?'���� �� �㿡�� ���ּ���':'����','lights','',!pet.alive)}${card('?? ġ��',pet.illness||'�ǰ���','treat','',!pet.alive||!pet.illness)}</div><h3 class="section-title">���� ����</h3>${statRow('�����',st.satiety)}${statRow('���',st.mood)}${statRow('������',st.energy)}${statRow('��Ʈ����',st.stress,true)}${statRow('�ǰ�',st.health)}<p class="subtle">������ �ǹ� �ִ� ����: ${Math.max(0,Math.floor((Date.now()-pet.lastCare)/MIN))}�� ��</p>`}
  function schoolView(){const pet=p();return `<h2 class="section-title">�б��� ����</h2><p class="subtle">������ ������ ĳ���Ϳ� �Բ� ���Ƿ� �̵��մϴ�. �� ī�带 ���� ���� ���� �� ������ Ǯ���. �Ϸ� 2��������̸�, ���Ƽ� �����ϸ� �Ƿΰ� ���Դϴ�.</p><div class="cards">${subjects.map(s=>card(`${s.icon} ${s.name}`,`${{intellect:'����',speech:'���ϱ�',fitness:'ü��',creativity:'â�Ƿ�'}[s.skill]} �� ���� ${pet.schoolToday}/2`,'school',s.id,!pet.alive||['egg','baby'].includes(pet.stage)||pet.schoolToday>=2)).join('')}</div>`}
  function playView(){const pet=p();return `<h2 class="section-title">�̴ϰ��� 5��</h2><p class="subtle">���� ��ҷ� �̵��� ĳ���͸� ���� �����Դϴ�. �� �巡��, ���� Ÿ�̹�, �� �ޱ�ó�� �� ���Ӹ��� ������ �޶��. �Ϸ� ù �� ���� M���� ������ �����ϴ�.</p><div class="cards">${gameNames.map(g=>card(`${g.icon} ${g.name}`,`�ູ �� ���� �� M����`,'startGame',g.id,!pet.alive||pet.stage==='egg')).join('')}</div>`}
  function lifeView(){const pet=p();return `<h2 class="section-title">� 5��</h2><div class="cards">${exercises.map(e=>card(`${e.icon} ${e.name}`,`${e.mins}�� �� ü�� +${e.fitness} �� ${e.needs&&!has(e.needs)?'���� �ʿ�':'�̿� ����'}`,'exercise',e.id,!pet.alive||pet.stage==='egg'||!!(e.needs&&!has(e.needs)))).join('')}</div><h2 class="section-title">���� 5��</h2><div class="cards">${hygiene.map(h=>card(`${h.icon} ${h.name}`,`${h.secs}�� �� ���� ${Math.round(pet.hygiene[h.part])}/100`,'hygiene',h.id,!pet.alive||pet.stage==='egg')).join('')}</div><h2 class="section-title">����ޱ�</h2><div class="cards">${card('?? ��������','25M �� �ִ� 8�ð� ��ȣ','sitter','',!pet.alive||pet.stage==='egg')}${card('?? �ǰ� Ȯ��',pet.illness||'���� ���� ����','treat','',!pet.illness)}</div>`}
  function shopView(){return `<h2 class="section-title">���۸��� <span class="pill">${state.coins}M</span></h2><p class="subtle">�⺻ ������ �� �Ǹ��մϴ�. ������ ��� ��̳� ������ �������� �þ��. ������ ���ڴ� �����ϴ�.</p><div class="cards">${shop.map(item=>card(`${item.icon} ${item.name}`,`${item.desc} �� ���� ${inventoryCount(item.id)}��`,'buy',item.id,item.type==='gear'&&has(item.id),`${price(item)}M ����`)).join('')}</div>`}
  function familyView(){const pet=p(),job=jobs.find(j=>j.id===pet.job);return `<h2 class="section-title">�ϰ� ����</h2><p class="subtle">��ü�� �Ǹ� ������ ������ ������ �ٸ� �� �ֽ��ϴ�. ���԰� �Բ� �ǷΡ���Ʈ���������� ���赵 �޶����ϴ�.</p>${adult()?`<div class="cards">${!job?card('?? ���� ����','�ټ� ���� �� �ϳ��� ����','chooseJob',''):card(`${job.icon} ${job.name}`,`${job.pay}M �⺻ ���� �� ${job.desc}`,'chooseJob','',false,'���� ����')}${card('?? ������ �ٹ�',pet.workToday?'���� �ٹ� �Ϸ�':'���ϰų� ������ ����','workMenu','',!job||pet.workToday)}${card('?? �����',pet.partner?`${pet.partner.name} �� ģ�е� ${Math.round(pet.partner.bond)}`:'��ȭ�ϰ� ���踦 �ױ�','partner','',!pet.alive)}${card('?? �ڳ�',pet.child?`${pet.child.name} �� ���� ���� �غ� �Ϸ�`:pet.partner?'��ȥ �� �ڳฦ ������ �� �־��':'��ȥ �� ����','child','',!pet.alive||!pet.partner)}</div>`:'<p class="subtle">��ü�� �Ǹ� ������ ���� �޴��� �����ϴ�.</p>'}${pet.child?`<div class="row"><span>�츮 ����</span><b>${esc(pet.child.name)} �� ${esc(pet.child.trait)}</b></div>`:''}`}
  function albumView(){const pet=p();return `<h2 class="section-title">�߾� �ٹ�</h2>${!pet.alive?card('?? ���� ���� ����',pet.child?'�ڳడ �θ��� Ư���� �̾�޽��ϴ�':'�� �˺��� �����մϴ�','nextGeneration','',false,'�� �� ����'):''}<div class="stack">${state.family.length?state.family.map(f=>`<div class="row"><span>${esc(f.generation)}���� ${esc(f.name)} �� ${esc(f.form)}</span><b>${f.age}��</b></div>`).join(''):'<p class="subtle">ù ��° ���� �̾߱Ⱑ ���� ���̿���.</p>'}</div><h3 class="section-title">�ֱ� �ϱ�</h3>${state.journal.slice(0,20).map(x=>`<div class="log">${new Date(x.at).toLocaleString('ko-KR')} �� ${esc(x.text)}</div>`).join('')}`}
  function statusView(){const pet=p(),st=pet.stats,sk=pet.skills;return `<h2 class="section-title">���¿� �ɷ�</h2><div class="row"><span>���� �� ���� �� ����</span><b>${stageLabel(pet.stage)} �� ${esc(pet.trait)} �� ${esc(pet.form||'����')}</b></div><div class="row"><span>���� �� ������ �� ���� �Ǽ�</span><b>${Math.floor(ageMinutes()/1440)}�� �� ${Math.round(st.weight)}g �� ${pet.careMistakes}ȸ</b></div><div class="row"><span>���� M����</span><b>${state.coins}M</b></div>${statRow('�����',st.satiety)}${statRow('�ູ',st.mood)}${statRow('������',st.energy)}${statRow('��Ʈ����',st.stress,true)}${statRow('�ǰ�',st.health)}${statRow('�鿪��',st.immunity)}${statRow('ģ�е�',st.bond)}<h3 class="section-title">��Ȱ �ɷ�</h3>${Object.entries({intellect:'����',speech:'���ϱ�',fitness:'ü��',creativity:'â�Ƿ�',discipline:'����',life:'��Ȱ���'}).map(([k,v])=>statRow(v,sk[k])).join('')}<h3 class="section-title">������ û��</h3>${hygiene.map(h=>statRow(h.name,pet.hygiene[h.part])).join('')}<div class="row"><span>���� ����</span><b>${esc(pet.illness||'����')}</b></div>`}
  function render(){renderTop();renderTabs();const views={care:careView,school:schoolView,play:playView,life:lifeView,shop:shopView,family:familyView,album:albumView,status:statusView};$('screen').innerHTML=(views[tab]||careView)();}
  function openDialog(title,body,choices,closable=true){dialogState={choices};$('dialog').innerHTML=`<h2>${esc(title)}</h2><p>${body}</p><div class="buttons-list">${choices.map((x,i)=>`<button type="button" data-choice="${i}">${esc(x.label)}</button>`).join('')}</div>${closable?'<button type="button" class="secondary close" data-close="1">�ݱ�</button>':''}`;$('dialogLayer').hidden=false;}
  function closeDialog(){$('dialogLayer').hidden=true;dialogState=null;game=null;}
  function changeStat(changes){const pet=p();for(const [key,amount] of Object.entries(changes)){if(key in pet.stats)pet.stats[key]=cap(pet.stats[key]+amount,key==='weight'?4:0,key==='weight'?80:100);else if(key in pet.skills)pet.skills[key]=cap(pet.skills[key]+amount);else if(key==='bond')pet.stats.bond=cap(pet.stats.bond+amount)}normalize()}
  function openFood(){if(!canAct())return;const foods=shop.filter(x=>x.type==='food');openDialog('������ �Ļ�','�谡 ��� ���� á���� ���캸�� ���̸� ����ּ���.',foods.map(item=>({label:`${item.icon} ${item.name} �� ${inventoryCount(item.id)}��`,run:()=>{feed(item.id);closeDialog()}})))}
  function school(id){if(!canAct())return;if(['egg','baby'].includes(p().stage)){notify('��̰� �Ǹ� �б��� �� �� �־��.');return}if(p().schoolToday>=2){notify('������ ������ �� �� ������. ���� �ٽ� ����.');return}const s=subjects.find(x=>x.id===id);if(!s)return;openDialog(`${s.icon} ${s.name} ����`,esc(s.question),s.options.map((answer,i)=>({label:answer,run:()=>{const correct=i===s.answer,bonus=(p().job==='teacher'||(s.id==='korean'&&has('book'))||(s.id==='science'&&has('scienceKit')))?2:0;p().schoolToday++;changeStat({[s.skill]:correct?6+bonus:2,energy:-7,stress:correct?3:7,mood:correct?3:-2});state.coins+=correct?16:6;care(correct?`${s.name} ������ �������! ${s.skill} �ɷ°� 16M ȹ��`:`${s.name} ������ Ʋ������ ������. 6M ȹ��`);closeDialog()}})))}
  function talk(){if(!canAct())return;if(p().conversationToday>=5){notify('������ ��ȭ�� ����� �������.');return}const scene=pick(dialogue);openDialog('����� ��ȭ',`��${esc(scene.line)}��`,scene.choices.map(([label,changes])=>({label,run:()=>{p().conversationToday++;changeStat(changes);changeStat({speech:1,bond:2});care(`��ȭ: ${label}`);closeDialog()}})))}
  function startHygiene(id){if(!canAct())return;const h=hygiene.find(x=>x.id===id);if(!h)return;activity={type:'hygiene',item:h,index:0};showHygiene()}
  function openHygiene(){if(!canAct())return;openDialog('��� �������?','��Ȱ �� �ı� ������ ���� ��� �ϼ��ϼ���.',hygiene.map(h=>({label:`${h.icon} ${h.name} �� ${h.secs}��`,run:()=>openHygieneScene(h.id)})))}
  function showHygiene(){const h=activity.item,idx=activity.index;if(idx>=h.steps.length){let gain=h.gain+(has('soap')&&h.part!=='teeth'?10:0)+(has('toothbrush')&&h.part==='teeth'?10:0);p().hygiene[h.part]=cap(p().hygiene[h.part]+gain);if(h.part==='body'){p().hygiene.hands=cap(p().hygiene.hands+10);p().hygiene.feet=cap(p().hygiene.feet+10)}p().stats.stress=cap(p().stats.stress-3);p().skills.life=cap(p().skills.life+1);care(`${h.name} �Ϸ� �� ���� �ð� ${h.secs}��`);activity=null;closeDialog();return}
    const options=[h.steps[idx],...h.steps.filter(x=>x!==h.steps[idx])].sort(()=>Math.random()-.5);openDialog(`${h.icon} ${h.name} �� ${idx+1}/3`,`���� ������ �����ϼ���. �Ϸ��ϸ� ���� �ӿ��� ${h.secs}�ʰ� �帨�ϴ�.`,options.map(label=>({label,run:()=>{if(label===h.steps[idx]){activity.index++;showHygiene()}else{p().stats.stress=cap(p().stats.stress+1);notify('������ �ٽ� �����غ���.','warning');showHygiene()}}})))}
  function startExercise(id){if(!canAct())return;const e=exercises.find(x=>x.id===id);if(!e)return;if(e.needs&&!has(e.needs)){notify('� �ⱸ�� �ʿ��ؿ�. ���۸��Ͽ��� �����ϼ���.','warning');return}if(p().stats.energy<15){notify('�ʹ� ���ƾ��. ���� �����ּ���.','warning');return}activity={type:'exercise',item:e,step:0,pattern:Array.from({length:3},()=>pick(['A','B','C']))};exerciseStep()}
  function exerciseStep(){const a=activity,e=a.item;if(a.step>=3){const st=p().stats,over=p().exerciseToday>=2;st.energy=cap(st.energy-e.effort*(over?1.5:1));st.stress=cap(st.stress+e.stress+(over?9:0));st.satiety=cap(st.satiety-7);st.weight=cap(st.weight-(over?.3:.7),4,80);st.mood=cap(st.mood+4);p().skills.fitness=cap(p().skills.fitness+e.fitness);p().hygiene[e.dirt]=cap(p().hygiene[e.dirt]-e.dirtAmt);p().exerciseToday++;if(over&&st.energy<20)p().illness='������';care(`${e.name} ${e.mins}�� �Ϸ�! ${over?'���� ����� �Ƿΰ� �׿����.':'ü���� �ö����.'}`);activity=null;closeDialog();return}const correct=a.pattern[a.step];openDialog(`${e.icon} ${e.name} �� ���� ${a.step+1}/3`,`ȭ���� ���� <b>${correct}</b>�� ���� ���� �ϼ���.`,['A','B','C'].map(key=>({label:`${key} ����`,run:()=>{if(key===correct){a.step++;exerciseStep()}else{p().stats.energy=cap(p().stats.energy-2);notify('������ �޶��. �ٽ� ����������.','warning');exerciseStep()}}})))}
  function chooseJob(){if(!canAct()||!adult())return;openDialog('���� ����','������ ���ԡ��ǷΡ����� ���迡 ���� �ٸ� ������ �ݴϴ�.',jobs.map(j=>({label:`${j.icon} ${j.name} �� ${j.pay}M/�� �� ${j.desc}`,run:()=>{p().job=j.id;care(`${j.name} ������ �����߾��.`);closeDialog()}})))}
  function workMenu(){if(!canAct()||!p().job)return;openDialog('������ �ٹ�','�ϰ� �޽� �� �ϳ��� �����ϼ���. ������ �� ���� ������ �� �ֽ��ϴ�.',[{label:'���� �ٹ� �� �⺻ ����',run:()=>{work('normal');closeDialog()}},{label:'�߱� �� ���� �� 1.5��, �ǷΡ����� ���� ��ȭ',run:()=>{work('overtime');closeDialog()}},{label:'������ ���� �� ���� 0, ��Ʈ���� ȸ��',run:()=>{work('rest');closeDialog()}}])}
  function partnerAction(){if(!canAct()||!adult())return;const pet=p();if(!pet.partner){openDialog('ģ�� ������','��ü�� �� ��� ���ο� ������ �������. ������ ģ�������?',[
      {label:'��� �� �����ϰ� ������ ����',run:()=>{pet.partner={name:'���',trait:'�����',bond:15,meet:Date.now(),married:false};care('���� ģ���� �Ǿ����.');closeDialog()}},
      {label:'���� �� Ȱ���ϰ� ȣ��� ���� ����',run:()=>{pet.partner={name:'����',trait:'ȣ���',bond:15,meet:Date.now(),married:false};care('����� ģ���� �Ǿ����.');closeDialog()}}
    ]);return}if(pet.partner.married){notify(`${pet.partner.name}�� �Բ� ������ ������ �־��.`);return}openDialog(`${pet.partner.name}�� ����`,`���� ģ�е� ${Math.round(pet.partner.bond)}/100. ���� �̾߱��ϸ� ���踦 ���� �� �־��.`,[
    {label:'�Բ� ��å�ϱ� �� ģ�е� +20',run:()=>{pet.partner.bond=cap(pet.partner.bond+20);changeStat({energy:-5,stress:-6,bond:4});care(`${pet.partner.name}�� ��å�߾��.`);closeDialog()}},
    {label:'������ �̾߱��ϱ� �� ģ�е� +15',run:()=>{pet.partner.bond=cap(pet.partner.bond+15);changeStat({speech:2,bond:4});care(`${pet.partner.name}�� ��ȭ�߾��.`);closeDialog()}},
    {label:'��ȥ�ϱ� �� ģ�е� 60 �̻�',run:()=>{if(pet.partner.bond<60){notify('ģ�е��� 60 �̻� �׾��ּ���.','warning');return}pet.partner.married=true;pet.marriedAt=Date.now();care(`${pet.partner.name}�� ��ȥ�߾��!`);closeDialog()}}
  ])}
  function childAction(){const pet=p();if(!canAct()||!adult())return;if(!pet.partner?.married){notify('��ȥ �� �ڳฦ ������ �� �־��.','warning');return}if(pet.child){notify(`${pet.child.name}�� ���� �ٹ����� ���� ���븦 ��ٸ��� �־��.`);return}if(Date.now()-pet.marriedAt<DAY){notify('��ȥ �� �Ϸ簡 ������ �ڳฦ ������ �� �־��.','warning');return}const inheritedSkill=Object.entries(pet.skills).sort((a,b)=>b[1]-a[1])[0][0];pet.child={name:'�Ʊ� ����',trait:rand(2)?pet.trait:pet.partner.trait,bond:35,genes:{horn:pet.genes.horn,tail:rand(2)?pet.genes.tail:rand(3)},inheritedSkill};care('���ο� ���� �������� ã�ƿԾ��!')}
  function useKey(key){if(activityEngine.active()){activityEngine.key(key);return}if($('dialogLayer').hidden){if(key==='A'){const tabs=[...document.querySelectorAll('#tabs button')];const i=tabs.findIndex(b=>b.dataset.tab===tab);tab=tabs[(i+1)%tabs.length].dataset.tab;notice='';render()}else if(key==='B'){const first=$('screen').querySelector('[data-action]:not(:disabled)');if(first)first.click()}else{tab='care';notice='';render()}return}if(game){gameKey(key);return}if(key==='C'){closeDialog();render();return}const buttons=[...$('dialog').querySelectorAll('[data-choice]')];if(!buttons.length)return;dialogState.cursor=key==='A'?((dialogState.cursor||0)+1)%buttons.length:(dialogState.cursor||0);buttons.forEach((b,i)=>b.style.outline=i===dialogState.cursor?'3px solid #157bb3':'none');if(key==='B')buttons[dialogState.cursor].click()}
  function startGame(id){
    if(!canAct())return;
    if(p().stats.energy<10){notify('����� �����ؿ�. ���� ���� ��ƿ�.','warning');return}
    const entry=gameNames.find(x=>x.id===id);if(!entry)return;
    game={id,score:0,round:0,lane:1,selected:0,balls:Array.from({length:5},()=>rand(3)),bricks:Array.from({length:3},()=>Array(4).fill(1)),sequence:[],input:0,phase:'play',marker:0,direction:1};
    if(id==='memory')nextMemory();
    if(id==='jump')game.timer=setInterval(()=>{if(!game||game.id!=='jump')return;game.marker+=game.direction;if(game.marker>=6||game.marker<=0)game.direction*=-1;renderGame()},350);
    renderGame();
  }
  function nextMemory(){game.sequence=Array.from({length:Math.min(3+game.round,6)},()=>pick(['A','B','C']));game.input=0;game.phase='show';setTimeout(()=>{if(game?.id==='memory'&&game.phase==='show'){game.phase='play';renderGame()}},2200)}
  function gameText(){
    if(game.id==='catch')return `���� <b>${['����','���','������'][game.balls[game.round]]}</b>�� �־��. A/C�� �̵��ϰ� B�� ��������.<div class="mini-board">${[0,1,2].map(i=>`<span>${game.balls[game.round]===i?'��':'��'}<br>${game.lane===i?'?':'_'}</span>`).join('')}</div>`;
    if(game.id==='bricks')return `A/C�� ��ġ�� �ű�� B�� ���� ���.<div class="mini-board">${game.bricks.map(row=>`<div>${row.map(v=>v?'��':'��').join(' ')}</div>`).join('')}<div>${[0,1,2,3].map(i=>i===game.selected?'��':'��').join(' ')}</div></div>`;
    if(game.id==='jump')return `���� ����� �� �� B�� ��������.<div class="mini-board">${Array.from({length:7},(_,i)=>i===game.marker?'��':i===3?'��':'��').join(' ')}</div>`;
    if(game.id==='memory')return game.phase==='show'?`������ ����ϼ���!<div class="mini-board">${game.sequence.join('  ')}</div>`:`����� ������� A/B/C�� ��������. (${game.input+1}/${game.sequence.length})`;
    const q=subjects[game.round%subjects.length];return `${esc(q.question)}<div class="mini-board">${q.options.map((v,i)=>`${i===game.selected?'��':'��'}${esc(v)}`).join('<br>')}</div>A/C ���� �� B Ȯ��`;
  }
  function renderGame(){if(!game)return;const entry=gameNames.find(x=>x.id===game.id);$('dialog').innerHTML=`<h2>${entry.icon} ${entry.name}</h2><p>${game.round+1}/${game.id==='bricks'?8:game.id==='jump'?8:game.id==='memory'?3:5}�� �� ���� ${game.score}</p><p>${gameText()}</p><div class="game-buttons"><button type="button" data-game-key="A">A</button><button type="button" data-game-key="B">B</button><button type="button" data-game-key="C">C</button></div><button type="button" class="secondary close" data-close="1">�׸��α�</button>`;$('dialogLayer').hidden=false}
  function endGame(){const g=game;if(g?.timer)clearInterval(g.timer);if(!g)return;const reward=Math.round(g.score*(p().gameToday<3?7:3));state.coins+=reward;p().gameToday++;changeStat({mood:Math.min(20,g.score*3+2),energy:-Math.max(3,g.round+2),stress:-Math.min(12,g.score*2),bond:Math.min(8,g.score)});if(g.id==='quiz')changeStat({intellect:Math.min(5,g.score)});if(g.id==='jump'||g.id==='catch')changeStat({fitness:Math.min(5,g.score)});game=null;closeDialog();care(`${gameNames.find(x=>x.id===g.id).name} ${g.score}�� �� ${reward}M�� ������.`)}
  function gameKey(key){
    const g=game;if(!g)return;
    if(g.id==='catch'){if(key==='A')g.lane=Math.max(0,g.lane-1);if(key==='C')g.lane=Math.min(2,g.lane+1);if(key==='B'){if(g.lane===g.balls[g.round])g.score++;g.round++;if(g.round>=5){endGame();return}}}
    else if(g.id==='bricks'){if(key==='A')g.selected=Math.max(0,g.selected-1);if(key==='C')g.selected=Math.min(3,g.selected+1);if(key==='B'){let hit=false;for(let row=2;row>=0;row--){if(g.bricks[row][g.selected]){g.bricks[row][g.selected]=0;g.score++;hit=true;break}}if(!hit)tone(190);g.round++;if(g.round>=8||g.bricks.flat().every(v=>!v)){endGame();return}}}
    else if(g.id==='jump'){if(key==='B'){if(g.marker===3)g.score++;g.round++;if(g.round>=8){endGame();return}}}
    else if(g.id==='memory'){if(g.phase==='show')return;if(key===g.sequence[g.input]){g.input++;if(g.input>=g.sequence.length){g.score++;g.round++;if(g.round>=3){endGame();return}nextMemory()}}else{g.round++;if(g.round>=3){endGame();return}nextMemory()}}
    else if(g.id==='quiz'){if(key==='A')g.selected=(g.selected+1)%3;if(key==='C')g.selected=(g.selected+2)%3;if(key==='B'){if(g.selected===subjects[g.round%subjects.length].answer)g.score++;g.selected=0;g.round++;if(g.round>=5){endGame();return}}}
    tone(key==='B'?720:480);renderGame();
  }
  const activityEngine=window.MotchiActivities.create({tone,onCancel:()=>{notice='Ȱ���� �ߴ��߾��. ������ ������ ������� �ʾҽ��ϴ�.';render()},onComplete:result=>{
    const pet=p(),st=pet.stats,score=result.score;
    if(result.kind==='mini'){
      const reward=Math.min(140,Math.round(score*(pet.gameToday<3?7:3)));state.coins+=reward;pet.gameToday++;
      changeStat({mood:Math.min(22,score*2+3),energy:-Math.max(4,Math.min(18,score+3)),stress:-Math.min(14,score*2),bond:Math.min(8,score)});
      if(['catch','jump'].includes(result.id))changeStat({fitness:Math.min(5,score)});if(result.id==='quiz'||result.id==='memory')changeStat({intellect:Math.min(5,score)});
      care(`${gameNames.find(x=>x.id===result.id)?.name||'����'} ${score}�� �� ${reward}M ȹ��`);
    }else if(result.kind==='school'){
      const subject=subjects.find(x=>x.id===result.id);pet.schoolToday++;const reward=6+score*8;state.coins+=reward;
      changeStat({[subject.skill]:2+score*2,energy:-8,stress:score>=2?2:6,mood:score>=2?4:0});
      care(`${subject.name} ���� ${score}/3���� �� ${reward}M ȹ��`);
    }else if(result.kind==='hygiene'){
      const h=hygiene.find(x=>x.id===result.id);const bonus=(h.part==='teeth'&&has('toothbrush'))||(h.part!=='teeth'&&has('soap'))?10:0;
      pet.hygiene[h.part]=cap(pet.hygiene[h.part]+h.gain+bonus);if(h.part==='body'){pet.hygiene.hands=cap(pet.hygiene.hands+10);pet.hygiene.feet=cap(pet.hygiene.feet+10)}
      changeStat({stress:-4,life:1});care(`${h.name} �Ϸ� �� ���� �� ${h.secs}�ʰ� �귶���.`);
    }else if(result.kind==='exercise'){
      const e=exercises.find(x=>x.id===result.id),over=pet.exerciseToday>=2;
      if(score<1){st.energy=cap(st.energy-3);care(`${e.name}�� ������ ���߾��. �ٽ� ���� ������ ������.`);return}
      st.energy=cap(st.energy-e.effort*(over?1.5:1));st.stress=cap(st.stress+e.stress+(over?9:0));st.satiety=cap(st.satiety-7);st.weight=cap(st.weight-(over?.3:.7),4,80);st.mood=cap(st.mood+4);
      pet.skills.fitness=cap(pet.skills.fitness+e.fitness);pet.hygiene[e.dirt]=cap(pet.hygiene[e.dirt]-e.dirtAmt);pet.exerciseToday++;
      if(over&&st.energy<20)pet.illness='������';care(`${e.name} ���� �÷��� �Ϸ� �� ${over?'���� ����� �Ƿΰ� �׿����.':'ü���� �ö����.'}`);
    }
  }});
  function openMiniScene(id){if(!canAct())return;if(p().stats.energy<10){notify('����� �����ؿ�. ���� ���� ��ƿ�.','warning');return}closeDialog();activityEngine.start('mini',id)}
  function openSchoolScene(id){if(!canAct())return;if(['egg','baby'].includes(p().stage)){notify('��̰� �Ǹ� �б��� �� �� �־��.');return}if(p().schoolToday>=2){notify('������ ������ �� �� ������. ���� �ٽ� ����.');return}closeDialog();activityEngine.start('school',id)}
  function openHygieneScene(id){if(!canAct())return;closeDialog();activityEngine.start('hygiene',id)}
  function openExerciseScene(id){if(!canAct())return;const e=exercises.find(x=>x.id===id);if(!e)return;if(e.needs&&!has(e.needs)){notify('� �ⱸ�� �ʿ��ؿ�. ���۸��Ͽ��� �����ϼ���.','warning');return}if(p().stats.energy<15){notify('�ʹ� ���ƾ��. ���� �����ּ���.','warning');return}closeDialog();activityEngine.start('exercise',id)}
  function dispatchAction(act,id){const actions={openFood,openHygiene,school:openSchoolScene,talk,rest,cleanPoop,lights,treat,sitter,exercise:openExerciseScene,hygiene:openHygieneScene,buy,chooseJob,workMenu,partner:partnerAction,child:childAction,nextGeneration,startGame:openMiniScene};if(actions[act])actions[act](id)}
  $('screen').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button&&!button.disabled)dispatchAction(button.dataset.action,button.dataset.id)});
  document.querySelector('.world').addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button&&!button.disabled)dispatchAction(button.dataset.action,button.dataset.id)});
  $('tabs').addEventListener('click',e=>{if(e.target.closest('[data-more]')){menuOpen=!menuOpen;renderTabs();return}const button=e.target.closest('[data-tab]');if(button){tab=button.dataset.tab;menuOpen=false;notice='';render()}});
  $('dialog').addEventListener('click',e=>{const gameButton=e.target.closest('[data-game-key]');if(gameButton){gameKey(gameButton.dataset.gameKey);return}const close=e.target.closest('[data-close]');if(close){if(game?.timer)clearInterval(game.timer);closeDialog();render();return}const button=e.target.closest('[data-choice]');if(button&&dialogState){const selected=dialogState.choices[Number(button.dataset.choice)];if(selected){tone(720);selected.run()}}});
  let lastPetTouch=0;
  $('petCanvas').addEventListener('pointerdown',()=>{const now=Date.now();if(now-lastPetTouch<650)return;lastPetTouch=now;const egg=p().stage==='egg';$('speech').textContent=egg?pick(['��! ��!','���塦','��!']):pick(['��!','����!','���� ����!']);tone(egg?560:740);const scene=document.querySelector('.pet-scene');scene.classList.remove('touched');void scene.offsetWidth;scene.classList.add('touched');setTimeout(()=>scene.classList.remove('touched'),650)});
  $('dialogLayer').addEventListener('click',e=>{if(e.target===$('dialogLayer')){if(game?.timer)clearInterval(game.timer);closeDialog();render()}});
  $('soundButton').addEventListener('click',()=>{state.sound=!state.sound;save();renderTop();if(state.sound)tone(700)});
  window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Enter','Escape','a','b','c','A','B','C'].includes(e.key)){e.preventDefault();if(e.key==='Escape'&&activityEngine.active()){activityEngine.quit();return}const key=({ArrowLeft:'A',ArrowRight:'C',Enter:'B',Escape:'C'})[e.key]||e.key.toUpperCase();useKey(key)}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){advance();render()}else save()});
  window.addEventListener('pagehide',save);
  advance();render();
  setInterval(()=>{advance();render()},30000);
  if('serviceWorker' in navigator&&location.protocol!=='file:'&&!['localhost','127.0.0.1'].includes(location.hostname))navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();
