
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

export interface keyedMeleeMode extends MeleeMode{
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

export interface keyedRangedMode extends RangedMode{
    key: string,
}

interface ElementList<TElement>{
    [index: string]:  TElement;
}

interface Weapon{
    name: string,
    notes: string,
}

export interface Hand {
    name : string,
    grip: string
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

export const emptyHand : WeaponGrip= {
    name: "Empty Hand",
    weaponName: "Empty Hand",
    twoHanded: false,
    note: "",
    fixedReach: null,
    ranged: false,
    meleeList: [],
    rangedList:[],             
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

/* assumption: notes on the attack are the VTTNotes from the weapon + the notes from the Attack. The part from the attack represent the skill. */
export function meleeToGrip(equipment : ElementList<Weapon>, melee: keyedMeleeMode) : WeaponGrip{
    let weapon = Object.entries(equipment).find(w => w[1].name === melee.name );
    let weaponName = Array.isArray(weapon) ? weapon[1].name : (melee.mode === "Punch" ? emptyHand.weaponName : "");
    let note = Array.isArray(weapon) ? melee.notes.replace(weapon[1].notes,"").trim() : melee.notes;
    let twoHanded = melee.st.includes('†');
    let fixedReach = melee.reach.includes('*') ? melee.reach : null;
    let name =  weaponName === emptyHand.weaponName ? emptyHand.name : melee.name + (note !== "" ? ` (${note})` : "") + (twoHanded ? " two handed" : "") + (fixedReach !== null ? ` ${fixedReach}` : "");
    return {
        name: name,
        weaponName: weaponName,
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
        name: ranged.name + (ranged.mode !== '' ? ` ${ranged.mode}` : ''),
        weaponName:  Array.isArray(weapon) ? weapon[1].name : "",
        twoHanded: ranged.st.includes('†'),
        note:  Array.isArray(weapon) ? ranged.notes.replace(weapon[1].notes,'').trim() : ranged.notes,
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
    let grips = Object.entries(melees)
    .map( ([k, m]) => {return {...m, key : k}})
    .flatMap(m => splitByReach(m))
    .map( m => meleeToGrip(equipment, m))
    .filter( g => g.weaponName !== "");

    if (grips.findIndex(g => g.name === emptyHand.name) < 0) {
        grips.push(emptyHand)
    }
    return grips;
}

export function rangedGrips (equipment : ElementList<Weapon>, ranged :ElementList<RangedMode>){
    return Object.entries(ranged)
    .map( ([k, m]) => {return {...m, key : k}})
    .map( m => rangedToGrip(equipment, m))
    .filter( g => g.weaponName !== "");
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

export function meleeWithoutGrip(equipment : ElementList<Weapon>, melees :ElementList<MeleeMode>) : keyedMeleeMode[]{
    return Object.entries(melees)
    .map( ([k, m]) => {return {...m, key : k}})
    .filter(m => Object.entries(equipment).every(w => w[1].name !== m.name && m.mode != 'Punch'))
}

export function rangedWithoutGrip(equipment : ElementList<Weapon>, ranged :ElementList<RangedMode>) : keyedRangedMode[]{
    return Object.entries(ranged)
    .map( ([k, m]) => {return {...m, key : k}})
    .filter(m => Object.entries(equipment).every(w => w[1].name !== m.name ))
}

export function initHands(numberOfHands : number){
    let hands : Hand[] = [];
    for (var i=0; i < numberOfHands; i++) {
       hands.push( {name :'Hand ' + (i+1), grip: emptyHand.name});
    }  
    return hands;
}

export function resolveGrips(
    equipment : ElementList<Weapon>, 
    meleeList :ElementList<MeleeMode>,
    rangedList :ElementList<RangedMode>,  
    hands : Hand[]
) : [grips : WeaponGrip[], hands : Hand[], melee : keyedMeleeMode[], ranged :keyedRangedMode[]] 
{
  let grips0 = meleeGrips(equipment, meleeList)
    .concat(rangedGrips(equipment, rangedList));
  let grips = reduceGrips(grips0);
    
  let melee : keyedMeleeMode[] = [];
  let ranged : keyedRangedMode[] = [];
  let selectedGripsNew : string[] = [];
  for (let hand of hands) {
    let grip = grips.find(g=> g.name === hand.grip)  ?? emptyHand;
    if (selectedGripsNew.every(g => grip.name !== g)){
      melee = melee.concat(grip.meleeList);
      ranged = ranged.concat(grip.rangedList);
    }
    selectedGripsNew.push (grip.name);
    hand.grip = grip.name;
  }
  melee = melee.concat(meleeWithoutGrip(equipment, meleeList));
  ranged = ranged.concat(rangedWithoutGrip(equipment, rangedList));
  return [grips, hands, melee, ranged]
}

export function applyGripToHands(grips : WeaponGrip[], gripName :string, index : number, hands : Hand[])
{
    if (index < hands.length && index >= 0){
        let oldGripName = hands[index].grip;
        let oldGrip = grips.find(g => g.name === oldGripName) ?? emptyHand;
        let grip = grips.find(g => g.name === gripName) ?? emptyHand;
        hands[index].grip = "";  
        if (grip.twoHanded){
          let otherHand = oldGrip.twoHanded ? hands.findIndex(h => h.grip === oldGripName) : hands.findIndex(h => h.grip === emptyHand.name);
          otherHand = otherHand < 0 ?  hands.findIndex(h => h.grip !== "") : otherHand;
          if (otherHand >= 0) hands[otherHand].grip = gripName;
        } else if(oldGrip.twoHanded) {
          let otherHand = hands.findIndex(h => h.grip === oldGripName);
          if (otherHand >= 0) hands[otherHand].grip = emptyHand.name;
        }
        hands[index].grip = gripName; 
    }
    return hands;  
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