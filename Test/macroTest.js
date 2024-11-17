main()

async function main(){
  // Get Selected
  let selected = canvas.tokens.controlled;
  if(selected.length > 1){
    ui.notifications.error("Please select only one token")
    return;
  }
  console.log(selected)
  // Get Target
  let targets = Array.from(game.user.targets)
  if(targets.length == 0 || targets.length > 1 ){
    ui.notifications.error("Please target one token");
    return;
  }
  console.log(targets)
  let target_actor = targets[0].actor;
  

  let selected_actor = selected[0].actor;
  console.log(selected_actor);

  // Select Weapon
  // Why Filter instead of Find? Because we are trying to get all weapons from user sheet
  let actorWeapons = selected_actor.items.filter(item => item.type == "weapon")
  let weaponOptions = ""
  for(let item of actorWeapons){
    weaponOptions += `<option value=${item.id}>${item.name} | DMG: ${item.system.damage.parts[0][0]}</option>`
  }

  
  let dialogTemplate = `
  <h1> Pick a weapon for attack:</h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="weapon">${weaponOptions}</select></div>
    <span style="flex:1"><input id="giantSmite" type="checkbox" checked /></span>
    </div>
  `

  new Dialog({
    title: "Roll Attack", 
    content: dialogTemplate,
    buttons: {
      rollAtk: {
        label: "Roll Attack", 
        callback: (html) => {
          let wepID = html.find("#weapon")[0].value;
          let wep = selected_actor.items.find(item => item.id == wepID)
          //let modifier = html.find("#mod")[0].value;
          let mod = selected_actor.system.abilities.str.mod;  // Get strength modifier
          let nProf = selected_actor.system.attributes.prof; // Proficiency
          //Check if smite is occuring
          let giantSmite = html.find("#giantSmite")[0].checked;
          
          // Roll Attack
          let newRollString = `3d20kl + ${wep.system.attack.bonus} + ${nProf} + ${mod}`
          let attackRoll = new Roll(newRollString).roll({async:false});

          // Get roll total
          let result = attackRoll.total
          console.log(result)

          // Send attack to chate
          attackRoll.toMessage({
            rollMode: 'roll',
            speaker: {alias: selected_actor.system.parent.name}
          });
          
          // Print Chat with Button to Roll Damage
          let chatTemplate = ""
          let armor = target_actor.system.attributes.ac.value;
          
          console.log(armor)

          if(result >= armor){
            chatTemplate = `
            <p> Rolled: ${result} against ${armor} Target Armor </p>
            <p> It was a Hit! </p>
            <p> <button id="rollDamage">Roll Damage</button></p>`
          } else {
            chatTemplate = `
            <p> Rolled: ${result} against ${armor} Target Armor </p>
            <p> It was a Miss! </p>`
          }
          
          ChatMessage.create({
            speaker: {
              alias: selected_actor.name
            },
            content: chatTemplate,
            roll: attackRoll
          })
        
        
          let finalDie = 0;
          for (dieResult of attackRoll.dice[0].results) {
              console.log(dieResult.active)
              if(dieResult.active){
                  finalDie = dieResult.result
              }
          };
          console.log(finalDie);
          

           // Weapon Damage:
          let weaponDamage = wep.system.damage.parts[0][0];
          let damageRoll = null;
          if(finalDie == 20){
            weaponDamageRoll = `${mod} + ${weaponDamage} + ${weaponDamage} - ${wep.system.attack.bonus}`;
            // Roll Damage
            damageRoll = new Roll(weaponDamageRoll).roll({async:false});
            // Celebtrate critical hit!
            ChatMessage.create({
              content: `
                 <p> You expertly hack into a weak spot right as your opponent pivots. You deal <strong>${damageRoll.total} damage</strong> with this massive critical hit!</p>`,
              roll: damageRoll
            });
            console.log(damageRoll.total);
          }else if(finalDie <= 2){
            weaponDamageRoll = `1d6`;
            // Roll Damage
            damageRoll = new Roll(weaponDamageRoll).roll({async:false});
            // Natural one message
            ChatMessage.create({
              content: `
                <p> The Claw takes it's anger out on you. You winch from the violent imagery in your head. "DO BETTER". You take <strong>${damageRoll.total} physcic damage</strong>.</p>`,
              roll: damageRoll
            });
            console.log(damageRoll.total);
          }else{
            weaponDamageRoll = `${mod} + ${weaponDamage}`;
            // Roll Damage
            damageRoll = new Roll(weaponDamageRoll).roll({async:false});
            console.log(damageRoll.total);
          }
          console.log(damageRoll.total);
          console.log(weaponDamageRoll);
          
         
        }
      }, 
      close: {
        label: "Close"
      }
    }
  }).render(true)

};
