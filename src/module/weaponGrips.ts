
interface MeleeMode {
    "notes": string,
    "pageref": string,
    "damage": string,
    "st": string,
    "mode": string,
    "level": number,
    "reach": string,
    "parry": string,
    "block": string,
    "name": string
}

interface keyedMeleeMode extends MeleeMode{
    key: string,
}

interface RangedMode {
    "notes": string,
    "pageref": string,
    "damage": string,
    "st": string,
    "mode": string,
    "level": number,
    "name": string
}

interface keyedRangedMode extends RangedMode{
    key: string,
}

interface ElementList<TElement>{
    [index: string]:  TElement;
}

interface Weapon{
    name: string,
    notes: string,
}

export interface WeaponGrip{
    name: string,
    weaponName: string,
    twoHanded: boolean,
    note: string,
    fixedReach: string | null,
    ranged: boolean,
    meleeList: keyedMeleeMode[],
    rangedList: keyedRangedMode[],   
}

function isReachFixed( reach: string) : boolean{
    return reach.includes('*');
}

export function splitReach(reach: string) : string[]{

    if (!isReachFixed(reach)){
        return [reach];
    } 
    else
    {
        let result : string[] = [];
        let r = reach.replace('*','');
        let rl = r.split(',');
        for ( var x of rl){
            x = x.trim();
            if (x.includes('-')){
                let xl = x.split('-');
                if (xl.length === 2) 
                {
                    let start = 0;
                    if (xl[0] !== 'C')
                    {
                        start = parseInt(xl[0]);
                    }
                    let end = parseInt(xl[1]);
                    if (!isNaN(start) && !isNaN(end)){
                        for (var i =start; i <= end; i++ )
                        result.push((i===0 ? 'C' : i.toString()) + '*');
                    }        
                }
                else//should not happen ...
                {
                    result.push(x + '*');
                }
            }
            else
            {
                result.push(x + '*');
            }
        }
        return result;
    }
};

export function splitByReach(melee :keyedMeleeMode) : keyedMeleeMode[] {
    let reaches = splitReach(melee.reach) ;
    return reaches.map(r => {return {...melee, reach :  r}})
}

export function areReachsCompatible(r1 : string, r2 : string) : boolean{
    if (r1 === r2) return true;
    if (!r1.includes('*') && !r2.includes('*')) return true;
    return false;
}

/* assumption: notes on the attack are the VTTNotes from the weapon + the notes from the Attack. The paart from the attack represent the skill. */
export function meleeToGrip(equipment : ElementList<Weapon>, melee: keyedMeleeMode) : WeaponGrip{
    let weapon = Object.entries(equipment).find(w => w[1].name === melee.name );
    let note = Array.isArray(weapon) ? melee.notes.replace(weapon[1].notes,"").trim() : melee.notes;
    let twoHanded = melee.st.includes('†');
    let fixedReach = melee.reach.includes('*') ? melee.reach : null;
    return {
        name: melee.name + (note !== "" ? " (" + note +")": "") + (twoHanded ? " two handed": "") + (fixedReach !== null ? " " + fixedReach : ""),
        weaponName: Array.isArray(weapon) ? weapon[1].name : "",
        twoHanded: twoHanded,
        note:  note,
        fixedReach: fixedReach,
        ranged: false,
        meleeList: [melee],
        rangedList: [],   
    }
}

export function rangedToGrip(equipment : ElementList<Weapon>, ranged: keyedRangedMode) : WeaponGrip{
    let weapon = Object.entries(equipment).find(w => w[1].name === ranged.name );
    return {
        name: ranged.name + (ranged.mode !== "" ? " " + ranged.mode : ""),
        weaponName:  Array.isArray(weapon) ? weapon[1].name : "",
        twoHanded: ranged.st.includes('†'),
        note:  Array.isArray(weapon) ? ranged.notes.replace(weapon[1].notes,"").trim() : ranged.notes,
        fixedReach: 'ranged',
        ranged: true,
        meleeList: [],
        rangedList: [ranged],   
    }
}

export function areGripsEqual(grip1 : WeaponGrip, grip2: WeaponGrip){
    return grip1.weaponName === grip2.weaponName 
        && grip1.twoHanded === grip2.twoHanded
        && grip1.note === grip2.note
        && grip1.fixedReach === grip2.fixedReach
        && grip1.ranged === grip2.ranged;
}

export function combineGrips(grip1 : WeaponGrip, grip2: WeaponGrip){
    return {
        ...grip1,
        meleeList: grip1.meleeList.concat(grip2.meleeList),
        rangedList: grip1.rangedList.concat(grip2.rangedList),
    };
}

export function meleeGrips (equipment : ElementList<Weapon>, melees :ElementList<MeleeMode>){
    return Object.entries(melees)
    .map( ([k, m]) => {return {...m, key : k}})
    .flatMap(m => splitByReach(m))
    .map( m => meleeToGrip(equipment, m))
    .filter( g => g.weaponName !== "");
}

export function rangedGrips (equipment : ElementList<Weapon>, ranged :ElementList<RangedMode>){
    return Object.entries(ranged)
    .map( ([k, m]) => {return {...m, key : k}})
    .map( m => rangedToGrip(equipment, m));
}

export function reduceGrips(grips : WeaponGrip[]){
    return grips.reduce((gl : WeaponGrip[], g) => {
        let i = gl.findIndex( g1 => areGripsEqual(g1, g));
        if ( i >= 0 ) 
            gl[i] = combineGrips(gl[i], g)
        else
            gl.push(g);
        return gl;
    }, [])
}

/*
Object.entries(data.system.equipment.carried).map(
    eq => {
        const melees = Object.entries(data.system.melee).filter(e =>e[1].name===eq[1].name);
        let result = [eq[0],melees];
        return ;
    }
);

Object.entries(data.system.melee).map(
    m => {
        weapon: Object.entries(data.system.equipment.carried).find(w => w[1].name = m[1].name )
    }
);

Object.entries(data.system.melee).map(
    m => {return {
        name: m[1].name, 
        reach: m[1].reach,
        mode: m[1].mode,
        st: m[1].st,
        twoHanded: m[1].st.includes('†'),
        parrybonus: m[1].parrybonus,
        notes: m[1].notes,
        weapon: Object.entries(data.system.equipment.carried).find(w => w[1].name === m[1].name )
    }}
).map(
    m => {return {
        ...m,
        note: Array.isArray(m.weapon) ? m.notes.replace(m.weapon[1].notes,"").trim() : m.notes
    }}
).reduce(
    (r,m) =>{
        let i = r.findIndex( x => x.name === m.name && x.twoHanded === m.twoHanded && x.note === m.note)
        if (i >= 0) {
            r[i].nodes.push(m);
            return r;
        } 
        else{
            r.push({
                name: m.name,
                twoHanded: m.twoHanded,
                note: m.note,
                nodes: [m]
            });
            return r;
        }
    },
    []
)
    */