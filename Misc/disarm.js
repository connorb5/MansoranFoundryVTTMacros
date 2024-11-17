main()

async function main(){
  // Get Selected
  let selected = canvas.tokens.controlled;
  if(selected.length > 1){
    ui.notifications.error("Please select only one token")
    return;
  }
  //console.log(selected)
  // Get Target
  let targets = Array.from(game.user.targets)
  if(targets.length == 0 || targets.length > 1 ){
    ui.notifications.error("Please target one token");
    return;
  }
  //console.log(targets)
  let target_actor = targets[0].actor;
  

  let selected_actor = selected[0].actor;
  //console.log(selected_actor);

//let modifier = html.find("#mod")[0].value;
let mod = selected_actor.system.abilities.str.mod;  // Get strength modifier
let nProf = selected_actor.system.attributes.prof; // Proficiency
         
// Roll Attack
let newRollString = `1d20kl + ${nProf} + ${mod}`
let attackRoll = new Roll(newRollString).roll({async:false});

// Get roll total
let result = attackRoll.total
console.log(result)

// Send attack to chate
attackRoll.toMessage({
  rollMode: 'roll',
  speaker: {alias: selected_actor.system.parent.name}
});          


// Target must make a saving throw or be restrained
let modAthe = selected_actor.system.skills.ath.total;  // atheltics modifier
let modAcro = selected_actor.system.skills.acr.total; // acrobatics 

//Use greater of two bonueses
let finalMod = modAthe
let finalModName = 'Athletics'
if(modAcro > modAthe){
    finalMod = modAcro
    finalModName = 'Acrobatics'
}
console.log(finalMod)
//Roll the target's check
let targetCheckString = `1d20 + ${finalMod}`
saveRoll = new Roll(targetCheckString).roll({async:false});

//Get roll total
let saveResult = saveRoll.total
console.log(saveResult);

// Send save to chate
saveRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: target_actor.name}
  });          
  

if(saveResult >= result){
  saveChatTemplate = `
  <p> ${target_actor.name} parries the attack with ease and hold's onto their weapon </p>
  <p> (Rolled ${saveResult} ${finalModName} Check vs. ${selected_actor.system.parent.name}'s DC ${result})
  `
}else{
  saveChatTemplate = `
  <p> ${target_actor.name} is overpowered by the attack and drops their weapon</p>
  <p> (Rolled ${saveResult} ${finalModName} Check vs. ${selected_actor.system.parent.name}'s DC ${result})
  `
}
//Output Results
ChatMessage.create({
    speaker: {
      alias: selected_actor.name
    },
    content: saveChatTemplate,
    roll: attackRoll
  })


};
