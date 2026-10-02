/* MOTCHI LIFE battle: a touch-assisted, one-line auto battle. */
(() => {
  'use strict';
  const W=390,H=650,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const stageNames=['풀잎 길','비 오는 숲','모래 언덕','장난감 방','달빛 해변','안개 골목','구름 정원','별빛 터널','꿈의 성','모찌의 세계'];
  window.MotchiBattle={create({snapshot,onFinish,tone,onProgress}){
    const layer=document.getElementById('battleLayer'),canvas=document.getElementById('battleCanvas'),ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=false;
    let run=null,raf=0,pausedAt=0;
    const stats=()=>({...snapshot(),...(window.MotchiBattleExtras?.()||{})});
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
    const label=(value,x,y,size=14,color='#31483d',align='left')=>{ctx.fillStyle=color;ctx.font=`900 ${size}px system-ui,sans-serif`;ctx.textAlign=align;ctx.fillText(value,x,y)};
    const level=s=>(s.stage-1)*5+s.wave;
    const health=s=>Math.round(85+(s.fitness||0)*.62+(s.health||0)*.22);
    const condition=s=>clamp(.65+((s.energy||0)+(s.satiety||0)+(s.mood||0))/600-(s.stress||0)/500,.5,1.12);
    const weaponName=s=>s.weapon==='dumbbell'?'아령':s.weapon==='battleRope'?'줄넘기':s.weapon==='battleBook'?'책':'맨손';
    function enemy(i,s){
      const boss=i===24,scale=1+level(s)*.066;
      const hp=Math.round((boss?34:10.5)*scale*(1+(i%5)*.025));
      return {i,hp,max:hp,alive:true,boss,phase:i*.53,hitAt:0,attackingAt:0};
    }
    function start(){
      if(run)return;
      const s=stats(),now=performance.now();
      run={stage:s.stage,wave:s.wave,enemies:Array.from({length:25},(_,i)=>enemy(i,s)),hp:health(s),maxHp:health(s),kills:0,earnedCoins:0,lastLoot:0,attacks:0,damageDone:0,dodges:0,crits:0,started:now,combatAt:now+900,last:now,attackAt:0,enemyAt:now+1850,assistAt:0,hitAt:0,dodgeAt:0,slashAt:0,slashDamage:0,flashText:'',flashAt:0,phase:'enter',endingAt:0,finishResult:null,bossDelay:0};
      layer.hidden=false;document.body.classList.add('in-battle');onProgress?.({earnedCoins:0,kills:0});tone?.(330);setTimeout(()=>tone?.(520),170);raf=requestAnimationFrame(frame);
    }
    function finish(win=false,quit=false){
      const r=run;if(!r||r.phase==='ending')return;
      r.phase='ending';r.endingAt=performance.now()+700;r.finishResult={win,quit,stage:r.stage,wave:r.wave,kills:r.kills,earnedCoins:r.earnedCoins,hp:Math.max(0,Math.round(r.hp)),dodges:r.dodges,crits:r.crits,damage:Math.round(r.damageDone)};
      tone?.(win?820:190);
    }
    function close(){
      const result=run?.finishResult;if(!result)return;
      run=null;cancelAnimationFrame(raf);layer.hidden=true;document.body.classList.remove('in-battle');onFinish(result);
    }
    const front=r=>r.enemies.find(e=>e.alive);
    function strike(now,assisted=false){
      const r=run;if(!r||r.phase!=='fight')return;
      const s=stats(),target=front(r);if(!target)return;
      const lv=s.weaponLevel||0,base=3.3+(s.power||0)*.045+(s.fitness||0)*.015+lv*.55+(s.attackBoost||0)*.8;
      let damage=base*condition(s);
      if(s.weapon==='dumbbell')damage+=1.15+lv*.37;
      if(s.weapon==='battleBook')damage+=(s.intellect||0)*.042;
      if(assisted)damage*=.9;
      const crit=Math.random()<clamp(.04+(s.luck||0)*.0016+(s.critBoost||0)*.02,.04,.5);
      if(crit){damage*=1.55;r.crits++}
      damage=Math.max(.7,damage);r.attacks++;r.damageDone+=damage;r.slashAt=now;r.slashDamage=damage;
      target.hp-=damage;target.hitAt=now;
      r.flashText=crit?'반짝 강타!':assisted?'함께 공격!':`${Math.round(damage)}`;r.flashAt=now;
      if(s.weapon==='battleRope'&&lv>=2){const next=r.enemies.find(e=>e.alive&&e.i>target.i);if(next){const splash=damage*(.23+lv*.045);next.hp-=splash;next.hitAt=now;r.damageDone+=splash;if(next.hp<=0)kill(next,now)}}
      if(s.weapon==='battleBook'&&r.attacks%Math.max(3,7-lv)===0){r.enemies.filter(e=>e.alive&&e.i>target.i).slice(0,2).forEach(e=>{const splash=damage*(.35+(s.intellect||0)*.0015);e.hp-=splash;e.hitAt=now;r.damageDone+=splash;if(e.hp<=0)kill(e,now)})}
      if(target.hp<=0)kill(target,now);
      if(r.kills===25)finish(true);
      if(assisted||crit||r.attacks%5===0)tone?.(crit?920:assisted?680:520);
    }
    function kill(enemy,now){
      if(!enemy.alive)return;
      enemy.alive=false;run.kills++;enemy.hitAt=now;
      const base=4+run.stage*2+run.wave;
      const spread=(.01+Math.random()*.14)*(Math.random()<.5?-1:1);
      const reward=Math.max(1,Math.round(base*(enemy.boss?2:1)*(1+spread)*(1+(stats().goldBoost||0)*.08)));
      run.earnedCoins+=reward;run.lastLoot=reward;
      run.flashText=`+${reward}M`;run.flashAt=now;
      onProgress?.({earnedCoins:run.earnedCoins,kills:run.kills});
      if(enemy.boss)tone?.(880);if(run.kills===24)run.bossDelay=now+500;
    }
    function enemyStrike(now){
      const r=run,s=stats(),target=front(r);if(!target||now<r.bossDelay)return;
      target.attackingAt=now;
      const dodge=clamp(.03+(s.dodge||0)*.0026,.03,.3);
      if(Math.random()<dodge){r.dodges++;r.dodgeAt=now;r.flashText='회피!';r.flashAt=now;tone?.(660);return}
      const threat=(1.9+level(s)*.18)*(target.boss?1.65:1);
      const block=clamp((s.fitness||0)*.002+(s.health||0)*.001,0,.29);
      const received=Math.max(.8,threat*(1-block));r.hp-=received;r.hitAt=now;r.flashText=`-${Math.ceil(received)} 체력`;r.flashAt=now;tone?.(210);
      if(r.hp<=0)finish(false);
    }
    function update(now){
      const r=run;if(!r)return;
      if(r.phase==='ending'){if(now>=r.endingAt)close();return}
      if(now<r.combatAt)return;
      if(r.phase==='enter'){r.phase='fight';r.started=now;r.enemyAt=now+1400;r.attackAt=now}
      const s=stats(),elapsed=(now-r.started)/1000;
      if(elapsed>=30){finish(r.kills===25);return}
      const interval=clamp(215-(s.dodge||0)*.16-(s.weapon==='battleRope'?24+(s.weaponLevel||0)*7:0)-(s.attackSpeedBoost||0)*12,125,215);
      if(now-r.attackAt>=interval&&now>=r.bossDelay){r.attackAt=now;strike(now)}
      const enemyInterval=clamp(1700-level(s)*17,850,1700);
      if(now>=r.enemyAt){r.enemyAt=now+enemyInterval;enemyStrike(now)}
    }
    function background(r,now){
      const colors=['#c5e4c6','#b9d8c6','#e6d9ae','#d5d0da','#b4d6dc'];
      rect(0,0,W,H,colors[(r.stage-1)%5]);rect(0,345,W,305,'#8bb383');
      for(let i=0;i<9;i++){const x=i*56-18;rect(x,297+(i%3)*13,26,54,'#607c5b');rect(x-13,282+(i%3)*13,52,25,'#5b986b')}
      rect(0,420,W,230,'#b29a73');for(let y=449;y<H;y+=42)rect(0,y,W,5,'#967f61');
      for(let i=0;i<10;i++)rect((i*87+Math.floor(now/75))%W,441+(i%3)*54,16,6,'#ccaf82');
    }
    function drawPet(now,s,r){
      const x=92,y=373,bob=Math.sin(now/105)*2,hit=now-r.hitAt<160,dodged=now-r.dodgeAt<220;
      const px=x+(dodged?-20:0),py=y+bob;
      rect(px-34,py-43,68,65,'#31463b');rect(px-30,py-39,60,57,['#78bc9a','#ed9cb2','#8bbbd6','#edc071','#baa4d7'][s.starter||0]);
      rect(px-23,py+20,17,18,'#31463b');rect(px+6,py+20,17,18,'#31463b');
      rect(px-19,py-13,7,8,'#2b4137');rect(px+12,py-13,7,8,'#2b4137');rect(px-5,py+2,11,4,'#2b4137');
      if((s.starter||0)===0){rect(px-39,py-46,19,18,'#4c8c61');rect(px+20,py-46,19,18,'#4c8c61')}
      if((s.starter||0)===1){rect(px-38,py-50,15,22,'#df7d9f');rect(px+23,py-50,15,22,'#df7d9f')}
      if((s.starter||0)===2){rect(px-43,py-5,14,25,'#69a4b8');rect(px+29,py-5,14,25,'#69a4b8')}
      if((s.starter||0)===3)rect(px-9,py-60,20,18,'#e8a749');
      if((s.starter||0)===4)rect(px-13,py-55,26,14,'#9d83bc');
      if(hit)rect(px-37,py-46,74,86,'#ffffff80');
      const swing=clamp((now-r.slashAt)/170,0,1),wy=py-16-31*(1-swing),wx=px+31+14*swing;
      if(s.weapon==='dumbbell'){
        rect(wx,wy+7,38,7,'#5d6468');rect(wx-5,wy,10,22,'#3d4b55');rect(wx+33,wy,10,22,'#3d4b55');
      }else if(s.weapon==='battleRope'){
        ctx.strokeStyle='#e2c275';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(wx,wy+15);ctx.quadraticCurveTo(wx+20,wy-43*swing,wx+44,wy+10);ctx.stroke();rect(wx+38,wy+5,10,14,'#915e64');
      }else if(s.weapon==='battleBook'){
        rect(wx,wy-7,31,33,'#32475b');rect(wx+4,wy-3,24,26,'#e6c88b');rect(wx+11,wy+5,10,3,'#6385a1');
      }else rect(wx,wy+6,17,14,'#31463b');
      if(now-r.slashAt<90){ctx.strokeStyle='#fff5bc';ctx.lineWidth=6;ctx.beginPath();ctx.arc(180,py-15,35,-1.3,.9);ctx.stroke()}
    }
    function drawEnemy(enemy,x,y,now){
      const boss=enemy.boss,size=boss?58:37,shake=now-enemy.hitAt<160?Math.sin(now/25)*5:0,lunge=now-enemy.attackingAt<200?-45:0;
      const xx=x+shake+lunge,bob=Math.sin(now/250+enemy.phase)*3;
      rect(xx-size/2-3,y+bob-size/2-3,size+6,size+6,'#374448');
      rect(xx-size/2,y+bob-size/2,size,size,boss?'#b7799d':enemy.i%3===0?'#7aa3b2':'#7fbaab');
      rect(xx-size*.24,y+bob-5,6,7,'#fff0d2');rect(xx+size*.1,y+bob-5,6,7,'#fff0d2');
      rect(xx-size*.2,y+bob-3,3,3,'#334049');rect(xx+size*.14,y+bob-3,3,3,'#334049');
      rect(xx-size/2,y+size/2+7,size,6,'#344a42');rect(xx-size/2,y+size/2+7,size*clamp(enemy.hp/enemy.max,0,1),6,'#e98275');
      if(now-enemy.hitAt<160)rect(xx-size/2,y+bob-size/2,size,size,'#fff9d274');
      if(now+270>run.enemyAt&&enemy===front(run)){ctx.strokeStyle='#e86c62';ctx.lineWidth=3;ctx.beginPath();ctx.arc(xx,y,46,0,Math.PI*2);ctx.stroke()}
    }
    function draw(now){
      const r=run;if(!r)return;const s=stats();background(r,now);
      rect(11,11,368,123,'#fff9e9');rect(11,11,368,4,'#6c7b5e');
      label(`${r.stage}-${r.wave===5?'Final':r.wave}  ${stageNames[r.stage-1]||'모찌의 세계'}`,22,39,18);
      const remaining=r.phase==='enter'?30:Math.max(0,30-(now-r.started)/1000);
      label(`${Math.ceil(remaining)}초 · 처치 ${r.kills}/25 · 획득 ${r.earnedCoins}M`,22,62,13);
      rect(22,73,348,12,'#d5dcd3');rect(22,73,348*clamp(r.hp/r.maxHp,0,1),12,r.hp/r.maxHp<.3?'#e87469':'#72b991');
      label(`모찌 체력 ${Math.max(0,Math.ceil(r.hp))}/${r.maxHp}`,22,104,12);
      for(let i=0;i<25;i++){const e=r.enemies[i],x=22+i*14;rect(x,115,10,12,e.alive?(e.boss?'#b875a0':'#5a9e92'):'#d9d8c9');if(e===front(r))rect(x-2,112,14,3,'#ed9b57')}
      const first=front(r),firstIndex=first?.i??25;
      for(let j=4;j>=0;j--){const e=r.enemies[firstIndex+j];if(!e||!e.alive)continue;drawEnemy(e,205+j*49,355,now)}
      drawPet(now,s,r);
      if(now-r.flashAt<360&&r.flashText)label(r.flashText,183,272,18,r.flashText.includes('체력')?'#d85955':'#fff4c4','center');
      rect(10,570,370,65,'#fff6dc');
      if(r.phase==='enter')label('몬스터가 다가옵니다!',195,604,19,'#384e40','center');
      else if(r.phase==='ending')label(r.finishResult?.win?'웨이브 클리어!':'도전 실패',195,604,22,r.finishResult?.win?'#4a9666':'#b35d59','center');
      else{label('자동 연타 중 · 몬스터를 터치하면 추가 타격',195,599,13,'#465b48','center');label(`${weaponName(s)} Lv.${s.weaponLevel||0} · 회피 ${r.dodges}회 · 강타 ${r.crits}회`,195,620,12,'#657565','center')}
    }
    function frame(now){
      if(!run)return;if(document.hidden){pausedAt=now;raf=requestAnimationFrame(frame);return}
      if(pausedAt){const wait=now-pausedAt;run.started+=wait;run.combatAt+=wait;run.attackAt+=wait;run.enemyAt+=wait;run.bossDelay+=wait;run.endingAt+=wait;pausedAt=0}
      update(now);if(run){draw(now);raf=requestAnimationFrame(frame)}
    }
    canvas.addEventListener('pointerdown',e=>{
      if(!run||run.phase!=='fight')return;
      const box=canvas.getBoundingClientRect(),x=(e.clientX-box.left)*W/box.width,y=(e.clientY-box.top)*H/box.height,now=performance.now();
      if(x>165&&y>175&&y<500&&now-run.assistAt>850){run.assistAt=now;strike(now,true)}
    });
    document.getElementById('battleExit').addEventListener('click',()=>finish(false,true));
    return {start,active:()=>!!run,stop:(win=false)=>finish(win,true)};
  }};
})();
