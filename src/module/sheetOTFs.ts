import { sheetOTF } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';

const defenceMods : sheetOTF[]=
[
    {region : "defence", modifier: '["+3 to Dodge (retreat)"+3 to Dodge (retreat)]'},
    {region : "defence", modifier: '["+1 to Block/Parry (retreat)"+1 to Block/Parry (retreat)]'},
    {region : "defence", modifier: '["−2 attacked from side"-2 to defence (attacked from side)]'},
    {region : "defence", modifier: '["−1 to defenses due to Deceptive attack"-1 to defenses due to Deceptive attack]'},
    {region : "defence", modifier: '["+2 Feverish Defense *Cost 1FP"+2 Feverish Defense *Cost 1FP]', 
        flags: {
            'extraEffort' : true}},
    {region : "defence", modifier: '["Acrobatic Dodge"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [Dodge]]', 
        skillRequiered:['acrobatics']},
    {region : "defence", modifier: '["Acrobatic Dodge (Retreat)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+3 Retreat]\\\\/r [Dodge]]', 
        skillRequiered:['acrobatics']},
    {region : "defence", modifier: '["Acrobatic Dodge (Feverish)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+2 Feverish Defense *Cost 1FP]\\\\/r [Dodge]]', 
        flags: {
            'extraEffort' : true},
        skillRequiered:['acrobatics']
        },
    {region : "defence", modifier: '["Acrobatic Dodge (Feverish/Retreat)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+2 Feverish Defense *Cost 1FP]\\\\/r [+3 Retreat]\\\\/r [Dodge]]', 
        flags: {
            'extraEffort' : true},
        skillRequiered:['acrobatics']
        },
    {region : "melee", modifier: '["+4 to hit (Telegraphic Attack)"+4 to hit (Telegraphic Attack)]'},
    {region : "melee", modifier: '["−2 to hit (Deceptive Attack)"-2 to hit (Deceptive Attack)]'},
    {region : "melee", modifier: '["−4 to hit (Move and Attack) *Max:9"-4 to hit (Move and Attack) *Max:9]'},
    {region : "melee", modifier: '["+0 Heroic Charge *Cost 1FP"+0 Heroic Charge *Cost 1FP]',
        flags: {
            'extraEffort' : true}},
    {region : "melee", modifier: '["+2 damage (Mighty Blow) *Cost 1FP"+2 damage (Mighty Blow) *Cost 1FP]',
        flags: {
            'extraEffort' : true}},
    {region : "melee", modifier: '["+4 to hit (Determined Attack)"+4 to hit (Determined Attack)]'},
    {region : "melee", modifier: '["+2 damage (Strong Attack)"+2 damage (Strong Attack)]'},
    {region : "melee", modifier: '["-3 Rapid Strike (Weapon Master)" -3 Rapid Strike]',
        traitRequiered: ['Weapon Master']
    },
    {region : "melee", modifier: '["-3 Rapid Strike (TbaM)" -3 Rapid Strike]',
        traitRequiered: ['Trained by a Master']
    },
    {region : "melee", modifier: '["-6 Rapid Strike" -6 Rapid Strike]',
        traitsForbidden: ['Weapon Master', 'Trained by a Master']
    },
    {region : "melee", modifier: '["-1 Flurry of blows (Weapon Master) *Cost 1FP" -1 Flurry of Blows *Cost 1FP]',
        flags: {
            'extraEffort' : true},
        traitRequiered: ['Weapon Master']
    },
    {region : "melee", modifier: '["-1 Flurry of blows (TbaM) *Cost 1FP" -1 Flurry of Blows *Cost 1FP]',
        flags: {
            'extraEffort' : true},
        traitRequiered: ['Trained by a Master']
    },
    {region : "melee", modifier: '["-3 Flurry of blows *Cost 1FP" -3 Flurry of Blows *Cost 1FP]',
        flags: {
            'extraEffort' : true},
        traitsForbidden: ['Weapon Master', 'Trained by a Master']
    },
    {region : "ranged", modifier: '["+1 Aim"+1 Aim]'},
    {region : "ranged", modifier: '["+1 to hit (Determined Attack)"+1 to hit (Determined Attack)]'},
    {region : "ranged", modifier: '["-3 Rapid Strike (Thrown Weapon, Weapon Master)" -3 Rapid Strike]',
        flags: {
            'extraEffort' : true},
        traitRequiered: ['Weapon Master']
    },
    {region : "ranged", modifier: '["-3 Rapid Strike (Thrown Weapon, TbaM)" -3 Rapid Strike]',
        flags: {
            'extraEffort' : true},
        traitRequiered: ['Trained by a Master']
    },
    {region : "ranged", modifier: '["-6 Rapid Strike (Thrown Weapon)" -6 Rapid Strike]',
        flags: {
            'extraEffort' : true},
        traitsForbidden: ['Weapon Master', 'Trained by a Master']
    },
    {region : "reactions", modifier: '["+2 Successful roll against a appropriate skill" +2 Successful roll against a appropriate skill]'},
    {region : "reactions", modifier: '["-2 Repeated attempt" -2 Repeated attempt]'},
];

function isSkillReqeuiementFullfilld(mod : sheetOTF, actor : any) : boolean{
    return mod.skillRequiered ? mod.skillRequiered.length === 0 || mod.skillRequiered.some( i => !!GURPS.findSkillSpell(actor, i)) : true;
}

function isTraitReqeuiementFullfilld(mod : sheetOTF, actor : any) : boolean{
    return mod.traitRequiered ? mod.traitRequiered.length === 0 || mod.traitRequiered.some( i => !!GURPS.findAdDisad (actor, i)) : true;
}

function noForbiddenTraits(mod : sheetOTF, actor : any) : boolean{
    return mod.traitsForbidden ? mod.traitsForbidden.length === 0 || !mod.traitsForbidden.some( i => !!GURPS.findAdDisad (actor, i)) : true;
}

export function getOTFs(region: string, actor : any){
    const allowExtraEffort : boolean = getMergedSettings(actor).allowExtraEffort;
    let mods = 
        defenceMods
        .filter(i => i.region === region)
        .filter(i => isSkillReqeuiementFullfilld(i, actor))
        .filter(i => isTraitReqeuiementFullfilld(i, actor))
        .filter(i => noForbiddenTraits(i, actor))
        .filter(i => (i.flags?.extraEffort ?? allowExtraEffort) === allowExtraEffort)
        .map(i=>i.modifier);

    return mods.join('');
}