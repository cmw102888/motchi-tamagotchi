/* Full-scene touch activities. Original pixel artwork, no image assets or external code. */
window.MotchiActivities = (() => {
  'use strict';
  const W=390,H=650,TAU=Math.PI*2;
  const labels={catch:'�� �ޱ�',bricks:'��������',jump:'�ٳѱ�',memory:'����',quiz:'���� ����',walk:'��å',stretch:'��Ʈ��Ī',ball:'������',swim:'����',hands:'�� �ı�',face:'����',teeth:'��ġ',feet:'�� �ı�',body:'����',korean:'����',english:'����',math:'����',science:'����',art:'�̼�',pe:'ü��'};
  const questions={
    korean:[['���ȳ硱�� ���� ����?',['�λ�','����','����'],0],['�������١��� ����?',['����','�г�','����'],0],['��Ŀ�ٶ����� �ݴ��?',['����','����','�ձ�'],0]],
    english:[['APPLE�� �����ϱ�?',['���','��','å'],0],['BLUE�� ���� ���ϱ�?',['�Ķ�','����','���'],0],['HELLO�� ���� ����?',['�λ��� ��','�� ��','�� ��'],0]],
    math:[['3 + 4 = ?',['6','7','8'],1],['9 - 5 = ?',['3','4','5'],1],['2 �� 3 = ?',['5','6','7'],1]],
    science:[['�Ĺ��� �ʿ��� ����?',['���� ��','��','�峭��'],0],['������ ������?',['��','��','����'],0],['���� ������ ����?',['�¾�','��','����'],0]],
    art:[['�Ķ�+�����?',['�ʷ�','����','����'],0],['���� �׸� �� �ʿ��� ����?',['�ձ� ��','����','����'],0],['����+�Ķ���?',['����','�ʷ�','��Ȳ'],0]],
    pe:[['� ���� �� ����?',['�غ� �','����','�����'],0],['�޸� �� ���� ������ ����?',['�� ���ñ�','����','���� �ʱ�'],0],['������ ���� ����?',['õõ��','������ ����','�б�'],0]]
  };
  const allQuestions=Object.values(questions).flat();
  const rand=n=>Math.floor(Math.random()*n),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function create({onComplete,onCancel,tone}){
    const layer=document.getElementById('activityLayer'),canvas=document.getElementById('activityCanvas'),ctx=canvas.getContext('2d'),title=document.getElementById('activityTitle'),scoreLabel=document.getElementById('activityScore'),instructions=document.getElementById('activityInstructions'),controls=document.getElementById('activityControls');
    let task=null,raf=0,last=0,pointer=null;
    ctx.imageSmoothingEnabled=false;
    const pos=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
    const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
    const text=(s,x,y,size=17,color='#284638',align='center')=>{ctx.fillStyle=color;ctx.font=`900 ${size}px system-ui,sans-serif`;ctx.textAlign=align;ctx.fillText(s,x,y)};
    function pet(x,y,size=95,pose='stand'){
      const u=size/12;ctx.save();ctx.translate(Math.round(x-size/2),Math.round(y-size/2));
      const bit=(gx,gy,gw,gh,c)=>rect(gx*u,gy*u,gw*u,gh*u,c);
      const dark='#2c4b3d',body='#77b9a0',light='#a1d2b2',blush='#ea999c';
      bit(3,0,2,2,dark);bit(4,1,1,1,'#f5d77c');bit(7,0,2,2,dark);bit(8,1,1,1,'#f5d77c');
      bit(2,2,8,7,dark);bit(1,4,10,4,dark);bit(2,3,8,5,body);bit(1,5,10,2,body);bit(3,8,6,3,dark);bit(4,8,4,2,light);
      bit(3,5,1,2,dark);bit(8,5,1,2,dark);bit(5,7,2,1,dark);bit(2,7,1,1,blush);bit(9,7,1,1,blush);
      const foot=pose==='jump'?-1:pose==='swim'?2:0;bit(3,10+foot,2,2,dark);bit(7,10+foot,2,2,dark);
      if(pose==='jump'||pose==='stretch'){bit(0,5,2,1,dark);bit(10,5,2,1,dark)}else{bit(0,8,2,1,dark);bit(10,8,2,1,dark)}
      ctx.restore();
    }
    function backdrop(theme='park'){
      const water=theme==='swim',inside=['school','hygiene','memory','quiz'].includes(theme);
      rect(0,0,W,H,water?'#99dce5':inside?'#f5ddb1':'#a9d8c1');
      if(water){for(let i=0;i<12;i++){rect(0,110+i*42,W,3,i%2?'#69b9d4':'#d4f4eb');for(let x=0;x<W;x+=75)rect(x+(i%2)*25,125+i*42,40,3,'#d6f4ec')}}
      else if(inside){rect(0,430,W,220,'#b58664');for(let y=450;y<H;y+=34)rect(0,y,W,3,'#88624e');rect(20,110,105,105,'#9d7654');rect(27,117,91,91,'#addced');rect(72,117,4,91,'#9d7654');rect(27,161,91,4,'#9d7654');rect(300,160,65,125,'#aa8063')}
      else{rect(0,390,W,260,'#92bc75');rect(0,455,W,195,'#81ae66');for(let x=15;x<W;x+=49){rect(x,405+(x%3)*18,7,7,'#f5dc84');rect(x+4,417+(x%3)*18,7,7,'#f4abc0')}rect(24,134,62,120,'#618c60');rect(10,200,90,70,'#76a56d');rect(327,158,42,100,'#608b61')}
    }
    function setControls(buttons=[]){controls.innerHTML=buttons.map(([label,key])=>`<button type="button" data-ctl="${key}">${label}</button>`).join('')}
    function setHint(message){instructions.textContent=message}
    function start(kind,id){
      if(task)return false;
      task={kind,id,score:0,misses:0,elapsed:0,phase:'play',round:0,selected:0,started:performance.now()};
      const t=task;
      if(kind==='mini'&&id==='bricks')Object.assign(t,{paddle:195,ball:{x:195,y:385,vx:138,vy:-185},bricks:Array.from({length:5},()=>Array(6).fill(true)),lives:3});
      if((kind==='mini'&&id==='jump')||(kind==='exercise'&&id==='jump'))Object.assign(t,{rope:0,jumpTime:0,target:kind==='mini'?8:5});
      if(kind==='mini'&&id==='catch')Object.assign(t,{petX:195,balls:[],spawned:0,spawnClock:0});
      if(kind==='mini'&&id==='memory')nextMemory(t);
      if(kind==='mini'&&id==='quiz')Object.assign(t,{questions:Array.from({length:5},()=>allQuestions[rand(allQuestions.length)]),bubbleClock:0});
      if(kind==='school')Object.assign(t,{drag:null,questionSet:questions[id]||questions.korean});
      if(kind==='hygiene')Object.assign(t,{phaseIndex:0,progress:0,stroke:null});
      if(kind==='exercise'&&id==='walk')Object.assign(t,{petX:80,targets:[290,80,310,165]});
      if(kind==='exercise'&&id==='stretch')Object.assign(t,{hold:0,holding:false});
      if(kind==='exercise'&&id==='ball')Object.assign(t,{ball:{x:80,y:310,vx:145,vy:75}});
      if(kind==='exercise'&&id==='swim')Object.assign(t,{lastDirection:-1,petX:80});
      title.textContent=(kind==='mini'?'?? ':kind==='school'?'?? ':kind==='hygiene'?'?? ':'?? ')+(labels[id]||id);
      layer.hidden=false;document.body.classList.add('in-activity');setControls(controlsFor(t));hint(t);last=performance.now();raf=requestAnimationFrame(frame);return true;
    }
    function controlsFor(t){
      if(t.kind==='mini'&&t.id==='bricks')return [['��','left'],['���� ƨ�⼼��','info'],['��','right']];
      if(t.id==='jump')return [['����!','jump']];
      if(t.kind==='mini'&&t.id==='catch')return [['��','left'],['ĳ���͸� �巡��','info'],['��','right']];
      if(t.kind==='mini'&&t.id==='memory')return [['����','0'],['���','1'],['������','2']];
      if(t.kind==='mini'&&t.id==='quiz')return [['��','0'],['��','1'],['��','2']];
      if(t.kind==='school')return [['��','0'],['��','1'],['��','2']];
      if(t.kind==='exercise'&&t.id==='stretch')return [['������ �ֱ�','hold']];
      return [];
    }
    function hint(t){
      const h=t.kind==='mini'?({bricks:'�ٸ� �¿�� �巡���� ���� �޾� ������ ������.',catch:'ĳ���͸� �¿�� ������ �������� ���� ��������.',jump:'���� �߿� �� �� ȭ���� ���� ���� �����ϼ���.',memory:t.phase==='show'?'������ ������ ������ ����ϼ���.':'����� ������� ������ ��ġ�ϼ���.',quiz:'�����̴� ���� ���� ��ġ�ϼ���.'})[t.id]:t.kind==='school'?'�� ī�带 ���� ���ڷ� ����� ��������.':t.kind==='hygiene'?['�񴩸� �ٸ��� ��������.','�������� ��������.','���� ����� ��������.'][t.phaseIndex]:({walk:'ĳ���͸� �巡���� ��¦�̴� ���� �ɾ��.',stretch:'ȭ���̳� ��ư�� �� ���� �ڼ��� �����ؿ�.',jump:'���� �߿� �� �� ȭ���� ���� �����ϼ���.',ball:'�����̴� ���� ���� ��ġ�� �޾ƿ�.',swim:'�¿� ������ �հ����� �о� ����Ŀ�.'})[t.id];setHint(h||'ȭ���� ��ġ�� �Բ� ��ƿ�.')
    }
    function nextMemory(t){t.phase='show';t.sequence=Array.from({length:3+t.round},()=>rand(3));t.input=0;t.showTime=0}
    function complete(){if(!task||task.phase==='finish')return;const t=task;t.phase='finish';setHint(`${labels[t.id]} �Ϸ�! ${t.score}�� �� ��� �� ���ư��ϴ�.`);tone?.(770);setTimeout(()=>{if(task!==t)return;const result={kind:t.kind,id:t.id,score:t.score,misses:t.misses,round:t.round};stop(false);onComplete(result)},900)}
    function stop(cancel=true){if(!task)return;cancelAnimationFrame(raf);task=null;pointer=null;layer.hidden=true;document.body.classList.remove('in-activity');controls.innerHTML='';if(cancel)onCancel?.()}
    function jump(){if(!task||task.phase==='finish')return;task.jumpTime=.58;tone?.(650)}
    function choose(index){const t=task;if(!t||t.phase==='finish')return;
      if(t.kind==='mini'&&t.id==='memory'){if(t.phase!=='input')return;if(index===t.sequence[t.input]){t.input++;tone?.(700);if(t.input===t.sequence.length){t.score+=t.sequence.length;t.round++;if(t.round>=3)complete();else{nextMemory(t);hint(t)}}}else{t.misses++;t.round++;tone?.(250);if(t.round>=3)complete();else{nextMemory(t);hint(t)}}}
      else if(t.kind==='mini'&&t.id==='quiz'){const q=t.questions[t.round];if(index===q[2]){t.score++;tone?.(700)}else{t.misses++;tone?.(260)}t.round++;if(t.round>=5)complete()}
      else if(t.kind==='school'){const q=t.questionSet[t.round];if(index===q[2]){t.score++;tone?.(700)}else{t.misses++;tone?.(260)}t.round++;t.drag=null;if(t.round>=3)complete()}
    }
    function act(key){const t=task;if(!t||t.phase==='finish')return;if(key==='info')return;
      if(key==='left'||key==='right'){const dx=key==='left'?-48:48;if(t.id==='bricks')t.paddle=clamp(t.paddle+dx,48,342);if(t.id==='catch')t.petX=clamp(t.petX+dx,30,360);if(t.id==='walk')walkTo(t,t.petX+dx);return}
      if(key==='jump'){jump();return}
      if(key==='hold'){t.holding=true;return}
      if(['0','1','2'].includes(key)){choose(Number(key));return}
    }
    function walkTo(t,x){t.petX=clamp(x,32,358);const target=t.targets[t.score];if(target!==undefined&&Math.abs(t.petX-target)<28){t.score++;tone?.(670);if(t.score>=t.targets.length)complete()}}
    function pointerDown(e){const t=task;if(!t||t.phase==='finish')return;const p=pos(e);pointer={x:p.x,y:p.y,startX:p.x,startY:p.y};canvas.setPointerCapture?.(e.pointerId);
      if(t.id==='bricks')t.paddle=clamp(p.x,48,342);
      else if(t.kind==='mini'&&t.id==='catch')t.petX=clamp(p.x,30,360);
      else if(t.id==='jump')jump();
      else if(t.kind==='mini'&&t.id==='memory'){if(p.y>265&&p.y<435)choose(clamp(Math.floor(p.x/130),0,2))}
      else if(t.kind==='mini'&&t.id==='quiz'){if(p.y>220&&p.y<410)choose(clamp(Math.floor(p.x/130),0,2))}
      else if(t.kind==='school'){if(p.y>350&&p.y<470)t.drag={index:clamp(Math.floor(p.x/130),0,2),x:p.x,y:p.y}}
      else if(t.kind==='hygiene')t.stroke=p;
      else if(t.id==='walk')walkTo(t,p.x);
      else if(t.id==='stretch')t.holding=true;
      else if(t.id==='ball'){const b=t.ball;if(Math.hypot(p.x-b.x,p.y-b.y)<60){t.score++;tone?.(730);b.x=55+rand(280);b.y=180+rand(210);if(t.score>=5)complete()}else{t.misses++;tone?.(270)}}
    }
    function pointerMove(e){const t=task;if(!t||!pointer||t.phase==='finish')return;const p=pos(e);
      if(t.id==='bricks')t.paddle=clamp(p.x,48,342);
      else if(t.kind==='mini'&&t.id==='catch')t.petX=clamp(p.x,30,360);
      else if(t.kind==='school'&&t.drag){t.drag.x=p.x;t.drag.y=p.y}
      else if(t.kind==='hygiene'&&t.stroke){const d=Math.hypot(p.x-t.stroke.x,p.y-t.stroke.y);if(d>5&&p.y>130&&p.y<500){t.progress+=Math.min(d,65);t.stroke=p;if(t.progress>=250){t.score++;t.phaseIndex++;t.progress=0;t.stroke=null;tone?.(720);if(t.phaseIndex>=3)complete();else hint(t)}}}
      else if(t.id==='walk')walkTo(t,p.x);
      pointer.x=p.x;pointer.y=p.y;
    }
    function pointerUp(e){const t=task;if(!t||!pointer)return;const p=pos(e);
      if(t.kind==='school'&&t.drag){const index=t.drag.index;t.drag=null;if(p.y>140&&p.y<270)choose(index)}
      if(t.id==='swim'){const dx=p.x-pointer.startX,dir=Math.sign(dx);if(Math.abs(dx)>55&&dir!==t.lastDirection){t.lastDirection=dir;t.score++;t.petX=clamp(t.petX+38,80,330);tone?.(650);if(t.score>=6)complete()}else if(Math.abs(dx)>40){t.misses++;tone?.(260)}}
      if(t.id==='stretch')t.holding=false;
      if(t.kind==='hygiene')t.stroke=null;
      pointer=null;
    }
    function frame(now){const t=task;if(!t)return;const dt=Math.min(.04,Math.max(0,(now-last)/1000));last=now;if(t.phase!=='finish'){t.elapsed+=dt;update(t,dt)}draw(t);raf=requestAnimationFrame(frame)}
    function update(t,dt){
      if(t.kind==='mini'&&t.id==='bricks'){
        const b=t.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<12||b.x>378){b.x=clamp(b.x,12,378);b.vx*=-1}if(b.y<83){b.y=83;b.vy=Math.abs(b.vy)}
        for(let r=0;r<5;r++)for(let c=0;c<6;c++)if(t.bricks[r][c]){const x=24+c*57,y=112+r*26;if(b.x>x-6&&b.x<x+57&&b.y>y-6&&b.y<y+24){t.bricks[r][c]=false;b.vy*=-1;t.score++;tone?.(550+r*50);if(t.score>=30)complete();r=5;break}}
        if(b.vy>0&&b.y>465&&b.y<484&&Math.abs(b.x-t.paddle)<52){b.vy=-Math.abs(b.vy)*1.025;b.vx=clamp(b.vx+(b.x-t.paddle)*2.3,-250,250);tone?.(430)}
        if(b.y>525){t.lives--;t.misses++;if(t.lives<=0)complete();else t.ball={x:t.paddle,y:390,vx:(rand(2)?1:-1)*135,vy:-180}}
        if(t.elapsed>75)complete();
      }
      else if(t.id==='jump'){t.jumpTime=Math.max(0,t.jumpTime-dt);t.rope+=dt*.8;if(t.rope>=1){t.rope-=1;if(t.jumpTime>0){t.score++;tone?.(720)}else{t.misses++;tone?.(240)}if(t.score>=t.target||t.misses>=10)complete()}if(t.elapsed>35)complete()}
      else if(t.kind==='mini'&&t.id==='catch'){t.spawnClock+=dt;if(t.spawned<10&&t.spawnClock>.82){t.spawnClock=0;t.spawned++;t.balls.push({x:45+rand(300),y:100,vy:135+rand(75)})}for(const b of t.balls)b.y+=b.vy*dt;const keep=[];for(const b of t.balls){if(b.y>420){if(Math.abs(b.x-t.petX)<45){t.score++;tone?.(670)}else{t.misses++;tone?.(230)}}else keep.push(b)}t.balls=keep;if((t.spawned>=10&&!t.balls.length)||t.elapsed>27)complete()}
      else if(t.kind==='mini'&&t.id==='memory'&&t.phase==='show'){t.showTime+=dt;if(t.showTime>t.sequence.length*.65+.65){t.phase='input';hint(t)}}
      else if(t.kind==='mini'&&t.id==='quiz'){t.bubbleClock+=dt}
      else if(t.kind==='exercise'&&t.id==='stretch'&&t.holding){t.hold+=dt;if(t.hold>=1.15){t.hold=0;t.score++;tone?.(720);if(t.score>=3)complete()}}
      else if(t.kind==='exercise'&&t.id==='ball'){const b=t.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<42||b.x>348)b.vx*=-1;if(b.y<165||b.y>397)b.vy*=-1;if(t.elapsed>32)complete()}
    }
    function draw(t){
      const theme=t.kind==='hygiene'?'hygiene':t.kind==='school'?'school':t.id==='memory'?'memory':t.id==='quiz'?'quiz':t.id==='swim'?'swim':'park';backdrop(theme);
      if(t.id==='bricks'&&t.kind==='mini'){rect(0,75,W,455,'#bbd9b4');for(let r=0;r<5;r++)for(let c=0;c<6;c++)if(t.bricks[r][c]){const colors=['#ef9b95','#f2bd75','#f0d87a','#9ccb9e','#8fbdd8'];rect(24+c*57,112+r*26,52,19,'#36574c');rect(27+c*57,115+r*26,46,13,colors[r])}rect(t.paddle-48,475,96,14,'#34564a');rect(t.paddle-42,478,84,8,'#e2a565');rect(t.ball.x-7,t.ball.y-7,14,14,'#34564a');rect(t.ball.x-4,t.ball.y-4,8,8,'#fff8d5');text(`���� �� ${t.lives}��`,195,89,14)}
      else if(t.id==='jump'){const airborne=t.jumpTime>0;pet(195,350-(airborne?50*Math.sin(Math.PI*(1-t.jumpTime/.58)):0),100,airborne?'jump':'stand');const a=t.rope*TAU;ctx.strokeStyle='#7d5b49';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(92,353);ctx.quadraticCurveTo(195,353+85*Math.sin(a),298,353);ctx.stroke();rect(88,343,12,22,'#634735');rect(290,343,12,22,'#634735');text(`${t.score}/${t.target}ȸ �� �Ǽ� ${t.misses}/10`,195,132,18)}
      else if(t.id==='catch'&&t.kind==='mini'){pet(t.petX,410,90);for(const b of t.balls){rect(b.x-15,b.y-15,30,30,'#3d6048');rect(b.x-12,b.y-12,24,24,'#f5cd6c');rect(b.x-4,b.y-12,8,24,'#fff2c8')}text(`${t.score}/10�� �ޱ�`,195,130,19)}
      else if(t.id==='memory'&&t.kind==='mini'){pet(195,205,90);const highlight=t.phase==='show'?t.sequence[Math.floor(t.showTime/.65)]:-1;text(t.phase==='show'?'������ ����ϼ���':'���� ������ ��ġ�ϼ���',195,135,19);for(let i=0;i<3;i++){const x=20+i*125;rect(x,307,105,105,'#38564b');rect(x+6,313,93,93,i===highlight?'#fff1a8':['#e8a0a4','#a6c9e7','#add4a2'][i]);text(['A','B','C'][i],x+52,374,30)}text(`${t.round+1}/3�ܰ� �� ${t.input}/${t.sequence.length}`,195,447,16)}
      else if(t.id==='quiz'&&t.kind==='mini'){const q=t.questions[t.round]||t.questions[4];pet(195,170,75);rect(25,220,340,52,'#fff5dc');text(q[0],195,254,16);for(let i=0;i<3;i++){const x=65+i*128,y=338+18*Math.sin(t.bubbleClock*2+i);rect(x-47,y-37,94,74,'#3b5c4e');rect(x-42,y-32,84,64,['#f4c27b','#a8d0e5','#a8d8ae'][i]);text(q[1][i],x,y+6,15)}text(`${t.round+1}/5����`,195,447,16)}
      else if(t.kind==='school'){const q=t.questionSet[t.round]||t.questionSet[2];pet(70,340,70);rect(21,145,348,112,'#715a44');rect(29,153,332,96,'#4b765f');text(q[0],195,196,18,'#fffbe7');text('������ ����� ������� ��',195,230,13,'#fff3b6');for(let i=0;i<3;i++){const x=t.drag?.index===i?t.drag.x:65+i*130,y=t.drag?.index===i?t.drag.y:405;rect(x-53,y-31,106,62,'#584b3a');rect(x-49,y-27,98,54,['#f5c580','#a5d1e9','#add4a2'][i]);text(q[1][i],x,y+6,15)}text(`${t.round+1}/3����`,195,484,16)}
      else if(t.kind==='hygiene'){pet(195,315,140);for(let i=0;i<13;i++){const x=45+(i*77)%300,y=170+(i*91)%260;ctx.strokeStyle='#f9fcf0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,5+(i%3)*5,0,TAU);ctx.stroke()}text(['��ĥ','��������','�󱸱�'][t.phaseIndex]||'�Ϸ�',195,130,22);rect(50,470,290,19,'#4e6d66');rect(54,474,282*(t.progress/250),11,'#8dcbd6');text(`${Math.round(t.progress/250*100)}%`,195,516,17)}
      else if(t.kind==='exercise'&&t.id==='walk'){for(let i=0;i<4;i++){const x=t.targets[i];rect(x-13,410,26,26,i===t.score?'#f8d86a':'#659a74')}pet(t.petX,360,95);text(`${t.score}/4�� �� ã��`,195,142,19)}
      else if(t.kind==='exercise'&&t.id==='stretch'){pet(195,330,120,t.holding?'stretch':'stand');rect(64,449,262,17,'#4c6b55');rect(68,453,254*(t.hold/1.15),9,'#f1d174');text(`${t.score}/3�ڼ�`,195,138,19)}
      else if(t.kind==='exercise'&&t.id==='ball'){pet(145,390,100);const b=t.ball;rect(b.x-23,b.y-23,46,46,'#33534a');rect(b.x-19,b.y-19,38,38,'#f6df9a');rect(b.x-5,b.y-19,10,38,'#fff9e8');text(`${t.score}/5�� �� �ޱ�`,195,136,19)}
      else if(t.kind==='exercise'&&t.id==='swim'){pet(t.petX,330,100,'swim');text(`${t.score}/6�� ���ġ��`,195,142,19);text(t.lastDirection<0?'������ ��':'������ ��',195,438,19)}
      if(t.phase==='finish'){rect(26,254,338,104,'#36584ce9');text('���߾�! '+t.score+'��',195,319,27,'#fff7d9')}
      scoreLabel.textContent=t.kind==='mini'||t.kind==='school'?`${t.score}��`:`${t.score}ȸ`;
    }
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
    controls.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-ctl]');if(b?.dataset.ctl==='hold'&&task?.id==='stretch')task.holding=true});
    controls.addEventListener('pointerup',e=>{if(task?.id==='stretch')task.holding=false});
    controls.addEventListener('click',e=>{const b=e.target.closest('[data-ctl]');if(b&&b.dataset.ctl!=='hold')act(b.dataset.ctl)});
    document.getElementById('activityExit').addEventListener('click',()=>stop(true));
    return {start,active:()=>!!task,quit:()=>stop(true),key(key){const t=task;if(!t)return;if(t.id==='jump'){if(key==='B')jump();return}if(t.id==='bricks'||t.id==='catch'){if(key==='A')act('left');if(key==='C')act('right');return}if(t.id==='memory'||t.id==='quiz'||t.kind==='school'){choose(({A:0,B:1,C:2})[key]);return}if(t.id==='stretch'){if(key==='B'){t.holding=true;setTimeout(()=>{if(task===t)t.holding=false},1200)}return}if(t.id==='walk'){if(key==='A')act('left');if(key==='C')act('right')}}};
  }
  return {create};
})();
