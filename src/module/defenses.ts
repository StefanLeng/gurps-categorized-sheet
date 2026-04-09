import { displaySelected } from './weaponGrips.ts';
import { keyedMeleeMode, WeaponGrip, Hand } from './types.ts';
import { getSettings } from './settings.ts';
import { getMergedSettings } from './actor-settings.ts';

interface Defense {
    name: string;
    notes: string;
    level: number;
    type: 'dodge' | 'block' | 'parry' | 'none';
    selected: boolean;
}

interface WeaponDefense extends Defense {
    attack?: keyedMeleeMode;
}

function compareDefenses(a: WeaponDefense, b: WeaponDefense) {
    return a.selected && !b.selected ? -1 : !a.selected && b.selected ? 1 : b.level - a.level;
}
function weaponDefenses(grips: WeaponGrip[], defensePossible: boolean, hands: Hand[]): WeaponDefense[] {
    const hideInactive = getSettings().hideInactiveAttacks;
    return grips
        .map(
            //get the best parry and block per grip: [0][0] is the best block level, [0][1] the attack with the best block, [1][0] is the best parry level, [0][1] the attack with the best parry
            (g) =>
                g.meleeList
                    .filter((i) => displaySelected(i, hideInactive))
                    .reduce(
                        (
                            r: [
                                [number, keyedMeleeMode | undefined, boolean],
                                [number, keyedMeleeMode | undefined, boolean],
                            ],
                            m,
                        ) => {
                            const b = parseInt(m.block ?? '');
                            if (!isNaN(b) && b > r[0][0]) r[0] = [b, m, hands.some((h) => h.grip === g.name)];
                            const p = parseInt(m.parry ?? '');
                            if (!isNaN(p) && p > r[1][0]) r[1] = [p, m, hands.some((h) => h.grip === g.name)];
                            return r;
                        },
                        [
                            [0, undefined, false],
                            [0, undefined, false],
                        ],
                    ),
        )
        .map((x) => {
            //make defense: if Block is better, use block, else parry (normally only one should exists)
            if (x[0][0] > x[1][0] && x[0][1] !== undefined) {
                return {
                    name: x[0][1].name,
                    notes: '',
                    level: x[0][0],
                    type: 'block',
                    attack: x[0][1],
                    selected: x[0][2] && defensePossible,
                } as WeaponDefense;
            } else if (x[1][1] !== undefined) {
                return {
                    name: x[1][1].name,
                    notes: '',
                    level: x[1][0],
                    type: 'parry',
                    attack: x[1][1],
                    selected: x[1][2] && defensePossible,
                } as WeaponDefense;
            }
            return {
                name: 'None',
                level: 0,
                notes: '',
                type: 'none',
                selected: false,
            } as WeaponDefense;
        })
        .sort(compareDefenses)
        .filter(
            (def, i, arr) =>
                i === arr.findIndex((v) => v.name === def.name && v.level === def.level && v.type === def.type) &&
                def.type !== 'none',
        ); //remove duplicates}
}

export function getDefenses(dodge: number, grips: WeaponGrip[], actor: Actor, hands: Hand[]): Defense[] {
    const hideInactive = getMergedSettings(actor).hideInactiveAttacks;
    const maneuver = (actor.system as any).conditions.maneuver;
    const defenses: Defense[] = [];
    const defensePossible = (GURPS.Maneuvers.get(maneuver)?.flags.gurps?.defense ?? 'all') !== 'none';
    defenses.push({
        name: '',
        level: dodge,
        type: 'dodge',
        selected: defensePossible,
        notes: '',
    });
    return defenses.concat(weaponDefenses(grips, defensePossible, hands)).filter((d) => d.selected || !hideInactive);
}
