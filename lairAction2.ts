main()

async function main(){
    function getRandomString(stringArray) {
        const randomIndex = Math.floor(Math.random() * stringArray.length);
        return stringArray[randomIndex];
    }
    // Create some informative variables
    let chatTemplate = ""
    let saveType = ""
    let lairTarget = ""
    // Roll Lair Action
    let newRollString = `1d6`
    let lairRoll = await new Roll(newRollString).roll();
    //Set lair DC
    let lairDC = 16
    // Get roll total and log to console
    let lairAction = lairRoll.total
    console.log(lairAction)
    //Lair action 1
    if(lairAction == 1){
        //Set additional rolls and damage
        let lairDamage = await new Roll(`3d6`).roll();
        console.log(lairDamage)
        //Select save type and output message to players
        chatTemplate = `
        <p> <strong>Assistance from the Crowd</strong>: The cultists can't help but interfere in the fight. A surge of goons
        push inward and grab at your clothes trying to hold you still for Wezrich.
        Make an athletics or acrobatics check to escape the grapple or be restrained and
        Suffer ${lairDamage.total} bludgeoning damage from loose elbows and punches
        <p>DC${lairDC} Ath or Acr Check</p>`
    }else if(lairAction ==2){
        //Set additional rolls and damage
        let lairDamage = await new Roll(`2d6`).roll();
        let lairHeal = await new Roll(`3d8`).roll();
        console.log(lairDamage)
        console.log(lairHeal)
        //Select save type and output message to players
        chatTemplate = `
        <p> <strong>Extreme Faith:</strong> Chants for Wezrich break out amongst the observers. Their religous fervor
        inspires Wezrich, granting him ${lairHeal.total} HP and giving him either advantage on 
        his next attack or ${lairDamage.total} bonus radiant damage on his next spell </p>`
    }else if(lairAction == 3){
        let lairDamage = await new Roll(`2d4`).roll();
        chatTemplate = `
        <p> <strong>Cult Fervor:</strong> Wezrich's cult of terror surges forward, with ${lairDamage.total} cultists joining in to help Wezrich</p>`
    }else if(lairAction == 4){
        // Roll for target and damage
        // Example usage:
        const PCs = ["Dorvyn","Grogmar The Peaceful","Vrogack Airellan","Yorapunith"];
        let lairTargetRoll = await new Roll(`1d4`).roll();
        lairTarget = PCs[lairTargetRoll.total]
        let lairDamage = await new Roll(`3d6`).roll();
        //let halfLairDamage = Math.floor(lairDamage.total / 2 )
        //Select save type and output message to players
        saveType = 'con'
        chatTemplate = `
        <p> <strong>Befuddling Mist:</strong> The cultists toss out dark potions that smash and s
        leak out sulfuric vapors. The smoke fills a 20-ft radius sphere centered on ${lairTarget} 
        The area is heavily obscured and any creature starting its turn within the cloud must succeed 
        on a CON save or suffer ${lairDamage.total} poison damage
        <p> DC${lairDC} DEX Save</p>`
        console.log(lairTarget)
        console.log(lairDamage)
    }else if(lairAction == 5){
        // Roll for target and damage
        // Example usage:
        const PCs = ["Dorvyn","Grogmar The Peaceful","Vrogack Airellan","Yorapunith"];
        let lairTargetRoll = await new Roll(`1d4`).roll();
        lairTarget = PCs[lairTargetRoll.total]
        let lairDamage = await new Roll(`2d6`).roll();
        let lairDamage2 = await new Roll(`2d6`).roll();
        //let halfLairDamage = Math.floor(lairDamage.total / 2 )
        //Select save type and output message to players
        saveType = 'dex'
        chatTemplate = `
        <p> <strong>Otherwordly Assistance:</strong> Unnatural plants spring forth from the ground,
        creating Plant Growth over a 30 ft radius centered on ${lairTarget}. All players in the
        area must succeed on a DEX save or suffer ${lairDamage.total} bludgoning and ${lairDamage2.total} piercing damage 
        from grasping vines</p>
        <p> DC${lairDC} DEX Save</p>`
        console.log(lairTarget)
        console.log(lairDamage)
    }else if(lairAction == 5){
        // Roll for target and damage
        // Example usage:
        const PCs = ["Dorvyn","Grogmar The Peaceful","Vrogack Airellan","Yorapunith"];
        let lairTargetRoll = await new Roll(`1d4`).roll();
        lairTarget = PCs[lairTargetRoll.total]
        let lairDamage = await new Roll(`2d6`).roll();
        let lairDamage2 = await new Roll(`2d6`).roll();
        //let halfLairDamage = Math.floor(lairDamage.total / 2 )
        //Select save type and output message to players
        saveType = 'wis'
        chatTemplate = `
        <p> <strong>Ethereal Music:</strong> ${lairTarget} suddenly hears the most haunting, enchanting tune.</p>
        <p> They are bewitched by this beat and must succeed on a WIS save or Wezrich may </p>
        <p> determine its next move action. The PC is still in control of its action and bonus action. </p>
        <p> The creature may control its own dash. </p>
        <p> DC${lairDC} WIS Save</p>`
        console.log(lairTarget)
        console.log(lairDamage)
    }
    //Send message to chat
    ChatMessage.create({
        content: chatTemplate,
        roll: lairRoll
    })
    //Request saving roll as needed
    if(saveType != ""){
        game.MonksTokenBar.requestRoll([{"token":"Dorvyn"},{"token":"Grogmar The Peaceful"},{"token":"Vrogack Airellan"},{"token":"Yorapunith"}],
            {request:[{"type":"save","key":saveType,"count":1}],
            dc:lairDC, silent:false, fastForward:false, rollMode:'roll'}).Roll()
    }
    
}