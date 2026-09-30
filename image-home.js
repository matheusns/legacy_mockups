(() => {
  const G=window.LegacyGeek;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const toast=$("[data-toast]"); let toastTimer;

  function notify(message){
    clearTimeout(toastTimer); toast.textContent=message; toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2200);
  }
  function openGeneric(title,html){
    $("#genericTitle").textContent=title;
    $("[data-generic-body]").innerHTML=html;
    $("#genericDialog").showModal();
  }
  function homeTasks(){
    const c=G.phaseGoals("career"), h=G.phaseGoals("health");
    return [
      {phase:"health",goal:h.short[0],task:h.short[0].tasks[0]},
      {phase:"career",goal:c.mid[1],task:c.mid[1].tasks[1]},
      {phase:"career",goal:c.mid[1],task:c.mid[1].tasks[2]},
      {phase:"career",goal:c.short[0],task:c.short[0].tasks[1]||c.short[0].tasks[0]},
      {phase:"career",goal:c.short[2],task:c.short[2].tasks[0]}
    ].filter(x=>x.task);
  }

  const phaseSelect=$("#taskPhase"), horizon=$("#taskHorizon"), goalSelect=$("#taskGoal");
  function populatePhases(){
    phaseSelect.replaceChildren();
    Object.entries(G.PHASES).forEach(([id,p])=>{
      const o=document.createElement("option");o.value=id;o.textContent=p.title;phaseSelect.append(o);
    });
    phaseSelect.value=G.state.selectedPhase||"career";
  }
  function populateGoals(){
    goalSelect.replaceChildren();
    const goals=G.phaseGoals(phaseSelect.value)[horizon.value]||[];
    goals.forEach(g=>{const o=document.createElement("option");o.value=g.id;o.textContent=g.title;goalSelect.append(o)});
  }
  populatePhases();populateGoals();
  phaseSelect.addEventListener("change",populateGoals);
  horizon.addEventListener("change",populateGoals);

  $$("[data-add-task]").forEach(b=>b.addEventListener("click",()=>{
    populatePhases();populateGoals();$("#taskDialog").showModal();
    setTimeout(()=>$("#taskTitle").focus(),60);
  }));
  $("#taskForm").addEventListener("submit",e=>{
    e.preventDefault();
    const title=$("#taskTitle").value.trim(); if(!title)return;
    G.addTask({
      phaseId:phaseSelect.value,horizon:horizon.value,goalId:goalSelect.value,
      title,focus:$("#taskFocus").value
    });
    $("#taskTitle").value="";$("#taskDialog").close();
    notify("Quest registered in "+G.PHASES[phaseSelect.value].title+" · state saved");
  });

  $("[data-water]").addEventListener("click",()=>{
    G.state.water=Math.min(12,(G.state.water||0)+1);G.save();
    notify("Hydration logged · "+G.state.water+"/8 glasses");
  });

  $$("[data-task-row]").forEach(btn=>btn.addEventListener("click",()=>{
    const item=homeTasks()[Number(btn.dataset.taskRow)];
    if(!item)return;
    G.toggleTask(item.task.id,item.phase);
    const now=G.taskById(item.task.id,item.phase);
    notify((now?.task.done?"Completed":"Reopened")+" · "+item.task.title);
  }));

  $("[data-next]").addEventListener("click",()=>{
    const c=G.currentTask();
    location.href="./island?phase="+(G.state.currentTask.phase||"career")+(c?"&goal="+encodeURIComponent(c.goal.id):"");
  });

  $("[data-search]").addEventListener("click",()=>openGeneric("Search",
    "<p>Search stays intentionally light in this visual prototype. Use the World Map for islands, Goals for hierarchy, and Tasks to register an action.</p>"));
  $("[data-settings]").addEventListener("click",()=>openGeneric("Settings",
    "<p>Prototype controls: reduced motion, reminders, focus sounds and game density. No account settings are persisted beyond this browser-local mockup.</p>"));
  $("[data-profile]").addEventListener("click",()=>openGeneric("Explorer Profile",
    "<p><strong>Level "+G.state.level+"</strong></p><p>"+G.state.totalXp+" total XP · "+G.state.streak+" day streak · "+G.state.focus.trees+" trees planted.</p>"));
  $("[data-journal]").addEventListener("click",()=>openGeneric("Journal",
    '<form class="sheet-form" id="journalForm"><label>Today\'s reflection<textarea id="journalText" placeholder="What did you learn today?"></textarea></label><button class="sheet-cta" type="submit">Save Reflection</button></form>'));

  document.addEventListener("submit",e=>{
    if(e.target?.id!=="journalForm")return;
    e.preventDefault();
    const text=$("#journalText").value.trim(); if(!text)return;
    G.state.journal.push({at:new Date().toISOString(),text});G.save();
    $("#genericDialog").close();notify("Reflection saved locally");
  });
})();