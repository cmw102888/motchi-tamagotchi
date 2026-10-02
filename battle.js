/* A self-contained, touch-friendly auto-battle scene. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const names = ['숲','들판','모래언덕','비 오는 길','별빛 언덕','구름 정원','얼음길','장난감 성','달빛 숲','모찌의 꿈'];
  window.MotchiBattle = {
    create({snapshot, onFinish, tone}) {
      const layer=$('battleLayer'), canvas=$('battleCanvas'), ctx=canvas.getContext('2d');
      let run=null, raf=0;
      const key=() => { const s=snapshot(); return `${s.stage}-${s.wave===5?'Final':s.wave}`; };
      function monster(i) {
        const s=snapshot(), level=(s.stage-1)*5+s.wave;
        return {x:55+(i%5)*66,y:145+Math.floor(i/5)*65,phase:i*.7,hp:(i===24?45:15)*(1+level*.07),max:(i===24?45:15)*(1+level*.07),boss:i===24,alive:true};
      }
      function start() {
        if(run)return;
        const s=snapshot();
        run={stage:s.stage,wave:s.wave,monsters:Array.from({length:25},(_,i)=>monster(i)),started:performance.now(),last:performance.now(),hit:0,combo:0,kills:0,hp:100,slash:0,attackAt:0,enemyAt:0};
        layer.hidden=false;draw(performance.now());raf=requestAnimationFrame(frame);
      }
      function stop(win=false,quit=false) {
        if(!run)return;
        const result={win,quit,stage:run.stage,wave:run.wave,kills:run.kills,hp:Math.max(0,Math.round(run.hp))};
        run=null;cancelAnimationFrame(raf);layer.hidden=true;onFinish(result);
      }
      function step(now) {
        const r=run,s=snapshot(),elapsed=(now-r.started)/1000;
        const speed=clamp(205-(s.fitness||0)*.8-(s.dodge||0)*.3-(s.weapon==='battleRope'?18+(s.weaponLevel||0)*4:0),95,205);
        if(now-r.attackAt>=speed && elapsed<30){
          const target=r.monsters.find(m=>m.alive&&!m.boss)||r.monsters.find(m=>m.alive);
          if(target){
            r.attackAt=now;r.slash=now;r.hit=target;
            const damage=3.5+(s.fitness||0)*.065+(s.intellect||0)*.025+(s.weaponLevel||0)*.8+(s.weapon==='dumbbell'?1.2:s.weapon==='battleBook'?(s.intellect||0)*.06:.1);
            target.hp-=damage;r.combo++;
            if(target.hp<=0){target.alive=false;r.kills++;tone(850)}
          }
        }
        if(now-r.enemyAt>900 && r.kills<25 && elapsed<30){
          r.enemyAt=now;
          const threat=1+(r.stage-1)*.28+(r.wave-1)*.16;
          const defense=(s.dodge||0)*.004+(s.energy||0)*.0025;
          r.hp-=Math.max(.25,threat*(1-defense));
        }
        if(r.hp<=0){stop(false);return}
        if(r.kills===25 || elapsed>=30){stop(r.kills===25);return}
        draw(now);
      }
      function sprite(x,y,boss,phase) {
        const size=boss?30:19, bob=Math.sin(phase)*2;
        ctx.fillStyle='#34404d';ctx.fillRect(x-size/2-2,y+bob-size/2-2,size+4,size+4);
        ctx.fillStyle=boss?'#b263a3':'#6daab4';ctx.fillRect(x-size/2,y+bob-size/2,size,size);
        ctx.fillStyle='#fff3d4';ctx.fillRect(x-size*.2,y+bob-2,4,4);ctx.fillRect(x+size*.12,y+bob-2,4,4);
        ctx.fillStyle='#34404d';ctx.fillRect(x-size*.2+1,y+bob-1,2,2);ctx.fillRect(x+size*.12+1,y+bob-1,2,2);
      }
      function draw(now) {
        if(!run)return;
        const r=run,s=snapshot(),time=Math.max(0,30-(now-r.started)/1000);
        const sky=['#c9e7ce','#e9cfbb','#bcd9e9'][(r.stage-1)%3];
        ctx.fillStyle=sky;ctx.fillRect(0,0,390,650);
        ctx.fillStyle='#7cae8d';ctx.fillRect(0,118,390,532);
        for(let i=0;i<24;i++){ctx.fillStyle=i%2?'#93bb8d':'#6e9f80';ctx.fillRect((i*79)%390,118+((i*137)%500),35,8)}
        ctx.fillStyle='#fff9e9';ctx.fillRect(12,12,366,88);
        ctx.fillStyle='#34404d';ctx.font='bold 20px sans-serif';ctx.fillText(`${r.stage}-${r.wave===5?'Final':r.wave}  ${names[r.stage-1]}`,25,39);
        ctx.font='bold 15px sans-serif';ctx.fillText(`${Math.ceil(time)}초  ·  몬스터 ${r.kills}/25  ·  콤보 ${r.combo}  ·  무기 Lv.${s.weaponLevel||0}`,25,64);
        ctx.fillStyle='#d5d5d1';ctx.fillRect(25,75,335,12);ctx.fillStyle=r.hp<30?'#e96866':'#6bb894';ctx.fillRect(25,75,335*clamp(r.hp/100,0,1),12);
        r.monsters.forEach((m,i)=>{if(!m.alive)return;const x=m.x+Math.sin(now/530+i)*3,y=m.y+Math.sin(now/440+i)*2;sprite(x,y,m.boss,now/250+m.phase);ctx.fillStyle='#463f4a';ctx.fillRect(x-(m.boss?16:11),y+(m.boss?19:13),m.boss?32:22,4);ctx.fillStyle='#f08372';ctx.fillRect(x-(m.boss?16:11),y+(m.boss?19:13),(m.boss?32:22)*clamp(m.hp/m.max,0,1),4)});
        const px=195+Math.sin(now/100)*5,py=535,col=['#74bca3','#e5a1aa','#91a8d7','#e5bc72','#b8a1c7'][s.starter||0];
        ctx.fillStyle='#34404d';ctx.fillRect(px-12,py-31,24,6);ctx.fillRect(px-18,py-25,36,6);ctx.fillRect(px-24,py-19,48,30);ctx.fillRect(px-18,py+11,36,6);ctx.fillRect(px-14,py+17,8,8);ctx.fillRect(px+6,py+17,8,8);
        ctx.fillStyle=col;ctx.fillRect(px-12,py-25,24,6);ctx.fillRect(px-18,py-19,36,30);ctx.fillRect(px-12,py+11,24,6);
        ctx.fillStyle='#34404d';ctx.fillRect(px-10,py-4,4,4);ctx.fillRect(px+6,py-4,4,4);ctx.fillRect(px-3,py+7,8,3);
        ctx.font='30px sans-serif';ctx.fillText(s.weaponIcon||'🏋️',px+21,py+3);
        if(now-r.slash<100&&r.hit){ctx.strokeStyle='#fff7c1';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(px+24,py-25);ctx.lineTo(r.hit.x,r.hit.y);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.fillText('연타!',px-20,py-36)}
        ctx.fillStyle='#fff9e9';ctx.fillRect(8,590,374,52);ctx.fillStyle='#34404d';ctx.font='14px sans-serif';ctx.fillText('모찌가 빠르게 자동 공격해요 · 돌봄과 장비가 전투에 반영돼요',18,621);
      }
      function frame(now){if(!run)return;step(now);if(run)raf=requestAnimationFrame(frame)}
      $('battleExit').addEventListener('click',()=>stop(false,true));
      return {start,active:()=>!!run,stop};
    }
  };
})();
