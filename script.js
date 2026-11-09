(function(){
  var NS="http://www.w3.org/2000/svg", C3=.866, ED="rgba(40,50,45,.28)";
  function $(id){return document.getElementById(id);}
  /* ===== phép chiếu isometric: x → phải-xuống, y → trái-xuống, z → lên ===== */
  function P(x,y,z){return [(x-y)*C3,(x+y)*.5-z];}
  function F(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}
  function pl(a,fill,st,sw){return '<polygon points="'+a.map(F).join(" ")+'" fill="'+fill+'"'+(st?' stroke="'+st+'" stroke-width="'+(sw||.4)+'"':'')+'/>';}
  function line(a,b,st,w,extra){return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+st+'" stroke-width="'+w+'" stroke-linecap="round" '+(extra||"")+'/>';}
  function sh(c,f){return "rgb("+c.map(function(v){return Math.min(255,Math.round(v*f));}).join(",")+")";}
  function box(x0,x1,y0,y1,z0,z1,c){
    return pl([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],sh(c,1.08),ED)+
           pl([P(x0,y1,z1),P(x1,y1,z1),P(x1,y1,z0),P(x0,y1,z0)],sh(c,.88),ED)+
           pl([P(x1,y0,z1),P(x1,y1,z1),P(x1,y1,z0),P(x1,y0,z0)],sh(c,.66),ED);
  }
  function ring(x,cy,cz,r,N){var o=[],i;for(i=0;i<N;i++){var a=2*Math.PI*i/N;o.push(P(x,cy+r*Math.cos(a),cz+r*Math.sin(a)));}return o;}
  /* trụ nằm dọc trục X */
  function cyl(x0,x1,cy,cz,r,c,N){
    N=N||26;var o="",i;
    for(i=0;i<N;i++){
      var a=2*Math.PI*i/N,b=2*Math.PI*(i+1)/N,m=(a+b)/2;
      if(Math.cos(m)+Math.sin(m)<-.12)continue;
      var f=.62+.42*((Math.sin(m)+Math.cos(m)*.5+1.5)/3),col=sh(c,f);
      o+=pl([P(x0,cy+r*Math.cos(a),cz+r*Math.sin(a)),P(x1,cy+r*Math.cos(a),cz+r*Math.sin(a)),P(x1,cy+r*Math.cos(b),cz+r*Math.sin(b)),P(x0,cy+r*Math.cos(b),cz+r*Math.sin(b))],col,col,.5);
    }
    return o+pl(ring(x1,cy,cz,r,N),sh(c,1.06),ED);
  }
  function rimLine(x,cy,cz,r,col){return '<polygon points="'+ring(x,cy,cz,r,30).map(F).join(" ")+'" fill="none" stroke="'+col+'" stroke-width=".7"/>';}
  function poly3(pts,st,w,dash){return '<polyline points="'+pts.map(function(p){return F(P(p[0],p[1],p[2]));}).join(" ")+'" fill="none" stroke="'+st+'" stroke-width="'+w+'" stroke-linejoin="round"/>';}

  /* ===== thông số ===== */
  var Zw=20, Ycut=30, LF=40, WC=[234,222,84], MAXL=8, BLADE_DY=7;
  var Tfeed=1.3, Td=.22, Tu=.3, Tc=Tfeed+Td+Tu;
  function ease(u){return (1-Math.cos(Math.PI*u))/2;}
  var ph=0, s=0, travel=0, pileN=3, fly=null, cutDone=false, bladeDy=0, paused=false, speed=1;

  /* ===== lớp tĩnh 1: sàn, dây, biến tần, cuộn vải, con lăn dưới, motor ===== */
  var s1="";
  s1+=pl([P(-52,-150,0),P(118,-150,0),P(118,135,0),P(-52,135,0)],"rgba(255,255,255,.22)","rgba(205,215,100,.85)",1);
  var wG=[[-37,-4,0],[-37,-30,0],[106,-30,0],[106,-12,0],[106,-12,5]],
      wO=[[-33,-4,0],[-33,-38,0],[110,-38,0],[110,30,0],[76,30,0],[76,30,30]],
      wC=[[-29,-4,0],[-29,30,0],[-12,30,0],[-12,30,18]];
  s1+=poly3(wG,"#8fc22e",1.2)+poly3(wO,"#e8a23c",1.2)+poly3(wC,"#2fb4c8",1.2);
  /* Unidrive SP */
  var dx0=-45,dx1=-29,dy0=-20,dy1=-4,dz=72;
  s1+=box(dx0,dx1,dy0,dy1,0,dz,[240,243,244]);
  function fy(u0,u1,v0,v1,fill){return pl([P(dx0+u0*16,dy1,v1*dz),P(dx0+u1*16,dy1,v1*dz),P(dx0+u1*16,dy1,v0*dz),P(dx0+u0*16,dy1,v0*dz)],fill);}
  s1+=fy(.18,.82,.78,.9,"#2c3237")+fy(.24,.76,.8,.88,"#aeb9b8")+fy(.18,.82,.45,.7,"#4fbf4a")+fy(.18,.82,.72,.76,"#c6ccce");
  /* cuộn vải lớn + mặt bên */
  s1+=cyl(-4,64,-100,34,22,[214,198,52],30);
  s1+=rimLine(64,-100,34,16,"rgba(120,105,20,.6)")+rimLine(64,-100,34,10,"rgba(120,105,20,.6)");
  /* giá đỡ cuộn vải: chân đế + trụ + trục */
  s1+=box(60,74,-114,-86,0,3,[170,175,178])+box(66,70,-106,-94,3,38,[222,226,228])+cyl(64,77,-100,34,5.5,[200,204,206],18);
  /* đoạn vải dốc từ cuộn xuống con lăn */
  $("g1").innerHTML=s1; s1="";
  /* con lăn căng (dancer) + cánh tay kéo */
  /* đe dưới dao: vải đi giữa đe và dao */
  s1+=box(-6,66,27,42,6,Zw-1.6,[62,65,68]);
  /* con lăn dưới + Unimotor */
  s1+=cyl(-4,64,-12,11,9,[200,205,208]);
  var mot=cyl(67,70,-12,11,11,[150,155,158]), xm;
  for(xm=70;xm<100;xm+=5)mot+=cyl(xm,xm+3.4,-12,11,7.6,[44,47,50],18)+cyl(xm+3.4,xm+5,-12,11,6,[30,32,35],18);
  mot+=cyl(100,104,-12,11,6,[165,170,172],18);
  $("g1b").innerHTML=s1;

  /* ===== lớp tĩnh 2: con lăn trên + trụ trái ===== */
  $("g2").innerHTML=cyl(-4,64,-12,29,9,[205,209,211])+box(64,67,-26,2,0,42,[214,218,220])+cyl(67,68,-12,29,7,[232,235,236])+mot+box(-12,-6,24,36,0,56,[225,229,230]);
  /* ===== lớp tĩnh 3: trụ phải, xà ngang, cảm biến ===== */
  $("g3").innerHTML=box(66,72,24,36,0,56,[225,229,230])+box(-12,72,24,36,56,62,[215,220,222])+box(74,80,27,33,30,37,[45,61,184]);

  /* ===== dây tín hiệu ===== */
  function proj(w){return w.map(function(p){return P(p[0],p[1],p[2]);});}
  var pG=proj(wG),pO=proj(wO),pC=proj(wC);
  $("gDots").innerHTML='<circle id="dG" r="2.6" fill="#f4ffb0" stroke="#8fc22e" stroke-width=".6"/><circle id="dO" r="2.6" fill="#ffe1a0" stroke="#e8a23c" stroke-width=".6"/><circle id="dC" r="2.6" fill="#b8f6ff" stroke="#2fb4c8" stroke-width=".6"/>';
  function along(path,u){
    var L=[],tot=0,k;
    for(k=0;k<path.length-1;k++){var d=Math.hypot(path[k+1][0]-path[k][0],path[k+1][1]-path[k][1]);L.push(d);tot+=d;}
    var t=u*tot;
    for(k=0;k<L.length;k++){if(t<=L[k]){var r=t/L[k];return [path[k][0]+(path[k+1][0]-path[k][0])*r,path[k][1]+(path[k+1][1]-path[k][1])*r];}t-=L[k];}
    return path[path.length-1];
  }
  function dot(id,path,u,on){var d=$(id);if(!on){d.setAttribute("opacity",0);return;}var p=along(path,Math.max(0,Math.min(1,u)));d.setAttribute("cx",p[0]);d.setAttribute("cy",p[1]);d.setAttribute("opacity",1);}

  /* ===== thanh tiến trình ===== */

  /* ===== phần động ===== */
  function nb(t){return t.replace(/stroke="rgba\(40,50,45,\.28\)"/g,'stroke="none"');}
  function drawWeb(){
    var ob=nb(box(-4,64,-22,10,Zw-1.6,Zw,WC)), of=nb(box(-4,64,10,Ycut+s,Zw-1.6,Zw,WC)), k;
    for(k=0;k<3;k++){
      var ym=Ycut-k*LF+s;
      if(ym>-20&&ym<Ycut+s-1){var ln=line(P(-1,ym,Zw),P(61,ym,Zw),"#7d7114",1.1,'stroke-dasharray="2 2"');if(ym<10)ob+=ln;else of+=ln;}
    }
    $("gWeb").innerHTML=ob; $("gWebF").innerHTML=of;
  }
  function drawKnife(){
    $("gKnife").innerHTML=box(-6,66,27,33,30-bladeDy,48-bladeDy,[62,65,68])+box(-6,66,27,33,27-bladeDy,30-bladeDy,[211,58,47]);
  }
  function drawPile(){var o="",k;for(k=0;k<pileN;k++)o+=box(-4,64,84,124,k*2.2,(k+1)*2.2,WC);$("gPile").innerHTML=o;}
  function drawFly(){
    if(!fly){$("gFly").innerHTML="";return;}
    var e=Math.min(1,fly.t);e=e*e;
    var ya=Ycut+(84-Ycut)*e, top=pileN*2.2+2.2, za=Zw+(top-Zw)*e;
    $("gFly").innerHTML=box(-4,64,ya,ya+LF,za-2.2,za,WC);
  }
  function spoke(x,cy,cz,r,deg){var t=deg*Math.PI/180;return line(P(x,cy,cz),P(x,cy+r*Math.cos(t),cz+r*Math.sin(t)),"#555a5d",1.3);}
  var cyc=0;
  /* cuộn căng + cánh tay: thỉnh thoảng đưa ra để kéo lại vải */
  function drawDan(){
    var th=(cyc%2===0)?0.17*Math.pow(Math.sin(Math.PI*ph/Tc),2):0, c=Math.cos(th), sn=Math.sin(th);
    var Hy=-100,Hz=34,vy=27,vz=-25,R=5;
    var Iy=Hy+vy*c-vz*sn, Iz=Hz+vy*sn+vz*c, k, o="";
    var pts=[[-78,34],[Iy-R,Iz]];
    for(k=1;k<=4;k++){var a=Math.PI*(1+k/8);pts.push([Iy+R*Math.cos(a),Iz+R*Math.sin(a)]);}
    pts.push([-22,Zw]);
    for(k=0;k<pts.length-1;k++){
      var A=pts[k],B=pts[k+1],dy=B[0]-A[0],dz=B[1]-A[1],ln=Math.hypot(dy,dz)||1,col=sh(WC,.8+.24*(dy/ln));
      o+=pl([P(-4,A[0],A[1]),P(64,A[0],A[1]),P(64,B[0],B[1]),P(-4,B[0],B[1])],col,col,.5);
    }
    o+='<polyline id="sdash" points="'+pts.map(function(q){return F(P(30,q[0],q[1]));}).join(" ")+'" fill="none" stroke="#7d7114" stroke-width="1" stroke-dasharray="3 6"/>';
    o+=cyl(-4,64,Iy,Iz,R,[120,124,127],18)+cyl(64,77,Iy,Iz,1.6,[90,94,97],10);
    var ay=Iy-Hy,az=Iz-Hz,al=Math.hypot(ay,az),ny=-az/al*1.8,nz=ay/al*1.8;
    o+=pl([P(77,Hy+ny,Hz+nz),P(77,Hy-ny,Hz-nz),P(77,Iy-ny,Iz-nz),P(77,Iy+ny,Iz+nz)],"#44494c",ED)+pl(ring(77,Hy,Hz,3.6,14),"#b4b9bc",ED)+pl(ring(77,Iy,Iz,3.2,14),"#b4b9bc",ED);
    $("gDan").innerHTML=o;
  }
  function render(){
    drawDan(); drawWeb(); drawKnife(); drawFly();
    $("gSp").innerHTML=spoke(64,-100,34,16,-travel*2.2)+spoke(68,-12,29,6,travel*7);
    $("sdash").setAttribute("stroke-dashoffset",travel*.5);
    dot("dG",pG,ph/Tfeed,ph<Tfeed);
    var uc=(ph-(Tfeed-.35))/.55, onC=uc>=0&&uc<=1;
    dot("dO",pO,uc,onC); dot("dC",pC,uc,onC);
  }
  function step(dt){
    ph+=dt; if(ph>=Tc){ph-=Tc;cutDone=false;cyc++;}
    if(ph<Tfeed){var ns=LF*ease(ph/Tfeed);travel+=ns-s;s=ns;bladeDy=0;}
    else if(ph<Tfeed+Td){var u=(ph-Tfeed)/Td;bladeDy=BLADE_DY*u*u;}
    else{
      if(!cutDone){cutDone=true;fly={t:0};s=0;bladeDy=BLADE_DY;}
      bladeDy=BLADE_DY*(1-ease((ph-Tfeed-Td)/Tu));
    }
    if(fly){fly.t+=dt/.5;if(fly.t>=1){fly=null;if(pileN>=MAXL)pileN=0;pileN++;drawPile();}}
  }

  /* ===== nút ===== */

  drawPile(); render();

  /* ===== tự căn cảnh vào khung + nhãn ===== */
  var sc=$("scene"), bb={x:-162,y:-112,width:394,height:240};
  var S=Math.min(560/bb.width,352/bb.height), TX=25+(560-bb.width*S)/2-bb.x*S, TY=30+(352-bb.height*S)/2-bb.y*S;
  sc.setAttribute("transform","translate("+TX.toFixed(2)+","+TY.toFixed(2)+") scale("+S.toFixed(3)+")");
  function lab(txt,w,dx,dy,anc){
    var p=P(w[0],w[1],w[2]), x=p[0]*S+TX, y=p[1]*S+TY, x2=x+dx, y2=y+dy;
    $("labels").insertAdjacentHTML("beforeend",
      '<line x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="#fff" stroke-width=".9"/>'+
      '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="1.8" fill="#fff"/>'+
      '<text class="lbl" x="'+(x2+(anc==="end"?-4:4)).toFixed(1)+'" y="'+(y2+3).toFixed(1)+'" text-anchor="'+anc+'">'+txt+'</text>');
  }
  lab("Unidrive SP",[-45,-12,55],-30,-8,"end");
  lab("Unimotor",[100,-12,12],26,10,"start");
  lab("Cut mark Sensor",[80,30,33],22,56,"start");

  var last=0;
  function frame(ts){
    if(!last)last=ts;
    var dt=Math.min(.05,(ts-last)/1000); last=ts;
    if(!paused){step(dt*speed);render();}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
