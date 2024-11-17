main()

async function main(rollType){
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

  // Select Weapon
  // Why Filter instead of Find? Because we are trying to get all weapons from user sheet
  let actorWeapons = selected_actor.items.filter(item => item.type == "weapon")
  let weaponOptions = ""
  for(let item of actorWeapons){
    weaponOptions += `<option value=${item.id}>${item.name} | DMG: ${item.system.damage.parts[0][0]}</option>`
  }

  
  let dialogTemplate = `
  <h1> Pick a weapon for attack:</h1>
  <div style="display:flex;flex-direction:column;">
    <div  style="flex:1"><select id="weapon">${weaponOptions}</select></div>
    <div style="flex:1;margin-left:100px;"><input id="fireRune" type="checkbox" checked /><label for="fireRune"> Fire Rune?</label>
    <input id="giantsMight" type="checkbox" checked /><label for="giantsMight"> Giant's Might?</label></div>
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
          console.log(wep)
          //let modifier = html.find("#mod")[0].value;
          let mod = selected_actor.system.abilities.str.mod;  // Get strength modifier
          let nProf = selected_actor.system.attributes.prof; // Proficiency
          //Check if giantsMight is occuring
          let fireRune = html.find("#fireRune")[0].checked;
          //If giantsMight is true, create a damage roll for it:
          fireRuneDamage = 0;
          if(fireRune){
            fireRuneDamage = '2d6'
          }
          //Check if giantsMight is occuring
          let giantsMight = html.find("#giantsMight")[0].checked;
          //If giantsMight is true, create a damage roll for it:
          giantsMightDamage = 0;
          if(giantsMight){
            giantsMightDamage = '1d6r'
          }

          // Roll Attack
          let newRollString = `${rollType} + ${wep.system.attack.bonus} + ${nProf} + ${mod}`
          let attackRoll = new Roll(newRollString).roll({async:false});

          // Get roll total
          let result = attackRoll.total
          console.log(result)
          
          // Print Chat with Button to Roll Damage
          let chatTemplate = ""
          let saveChatTemplate = ""
          let armor = target_actor.system.attributes.ac.value;
          //Print target armor
          console.log(armor)
          // Get the final result of the roll to check for crits or crit fails
          let finalDie = 0;
          for (dieResult of attackRoll.dice[0].results) {
              //console.log(dieResult.active)
              if(dieResult.active){
                  finalDie = dieResult.result
              }
          };
          console.log(finalDie);
          
          let saveRoll = null;
          if(result >= armor & finalDie >= 3){
            chatTemplate = `
            <p> Rolled: ${result}(base ${finalDie}) against ${target_actor.name}'s AC (${armor})</p>
            <p> It was a Hit! </p>
            <p> <button id="rollDamage">Roll Damage</button></p>`

            if(fireRune){
              // Target must make a saving throw or be restrained
              let modCon = selected_actor.system.abilities.con.mod;  // Get con modifier
              let saveDC = 8 + modCon + nProf;
              //Get the target's strength save bonus
              let targetStrSave = target_actor.system.abilities.str.save;
              console.log(`Target str save is ${targetStrSave}`)
              // Roll Save
              let targetSaveString = `1d20 + ${targetStrSave}`
              saveRoll = new Roll(targetSaveString).roll({async:false});

              //Get roll total
              let saveResult = saveRoll.total
              console.log(saveResult);
              if(saveResult >= saveDC){
                saveChatTemplate = `
                <p> Fiery Shackles grasp at ${target_actor.name}, but they break free and banishes the shackles </p>
                <p> (Rolled ${saveResult} Str Save vs. ${selected_actor.system.parent.name}'s DC ${saveDC})
                `
              }else{
                saveChatTemplate = `
                <p> Fiery Shackles grasp at ${target_actor.name}, overpowering and restraining them</p>
                <p> (Rolled ${saveResult} Str Save vs. ${selected_actor.system.parent.name}'s DC ${saveDC})
                `
                //Restrain target:
                let uuid = target_actor.uuid;
                game.dfreds.effectInterface.addEffect({ effectName: 'Restrained', uuid});
              }
            }

          } else {
            chatTemplate = `
            <p> Rolled: ${result}(base ${finalDie}) against ${target_actor.name}'s AC (${armor})</p>
            <p> It was a Miss! </p>`
          }
          
          ChatMessage.create({
            speaker: {
              alias: selected_actor.name
            },
            content: chatTemplate,
            roll: attackRoll
          })
        
          // Send attack to chate
          attackRoll.toMessage({
            rollMode: 'roll',
            speaker: {alias: selected_actor.system.parent.name}
          });          

           // Weapon Damage:
          let weaponDamage = wep.system.damage.parts[0][0];
          let damageRoll = null;
          if(finalDie == 20){
            weaponDamageRoll = `${mod} + ${weaponDamage} + ${weaponDamage} - ${wep.system.attack.bonus} + ${wep.system.critical.damage} + ${giantsMightDamage} + ${giantsMightDamage} + ${fireRuneDamage} + ${fireRuneDamage}`;
            // Roll Damage
            damageRoll = new Roll(weaponDamageRoll).roll({async:false});
            // Celebtrate critical hit!
            ChatMessage.create({
              content: `
                 <p> You expertly hack into a weak spot right as your opponent pivots. You deal <strong>${damageRoll.total} damage</strong> with this massive critical hit!</p>`,
              roll: damageRoll
            });
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
            damageRoll.toMessage({
              rollMode: 'roll'
            });
          }else{
            weaponDamageRoll = `${mod} + ${weaponDamage} + ${giantsMightDamage} + ${fireRuneDamage}`;
            // Roll Damage
            damageRoll = new Roll(weaponDamageRoll).roll({async:false});
          }
          console.log(weaponDamageRoll);
          console.log(damageRoll.total);         

          if(fireRune & result >= armor & finalDie >= 3){
            console.log(`Checking the output message for restraining`)
            console.log(saveRoll);
            //Show saving roll result
            saveRoll.toMessage({
              rollMode: 'roll',
              speaker: {alias: target_actor.system.parent.name}
            });   
            //Show the result of the saving throw via a message of end result
            ChatMessage.create({
              content: saveChatTemplate
            }); 
          }


          // Roll Damage
          Hooks.once('renderChatMessage', (chatItem, html) => {
            html.find("#rollDamage").click(() => {
              //console.log("Damage Button Clicked")
              //console.log(damageRoll.total)
              damageRoll.toMessage({
                rollMode: 'roll',
                speaker: {alias: selected_actor.system.parent.name}
              });
            })
          })



        }
      }, 
      close: {
        label: "Close"
      }
    }
  }).render(true)



};
