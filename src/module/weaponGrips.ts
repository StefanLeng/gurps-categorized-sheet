interface AttackMode{
    "name": string
    "notes": string,
    "pageref": string,
    "damage": string,
    "st": string,
    "mode": string,
    "level": number,
}

interface MeleeMode extends AttackMode{
    "reach": string,
    "parry": string,
    "block": string,
}

interface Keyed {
    key: string,
    selected : boolean,    
}

interface KeyedAttack extends AttackMode, Keyed{}

export interface keyedMeleeMode extends MeleeMode, Keyed{
}

interface RangedMode  extends AttackMode{
}

export interface keyedRangedMode extends RangedMode, Keyed{
}

interface ElementList<TElement>{
    [index: string]:  TElement;
}

interface Equipment{
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
    weaponNote: string,
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
    weaponNote: "",
    fixedReach: null,
    ranged: false,
    meleeList: [],
    rangedList:[],             
}

interface Weapon extends Equipment{
    grips : WeaponGrip[],
    notes : string,
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

/* assumption: notes on the attack are the VTTNotes from the weapon + the notes from the Attack. The part from the attack represent the skill. */
export function meleeToGrip(equipment : ElementList<Equipment>, melee: keyedMeleeMode) : WeaponGrip{
    const weapon = Object.entries(equipment).find(w => w[1].name === melee.name );
    const weaponName = Array.isArray(weapon) ? weapon[1].name : (melee.parry ? emptyHand.weaponName : "");
    const weaponNote = Array.isArray(weapon) ? weapon[1].notes : "";
    const note = melee.notes.replace(weaponNote,"").trim();
    const twoHanded = melee.st.includes('†');
    const fixedReach = melee.reach.includes('*') ? melee.reach : null;
    const name =  weaponName === emptyHand.weaponName ? emptyHand.name : melee.name + (note !== "" ? ` (${note})` : "") + (twoHanded ? " two handed" : "") + (fixedReach !== null ? ` ${fixedReach}` : "");
    return {
        name: name,
        weaponName: weaponName,
        twoHanded: twoHanded,
        note:  note,
        weaponNote: weaponNote,
        fixedReach: fixedReach,
        ranged: false,
        meleeList: [{...melee, notes: note}],
        rangedList: [],   
    }
}

export function rangedToGrip(equipment : ElementList<Equipment>, ranged: keyedRangedMode) : WeaponGrip{
    const weapon = Object.entries(equipment).find(w => w[1].name === ranged.name );
    const weaponNote = Array.isArray(weapon) ? weapon[1].notes : "";
    const note = ranged.notes.replace(weaponNote,'').trim()
    return {
        name: ranged.name + (ranged.mode !== '' ? ` ${ranged.mode}` : ''),
        weaponName:  Array.isArray(weapon) ? weapon[1].name : "",
        twoHanded: ranged.st.includes('†'),
        note:  note,
        weaponNote: weaponNote,
        fixedReach: 'ranged',
        ranged: true,
        meleeList: [],
        rangedList: [{...ranged, notes: note}],   
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

export function meleeGrips (equipment : ElementList<Equipment>, melees :ElementList<MeleeMode>){
    const grips = Object.entries(melees)
    .map( ([k, m]) => {return {...m, key : k, selected : false}})
    //.flatMap(m => splitByReach(m))
    .map( m => meleeToGrip(equipment, m))
    .filter( g => g.weaponName !== "");

    if (grips.findIndex(g => g.name === emptyHand.name) < 0) {
        grips.push(emptyHand)
    }
    return grips;
}

export function rangedGrips (equipment : ElementList<Equipment>, ranged :ElementList<RangedMode>){
    return Object.entries(ranged)
    .map( ([k, m]) => {return {...m, key : k, selected : false}})
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

export function meleeWithoutGrip(equipment : ElementList<Equipment>, melees :ElementList<MeleeMode>) : keyedMeleeMode[]{
    return Object.entries(melees)
        .map( ([k, m]) => {return {...m, key : k, selected : true}})
        .filter(m => Object.entries(equipment).every(w => w[1].name !== m.name && !m.parry))
}

export function rangedWithoutGrip(equipment : ElementList<Equipment>, ranged :ElementList<RangedMode>) : keyedRangedMode[]{
    return Object.entries(ranged)
        .map( ([k, m]) => {return {...m, key : k, selected : true}})
        .filter(m => Object.entries(equipment).every(w => w[1].name !== m.name ))
}

function nonEquipmentMeleeWeapons( modes : keyedMeleeMode[]){
    return modes.reduce(
        (wl: Weapon[], m) => {
            let i = wl.findIndex(w => w.name === m.name);
            if (i >= 0){
                wl[i].meleeList.push(m);
            }
            else
            {
                wl.push(
                    {
                        name: m.name,
                        notes: '',
                        grips: [],
                        meleeList: [m],
                        rangedList: [],        
                    }
                )
            }
            return wl;
        },
        []
    )
}

function nonEquipmentRangedWeapons( modes : keyedRangedMode[]){
    return modes.reduce(
        (wl: Weapon[], m) => {
            let i = wl.findIndex(w => w.name === m.name);
            if (i >= 0){
                wl[i].rangedList.push(m);
            }
            else
            {
                wl.push(
                    {
                        name: m.name,
                        notes: '',
                        grips: [],
                        meleeList: [],
                        rangedList: [m],        
                    }
                )
            }
            return wl;
        },
        []
    )
}

function markSelectd(grips : WeaponGrip[], hands : Hand[]){
    return grips    
        .map( g => {
                let selected = hands.some( h => h.grip === g.name);
                g.meleeList = selected ? g.meleeList.map(setSelected) :  g.meleeList,
                g.rangedList = selected ? g.rangedList.map(setSelected) : g.rangedList
                return g       
        }   )
}

export function initHands(numberOfHands : number){
    let hands : Hand[] = [];
    for (var i=0; i < numberOfHands; i++) {
       hands.push( {name :'Hand ' + (i+1), grip: emptyHand.name});
    }  
    return hands;
}

function setSelected<T extends Keyed>(mode : T) : T {
    return {
        ...mode,
        selected : true
    }
}

function addGripToWeapons( weapons : Weapon[], grip : WeaponGrip, hands : Hand[]){
    let i = weapons.findIndex(w => w.name === grip.weaponName);
    let selected = hands.some( h => h.grip === grip.name);
    if (i >= 0){
        weapons[i].grips.push(grip);
        weapons[i].meleeList = weapons[i].meleeList.concat(selected ? grip.meleeList.map(setSelected) :  grip.meleeList);
        weapons[i].rangedList = weapons[i].rangedList.concat(selected ? grip.rangedList.map(setSelected) : grip.rangedList);
    }
    else
    {
        weapons.push(
            {
                name: grip.weaponName,
                notes: grip.weaponNote,
                grips: [grip],
                meleeList: selected ? grip.meleeList.map(setSelected) :  grip.meleeList,
                rangedList: selected ? grip.rangedList.map(setSelected) : grip.rangedList,        
            }
        )
    }
    return weapons;
}

export function compareAttacks(a : KeyedAttack | undefined, b: KeyedAttack | undefined){
    if (!a) return 1;
    if (!b) return -1;
    return a.selected && !b.selected ? -1 : (!a.selected && b.selected ? 1 : (a.mode > b.mode ? 1 : ( a.mode < b.mode ? -1 : 0)))
}

function isSelected( w : Weapon){
    return w.meleeList.some(m => m.selected) ||  w.rangedList.some(m => m.selected)
}

function compareWeapons(a : Weapon, b: Weapon){
    return isSelected(a) && !isSelected(b) ? -1 
    : (!isSelected(a) && isSelected(b) ? 1 : 
    (a.name > b.name ? 1 : -1));
}

export function resolveWeapons(
    equipment : ElementList<Equipment>, 
    meleeList :ElementList<MeleeMode>,
    rangedList :ElementList<RangedMode>,  
    handsIn : Hand[]
) : [grips : WeaponGrip[], hands : Hand[], meleeWeapons : Weapon[], rangedWeapons : Weapon[], rangedSelcted : boolean] {
    
    const grips00 = 
        meleeGrips(equipment, meleeList)
        .concat(rangedGrips(equipment, rangedList));
    
    const grips0 = reduceGrips(grips00);

    const hands =  handsIn.map(h => {return {...h, grip : grips0.find(g => g.name === h.grip)?.name  ?? emptyHand.name}});

    const grips = markSelectd(grips0, hands);

    const weapons : Weapon[] = 
        grips
        .reduce((wl: Weapon[], g) => addGripToWeapons(wl, g, hands), [])
        .map(w => {
            w.meleeList = w.meleeList.sort(compareAttacks);
            w.rangedList = w.rangedList.sort(compareAttacks);
            return w;
        });

    const meeleWeapons = 
        weapons
        .filter(w => w.meleeList.length > 0)
        .sort(compareWeapons)
        .concat(nonEquipmentMeleeWeapons(meleeWithoutGrip(equipment, meleeList))) ;

    const rangedWeapons = 
        weapons
        .filter(w => w.rangedList.length > 0)
        .sort(compareWeapons) 
        .concat(nonEquipmentRangedWeapons(rangedWithoutGrip(equipment, rangedList))) ;

    const rangedSelcted = hands.some(h => grips.some(g => g.name === h.grip && g.ranged));
                                
    return [grips, hands, meeleWeapons, rangedWeapons, rangedSelcted];
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
