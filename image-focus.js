(() => {
  const G=window.LegacyGeek;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const toast=$("[data-toast]");
  let toastTimer, timerId=null, running=false;
  let mode="pomodoro", totalMinutes=25, remaining=25*60;
  const qaMode=new URLSearchParams(location.search).get("qa")==="complete";
  if(qaMode) remaining=3;

  function notify(message){
    clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2200);
  }
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
  function openGeneric(title,html){
    $("#genericTitle").textContent=title;$("[data-generic-body]").innerHTML=html;$("#genericDialog").showModal();
  }
  function renderTimer(){
    const m=Math.floor(remaining/60),s=remaining%60;
    $("[data-timer]").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    $("[data-start]").classList.toggle("running",running);
    $("[data-start]").setAttribute("aria-label",running?"Pause focus session":"Start focus session");
  }
  function setMode(btn){
    if(running)return;
    $$("[data-mode]").forEach(b=>b.classList.toggle("focus-mode-selected",b===btn));
    mode=btn.dataset.mode;totalMinutes=Number(btn.dataset.minutes)||25;
    remaining=qaMode&&mode==="pomodoro"?3:totalMinutes*60;
    renderTimer();notify(btn.querySelector(".hit-label")?.textContent||"Mode changed");
  }
  function tick(){
    if(!running)return;
    remaining=Math.max(0,remaining-1);renderTimer();
    if(remaining===0)finish();
  }
  function toggle(){
    running=!running;
    if(running){timerId=setInterval(tick,1000);notify("Focus session started")}
    else{clearInterval(timerId);timerId=null;notify("Session paused")}
    renderTimer();
  }
  function finish(){
    clearInterval(timerId);timerId=null;running=false;
    if(mode==="pomodoro"||mode==="custom"){
      G.completeFocusSession(mode==="custom"?"Deep Work":"Focus Session",totalMinutes);
      notify("Session complete · your forest grew 🌳");
    }else{
      notify("Break complete · ready for the next quest");
    }
    remaining=qaMode&&mode==="pomodoro"?3:totalMinutes*60;
    renderTimer();
  }
  function reset(){
    running=false;clearInterval(timerId);timerId=null;
    remaining=qaMode&&mode==="pomodoro"?3:totalMinutes*60;renderTimer();notify("Timer reset");
  }
  function currentContext(){
    const found=G.currentTask();
    if(!found)return null;
    const phaseId=G.state.currentTask.phase||"career";
    return {found,phaseId,phase:G.PHASES[phaseId]||G.PHASES.career};
  }
  function showCurrentTask(){
    const c=currentContext();
    if(!c){openGeneric("Current Task","<p>No task is selected yet. Open Career Island and choose a task for Focus.</p>");return}
    const goal=c.found.goal;
    const rows=goal.tasks.map(t=>`
      <div style="display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;min-height:48px;border-top:1px solid #123b4e">
        <button type="button" data-pick="${esc(t.id)}" style="width:28px;height:28px;border-radius:50%;border:2px solid ${t.id===c.found.task.id?"#32e98e":"#bcd2dc"};background:${t.done?"#32e98e":"#071a25"};color:#062219">${t.done?"✓":""}</button>
        <div><strong>${esc(t.title)}</strong><div style="color:#8ca8b8;font-size:10px">${t.done?"Completed":"Pending"} · ${t.focus||25} min</div></div>
        <button type="button" data-open-goal style="min-height:36px;border:1px solid #245873;border-radius:9px;background:#082130;color:#b9d5e3">Goal</button>
      </div>`).join("");
    openGeneric("Current Task",`
      <p><strong>${esc(c.phase.title)} Island · ${esc(goal.title)}</strong></p>
      <p style="color:#9bb8c8">Selected: ${esc(c.found.task.title)}</p>
      <div>${rows}</div>`);
    setTimeout(()=>{
      document.querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{
        G.setCurrentTask(c.phaseId,goal.id,b.dataset.pick);$("#genericDialog").close();notify("Focus task changed");
      }));
      document.querySelectorAll("[data-open-goal]").forEach(b=>b.addEventListener("click",()=>location.href="./island?phase="+c.phaseId+"&goal="+encodeURIComponent(goal.id)));
    },0);
  }
  function showHistory(){
    const rows=G.state.focus.history.slice(0,12).map(h=>`
      <div style="display:flex;justify-content:space-between;gap:12px;min-height:48px;align-items:center;border-top:1px solid #123b4e">
        <div><strong>${esc(h.type)}</strong><div style="color:#8ca8b8;font-size:10px">${h.minutes} min</div></div>
        <span style="color:#8ca8b8">${esc(h.when)}</span>
      </div>`).join("");
    openGeneric("Session History",`
      <p><strong>${G.state.focus.trees} trees planted</strong> · ${G.state.focus.sessionsToday} focus sessions today</p>
      <div>${rows}</div>`);
  }

  $$("[data-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b)));
  $("[data-start]").addEventListener("click",toggle);
  $("[data-reset]").addEventListener("click",reset);
  $$("[data-current-task]").forEach(b=>b.addEventListener("click",showCurrentTask));
  $("[data-history]").addEventListener("click",showHistory);
  $("[data-mark]").addEventListener("click",()=>{
    if(G.markCurrentTaskProgress())notify("Quest progress marked · current task completed");
    else notify("Complete a focus session first to unlock progress");
  });
  $("[data-search]").addEventListener("click",()=>openGeneric("Focus Search","<p>Choose the current task from the task panel or navigate back to Goals to select another quest.</p>"));
  $("[data-settings]").addEventListener("click",()=>openGeneric("Focus Settings","<p>Prototype settings: focus sounds, notifications, reduced motion and auto-start breaks.</p>"));
  $("[data-profile]").addEventListener("click",()=>openGeneric("Forest Profile",`<p><strong>${G.state.focus.trees} trees planted</strong></p><p>${G.state.streak} day streak · ${G.state.focus.sessionsToday} focus sessions today.</p>`));
  $("[data-journal]").addEventListener("click",()=>openGeneric("Focus Journal",
    '<form class="sheet-form" id="focusJournal"><label>Post-session reflection<textarea id="focusJournalText" placeholder="What did you accomplish or learn?"></textarea></label><button class="sheet-cta" type="submit">Save Reflection</button></form>'));

  document.addEventListener("submit",e=>{
    if(e.target?.id!=="focusJournal")return;
    e.preventDefault();const text=$("#focusJournalText").value.trim();if(!text)return;
    G.state.journal.push({at:new Date().toISOString(),text,context:"focus"});G.save();
    $("#genericDialog").close();notify("Focus reflection saved locally");
  });

  window.addEventListener("pagehide",()=>{clearInterval(timerId)});
  renderTimer();
})();