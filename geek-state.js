(() => {
  const KEY = "legacy-geek-v0.4";

  const PHASES = {
    foundation:{id:"foundation",title:"Foundation",icon:"🌿",theme:"Forest",tagline:"Build the core. A stronger you creates a brighter tomorrow."},
    health:{id:"health",title:"Health",icon:"❤️",theme:"Highlands",tagline:"Energy, recovery and resilience for the journey ahead."},
    career:{id:"career",title:"Career",icon:"💼",theme:"Citadel",tagline:"Build a meaningful career. Create freedom through your skills."},
    wealth:{id:"wealth",title:"Wealth",icon:"🪙",theme:"Golden Port",tagline:"Create resilience, freedom and long-term optionality."},
    legacy:{id:"legacy",title:"Legacy",icon:"♛",theme:"Summit",tagline:"Turn achievement into contribution that outlives the quest."}
  };

  const DEFAULT_GOALS = {
    foundation:{
      long:[{id:"f-l1",title:"Build My Personal Operating System",desc:"Create routines and systems that make progress repeatable.",tasks:["Weekly life review","Define morning routine","Simplify digital systems"]}],
      mid:[{id:"f-m1",title:"Build Core Habits",desc:"Strengthen the routines that support every other island.",tasks:["Sleep routine","Plan tomorrow","Read daily"]}],
      short:[{id:"f-s1",title:"Complete This Month's Foundation Sprint",desc:"Make the system real through small daily actions.",tasks:["Set weekly priorities","Clean task backlog","Review goals Friday"]}]
    },
    health:{
      long:[{id:"h-l1",title:"Build Sustainable Health",desc:"Create a strong body and energy system for the long term.",tasks:["Annual health plan","Reach endurance baseline","Build strength program"]}],
      mid:[{id:"h-m1",title:"Improve Fitness & Recovery",desc:"Turn movement, sleep and recovery into stable routines.",tasks:["Train 3x per week","Protect sleep window","Track hydration"]}],
      short:[{id:"h-s1",title:"30-Day Energy Sprint",desc:"Small steps to increase energy this month.",tasks:["Walk daily","Hydrate 8 glasses","Prepare healthy meals"]}]
    },
    career:{
      long:[
        {id:"c-l1",title:"Become a Senior Developer",desc:"Grow into a senior role with strong technical depth and leadership skills.",tasks:["Lead technical initiative","Mentor a teammate","Complete system design plan","Present architecture review"]},
        {id:"c-l2",title:"Build Multiple Income Streams",desc:"Create financial freedom through skills and side projects.",tasks:["Validate side project","Launch MVP","Find first customer"]},
        {id:"c-l3",title:"Work Remotely from Anywhere",desc:"Design a location-independent career.",tasks:["Update portfolio","Target remote companies","Practice interviews"]}
      ],
      mid:[
        {id:"c-m1",title:"Complete a Key Project",desc:"Ship a portfolio project I'm proud of.",tasks:["Define scope","Build core feature","Publish demo","Write case study"]},
        {id:"c-m2",title:"Improve Core Skills",desc:"Level up in areas that increase my value.",tasks:["Complete advanced React course","Build 3 practice projects","Read 2 technical books","Practice system design (1 hour weekly)","Take an online course on cloud (AWS)"]},
        {id:"c-m3",title:"Grow Strategic Network",desc:"Build genuine relationships around my long-term direction.",tasks:["Reconnect with 3 peers","Attend one technical meetup","Share one technical post"]}
      ],
      short:[
        {id:"c-s1",title:"Update Resume",desc:"Polish and tailor my resume.",tasks:["Rewrite summary","Add current projects","Review achievements"]},
        {id:"c-s2",title:"Apply to 3 Target Companies",desc:"Take action towards new opportunities.",tasks:["Select target companies","Tailor resume","Submit applications","Track responses"]},
        {id:"c-s3",title:"Dedicate 30 Min Daily to Learning",desc:"Build a consistent learning habit.",tasks:["Pick learning theme","Schedule daily block","Complete 5 sessions","Review progress"]}
      ]
    },
    wealth:{
      long:[{id:"w-l1",title:"Reach Financial Independence",desc:"Build optionality through disciplined capital growth.",tasks:["Define target number","Build asset allocation","Review annually"]}],
      mid:[{id:"w-m1",title:"Build Investment Engine",desc:"Automate long-term investing and monitor the plan.",tasks:["Automate monthly contribution","Review portfolio","Track savings rate"]}],
      short:[{id:"w-s1",title:"Strengthen Cash Buffer",desc:"Increase resilience over the next month.",tasks:["Audit expenses","Transfer savings","Cancel unused subscription"]}]
    },
    legacy:{
      long:[{id:"l-l1",title:"Build Something Enduring",desc:"Create a body of work, contribution and knowledge that lasts.",tasks:["Define contribution thesis","Start legacy project","Create knowledge archive"]}],
      mid:[{id:"l-m1",title:"Mentor & Share Knowledge",desc:"Help other people grow through what I learn.",tasks:["Mentor monthly","Publish learning notes","Teach one workshop"]}],
      short:[{id:"l-s1",title:"Capture This Month's Lessons",desc:"Turn current experience into reusable knowledge.",tasks:["Write monthly reflection","Save one lesson learned","Share one insight"]}]
    }
  };

  const seededDone = new Set([
    "c-l2::0","c-l2::1","c-l2::2",
    "c-m1::0","c-m1::1","c-m1::2","c-m1::3",
    "c-m2::0","c-m2::3",
    "c-s1::0","c-s1::1","c-s1::2",
    "h-s1::0"
  ]);

  function makeGoals(){
    const out={};
    Object.entries(DEFAULT_GOALS).forEach(([phase,horizons])=>{
      out[phase]={};
      Object.entries(horizons).forEach(([horizon,goals])=>{
        out[phase][horizon]=goals.map(goal=>({
          ...goal,
          done:false,
          tasks:goal.tasks.map((title,index)=>({
            id:goal.id+"::"+index,
            title,
            done:seededDone.has(goal.id+"::"+index),
            due:phase==="career" ? ["Apr 12","Apr 25","May 10","Apr 8","May 20"][index%5] : "",
            focus:25
          }))
        }));
      });
    });
    return out;
  }

  function defaults(){
    return {
      version:"0.4",
      xp:730,
      totalXp:2340,
      level:12,
      streak:21,
      coins:2340,
      water:6,
      selectedPhase:"career",
      currentTask:{phase:"career",goalId:"c-m2",taskId:"c-m2::1"},
      goals:makeGoals(),
      focus:{
        trees:12,
        sessionsToday:7,
        completedSessionAvailable:false,
        history:[
          {type:"Focus Session",minutes:25,when:"10:00 AM"},
          {type:"Focus Session",minutes:25,when:"9:30 AM"},
          {type:"Deep Work",minutes:50,when:"8:30 AM"},
          {type:"Focus Session",minutes:25,when:"Yesterday"},
          {type:"Focus Session",minutes:25,when:"Yesterday"}
        ]
      },
      journal:[],
      customTasks:[]
    };
  }

  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY));
      if(!raw) return defaults();
      const base=defaults();
      return {
        ...base,...raw,
        goals:raw.goals||base.goals,
        focus:{...base.focus,...(raw.focus||{})},
        currentTask:{...base.currentTask,...(raw.currentTask||{})}
      };
    }catch{return defaults()}
  }

  let state=load();

  function save(){
    localStorage.setItem(KEY,JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("legacy:state",{detail:state}));
  }

  function phase(){return PHASES[state.selectedPhase]||PHASES.career}
  function phaseGoals(phaseId=state.selectedPhase){return state.goals[phaseId]||state.goals.career}
  function allGoals(phaseId=state.selectedPhase){
    const p=phaseGoals(phaseId);
    return [...p.long,...p.mid,...p.short];
  }
  function goalById(goalId,phaseId=state.selectedPhase){return allGoals(phaseId).find(g=>g.id===goalId)}
  function taskById(taskId,phaseId=state.selectedPhase){
    for(const g of allGoals(phaseId)){const t=g.tasks.find(t=>t.id===taskId);if(t)return {goal:g,task:t}}
    return null;
  }
  function taskStats(phaseId=state.selectedPhase){
    const tasks=allGoals(phaseId).flatMap(g=>g.tasks);
    const done=tasks.filter(t=>t.done).length;
    return {done,total:tasks.length,pct:tasks.length?Math.round(done/tasks.length*100):0};
  }
  function horizonStats(phaseId,horizon){
    const goals=phaseGoals(phaseId)[horizon];
    const complete=goals.filter(g=>g.tasks.length&&g.tasks.every(t=>t.done)).length;
    return {done:complete,total:goals.length};
  }
  function phaseCompletion(phaseId){
    const s=taskStats(phaseId);return s.pct;
  }
  function toggleTask(taskId,phaseId){
    const found=taskById(taskId,phaseId);if(!found)return;
    found.task.done=!found.task.done;
    state.xp=Math.max(0,state.xp+(found.task.done?15:-15));
    state.totalXp=Math.max(0,state.totalXp+(found.task.done?15:-15));
    save();
  }
  function addTask({phaseId,horizon,goalId,title,focus=25}){
    const phaseGoalsFor=phaseGoals(phaseId);
    let goal=[...(phaseGoalsFor[horizon]||[])].find(g=>g.id===goalId);
    if(!goal){
      goal=phaseGoalsFor.short[0];
    }
    const task={id:"task-"+Date.now()+"-"+Math.random().toString(16).slice(2),title,done:false,due:"",focus:Number(focus)||25};
    goal.tasks.push(task);
    state.currentTask={phase:phaseId,goalId:goal.id,taskId:task.id};
    state.customTasks.push(task.id);
    save();
    return task;
  }
  function setCurrentTask(phaseId,goalId,taskId){state.currentTask={phase:phaseId,goalId,taskId};save()}
  function currentTask(){
    const phaseId=state.currentTask.phase||state.selectedPhase;
    return taskById(state.currentTask.taskId,phaseId)||taskById("c-m2::1","career");
  }
  function completeFocusSession(type,minutes){
    state.focus.trees+=1;
    state.focus.sessionsToday+=1;
    state.focus.completedSessionAvailable=true;
    state.focus.history.unshift({type,minutes,when:"Just now"});
    state.xp+=Math.max(5,Math.round(minutes/5));
    state.totalXp+=Math.max(5,Math.round(minutes/5));
    save();
  }
  function markCurrentTaskProgress(){
    const c=currentTask();if(!c||!state.focus.completedSessionAvailable)return false;
    if(!c.task.done){c.task.done=true;state.xp+=15;state.totalXp+=15}
    state.focus.completedSessionAvailable=false;save();return true;
  }
  function setSelectedPhase(id){if(PHASES[id]){state.selectedPhase=id;save()}}
  function reset(){state=defaults();save()}

  window.LegacyGeek={
    KEY,PHASES,get state(){return state},save,phase,phaseGoals,allGoals,goalById,taskById,taskStats,
    horizonStats,phaseCompletion,toggleTask,addTask,setCurrentTask,currentTask,completeFocusSession,
    markCurrentTaskProgress,setSelectedPhase,reset
  };
})();