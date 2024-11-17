



chefTreatHealing('Vrogack Airellan')

async function chefTreatHealing(chefName){
  let chefProf = game.actors.getName(chefName).system.attributes.prof;

  let actor = canvas.tokens.controlled[0].actor

  let currentTempHP = actor.system.attributes.hp.temp
  let newHealth = currentTempHP + chefProf

  //Set the temp health gained to the temp max if this is non-zero for this actor
  if(newHealth > actor.system.attributes.hp.tempmax & actor.system.attributes.hp.tempmax > 0){
    newHealth = actor.system.attributes.hp.tempmax
  }

  //Send message indicating the actor has healed
  await actor.update({"system.attributes.hp.temp": newHealth});
  ChatMessage.create({
    content: `${actor.name} healed via ${chefName}'s treat for ${chefProf}, going from ${currentTempHP} to ${newHealth} temporary HP`,
    speaker: {alias: actor.system.parent.name}
  });
}




chefFeat('Vrogack Airellan')
async function chefFeat(chefName){
  let choice = "";
  new Dialog({
    title: `Chef feat!`,
    content: `<p>What kind of meal are we cooking up? Special Food (short rest) or Treats (long rest)?</p>`,
    buttons: {
      short: { label: "Short Rest", callback: () => choice = `short` },
      long: { label: "Long Rest", callback: () => choice = `long` }
    },
    close: (html) => {
      let restType = choice
      
      if(choice == "long"){
        chefFeatLongRest(chefName)
      }else{
        chefFeatShortRest(chefName)
      }
    }
  }).render(true);
}

//On use of chefFeat for short rest, roll 1d8 and output message about user healing bonus
async function chefFeatShortRest(chefName){
  let chefProf = game.actors.getName(chefName).system.attributes.prof;
  let chef = game.actors.getName(chefName);
  //Roll 1d8 for extra healing
  let roll = await new Roll(`1d8`).roll()
  const healResult = roll.result
  // Send attack to chate
  roll.toMessage({
    flavor: `${chefName} has cooked up some special food for ${chefProf} creatures. At the end of the short rest, any creature who eats the food and spends one or more Hit Dice to regain hit points regains an extra ${healResult} hit points!`,
    rollMode: 'roll',
    speaker: {alias: chef.system.parent.name}
  });
}

//On use of chefFeat, put a treat item that has the above macro in it on use in each players inventory. 
//If there are more than the chef's proficiency bonus, output a warning and have player select who get's what
async function chefFeatLongRest(chefName){
  let chefProf = game.actors.getName(chefName).system.attributes.prof;
  let chef = game.actors.getName(chefName);

  ChatMessage.create({
    content: `${chefName} has whipped up a batch of ${chefProf} special treats that restore ${chefProf} temporary HP! These have been added to ${chefName}'s inventory!`,
    speaker: {alias: chef.system.parent.name}
  });

  //Remove all chef's treats from previous batch by updating quantity to chefProf. If none exist, create and update quantity
  const exTreats = chef.items.find(item => item.name == "Chef's Treats")
  if(exTreats != undefined){
    //await chef.items.find("Chef's Treats").delete()
    //console.log("remove successful")
    //Update the quantity of chef's treats
    await exTreats.update({"system.quantity" : chefProf})
  }else{
    //Create a chef's treats item in the chef's inventory
    const item = game.items.getName("Chef's Treats");
    await chef.createEmbeddedDocuments('Item', [item.toObject()])

    //Update the quantity of chef's treats
    let treatItem = chef.items.find(item => item.name == "Chef's Treats")
    await treatItem.update({"system.quantity" : chefProf})
  }

  //The below code has been commented out. It was the beginning of giving treats to players
  //targeted by the chef. However, the chefs feat can be used by a single player. Rather
  //than having a complicated selection process, the chef will be given all treats.
  ////Using filter, get all actors that are characters from the game
  //let allActors = game.actors.filter(actor => actor.type == 'character')
  ////Remove any "echo" characters used by echo knights. Assumed name is Echo
  //allActors.filter(actor => actor.name != 'Echo')

  ////Check to see if there are more players than the players proficiency
  //let requireTargets = false
  //if(allActors.length > chefProf){
  //  ui.notifications.warn("Your proficiency is ${chefProf} which exceeds the number of players in the game. The chef's treats will only be assigned to targeted players")
  //  requireTargets = true
  //}


  //At the end of the short rest, any creature who eats the food and spends one or more Hit Dice to regain hit points regains an extra 1d8 hit points.!!!!!!!

}