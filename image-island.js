(() => {
  const G=window.LegacyGeek;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const toast=$("[data-toast]");let toastTimer;
  const phaseId="career";

  function notify(message){
    clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2200);
  }
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
  function openGeneric(title,html){
    $("#genericTitle").textContent=title;$("[data-generic-body]").innerHTML=html;$("#genericDialog").showModal();
  }
  function horizonForGoal(goalId){
    for(const h of ["long","mid","short"]){if(G.phaseGoals(phaseId)[h].some(g=>g.id===goalId))return h}
    return "short";
  }
  function populateGoals(){
    const h=$("#taskHorizon").value,sel=$("#taskGoal");sel.replaceChildren();
    G.phaseGoals(phaseId)[h].forEach(g=>{const o=document.createElement("option");o.value=g.id;o.textContent=g.title;sel.append(o)});
  }
  function openTask(goalId=null){
    if(goalId){$("#taskHorizon").value=horizonForGoal(goalId)}
    populateGoals();if(goalId)$("#taskGoal").value=goalId;
    $("#taskDialog").showModal();setTimeout(()=>$("#taskTitle").focus(),60);
  }
  function goalDetails(goalId){
    const goal=G.goalById(goalId,phaseId);if(!goal)return;
    const done=goal.tasks.filter(t=>t.done).length,pct=goal.tasks.length?Math.round(done/goal.tasks.length*100):0;
    const rows=goal.tasks.map(t=>`
      <div style="display:grid;grid-template-columns:36px 1fr auto;gap:8px;align-items:center;min-height:48px;border-top:1px solid #123b4e">
        <button type="button" data-task="${esc(t.id)}" style="width:30px;height:30px;border-radius:50%;border:2px solid #bcd2dc;background:${t.done?"#32e98e":"#071a25"};color:#062219">${t.done?"✓":""}</button>
        <div><strong>${esc(t.title)}</strong><div style="color:#8ca8b8;font-size:10px">${t.focus||25} min focus</div></div>
        <button type="button" data-focus="${esc(t.id)}" style="min-height:38px;border:1px solid #245873;border-radius:9px;background:#082130;color:#b9d5e3">Focus</button>
      </div>`).join("");
    openGeneric(goal.title,`
      <p style="color:#9bb8c8">${esc(goal.desc)}</p>
      <p><strong>${pct}% complete</strong> · ${done}/${goal.tasks.length} tasks</p>
      <div>${rows}</div>
      <button class="sheet-cta" type="button" data-add-from-detail style="width:100%;margin-top:12px">＋ Add Task to This Goal</button>`);
    setTimeout(()=>{
      document.querySelectorAll("[data-task]").forEach(b=>b.addEventListener("click",()=>{G.toggleTask(b.dataset.task,phaseId);$("#genericDialog").close();notify("Task status updated");setTimeout(()=>goalDetails(goalId),80)}));
      document.querySelectorAll("[data-focus]").forEach(b=>b.addEventListener("click",()=>{
        const goal=G.goalById(goalId,phaseId);G.setCurrentTask(phaseId,goalId,b.dataset.focus);location.href="./focus";
      }));
      document.querySelector("[data-add-from-detail]")?.addEventListener("click",()=>{$("#genericDialog").close();openTask(goalId)});
    },0);
  }

  $("#taskHorizon").addEventListener("change",populateGoals);
  populateGoals();
  $("#taskForm").addEventListener("submit",e=>{
    e.preventDefault();const title=$("#taskTitle").value.trim();if(!title)return;
    G.addTask({phaseId,horizon:$("#taskHorizon").value,goalId:$("#taskGoal").value,title,focus:$("#taskFocus").value});
    $("#taskTitle").value="";$("#taskDialog").close();notify("Task registered under "+$("#taskGoal option:checked").textContent);
  });

  $$("[data-goal]").forEach(b=>b.addEventListener("click",()=>goalDetails(b.dataset.goal)));
  $$("[data-register]").forEach(b=>b.addEventListener("click",()=>openTask()));
  $$("[data-add-goal]").forEach(b=>b.addEventListener("click",()=>openTask(b.dataset.addGoal)));
  $$("[data-focus-goal]").forEach(b=>b.addEventListener("click",()=>{
    const goal=G.goalById(b.dataset.focusGoal,phaseId);const t=goal?.tasks.find(t=>!t.done)||goal?.tasks[0];
    if(t){G.setCurrentTask(phaseId,goal.id,t.id);location.href="./focus"}
  }));

  $$("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
    const tab=b.dataset.tab;
    if(tab==="goals"){notify("Goals & Tasks is the active island workflow");return}
    if(tab==="overview"){
      const goals=G.allGoals(phaseId),tasks=goals.flatMap(g=>g.tasks),pct=G.phaseCompletion(phaseId);
      openGeneric("Career Overview",`<p><strong>${pct}% island complete</strong></p><p>${goals.length} goals · ${tasks.filter(t=>t.done).length}/${tasks.length} tasks completed.</p><p>Long-term goals define direction, mid-term goals define projects, and short-term goals define the next executable steps.</p>`);
    }
    if(tab==="notes"){
      G.state.notes=G.state.notes||{};
      openGeneric("Career Notes",`<form class="sheet-form" id="notesForm"><label>Strategic notes<textarea id="notesText" placeholder="Decisions, lessons and island strategy...">${esc(G.state.notes.career||"")}</textarea></label><button class="sheet-cta" type="submit">Save Notes</button></form>`);
    }
    if(tab==="resources"){
      openGeneric("Career Resources","<p>📚 Learning plans · 3</p><p>🔗 Reference links · 5</p><p>🧠 Lessons learned · 2</p><p>This prototype keeps resource links conceptual while preserving the approved visual screen.</p>");
    }
  }));

  document.addEventListener("submit",e=>{
    if(e.target?.id!=="notesForm")return;
    e.preventDefault();G.state.notes.career=$("#notesText").value;G.save();$("#genericDialog").close();notify("Career notes saved locally");
  });
})();