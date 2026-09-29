(() => {
  const G=window.LegacyGeek;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const toast=$("[data-toast]");
  let toastTimer;

  function notify(msg){
    clearTimeout(toastTimer);toast.textContent=msg;toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=""},2200);
  }

  function openGeneric(title,body){
    $("[data-generic-body]").innerHTML='<p class="pixel-kicker">LEGACY</p><h2>'+title+'</h2>'+body;
    $("#genericDialog").showModal();
  }

  function render(){
    const s=G.state;
    $$("[data-level]").forEach(n=>n.textContent=s.level);
    $("[data-xp]").textContent=s.xp;
    $("[data-total-xp]").textContent=s.totalXp;
    $("[data-streak]").textContent=s.streak;
    $("[data-xp-bar]").style.width=Math.min(100,s.xp/10)+"%";
    $("[data-forest-level]").textContent=Math.max(1,Math.ceil(s.focus.trees/6));
    $("[data-water-glasses]").textContent=s.water;
    $("[data-water-pct]").textContent=Math.min(100,Math.round(s.water/8*100));
    renderGlasses();
    renderTasks();
    const current=G.currentTask();
    if(current)$("[data-next-task]").textContent=current.task.title;
  }

  function renderGlasses(){
    const root=$("[data-glasses]");root.replaceChildren();
    for(let i=0;i<8;i++){const el=document.createElement("span");el.className="glass"+(i<G.state.water?" full":"");root.append(el)}
  }

  function homeTasks(){
    const career=G.phaseGoals("career");
    const short=career.short.flatMap(g=>g.tasks.map(t=>({...t,phase:"career",goalId:g.id,tag:g.id==="c-s2"?"Planning":"Deep Work"})));
    const health=G.phaseGoals("health").short.flatMap(g=>g.tasks.map(t=>({...t,phase:"health",goalId:g.id,tag:"Health"})));
    const learning=career.mid.find(g=>g.id==="c-m2").tasks.map(t=>({...t,phase:"career",goalId:"c-m2",tag:"Learning"}));
    const list=[health[0],short[0],learning[2],short[1],learning[4]].filter(Boolean);
    return list;
  }

  function renderTasks(){
    const list=homeTasks(), root=$("[data-home-tasks]");root.replaceChildren();
    list.forEach((task,i)=>{
      const row=document.createElement("div");row.className="task-row"+(task.done?" done":"");
      row.innerHTML='<button class="task-toggle" type="button" aria-label="Toggle '+escapeHtml(task.title)+'">'+(task.done?"✓":"")+'</button><div class="task-title"><strong>'+escapeHtml(task.title)+'</strong></div><span class="tag">'+escapeHtml(task.tag)+'</span><span class="task-time">'+["7:00 AM","10:00 AM","6:00 PM","8:00 PM","9:00 PM"][i]+'</span>';
      row.querySelector("button").addEventListener("click",()=>{G.toggleTask(task.id,task.phase);render();notify(task.done?"Quest completed +15 XP":"Quest updated")});
      row.querySelector(".task-title").addEventListener("click",()=>{G.setCurrentTask(task.phase,task.goalId,task.id);location.href="./focus"});
      root.append(row);
    });
    const done=list.filter(t=>t.done).length;
    $("[data-task-summary]").textContent=done+" of "+list.length;
    $("[data-task-bar]").style.width=(list.length?done/list.length*100:0)+"%";
  }

  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

  const phaseSelect=$("#taskPhase"), horizon=$("#taskHorizon"), goalSelect=$("#taskGoal");
  function populatePhases(){
    phaseSelect.replaceChildren();
    Object.entries(G.PHASES).forEach(([id,p])=>{const o=document.createElement("option");o.value=id;o.textContent=p.title;phaseSelect.append(o)});
    phaseSelect.value=G.state.selectedPhase;
  }
  function populateGoals(){
    goalSelect.replaceChildren();
    const goals=G.phaseGoals(phaseSelect.value)[horizon.value]||[];
    goals.forEach(g=>{const o=document.createElement("option");o.value=g.id;o.textContent=g.title;goalSelect.append(o)});
  }
  populatePhases();populateGoals();
  phaseSelect.addEventListener("change",populateGoals);horizon.addEventListener("change",populateGoals);

  $$("[data-add-task]").forEach(b=>b.addEventListener("click",()=>{populatePhases();populateGoals();$("#taskDialog").showModal()}));
  $("#taskForm").addEventListener("submit",e=>{
    e.preventDefault();
    const title=$("#taskTitle").value.trim();if(!title)return;
    G.addTask({phaseId:phaseSelect.value,horizon:horizon.value,goalId:goalSelect.value,title,focus:$("#taskFocus").value});
    $("#taskTitle").value="";$("#taskDialog").close();render();notify("New quest registered");
  });

  $("[data-water-plus]").addEventListener("click",()=>{G.state.water=Math.min(12,G.state.water+1);G.save();render();notify("+1 glass")});
  $("[data-water-minus]").addEventListener("click",()=>{G.state.water=Math.max(0,G.state.water-1);G.save();render()});
  $("[data-open-next]").addEventListener("click",()=>{const c=G.currentTask();if(c)location.href="./island?phase="+G.state.currentTask.phase+"&goal="+c.goal.id});
  $("[data-search]").addEventListener("click",()=>openGeneric("Search the world",'<p>Global search is represented in this prototype by island, goal and task navigation. The next iteration can add command-palette search.</p>'));
  $("[data-settings]").addEventListener("click",()=>openGeneric("Settings",'<p>Prototype settings: sound, reduced motion, game density and reminder preferences.</p>'));
  $("[data-profile]").addEventListener("click",()=>openGeneric("Explorer profile",'<p>Level '+G.state.level+' · '+G.state.totalXp+' total XP · '+G.state.streak+' day streak.</p>'));
  $$("[data-journal]").forEach(b=>b.addEventListener("click",()=>openGeneric("Journal",'<p>Capture lessons learned, reflections and notes tied to your islands.</p><textarea style="width:100%;min-height:140px;background:#071d29;color:white;border:1px solid #24566b;border-radius:10px;padding:10px" placeholder="What did you learn today?"></textarea>')));

  window.addEventListener("legacy:state",render);
  render();
})();