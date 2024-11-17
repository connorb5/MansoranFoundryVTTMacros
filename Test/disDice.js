//BASIC CODE BELOW:

// Need to improve chat message output and provide damage roll which should include crits and the claw's fumble damage!!
let thisActor = game.actors.getName('Vrogack Airellan')

// Define variables
let nStrMod = thisActor.system.abilities.str.mod;  // Get strength modifier
let nDexMod = thisActor.system.abilities.dex.mod; // Get dexterity modifier
let nProf = thisActor.system.attributes.prof; // Proficiency

console.log(thisActor.items.find(item => item.name == "The Claw (Maul)").system.attack.bonus)
// Attack modifier for the Claw
let nClawAtkBonus = thisActor.items.find(item => item.name == "The Claw (Maul)").system.attack.bonus; 
// Damage modifier for the Claw, assumed equal to attack
let nClawDmgBonus = nClawAtkBonus; 

// Roll Attack at triple disadvantage using the keep lower chat script (kl)
let newRollString = `3d20kl + ${nProf} + ${nStrMod} + ${nClawAtkBonus}`
let attackRoll = new Roll(newRollString).roll({async:false});
console.log(attackRoll);

// Send attack to chate
attackRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: game.actors.getName('Vrogack Airellan').system.parent.name}
    });


// Check for crit. Iterate through dice and find the "active" that was selected by kl/kh
console.log(attackRoll.dice[0].results);

let finalDie = 0;
for (dieResult of attackRoll.dice[0].results) {
    console.log(dieResult.active)
    if(dieResult.active){
        finalDie = dieResult.result
    }
};
console.log(finalDie);

// Weapon Damage:
let weaponDamage = thisActor.items.find(item => item.name == "The Claw (Maul)").system.damage.parts[0][0];


if(finalDie == 20){
    weaponDamageRoll = `${nStrMod} + ${weaponDamage} + ${weaponDamage} - ${nClawDmgBonus}`;
    console.log(weaponDamageRoll);
    // Roll Damage
    let damageRoll = new Roll(weaponDamageRoll).roll({async:false});
    console.log(damageRoll);
    // Celebtrate critical hit!
    ChatMessage.create({
        content: `
                <p> You expertly hack into a weak spot right as your opponent pivots. You deal <strong>${damageRoll.total} damage</strong> with this massive critical hit!</p>
                `,
        roll: damageRoll
      });
    // Send damage to chat
    damageRoll.toMessage({
        rollMode: 'roll',
        speaker: {alias: game.actors.getName('Vrogack Airellan').system.parent.name}
    });

}else if(finalDie <= 2){
    weaponDamageRoll = `1d6`;
    console.log(weaponDamageRoll);
    // Roll Damage
    let damageRoll = new Roll(weaponDamageRoll).roll({async:false});
    console.log(damageRoll);
    // Send damage to chat
    damageRoll.toMessage({
        rollMode: 'roll',
        speaker: {alias: game.actors.getName('Vrogack Airellan').system.parent.name}
    });

    ChatMessage.create({
    content: `
            <p> The Claw takes it's anger out on you. You winch from the violent imagery in your head. "DO BETTER". You take <strong>${damageRoll.total} physcic damage</strong>.</p>
            `,
    roll: damageRoll
  });
}else{
    weaponDamageRoll = `${nStrMod} + ${weaponDamage}`;
    console.log(weaponDamageRoll);
    // Roll Damage
    let damageRoll = new Roll(weaponDamageRoll).roll({async:false});
    console.log(damageRoll);
    // Send damage to chat
    damageRoll.toMessage({
        rollMode: 'roll',
        speaker: {alias: game.actors.getName('Vrogack Airellan').system.parent.name}
    });

}



