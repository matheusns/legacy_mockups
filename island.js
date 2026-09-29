(() => {
  const G=window.LegacyGeek,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const qs=new URLSearchParams(location.search);
  const phaseId=G.PHASES[qs.get("phase")]?qs.get("phase"):"career";
  G.setSelectedPhase(phaseId);
  const phase=G.PHASES[phaseId];
  const toast=$("[data-toast]");let toastTimer;
  G.state.notes=G.state.notes||{};

  const horizonMeta={
    long:{title:"Long-term Goals",desc:"Big milestones that shape your future (6–12+ months)",icon:"⛰",class:"long"},
    mid:{title:"Mid-term Goals",desc:"Important steps for the next few months (1–6 months)",icon:"⚙",class:"mid"},
    short:{title:"Short-term Goals",desc:"Small steps to make progress now (this month)",icon:"🌱",class:"short"}
  };

  function notify(m){clearTimeout(toastTimer);toast.textContent=m;toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2100)}
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

  function renderHeader(){
    $("[data-phase-theme]").textContent=phase.icon+" "+phase.theme.toUpperCase();
    $("[data-phase-title]").textContent=phase.title;
    $("[data-phase-tagline]").textContent=phase.tagline;
    $("[data-phase-quote]").textContent=phaseId==="career"?"A SKILL TODAY BUILDS A BRIGHTER TOMORROW.":phase.tagline.toUpperCase();
  }

  function goalPct(goal){return goal.tasks.length?Math.round(goal.tasks.filter(t=>t.done).length/goal.tasks.length*100):0}
  function renderGoals(){
    const root=$("[data-goal-sections]");root.replaceChildren();
    ["long","mid","short"].forEach(horizon=>{
      const meta=horizonMeta[horizon],goals=G.phaseGoals(phaseId)[horizon],stats=G.horizonStats(phaseId,horizon);
      const section=document.createElement("section");section.className="goal-section";
      section.innerHTML='<div class="goal-section-header"><div><h2 style="color:'+(horizon==="long"?"#ffc85c":horizon==="mid"?"#51c9ff":"#55e8a3")+'">'+meta.icon+' '+meta.title+'</h2><p>'+meta.desc+'</p></div><div><small>'+stats.done+" / "+stats.total+' completed</small></div></div>';
      goals.forEach(goal=>{
        const pct=goalPct(goal),done=pct===100;
        const group=document.createElement("div");group.className="goal-group"+(done?" done":"");
        group.dataset.goalId=goal.id;
        group.innerHTML='<div class="goal-row"><button type="button" class="goal-status" aria-label="Goal status">'+(done?"✓":"")+'</button><div class="goal-copy"><strong>'+esc(goal.title)+'</strong><small>'+esc(goal.desc)+'</small></div><div class="goal-progress"><div class="bar"><i style="width:'+pct+'%"></i></div><small>'+pct+'% · '+goal.tasks.filter(t=>t.done).length+" / "+goal.tasks.length+' tasks</small></div><span class="goal-expand">⌄</span></div><div class="subtasks"></div><button class="add-task-goal" type="button">＋ Add Task to This Goal</button>';
        const sub=group.querySelector(".subtasks");
        goal.tasks.forEach(task=>{
          const row=document.createElement("div");row.className="subtask-row"+(task.done?" done":"");
          row.innerHTML='<button type="button" class="subtask-check" aria-label="Toggle task">'+(task.done?"✓":"")+'</button><strong>'+esc(task.title)+'</strong><span class="tag">'+(task.focus||25)+' min</span><small>'+esc(task.due||"")+'</small>';
          row.querySelector(".subtask-check").addEventListener("click",()=>{G.toggleTask(task.id,phaseId);renderAll();notify(task.done?"Task complete · +15 XP":"Task reopened")});
          row.querySelector("strong").addEventListener("click",()=>{G.setCurrentTask(phaseId,goal.id,task.id);location.href="./focus"});
          sub.append(row);
        });
        group.querySelector(".goal-row").addEventListener("click",e=>{if(e.target.closest("button"))return;group.classList.toggle("expanded")});
        group.querySelector(".add-task-goal").addEventListener("click",()=>openTaskDialog(horizon,goal.id));
        section.append(group);
      });
      root.append(section);
    });
    const requested=qs.get("goal");
    if(requested){const el=root.querySelector('[data-goal-id="'+CSS.escape(requested)+'"]');if(el){el.classList.add("expanded");setTimeout(()=>el.scrollIntoView({block:"center"}),60)}}
  }

  function renderStats(){
    const goals=G.allGoals(phaseId),tasks=goals.flatMap(g=>g.tasks),done=tasks.filter(t=>t.done).length;
    const incomplete=tasks.filter(t=>!t.done).length;
    $("[data-overdue]").textContent=Math.min(2,incomplete);
    $("[data-in-progress]").textContent=Math.min(3,incomplete);
    $("[data-done]").textContent=done;
    $("[data-next]").textContent=Math.min(2,incomplete);
    $("[data-overview-pct]").textContent=G.phaseCompletion(phaseId)+"%";
    $("[data-overview-goals]").textContent=goals.length;
    $("[data-overview-tasks]").textContent=tasks.length;
    $("[data-overview-title]").textContent=phase.title+" progression";
  }

  function populateGoalSelect(){
    const h=$("#taskHorizon").value,sel=$("#taskGoal");sel.replaceChildren();
    G.phaseGoals(phaseId)[h].forEach(g=>{const o=document.createElement("option");o.value=g.id;o.textContent=g.title;sel.append(o)});
  }
  function openTaskDialog(horizon="short",goalId=null){
    $("#taskHorizon").value=horizon;populateGoalSelect();
    if(goalId)$("#taskGoal").value=goalId;
    $("#taskDialog").showModal();setTimeout(()=>$("#taskTitle").focus(),50);
  }

  $("#taskHorizon").addEventListener("change",populateGoalSelect);
  $("#taskForm").addEventListener("submit",e=>{
    e.preventDefault();const title=$("#taskTitle").value.trim();if(!title)return;
    G.addTask({phaseId,horizon:$("#taskHorizon").value,goalId:$("#taskGoal").value,title,focus:$("#taskFocus").value});
    $("#taskTitle").value="";$("#taskDialog").close();renderAll();notify("Quest registered in "+phase.title);
  });
  $$("[data-register-task]").forEach(b=>b.addEventListener("click",()=>openTaskDialog()));

  $$("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>{
    $$("[data-tab]").forEach(b=>b.classList.toggle("active",b===btn));
    $$("section[data-view]").forEach(v=>v.hidden=v.dataset.view!==btn.dataset.tab);
  }));

  $("[data-notes]").value=G.state.notes[phaseId]||"";
  $("[data-save-notes]").addEventListener("click",()=>{G.state.notes[phaseId]=$("[data-notes]").value;G.save();notify("Island notes saved")});
  $$("[data-journal]").forEach(b=>b.addEventListener("click",()=>{G.state.notes[phaseId]=$("[data-notes]").value||G.state.notes[phaseId]||"";G.save();$("[data-generic-body]").innerHTML='<p class="pixel-kicker">JOURNAL</p><h2>'+phase.title+' reflection</h2><p>Notes are stored locally in this prototype. Use the Notes tab for island-specific strategy.</p>';$("#genericDialog").showModal()}));

  function renderAll(){renderHeader();renderGoals();renderStats()}
  renderAll();
})();