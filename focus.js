(() => {
  const G=window.LegacyGeek,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const toast=$("[data-toast]");let toastTimer,timerId=null,remaining=25*60,totalMinutes=25,running=false,mode="focus";
  function notify(m){clearTimeout(toastTimer);toast.textContent=m;toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2200)}
  function current(){return G.currentTask()}
  function renderCurrent(){
    const found=current();if(!found)return;
    const phase=G.PHASES[G.state.currentTask.phase]||G.PHASES.career;
    $("[data-current-icon]").textContent=phase.icon;
    $("[data-current-island]").textContent=phase.title.toUpperCase()+" ISLAND";
    $("[data-current-task]").textContent=found.task.title;$("[data-current-task-2]").textContent=found.task.title;
    $("[data-view-goal]").href="./island?phase="+phase.id+"&goal="+found.goal.id;
    $("[data-change-task]").href="./island?phase="+phase.id+"&goal="+found.goal.id;
    const root=$("[data-focus-subtasks]");root.replaceChildren();
    found.goal.tasks.slice(0,6).forEach(task=>{
      const row=document.createElement("div");row.className="focus-subtask"+(task.done?" done":"");
      row.innerHTML='<button type="button" aria-label="Toggle '+esc(task.title)+'">'+(task.done?"✓":"")+'</button><strong>'+esc(task.title)+'</strong><small>'+(task.focus||25)+' min</small>';
      row.querySelector("button").addEventListener("click",()=>{G.toggleTask(task.id,phase.id);renderAll();notify(task.done?"Task completed":"Task reopened")});
      row.querySelector("strong").addEventListener("click",()=>{G.setCurrentTask(phase.id,found.goal.id,task.id);renderAll();notify("Current focus task changed")});
      root.append(row);
    });
  }
  function renderStats(){
    $("[data-streak]").textContent=G.state.streak;
    $("[data-trees]").textContent=G.state.focus.trees;
    $("[data-session-count]").textContent=G.state.focus.sessionsToday;
    const treeCount=G.state.focus.trees;
    $("[data-tree]").textContent=treeCount<5?"🌱":treeCount<12?"🌲":treeCount<24?"🌳":"🌳✨";
    const mark=$("[data-mark-progress]");
    mark.disabled=!G.state.focus.completedSessionAvailable;
    mark.classList.toggle("ready",G.state.focus.completedSessionAvailable);
  }
  function renderHistory(){
    const root=$("[data-history]");root.replaceChildren();
    G.state.focus.history.slice(0,7).forEach(h=>{
      const r=document.createElement("div");r.className="session-row";
      r.innerHTML='<div><strong>'+(h.type==="Deep Work"?"🌲":"🌳")+' '+esc(h.type)+'</strong><small>'+h.minutes+' min</small></div><small>'+esc(h.when)+'</small>';
      root.append(r);
    });
  }
  function renderTimer(){
    const min=Math.floor(remaining/60),sec=remaining%60;
    $("[data-timer]").textContent=String(min).padStart(2,"0")+":"+String(sec).padStart(2,"0");
    $("[data-start]").textContent=running?"Ⅱ Pause Session":"▶ "+(remaining<totalMinutes*60?"Resume Session":"Start Focus Session");
  }
  function setMode(btn){
    if(running)return;
    $$(".mode-tabs button").forEach(b=>b.classList.toggle("active",b===btn));
    mode=btn.dataset.mode;totalMinutes=Number(btn.dataset.minutes)||25;remaining=totalMinutes*60;
    $("[data-mode-label]").textContent=mode==="focus"?"🍅 Focus Session":mode==="short"?"☕ Short Break":mode==="long"?"🌲 Long Break":"⚙ Custom Session";
    renderTimer();
  }
  function tick(){
    if(!running)return;
    remaining=Math.max(0,remaining-1);renderTimer();
    if(remaining===0){finish()}
  }
  function finish(){
    clearInterval(timerId);timerId=null;running=false;
    if(mode==="focus"||mode==="custom"){
      G.completeFocusSession(mode==="custom"?"Deep Work":"Focus Session",totalMinutes);
      notify("Session complete · a new tree grew 🌳");
    }else notify("Break complete");
    remaining=totalMinutes*60;renderAll();
  }
  function toggleStart(){
    running=!running;
    if(running){timerId=setInterval(tick,1000);notify("Focus mode engaged")}
    else{clearInterval(timerId);timerId=null;notify("Session paused")}
    renderTimer();
  }
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
  function openGeneric(title,body){$("[data-generic-body]").innerHTML='<p class="pixel-kicker">LEGACY</p><h2>'+title+'</h2>'+body;$("#genericDialog").showModal()}
  function renderAll(){renderCurrent();renderStats();renderHistory();renderTimer()}

  $$(".mode-tabs button").forEach(b=>b.addEventListener("click",()=>setMode(b)));
  $("[data-start]").addEventListener("click",toggleStart);
  $("[data-reset-timer]").addEventListener("click",()=>{running=false;clearInterval(timerId);timerId=null;remaining=totalMinutes*60;renderTimer();notify("Timer reset")});
  $("[data-mark-progress]").addEventListener("click",()=>{
    if(G.markCurrentTaskProgress()){renderAll();notify("Current quest advanced · +15 XP")}
  });
  $$("[data-tasks]").forEach(b=>b.addEventListener("click",()=>{const c=current();location.href="./island?phase="+G.state.currentTask.phase+"&goal="+(c?c.goal.id:"")}));
  $$("[data-journal]").forEach(b=>b.addEventListener("click",()=>openGeneric("Focus Journal",'<p>Capture distractions, lessons or a short post-session reflection.</p><textarea style="width:100%;min-height:140px;background:#071d29;color:white;border:1px solid #24566b;border-radius:10px;padding:10px" placeholder="What did this session teach you?"></textarea>')));

  if(new URLSearchParams(location.search).get("qa")==="complete"){remaining=3;renderTimer()}
  renderAll();
})();