main()

async function main(){
    // Create some informative variables
    let chatTemplate = ""
    let saveType = ""
    // Roll Lair Action
    let newRollString = `1d4`
    let lairRoll = await new Roll(newRollString).roll();
    //Set lair DC
    let lairDC = 13
    // Get roll total and log to console
    let lairAction = lairRoll.total
    console.log(lairAction)
    //Lair action 1
    if(lairAction == 1){
        //Set additional rolls and damage
        let windRoll = await new Roll(`1d4`).roll();
        let lairDamage = await new Roll(`2d6`).roll();
        let windDirection = 'Upward'
        if(lairAction == 2){
            windDirection = 'Downward'
        }else if(lairAction == 3){
            windDirection = 'Leftward'
        }else if(lairAction ==4){
            windDirection = 'Rightward'
        }
        console.log(windRoll)
        console.log(lairDamage)
        //Select save type and output message to players
        saveType = 'str'
        chatTemplate = `
        <p> A strong wind savages through the area, pushing all creatures 10ft ${windDirection}.</p>
        <p> If a creature is in a builidng, they make this save with advantage.</p>
        <p> If a creature hits a builidng, they fall prone and suffer ${lairDamage.total} bludgeoning damage</p>
        <p> DC${lairDC} STR Save</p>`
    }else if(lairAction ==2){
        //Damage and additional damage as needed
        let lairDamage = await new Roll(`2d6`).roll();
        let doubleLair = lairDamage.total * 2
        //Select save type and output message to players
        saveType = 'dex'
        chatTemplate = `
        <p> Strong winds offshore cause a rushing surge of water, battering all creatures outdoors for ${lairDamage.total} bludgeoning damage and are knocked prone.</p>
        <p> If a creature is in a builidng, they make this save with advantage but take double damage ${doubleLair} bludgeoning damage</p>
        <p> DC${lairDC} DEX Save</p>`
        console.log(lairDamage)
        console.log(doubleLair)
    }else if(lairAction == 3){
        chatTemplate = `
        <p> Heavy rains suddenly obscure the area. Visibility is greatly reduced and all creatures are given advantage on hide checks.</p>
        <p> Ranged attacks originating from more than 30-ft away have disadvantage</p>`

    }else if(lairAction ==4){
        // Roll for target and damage
        let lairTarget = await new Roll(`1d20`).roll();
        let lairDamage = await new Roll(`4d6`).roll();
        let halfLairDamage = Math.floor(lairDamage.total / 2 )
        //Select save type and output message to players
        saveType = 'dex'
        chatTemplate = `
        <p> The air is charged with electricity. You're blinded for a moment before being shaken by thunder.</p>
        <p> Lightning strikes at the creature with initiative closest to ${lairTarget.total},</p>
        <p> dealing ${lairDamage.total} in a 5ft radius and ${halfLairDamage} in a 10ft radius.</p>
        <p> DC${lairDC} DEX Save</p>`

        console.log(lairTarget)
        console.log(lairDamage)
        console.log(halfLairDamage)

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