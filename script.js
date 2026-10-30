// F1 Race Intelligence Dashboard — student demo data.
// The numbers below are illustrative and are not official live Formula 1 results.
const drivers = [
  {name:"Lando Norris",short:"L. Norris",initials:"LN",team:"McLaren",lap:72.8,points:126,race:"all"},
  {name:"Oscar Piastri",short:"O. Piastri",initials:"OP",team:"McLaren",lap:73.1,points:118,race:"all"},
  {name:"Max Verstappen",short:"M. Verstappen",initials:"MV",team:"Red Bull",lap:73.4,points:104,race:"all"},
  {name:"Charles Leclerc",short:"C. Leclerc",initials:"CL",team:"Ferrari",lap:73.7,points:92,race:"all"},
  {name:"Lewis Hamilton",short:"L. Hamilton",initials:"LH",team:"Ferrari",lap:74.0,points:78,race:"all"},
  {name:"George Russell",short:"G. Russell",initials:"GR",team:"Mercedes",lap:74.2,points:69,race:"all"}
];
const raceData = {
  all: {count:4, laps:[72.8,73.1,73.4,73.7,74.0,74.2], points:[126,118,104,92,78,69]},
  Monaco: {count:1, laps:[72.5,72.9,73.0,73.4,73.8,74.1], points:[25,18,15,12,10,8]},
  Silverstone: {count:1, laps:[88.1,88.3,88.5,88.8,89.0,89.3], points:[18,25,15,10,8,12]},
  Monza: {count:1, laps:[82.0,82.3,82.6,82.8,83.0,83.1], points:[25,15,18,12,8,10]},
  Suzuka: {count:1, laps:[91.2,91.5,91.8,92.0,92.3,92.5], points:[18,25,15,18,12,8]}
};
let selectedRace = "all";
const $ = id => document.getElementById(id);

function formatLap(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds - mins * 60).toFixed(1).padStart(4, "0");
  return `${mins}:${secs}`;
}
function drawBarChart(canvasId, labels, values, options={}) {
  const canvas = $(canvasId);
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(rect.width, 260), height = Math.max(rect.height, 180);
  canvas.width = width * dpr; canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const pad = {top:14,right:12,bottom:36,left:options.time?43:32};
  const plotW = width-pad.left-pad.right, plotH=height-pad.top-pad.bottom;
  const min = options.time ? Math.floor(Math.min(...values)-1) : 0;
  const max = options.time ? Math.ceil(Math.max(...values)+1) : Math.ceil(Math.max(...values)*1.15);
  ctx.font = "9px Inter, Arial"; ctx.textBaseline="middle";
  for(let i=0;i<5;i++){
    const y=pad.top+plotH*i/4;
    ctx.strokeStyle="#2b2d35";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(width-pad.right,y);ctx.stroke();
    const v=max-(max-min)*i/4;
    ctx.fillStyle="#777a86";ctx.textAlign="right";
    ctx.fillText(options.time?v.toFixed(0):Math.round(v),pad.left-8,y);
  }
  const step=plotW/labels.length, barW=Math.min(28,step*.52);
  values.forEach((v,i)=>{
    const x=pad.left+step*i+(step-barW)/2;
    const barH=(v-min)/(max-min)*plotH;
    const y=pad.top+plotH-barH;
    const grad=ctx.createLinearGradient(0,y,0,pad.top+plotH);
    grad.addColorStop(0, options.time?"#ff596b":"#f3263e");grad.addColorStop(1,"#8d1224");
    ctx.fillStyle=grad;
    ctx.beginPath();ctx.roundRect(x,y,barW,Math.max(2,barH),[3,3,0,0]);ctx.fill();
    ctx.fillStyle="#b6b8c1";ctx.textAlign="center";ctx.font="9px Inter, Arial";
    const label=labels[i].split(" ")[1] || labels[i];
    ctx.fillText(label.replace(".",""),x+barW/2,height-19);
  });
}
function renderLeaderboard(race) {
  const points = raceData[race].points;
  const laps = raceData[race].laps;
  const list = drivers.map((d,i)=>({...d,points:points[i],lap:laps[i]})).sort((a,b)=>b.points-a.points);
  $("leaderboard").innerHTML = list.map((d,i)=>`<tr>
    <td><span class="position">${String(i+1).padStart(2,"0")}</span></td>
    <td><div class="driver-cell"><span class="driver-initial">${d.initials}</span>${d.short}</div></td>
    <td><span class="team-name">${d.team}</span></td>
    <td>${formatLap(d.lap)}</td><td><span class="points">${d.points}</span></td>
  </tr>`).join("");
}
function render(race="all") {
  selectedRace=race;
  const data=raceData[race];
  const fastest=Math.min(...data.laps);
  const fastestIndex=data.laps.indexOf(fastest);
  const teamPoints = {McLaren:data.points[0]+data.points[1], "Red Bull":data.points[2],Ferrari:data.points[3]+data.points[4],Mercedes:data.points[5]};
  const topTeam=Object.entries(teamPoints).sort((a,b)=>b[1]-a[1])[0];
  $("raceCount").textContent=data.count;
  $("fastestLap").textContent=formatLap(fastest);
  $("fastestDriver").textContent=`${drivers[fastestIndex].short} · demo data`;
  $("topTeam").textContent=topTeam[0];
  $("topTeamPoints").textContent=`${topTeam[1]} sample points`;
  drawBarChart("lapChart",drivers.map(d=>d.short),data.laps,{time:true});
  drawBarChart("pointsChart",drivers.map(d=>d.short),data.points);
  renderLeaderboard(race);
  document.querySelectorAll(".circuit-row").forEach(btn=>btn.classList.toggle("selected",btn.dataset.race===race));
  $("raceFilter").value=race;
}
$("raceFilter").addEventListener("change",e=>render(e.target.value));
document.querySelectorAll(".circuit-row").forEach(btn=>btn.addEventListener("click",()=>render(btn.dataset.race)));
$("menuButton").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-item").forEach(link=>link.addEventListener("click",()=>$("sidebar").classList.remove("open")));
window.addEventListener("resize",()=>render(selectedRace));
render();
