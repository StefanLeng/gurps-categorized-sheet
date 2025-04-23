import { getMergedSettings, getActorSettings } from './actor-settings.ts';
import * as RecursiveList from './recursiveList.ts';
import { getSystemSetting } from './settings.ts';
import {
    AttackMode,
    Keyed,
    MeleeMode,
    KeyedAttack,
    keyedMeleeMode,
    RangedMode,
    keyedRangedMode,
    Equipment,
    Hand,
    WeaponGrip,
    Weapon,
} from './types.ts';

const emptyHand: WeaponGrip = {
    name: 'Empty Hand',
    weaponName: 'Empty Hand',
    twoHanded: false,
    skill: '',
    weaponNote: '',
    fixedReach: null,
    ranged: false,
    meleeList: [],
    rangedList: [],
    ready: true,
};

function isMelee(m: MeleeMode | RangedMode): m is MeleeMode {
    return (m as MeleeMode).reach !== undefined;
}

function isRanged(m: MeleeMode | RangedMode): m is RangedMode {
    return (m as RangedMode).acc !== undefined;
}

/* assumption: notes on the attack are the VTTNotes from the weapon + the notes from the Attack.*/
function attackToGrip(
    equipment: RecursiveList.List<Equipment>,
    attack: keyedMeleeMode | keyedRangedMode,
    emptyHandWeapons: { name: string; usage: string }[],
    ST: number,
): WeaponGrip {
    const weapon = RecursiveList.findBestNameFit(equipment, attack.name);
    const weaponName = weapon
        ? weapon.name
        : emptyHandWeapons.some((w) => (w.name === attack.name && w.usage === attack.mode) ?? '')
          ? emptyHand.weaponName
          : '';
    const weaponNote = weapon ? weapon.notes : '';
    const note = weaponName !== emptyHand.weaponName ? (attack.notes?.replace(weaponNote, '').trim() ?? '') : '';
    const numStr = attack.st?.match(/[\d]+/g);
    const twoHanded = (attack.st?.includes('†') ?? false) || (attack.st?.includes('‡') ?? false);
    const weaponSt = !!numStr ? Number.parseInt(numStr[0]) : NaN;
    const highST = ST >= weaponSt * 1.5;
    const fixedReach = isMelee(attack) ? (attack.reach?.includes('*') ? attack.reach : null) : 'ranged';
    const skill = ''; //we can not determine the skill at the moment
    const name = isMelee(attack)
        ? weaponName === emptyHand.weaponName
            ? emptyHand.name
            : attack.name +
              (skill !== '' ? ` (${skill})` : '') +
              (twoHanded ? (highST ? ' (high ST)' : ' two handed') : '') +
              (fixedReach !== null ? ` ${fixedReach}` : '')
        : attack.name + (attack.mode !== '' ? ` ${attack.mode}` : '') + (twoHanded && highST ? ' (high ST)' : '');

    const grip: WeaponGrip = {
        name: name,
        weaponName: weaponName,
        twoHanded: twoHanded && !highST,
        skill: skill,
        weaponNote: weaponNote,
        fixedReach: fixedReach,
        ranged: isRanged(attack),
        meleeList: isMelee(attack) ? [{ ...attack, notes: note }] : [],
        rangedList: isRanged(attack) ? [{ ...attack, notes: note }] : [],
        ready: true,
    };

    return grip;
}

function makeUnready(grip: WeaponGrip): WeaponGrip {
    return {
        ...grip,
        name: `${grip.weaponName}${grip.twoHanded ? ' t.h.' : ''} (unready)`,
        ready: false,
        meleeList: [],
        rangedList: [],
    };
}

function areGripsEqual(grip1: WeaponGrip, grip2: WeaponGrip) {
    return (
        grip1.weaponName === grip2.weaponName &&
        grip1.twoHanded === grip2.twoHanded &&
        grip1.ready === grip2.ready &&
        ((grip1.skill === grip2.skill && grip1.fixedReach === grip2.fixedReach && grip1.ranged === grip2.ranged) ||
            !grip1.ready)
    );
}

function combineGrips(grip1: WeaponGrip, grip2: WeaponGrip) {
    return {
        ...grip1,
        meleeList: grip1.meleeList.concat(grip2.meleeList),
        rangedList: grip1.rangedList.concat(grip2.rangedList),
    };
}

function makeGrips(
    equipment: RecursiveList.List<Equipment>,
    melees: RecursiveList.ElementList<MeleeMode | RangedMode>,
    ranged: RecursiveList.ElementList<MeleeMode | RangedMode>,
    emptyHandWeapons: { name: string; usage: string }[],
    ST: number,
) {
    const grips = Object.entries(melees)
        .concat(Object.entries(ranged))
        .map(([k, m]) => {
            return { ...m, key: k, selected: false };
        })
        //.flatMap(m => splitByReach(m))
        .map((m) => attackToGrip(equipment, m, emptyHandWeapons, ST))
        .filter((g) => g.weaponName !== '')
        .flatMap((m) => (m.name === emptyHand.name ? [m] : [m, makeUnready(m)]));

    if (grips.findIndex((g) => g.name === emptyHand.name) < 0) {
        grips.push(emptyHand);
    }
    return grips;
}

function reduceGrips(grips: WeaponGrip[]) {
    return grips.reduce((gl: WeaponGrip[], g) => {
        const i = gl.findIndex((g1) => areGripsEqual(g1, g));
        if (i >= 0) gl[i] = combineGrips(gl[i], g);
        else gl.push(g);
        return gl;
    }, []);
}

function attackWithoutGrip<T extends AttackMode>(
    equipment: RecursiveList.List<Equipment>,
    melees: RecursiveList.ElementList<T>,
    emptyHandWeapons: { name: string; usage: string }[],
    attacksPossible: boolean,
): (T & Keyed)[] {
    return Object.entries(melees)
        .map(([k, m]) => {
            return { ...m, key: k, selected: attacksPossible };
        })
        .filter(
            (m) =>
                !RecursiveList.nameStartExists(equipment, m.name) &&
                !emptyHandWeapons.some((w) => w.name === m.name && w.usage === (m.mode ?? '')),
        );
}

function nonEquipmentWeapons(
    modes: keyedMeleeMode[] | keyedRangedMode[],
    modes2: keyedMeleeMode[] | keyedRangedMode[],
) {
    return modes.concat(modes2).reduce((wl: Weapon[], m) => {
        const i = wl.findIndex((w) => w.name === m.name);
        if (i >= 0) {
            if (isMelee(m)) {
                wl[i].meleeList.push(m);
            } else wl[i].rangedList.push(m);
        } else {
            wl.push({
                name: m.name,
                notes: '',
                grips: [],
                meleeList: isMelee(m) ? [m] : [],
                rangedList: isRanged(m) ? [m] : [],
                equipped: false,
            });
        }
        return wl;
    }, []);
}

function markSelectd(grips: WeaponGrip[], hands: Hand[], attackPossible: boolean) {
    return grips.map((g) => {
        const selected = hands.some((h) => h.grip === g.name);
        g.meleeList = selected && attackPossible ? g.meleeList.map(setSelected) : g.meleeList;
        g.rangedList = selected && attackPossible ? g.rangedList.map(setSelected) : g.rangedList;
        return g;
    });
}

function setSelected<T extends Keyed>(mode: T): T {
    return {
        ...mode,
        selected: true,
    };
}

export function displaySelected<T extends Keyed>(mode: T, hideInactive: boolean): boolean {
    return mode.selected || !hideInactive;
}

function addGripToWeapons(weapons: Weapon[], grip: WeaponGrip) {
    const i = weapons.findIndex((w) => w.name === grip.weaponName);
    if (i >= 0) {
        weapons[i].grips.push(grip);
        weapons[i].meleeList = weapons[i].meleeList.concat(grip.meleeList);
        weapons[i].rangedList = weapons[i].rangedList.concat(grip.rangedList);
    } else {
        weapons.push({
            name: grip.weaponName,
            notes: grip.weaponNote,
            grips: [grip],
            meleeList: grip.meleeList,
            rangedList: grip.rangedList,
            equipped: true,
        });
    }
    return weapons;
}

function compareAttacks(a: KeyedAttack | undefined, b: KeyedAttack | undefined) {
    if (!a) return 1;
    if (!b) return -1;
    return a.selected && !b.selected
        ? -1
        : !a.selected && b.selected
          ? 1
          : (a.mode ?? '') > (b.mode ?? '')
            ? 1
            : (a.mode ?? '') < (b.mode ?? '')
              ? -1
              : 0;
}

function isSelected(w: Weapon) {
    return w.meleeList.some((m) => m.selected) || w.rangedList.some((m) => m.selected);
}

function compareWeapons(a: Weapon, b: Weapon) {
    return isSelected(a) && !isSelected(b) ? -1 : !isSelected(a) && isSelected(b) ? 1 : a.name > b.name ? 1 : -1;
}

function isAttackEquippped(
    attack: AttackMode,
    equipment: { carried: RecursiveList.List<Equipment>; other: RecursiveList.List<Equipment> },
): boolean {
    const filterEquipped = getSystemSetting('remove-unequipped-weapons');
    const isEquipped = RecursiveList.some(
        equipment.carried,
        (w) => attack.name.startsWith(w.name) && (!filterEquipped || w.equipped),
    );
    const isNotFromWeapon =
        !RecursiveList.nameStartExists(equipment.carried, attack.name) &&
        !RecursiveList.nameStartExists(equipment.other, attack.name);
    return isEquipped || isNotFromWeapon;
}

function fixMelee(mode: MeleeMode): MeleeMode {
    if (mode.reach === undefined) {
        return { ...mode, reach: '' };
    } else return mode;
}

function fixRanged(mode: RangedMode): RangedMode {
    if (mode.acc === undefined) {
        return { ...mode, acc: '' };
    } else return mode;
}

function attackPossible(actor: Actor) {
    const attackManeuvers = [
        'attack',
        'allout_attack',
        'aoa_determined',
        'aoa_double',
        'aoa_feint',
        'aoa_strong',
        'aoa_suppress',
        'move_and_attack',
        'undefined', //returned out of combat!
    ];
    const maneuver = (actor.system as any).conditions.maneuver;
    return !!maneuver ? attackManeuvers.some((i) => i === maneuver) : true;
}

export function resolveWeapons(
    equipment: { carried: RecursiveList.List<Equipment>; other: RecursiveList.List<Equipment> },
    meleeListIn: RecursiveList.ElementList<MeleeMode>,
    rangedListIn: RecursiveList.ElementList<RangedMode>,
    handsIn: Hand[],
    actor: Actor,
): [grips: WeaponGrip[], hands: Hand[], meleeWeapons: Weapon[], rangedWeapons: Weapon[]] {
    const emptyHandWeapons = getActorSettings(actor).emptyHandAttacks ?? [];
    const mergedSetting = getMergedSettings(actor);
    const meleeList0 = RecursiveList.filterList(meleeListIn, (a) => isAttackEquippped(a, equipment));
    const meleeList = RecursiveList.mapList(meleeList0, fixMelee);
    const rangedList0 = RecursiveList.filterList(rangedListIn, (a) => isAttackEquippped(a, equipment));
    const rangedList = RecursiveList.mapList(rangedList0, fixRanged);
    const grips00 = makeGrips(
        equipment.carried,
        meleeList,
        rangedList,
        emptyHandWeapons,
        mergedSetting.highStrengthOneHanded ? (actor.system as any).attributes.ST.value : 0,
    );
    const grips0 = reduceGrips(grips00);

    const hands = handsIn.map((h) => {
        return { ...h, grip: grips0.find((g) => g.name === h.grip)?.name ?? emptyHand.name };
    });

    const attacksPossible = attackPossible(actor);

    const grips = markSelectd(grips0, hands, attacksPossible);
    const hideInactive = mergedSetting.hideInactiveAttacks;

    const weapons: Weapon[] = grips
        .reduce(addGripToWeapons, [])
        .map((w) => {
            w.meleeList = w.meleeList.filter((i) => displaySelected(i, hideInactive)).sort(compareAttacks);
            w.rangedList = w.rangedList.filter((i) => displaySelected(i, hideInactive)).sort(compareAttacks);
            return w;
        })
        .concat(
            nonEquipmentWeapons(
                attackWithoutGrip(equipment.carried, meleeList, emptyHandWeapons, attacksPossible)
                    .filter((i) => displaySelected(i, hideInactive))
                    .sort(compareAttacks),
                attackWithoutGrip(equipment.carried, rangedList, emptyHandWeapons, attacksPossible)
                    .filter((i) => displaySelected(i, hideInactive))
                    .sort(compareAttacks),
            ),
        );

    const meeleWeapons = weapons.filter((w) => w.meleeList.length > 0).sort(compareWeapons);
    const rangedWeapons = weapons.filter((w) => w.rangedList.length > 0).sort(compareWeapons);

    return [grips, hands, meeleWeapons, rangedWeapons];
}

export function applyGripToHands(grips: WeaponGrip[], gripName: string, index: number, hands: Hand[]) {
    if (index < hands.length && index >= 0) {
        const oldGripName = hands[index].grip;
        const oldGrip = grips.find((g) => g.name === oldGripName) ?? emptyHand;
        const grip = grips.find((g) => g.name === gripName) ?? emptyHand;

        hands[index].grip = '';

        if (grip.twoHanded) {
            let otherHand = oldGrip.twoHanded
                ? hands.findIndex((h) => h.grip === oldGripName)
                : hands.findIndex((h) => h.grip === emptyHand.name);
            otherHand = otherHand < 0 ? hands.findIndex((h) => h.grip !== '') : otherHand;
            if (otherHand >= 0) hands[otherHand].grip = gripName;
        } else if (oldGrip.twoHanded) {
            const otherHand = hands.findIndex((h) => h.grip === oldGripName);
            if (otherHand >= 0) hands[otherHand].grip = emptyHand.name;
        }

        hands[index].grip = gripName;
    }
    return hands;
}

export function initHands(hands_in: Hand[] | undefined, numberOfHands: number) {
    let hands: Hand[] = hands_in ?? [];
    if (hands.length > numberOfHands) {
        hands = [];
    }
    for (let i = hands.length; i < numberOfHands; i++) {
        hands.push({ name: 'Hand ' + (i + 1), grip: emptyHand.name });
    }
    return hands;
}
