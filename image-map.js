(() => {
  const G=window.LegacyGeek;
  const feedback=document.querySelector("[data-map-feedback]");
  const toast=document.querySelector("[data-toast]");
  let toastTimer;
  let selected=G.state.selectedPhase||"career";

  function notify(message){
    clearTimeout(toastTimer);
    toast.textContent=message;
    toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},1800);
  }

  function showDialog(id){
    const p=G.PHASES[id];
    document.querySelector("#genericTitle").textContent=p.title+" Island";
    document.querySelector("[data-generic-body]").innerHTML=
      "<p>"+p.tagline+"</p><p>The weekly MVP keeps the approved Career Island as the detailed goal/task workflow while the remaining islands stay selectable on the world map.</p><button class='sheet-cta' type='button' data-open-career>Open Career Island</button>";
    document.querySelector("#genericDialog").showModal();
    setTimeout(()=>document.querySelector("[data-open-career]")?.addEventListener("click",()=>location.href="./island?phase=career"),0);
  }

  function select(id,open=false){
    selected=id;
    G.setSelectedPhase(id);
    document.querySelectorAll(".map-hit").forEach(b=>b.classList.toggle("selected",b.dataset.phase===id));
    const p=G.PHASES[id];
    feedback.textContent=p.title+" selected · "+G.phaseCompletion(id)+"% complete";
    feedback.classList.add("show");
    setTimeout(()=>feedback.classList.remove("show"),1200);
    if(open){
      if(id==="career") location.href="./island?phase=career";
      else showDialog(id);
    }
  }

  document.querySelectorAll(".map-hit").forEach(btn=>{
    btn.addEventListener("click",()=>select(btn.dataset.phase,false));
    btn.addEventListener("dblclick",()=>select(btn.dataset.phase,true));
  });

  document.querySelector("[data-continue]").addEventListener("click",()=>select(selected,true));
  document.querySelector("[data-reset-map]").addEventListener("click",()=>{select("career",false);notify("Career selected")});

  document.querySelector("[data-tasks]").addEventListener("click",()=>{
    document.querySelector("#genericTitle").textContent="Tasks";
    document.querySelector("[data-generic-body]").innerHTML="<p>Register tasks from Home or Career Island so each action keeps its goal context.</p><button class='sheet-cta' type='button' data-open-goals>Open Career Goals</button>";
    document.querySelector("#genericDialog").showModal();
    setTimeout(()=>document.querySelector("[data-open-goals]")?.addEventListener("click",()=>location.href="./island?phase=career"),0);
  });

  document.querySelector("[data-journal]").addEventListener("click",()=>{
    document.querySelector("#genericTitle").textContent="Journal";
    document.querySelector("[data-generic-body]").innerHTML="<p>Journal remains browser-local in this MVP. Career Island notes are available from the goal workflow.</p>";
    document.querySelector("#genericDialog").showModal();
  });

  select(selected,false);
})();