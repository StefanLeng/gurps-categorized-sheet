import { displaySelected } from './weaponGrips.ts';
import { keyedMeleeMode, WeaponGrip } from './types.ts';
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
function weaponDefenses(grips: WeaponGrip[], defensePossible: boolean): WeaponDefense[] {
    const hideInactive = getSettings().hideInactiveAttacks;
    return grips
        .map((g) =>
            g.meleeList
                .filter((i) => displaySelected(i, hideInactive))
                .reduce(
                    (r: [[number, keyedMeleeMode | undefined], [number, keyedMeleeMode | undefined]], m) => {
                        const b = parseInt(m.block ?? '');
                        if (!isNaN(b) && b > r[0][0]) r[0] = [b, m];
                        const p = parseInt(m.parry ?? '');
                        if (!isNaN(p) && p > r[1][0]) r[1] = [p, m];
                        return r;
                    },
                    [
                        [0, undefined],
                        [0, undefined],
                    ],
                ),
        )
        .map((x) => {
            if (x[0][0] > x[1][0] && x[0][1] !== undefined) {
                return {
                    name: x[0][1].name,
                    notes: '',
                    level: x[0][0],
                    type: 'block',
                    attack: x[0][1],
                    selected: x[0][1].selected && defensePossible,
                } as WeaponDefense;
            } else if (x[1][1] !== undefined) {
                return {
                    name: x[1][1].name,
                    notes: '',
                    level: x[1][0],
                    type: 'parry',
                    attack: x[1][1],
                    selected: x[1][1].selected && defensePossible,
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

export function getDefenses(dodge: number, grips: WeaponGrip[], actor: Actor): Defense[] {
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
    return defenses.concat(weaponDefenses(grips, defensePossible)).filter((d) => d.selected || !hideInactive);
}
