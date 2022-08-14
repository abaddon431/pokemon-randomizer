const STARTERS = [3,6,9, //gen i
                25, // pikachu
                154,157,160, //gen ii
                254,257,260, //gen iii
                389,392,395, //gen iv
                497,500,503, //gen v
                652,655,658, //gen vi
                724,727,730, //gen vii
                812,815,818 // gen viii
            ];

const typingStyles = {normal: "#A8A77A",fire: "#EE8130",water: "#6390F0",
    electric: "#F7D02C",grass: "#7AC74C",ice: "#96D9D6",fighting: "#C22E28",
    poison: "#A33EA1",ground: "#E2BF65",flying: "#A98FF3",psychic: "#F95587",
    bug: "#A6B91A",rock: "#B6A136",ghost: "#735797",dragon: "#6F35FC",
    dark:"#705746",steel:"#B7B7CE",fairy: "#D685AD"
    };

var team_info = localStorage.getItem("team_info") ? JSON.parse(localStorage.getItem("team_info")) : ["Team Name"];

function getPokemon(index,slot){
    fetch(`https://pokeapi.co/api/v2/pokemon/${index}/`)
    .then((response)=> response.json()
    .then((data)=>{
        team_info[slot+1]={
            "name":"",
            "sprites":{"other":{"official-artwork":{"front-default":""}}},
            "stats":data.stats,
            "types":data.types
        };
        team_info[slot+1].sprites.other['official-artwork'].front_default=data.sprites.other['official-artwork'].front_default;
        team_info[slot+1].name=data.name;
        team_info[slot+1].rerolls=2;
        team_info[slot+1].id=data.id;
        generateCard(data,slot);
        createLink();
        rerollEvent();
    })).catch((err)=>{
        console.log(err);
    })
}

function randomizePokemon(max){
    var pokemons = [];
    while(pokemons.length!=max){
        let x = Math.ceil(Math.random()*STARTERS.length-1);
        if(!pokemons.includes(STARTERS[x])){
            pokemons.push(STARTERS[x]);
        }
    }
    return pokemons;
}

async function randomizePokemonV2(max){
    var pokemons = [];
    let fire=0,grass=0,water=0;
    while(pokemons.length!=max){
        let x = Math.ceil(Math.random()*STARTERS.length-1);
        if(!pokemons.includes(STARTERS[x])){
            await fetch(`https://pokeapi.co/api/v2/pokemon/${STARTERS[x]}/`)
            .then((response)=>response.json()
            .then((data)=>{
                let type = data.types[0].type.name;
                switch(type){
                    case "fire":
                        if(fire<2){
                            fire+=1;
                            pokemons.push(STARTERS[x]);
                        }
                        break;
                    case "water":
                        if(water<2){
                            water+=1;
                            pokemons.push(STARTERS[x]);
                        }
                        break;
                    case "grass":
                        if(grass<2){
                            grass+=1;
                            pokemons.push(STARTERS[x]);
                        }
                        break;
                    default:
                        pokemons.push(STARTERS[x]);
                        break;
                }
            }))
            .catch((err)=>{
                console.log(err);
            })
        }
    }
    return pokemons;
}
function generateCard(data,slot){
    let card =  document.getElementById(`pokemon-${slot}`);
    card.innerHTML=`
    <p class="hp">
      <span class="reroll" id=${slot}><i class="fa-solid fa-arrows-rotate"></i> ${team_info[slot+1].rerolls}</span>
    </p>
    <a href="https://bulbapedia.bulbagarden.net/wiki/${data.name[0].toUpperCase() + data.name.slice(1)}_(Pokémon)" target="_blank"><img src=${data.sprites.other['official-artwork'].front_default} /></a>
    <!--<img src="http://play.pokemonshowdown.com/sprites/xyani/${data.name}.gif"/>-->
    <h2 class="poke-name">${data.name[0].toUpperCase() + data.name.slice(1)}</h2>
    <div class="type" id="types-${slot}">
    </div>
    <div class="stats" id="stat-${slot}">
      <div>
        <h3 id="atk-${slot}">${data.stats[1].base_stat}</h3>
        <p>Attack</p>
      </div>
      <div>
        <h3 id="def-${slot}">${data.stats[2].base_stat}</h3>
        <p>Defense</p>
      </div>
      <div>
        <h3 id="spd-${slot}">${data.stats[5].base_stat}</h3>
        <p>Speed</p>
      </div>
    </div>`;
    let types = data.types;
    let id = "#types-"+slot;
    types.forEach(function(value){
        let span = document.createElement("span");
        span.textContent = value.type.name;
        span.className = "type-"+value.type.name;
        document.querySelector(id).appendChild(span);
    });
    let color= typingStyles[data.types[0].type.name];
    card.style.background = `linear-gradient(to right top, rgba(255, 255, 255, 0.1) 85%, rgba(255, 255, 255, 0.1) 85%, ${color} 80%),linear-gradient(0deg, #ffffff 60%, #ffffff 60%, ${color} 60%)`;
    // card.style.background = `linear-gradient(0deg, #ffffff 60%, #ffffff 60%, ${color} 60%)`;
}

function saveTeam(){
    if(team_info.length==1){
        Swal.fire(
            'Team Empty',
            'Please randomize a team first before saving!',
            'warning'
        )
        return;
    }
    let team_name = document.getElementById("team-name").value;
    if(team_name==""){
        team_name="Pokemon Team";
    }
    team_info[0] = team_name;
    localStorage.removeItem("team_info");
    localStorage.setItem("team_info",JSON.stringify(team_info));
    createLink();
    Swal.fire(
        "",
        `${team_info[0]} has been saved!`,
        "success",
    ).then((result)=>{
        setTimeout(function(){ window.location.reload() }, 500);
    });
}

function loadTeam(){
    if(localStorage.getItem("team_info")){
         local_team = JSON.parse(localStorage.getItem("team_info"));
         local_team_name = local_team[0];
         local_team.shift();
         local_team.forEach(function(data,slot){
             generateCard(data, slot);
         })
         document.getElementById("team-name").value = local_team_name;
         
         rerollEvent();
         createLink();
    }

}

function flushTeam(){
    if(localStorage.getItem("team_info")){
    Swal.fire({
        title: 'Release Team?',
        text: "Do you want to release this team in the wild?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Release'
      }).then((result) => {
        if (result.isConfirmed) {
        localStorage.removeItem("team_info");
        document.getElementById("team-name").value = "";
          Swal.fire(
            'Released :(',
            'Your team was released in the wild.',
            'success'
          ).then((result)=>{
            setTimeout(function(){ window.location.reload() }, 500);
          })
        }
      });
    }
}

function createLink(){
    var exportObj = JSON.stringify(team_info);
    var exportName = document.getElementById("team-name").value !== "" ? document.getElementById("team-name").value : "team_name";
    var dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(exportObj);
    var downloadANode = document.getElementById("dl-team");
    downloadANode.setAttribute("href", dataStr);
    downloadANode.setAttribute("download", exportName+".json");
}

function rollPokemon(){
    var dupli = false;
    var tries=0;
    while(!dupli){
        tries+=1;
        let randomPokemon = randomizePokemon(1);
        let pokemon = team_info.find(poke => poke.id === randomPokemon[0]);
        if(!pokemon){
            return fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemon[0]}/`)
            .then((response)=> response.json()
            .then((data)=>{
                return data;
            })).catch((err)=>{
                console.log(err);
            })
        }
        else{
            if(tries==100){
                dupli=true;
            }
        }
    }
    return "error";
}

function loadRolledTeam(team){
    team.forEach(function(index,slot){
        generateCard(index, slot);
    })
    rerollEvent();
    createLink();
}

function rerollEvent(){
    const rollGroup = document.querySelectorAll('.reroll');
    rollGroup.forEach((element)=>{
        element.addEventListener("click",function(e){
            let roll_id = parseInt(element.getAttribute("id"));
            if(!team_info[roll_id+1].rerolls==0){
                let response = rollPokemon();
                if(response==="error"){
                    Swal.fire(
                        "",
                        'Cannot find another pokemon!',
                        "warning",
                      );
                    return;
                }
                else{  
                    rolls_left = team_info[roll_id+1].rerolls-=1;
                    response.then(function(data){
                        team_info[roll_id+1]={
                            "name":"",
                            "sprites":{"other":{"official-artwork":{"front-default":""}}},
                            "stats":data.stats,
                            "types":data.types
                        };
                        team_info[roll_id+1].sprites.other['official-artwork'].front_default=data.sprites.other['official-artwork'].front_default;
                        team_info[roll_id+1].name=data.name;
                        team_info[roll_id+1].rerolls=rolls_left;
                        team_info[roll_id+1].id=data.id;
                        loadRolledTeam(team_info.slice(1));
                    });
                }
            }else{
                Swal.fire(
                    "",
                    'Only 2 Rerolls are allowed per slot!',
                    "warning",
                  );
            }
            e.stopImmediatePropagation();
            e.preventDefault
        });
    })
}

// button events

const generate = document.getElementById("generate_team");
generate.addEventListener("click",function(){
    var randomize = randomizePokemonV2(6);
    randomize.then((data)=>{
        data.forEach(function(index,slot){
            getPokemon(index,slot);
        })
    })
});

const save = document.getElementById("save-team");
save.addEventListener("click",saveTeam);

const flush = document.getElementById("del-team");
flush.addEventListener("click",flushTeam);

// load local team if it exists
loadTeam();
