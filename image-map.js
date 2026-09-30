(() => {
  const G=window.LegacyGeek;
  const crop=document.querySelector("[data-map-crop]");
  const content=document.querySelector("[data-map-transform]");
  const feedback=document.querySelector("[data-map-feedback]");
  const toast=document.querySelector("[data-toast]");
  let toastTimer, scale=1, tx=0, ty=0, dragging=false, moved=false, sx=0, sy=0, bx=0, by=0;
  let selected=G.state.selectedPhase||"foundation";
  let lastTap={id:null,time:0};

  function notify(message){
    clearTimeout(toastTimer); toast.textContent=message; toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},1800);
  }
  function apply(){content.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`}
  function reset(){scale=1;tx=0;ty=0;apply();notify("Map view reset")}
  function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
  function select(id,open=false){
    selected=id;G.setSelectedPhase(id);
    document.querySelectorAll(".map-hit").forEach(b=>b.classList.toggle("selected",b.dataset.phase===id));
    const p=G.PHASES[id];
    feedback.textContent=p.title+" selected · "+G.phaseCompletion(id)+"% complete";
    feedback.classList.add("show");setTimeout(()=>feedback.classList.remove("show"),1500);
    if(open){
      if(id==="career") location.href="./island?phase=career";
      else{
        document.querySelector("#genericTitle").textContent=p.title+" Island";
        document.querySelector("[data-generic-body]").innerHTML=
          "<p>"+p.tagline+"</p><p>This image-first production pass uses <strong>Career Island</strong> as the exact visual reference for the island-detail workflow. The goal/task hierarchy is shared across islands, but only the Career visual has been approved for exact rendering.</p><button class='sheet-cta' type='button' data-open-career>Open approved Career reference</button>";
        document.querySelector("#genericDialog").showModal();
        setTimeout(()=>document.querySelector("[data-open-career]")?.addEventListener("click",()=>location.href="./island?phase=career"),0);
      }
    }
  }

  crop.addEventListener("pointerdown",e=>{
    dragging=true;moved=false;sx=e.clientX;sy=e.clientY;bx=tx;by=ty;crop.setPointerCapture(e.pointerId);
  });
  crop.addEventListener("pointermove",e=>{
    if(!dragging)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(Math.abs(dx)+Math.abs(dy)>6)moved=true;
    tx=bx+dx;ty=by+dy;apply();
  });
  function stop(e){dragging=false;try{crop.releasePointerCapture(e.pointerId)}catch{}}
  crop.addEventListener("pointerup",stop);crop.addEventListener("pointercancel",stop);

  crop.addEventListener("wheel",e=>{
    e.preventDefault();
    const rect=crop.getBoundingClientRect();
    const px=e.clientX-rect.left,py=e.clientY-rect.top;
    const old=scale,next=clamp(old*(e.deltaY>0?.9:1.1),.78,1.55);
    tx=px-(px-tx)*(next/old);ty=py-(py-ty)*(next/old);scale=next;apply();
  },{passive:false});

  let pinch=null;
  crop.addEventListener("touchstart",e=>{
    if(e.touches.length===2){
      const a=e.touches[0],b=e.touches[1];
      pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),scale,tx,ty,
        cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2};
    }
  },{passive:true});
  crop.addEventListener("touchmove",e=>{
    if(e.touches.length===2&&pinch){
      const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
      scale=clamp(pinch.scale*d/pinch.d,.78,1.55);
      tx=pinch.tx;ty=pinch.ty;apply();
    }
  },{passive:true});

  document.querySelectorAll(".map-hit").forEach(btn=>btn.addEventListener("click",e=>{
    if(moved){e.preventDefault();return}
    const id=btn.dataset.phase,now=Date.now(),dbl=lastTap.id===id&&now-lastTap.time<550;
    lastTap={id,time:now};select(id,dbl);
  }));

  document.querySelector("[data-continue]").addEventListener("click",()=>select(selected,true));
  document.querySelector("[data-reset-map]").addEventListener("click",reset);
  document.querySelector("[data-tasks]").addEventListener("click",()=>{
    document.querySelector("#genericTitle").textContent="Tasks";
    document.querySelector("[data-generic-body]").innerHTML="<p>Tasks are registered from Home or directly inside a goal so every action keeps its island and horizon context.</p><button class='sheet-cta' type='button' data-open-goals>Open Goals</button>";
    document.querySelector("#genericDialog").showModal();
    setTimeout(()=>document.querySelector("[data-open-goals]")?.addEventListener("click",()=>location.href="./island?phase=career"),0);
  });
  document.querySelector("[data-journal]").addEventListener("click",()=>{
    document.querySelector("#genericTitle").textContent="Journal";
    document.querySelector("[data-generic-body]").innerHTML="<p>Journal remains browser-local in this mockup. Island notes are available from the Career page.</p>";
    document.querySelector("#genericDialog").showModal();
  });

  select(selected,false);apply();
})();