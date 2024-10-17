import { rollTableExists, drawTableRoll } from  './rollTables.ts';

export function reactionTableExists(){
    return rollTableExists("Reaction Rolls");
}

export function drawReactionRoll() {
    drawTableRoll("Reaction Rolls");
    GURPS.ModifierBucket.clear();
}
  

const reactionMods =
[
    '["+2 Successful roll against a appropriate skill" +2 Successful roll against a appropriate skill]',
    '["-2 Repeated attempt" -2 Repeated attempt]',
];

export function reactionOTFs (actor : any){
    let mods = reactionMods.map(i=>i);
    return mods.join('');
}