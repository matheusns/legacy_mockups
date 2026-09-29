(() => {
  const G=window.LegacyGeek;
  const viewport=document.querySelector("[data-viewport]");
  const canvas=document.querySelector("[data-canvas]");
  const phases=G.PHASES;
  let scale=.78, x=0, y=0, dragging=false, startX=0, startY=0, baseX=0, baseY=0;

  function center(){
    const r=viewport.getBoundingClientRect();
    scale=Math.min(r.width/900,r.height/1050,.88);
    x=r.width/2-650*scale;
    y=r.height/2-725*scale;
    apply();
  }
  function apply(){canvas.style.transform="translate("+x+"px,"+y+"px) scale("+scale+")"}
  function clampScale(v){return Math.max(.45,Math.min(1.45,v))}
  function zoomAt(cx,cy,next){
    const rect=viewport.getBoundingClientRect();
    const px=cx-rect.left,py=cy-rect.top;
    const worldX=(px-x)/scale,worldY=(py-y)/scale;
    scale=clampScale(next);
    x=px-worldX*scale;y=py-worldY*scale;apply();
  }

  viewport.addEventListener("pointerdown",e=>{
    dragging=true;viewport.classList.add("dragging");viewport.setPointerCapture(e.pointerId);
    startX=e.clientX;startY=e.clientY;baseX=x;baseY=y;
  });
  viewport.addEventListener("pointermove",e=>{
    if(!dragging)return;x=baseX+(e.clientX-startX);y=baseY+(e.clientY-startY);apply();
  });
  const stop=e=>{dragging=false;viewport.classList.remove("dragging");try{viewport.releasePointerCapture(e.pointerId)}catch{}};
  viewport.addEventListener("pointerup",stop);viewport.addEventListener("pointercancel",stop);
  viewport.addEventListener("wheel",e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,scale*(e.deltaY>0?.9:1.1))},{passive:false});

  let pinch=null;
  viewport.addEventListener("touchstart",e=>{
    if(e.touches.length===2){
      pinch={d:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),scale};
    }
  },{passive:true});
  viewport.addEventListener("touchmove",e=>{
    if(e.touches.length===2&&pinch){
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const cx=(e.touches[0].clientX+e.touches[1].clientX)/2,cy=(e.touches[0].clientY+e.touches[1].clientY)/2;
      zoomAt(cx,cy,pinch.scale*d/pinch.d);
    }
  },{passive:true});

  function select(id){
    G.setSelectedPhase(id);
    document.querySelectorAll(".island-hotspot").forEach(b=>b.classList.toggle("selected",b.dataset.phase===id));
    const p=phases[id],pct=G.phaseCompletion(id);
    document.querySelector("[data-map-icon]").textContent=p.icon;
    document.querySelector("[data-map-theme]").textContent=p.theme.toUpperCase();
    document.querySelector("[data-map-title]").textContent=p.title;
    document.querySelector("[data-map-tagline]").textContent=p.tagline;
    document.querySelector("[data-map-pct]").textContent=pct;
    const a=document.querySelector("[data-continue]");
    a.href="./island?phase="+id;a.textContent="▶ Continue in "+p.title;
  }

  document.querySelectorAll(".island-hotspot").forEach(b=>{
    b.addEventListener("click",e=>{if(Math.abs(e.clientX-startX)>8||Math.abs(e.clientY-startY)>8)return;select(b.dataset.phase)});
    b.addEventListener("dblclick",()=>location.href="./island?phase="+b.dataset.phase);
  });
  document.querySelector("[data-fit]").addEventListener("click",center);

  Object.keys(phases).forEach(id=>{
    document.querySelector('[data-phase-pct="'+id+'"]').textContent=G.phaseCompletion(id);
  });
  const unlocked=Object.keys(phases).filter(id=>G.phaseCompletion(id)>0).length;
  document.querySelector("[data-region-count]").textContent=unlocked+" / 5";
  select(G.state.selectedPhase||"career");
  window.addEventListener("resize",center);
  center();
})();