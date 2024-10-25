import { WeaponGrip, keyedMeleeMode, displaySelected } from './weaponGrips.ts';
import { getSettings } from './settings.ts';

interface Defence {
    name: string;
    notes: string;
    level: number;
    type: 'dodge' | 'block' | 'parry' | 'none';
    selected: boolean;
}

interface WeaponDefence extends Defence {
    attack?: keyedMeleeMode;
}

function compareDefences(a: WeaponDefence, b: WeaponDefence) {
    return a.selected && !b.selected ? -1 : !a.selected && b.selected ? 1 : b.level - a.level;
}
function weaponDefences(grips: WeaponGrip[]): WeaponDefence[] {
    const hideInactive = getSettings().hideInactiveAttacks;
    return grips
        .map((g) =>
            g.meleeList
                .filter((i) => displaySelected(i, hideInactive))
                .reduce(
                    (r: [[number, keyedMeleeMode | undefined], [number, keyedMeleeMode | undefined]], m) => {
                        const b = parseInt(m.block);
                        if (!isNaN(b) && b > r[0][0]) r[0] = [b, m];
                        const p = parseInt(m.parry);
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
                    notes: x[0][1].notes,
                    level: x[0][0],
                    type: 'block',
                    attack: x[0][1],
                    selected: x[0][1].selected,
                } as WeaponDefence;
            } else if (x[1][1] !== undefined) {
                return {
                    name: x[1][1].name,
                    notes: x[1][1].notes,
                    level: x[1][0],
                    type: 'parry',
                    attack: x[1][1],
                    selected: x[1][1].selected,
                } as WeaponDefence;
            }
            return {
                name: 'None',
                level: 0,
                notes: '',
                type: 'none',
                selected: false,
            } as WeaponDefence;
        })
        .sort(compareDefences)
        .filter(
            (def, i, arr) =>
                i === arr.findIndex((v) => v.name === def.name && v.level === def.level && v.type === def.type) &&
                def.type !== 'none',
        ); //remaove duplicates}
}

export function getDefenses(dodge: number, grips: WeaponGrip[]): Defence[] {
    const defences: Defence[] = [];
    defences.push({
        name: '',
        level: dodge,
        type: 'dodge',
        selected: true,
        notes: '',
    });
    return defences.concat(weaponDefences(grips));
}
