import { WeaponGrip, keyedMeleeMode} from './weaponGrips.ts';


interface Defence{
    name: string,
    notes: string,
    level: number,
    type: "dodge" | "block" | "parry" | "none",
    selected: boolean,
  }

interface WeaponDefence extends Defence{
    attack?: keyedMeleeMode,
}

function compareDefences(a : WeaponDefence, b : WeaponDefence){
    return a.selected && !b.selected ? -1 : (!a.selected && b.selected ? 1 : (b.level - a.level))
}
function weaponDefences(grips : WeaponGrip[]) : WeaponDefence[]{
    return  grips
    .map(
        g => g.meleeList.reduce(
        (r : [[number, keyedMeleeMode | undefined],[number, keyedMeleeMode | undefined]] , m) => {
            let b = parseInt(m.block);
            if (!isNaN(b) && b > r[0][0]) r[0] = [b,m];
            let p = parseInt(m.parry);
            if (!isNaN(p) && p > r[1][0]) r[1] = [p,m];
            return r;
        } 
        ,[[0,undefined],[0,undefined]]
        )  
    )
    .map(
        x => {
        if (x[0][0] > x[1][0] && x[0][1] !== undefined)
        {
            return{
            name : x[0][1].name,
            notes : x[0][1].notes,
            level : x[0][0],
            type : "block",
            attack: x[0][1],  
            selected: x[0][1].selected     
            } as WeaponDefence
        } else if (x[1][1] !== undefined){
            return{
            name : x[1][1].name,
            notes : x[1][1].notes,
            level : x[1][0],
            type : "parry",
            attack: x[1][1],           
            selected: x[1][1].selected       
            } as WeaponDefence
        }
        return{
            name : "None",
            level : 0,
            notes : "", 
            type : "none",
            selected: false    
        } as WeaponDefence
        }
    )
    .sort(compareDefences)
    .filter( (def, i, arr) => i === arr.findIndex(v => v.name === def.name && v.level === def.level && v.type === def.type) && def.type !== "none") //remaove duplicates}
}

export function getDefenses(dodge: number, grips : WeaponGrip[]) : Defence[]{
    let defences : Defence[] = [];
    defences.push({
        name : "",
        level : dodge,
        type : "dodge",
        selected: true,
        notes: ""
    });
    return defences.concat(weaponDefences(grips));
}

const defenceMods =
[
    '["+3 to Dodge (retreat)"+3 to Dodge (retreat)]',
    '["+1 to Block/Parry (retreat)"+1 to Block/Parry (retreat)]',
    '["−2 attacked from side"-2 to defence (attacked from side)]',
    '["−1 to defenses due to Deceptive attack"-1 to defenses due to Deceptive attack]',
    '["+2 Feverish Defense *Cost 1FP"+2 Feverish Defense *Cost 1FP]',
];

const accrobaticsMods =
[
    '["Acrobatic Dodge"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [Dodge]]',
    '["Acrobatic Dodge (Retreat)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+3 Retreat]\\\\/r [Dodge]]',
    '["Acrobatic Dodge (Feverish)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+2 Feverish Defense *Cost 1FP]\\\\/r [Dodge]]',
    '["Acrobatic Dodge (Feverish/Retreat)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+2 Feverish Defense *Cost 1FP]\\\\/r [+3 Retreat]\\\\/r [Dodge]]',
];

export function defenceOTFs(actor : any){
    let mods = defenceMods;
    if (GURPS.findSkillSpell(actor, 'Acrobatics')){
        mods = mods.concat(accrobaticsMods);
    }
    return mods.join('');
}