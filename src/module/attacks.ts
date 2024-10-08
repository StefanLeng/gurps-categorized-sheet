const meleeMods =
[
    '["+4 to hit (Telegraphic Attack)"+4 to hit (Telegraphic Attack)]',
    '["−2 to hit (Deceptive Attack)"-2 to hit (Deceptive Attack)]',
    '["−4 to hit (Move and Attack) *Max:9"-4 to hit (Move and Attack) *Max:9]',
    '["+0 Heroic Charge *Cost 1FP"+0 Heroic Charge *Cost 1FP]',
    '["+2 damage (Mighty Blow) *Cost 1FP"+2 damage (Mighty Blow) *Cost 1FP]',
    '["+4 to hit (Determined Attack)"+4 to hit (Determined Attack)]',
    '["+2 damage (Strong Attack)"+2 damage (Strong Attack)]',
];

export function meleeOTFs(actor : any){
    let mods = meleeMods.map(i=>i);
    if (GURPS.findAdDisad(actor, 'Weapon Master')){
        mods.push('["-3 Rapid Strike (Weapon Master)" -3 Rapid Strike]');
        mods.push('["-1 Flurry of blows (Weapon Master) *Cost 1FP" -1 Flurry of Blows *Cost 1FP]');
    } else if (GURPS.findAdDisad(actor, 'Trained by a Master')){
        mods.push('["-3 Rapid Strike (TbaM)" -3 Rapid Strike]');
        mods.push('["-1 Flurry of blows (TbaM) *Cost 1FP" -1 Flurry of Blows *Cost 1FP]');
    } else{
        mods.push('["-6 Rapid Strike" -6 Rapid Strike]');
        mods.push('["-3 Flurry of blows *Cost 1FP" -3 Flurry of Blows *Cost 1FP]');
    }
    return mods.join('');
}

const rangedMods =
[
    '["+1 Aim"+1 Aim]',
    '["+1 to hit (Determined Attack)"+1 to hit (Determined Attack)]',
];

export function rangedOTFs(actor : any){
    let mods = rangedMods.map(i=>i);
    if (GURPS.findAdDisad(actor, 'Weapon Master')){
        mods.push('["-3 Rapid Strike (Thrown Weapon, Weapon Master)" -3 Rapid Strike]');
    } else if (GURPS.findAdDisad(actor, 'Trained by a Master')){
        mods.push('["-3 Rapid Strike (Thrown Weapon, TbaM)" -3 Rapid Strike]');
    } else{
        mods.push('["-6 Rapid Strike (Thrown Weapon)" -6 Rapid Strike]');
    }
    return mods.join('');
}