import { describe, expect, it, jest } from '@jest/globals';
import { getDefenses } from '../src/module/defenses.ts';
import { getMergedSettings } from '../src/module/actor-settings.ts';
import { WeaponGrip2 } from '../src/module/types.ts';
import { DisplayMeleeAttack } from '@gurps-types/gurps/display-item.ts';
import { GurpsActorV2 } from '@module/actor/gurps-actor.ts';
import { ActorType } from '@module/actor/types.ts';

jest.mock('../src/module/actor-settings.ts', () => ({
    getMergedSettings: jest.fn(),
}));

const actor = {
    system: { conditions: { maneuver: 'testManeuver' } },
} as unknown as GurpsActorV2<ActorType.Character>;

let defenses = 'all';

(global as any).GURPS = {
    Maneuvers: {
        get: (maneuver: string) => {
            return {
                flags: {
                    gurps: { defense: defenses },
                },
            };
        },
    },
};

const grips: WeaponGrip2[] = [
    {
        name: 'Empty Hand',
        twoHanded: false,
        skill: '',
        fixedReach: null,
        ranged: false,
        meleeList: [{ name: 'Natural Attacks', parry: '11', block: '', reach: 'C' } as DisplayMeleeAttack],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Large Knife',
        twoHanded: false,
        skill: '',
        fixedReach: null,
        ranged: false,
        meleeList: [
            { name: 'Large Knife', parry: '12', block: '', reach: 'C,1' } as DisplayMeleeAttack,
            { name: 'Large Knife', parry: '12', block: '', reach: 'C,1' } as DisplayMeleeAttack,
        ],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear 1*',
        twoHanded: false,
        skill: '',
        fixedReach: '1*',
        ranged: false,
        meleeList: [{ name: 'Spear', parry: '13', block: '', reach: '1*' } as DisplayMeleeAttack],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear two handed 1*',
        twoHanded: true,
        skill: '',
        fixedReach: '1*',
        ranged: false,
        meleeList: [{ name: 'Spear', parry: '13', block: '', reach: '1*' } as DisplayMeleeAttack],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear two handed 2*',
        twoHanded: true,
        skill: '',
        fixedReach: '2*',
        ranged: false,
        meleeList: [{ name: 'Spear', parry: '13', block: '', reach: '2*' } as DisplayMeleeAttack],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear (Staff) two handed',
        twoHanded: true,
        skill: 'Staff',
        fixedReach: null,
        ranged: false,
        meleeList: [{ name: 'Spear', parry: '15', block: '', reach: '1-2' } as DisplayMeleeAttack],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Large Shield',
        twoHanded: true,
        skill: 'Shield',
        fixedReach: null,
        ranged: false,
        meleeList: [{ name: 'Large Shield', parry: '', block: '14', reach: '1' } as DisplayMeleeAttack],
        rangedList: [],
        ready: true,
    },
];

const hands1 = [
    {
        name: 'Hand1',
        grip: 'Spear 1*',
    },
    {
        name: 'Hand2',
        grip: 'Large Shield',
    },
];

describe('The getDefenses function', () => {
    it('Should return the dodge', () => {
        defenses = 'all';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false });
        expect(getDefenses(10, [], actor, [])).toEqual([
            {
                name: '',
                level: 10,
                type: 'dodge',
                selected: true,
                notes: '',
            },
        ]);
    });

    it('Dodge should be deselected if no defenses are possible', () => {
        defenses = 'none';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false });
        expect(getDefenses(10, [], actor, [])).toEqual([
            {
                name: '',
                level: 10,
                type: 'dodge',
                selected: false,
                notes: '',
            },
        ]);
    });

    it('Dodge should not be returned if no defenses are possible and hideInactiveAttacks is true', () => {
        defenses = 'none';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: true });
        expect(getDefenses(10, [], actor, [])).toEqual([]);
    });

    it('Should return a parry per weapon and parry level', () => {
        defenses = 'all';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false });
        expect(getDefenses(10, grips, actor, [])).toEqual(
            expect.arrayContaining([
                {
                    attack: { name: 'Natural Attacks', parry: '11', block: '', reach: 'C' },
                    name: 'Natural Attacks',
                    level: 11,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Spear', parry: '13', block: '', reach: '1*' },
                    name: 'Spear',
                    level: 13,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Spear', parry: '15', block: '', reach: '1-2' },
                    name: 'Spear',
                    level: 15,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Large Knife', parry: '12', block: '', reach: 'C,1' },
                    name: 'Large Knife',
                    level: 12,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
            ]),
        );
    });

    it('Should return a bock per weapon with block', () => {
        defenses = 'all';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false });
        expect(getDefenses(10, grips, actor, [])).toEqual(
            expect.arrayContaining([
                {
                    attack: { name: 'Large Shield', parry: '', block: '14', reach: '1' },
                    name: 'Large Shield',
                    level: 14,
                    type: 'block',
                    selected: false,
                    notes: '',
                },
            ]),
        );
    });

    it('Should select defenses from hold weapons', () => {
        defenses = 'all';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false });
        expect(getDefenses(10, grips, actor, hands1)).toEqual(
            expect.arrayContaining([
                {
                    attack: { name: 'Natural Attacks', parry: '11', block: '', reach: 'C' },
                    name: 'Natural Attacks',
                    level: 11,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Spear', parry: '13', block: '', reach: '1*' },
                    name: 'Spear',
                    level: 13,
                    type: 'parry',
                    selected: true,
                    notes: '',
                },
                {
                    attack: { name: 'Spear', parry: '15', block: '', reach: '1-2' },
                    name: 'Spear',
                    level: 15,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Large Knife', parry: '12', block: '', reach: 'C,1' },
                    name: 'Large Knife',
                    level: 12,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Large Shield', parry: '', block: '14', reach: '1' },
                    name: 'Large Shield',
                    level: 14,
                    type: 'block',
                    selected: true,
                    notes: '',
                },
            ]),
        );
    });

    it('Should show only selected Defenses if HideInactiveAttacks is true', () => {
        defenses = 'all';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: true });
        expect(new Set(getDefenses(10, grips, actor, hands1))).toEqual(
            new Set([
                {
                    attack: { name: 'Spear', parry: '13', block: '', reach: '1*' },
                    name: 'Spear',
                    level: 13,
                    type: 'parry',
                    selected: true,
                    notes: '',
                },
                {
                    attack: { name: 'Large Shield', parry: '', block: '14', reach: '1' },
                    name: 'Large Shield',
                    level: 14,
                    type: 'block',
                    selected: true,
                    notes: '',
                },
                {
                    name: '',
                    level: 10,
                    type: 'dodge',
                    selected: true,
                    notes: '',
                },
            ]),
        );
    });

    it('Should select no defenses from hold weapons when no defenses are possible with the manuever', () => {
        defenses = 'none';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false });
        expect(getDefenses(10, grips, actor, hands1)).toEqual(
            expect.arrayContaining([
                {
                    attack: { name: 'Natural Attacks', parry: '11', block: '', reach: 'C' },
                    name: 'Natural Attacks',
                    level: 11,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Spear', parry: '13', block: '', reach: '1*' },
                    name: 'Spear',
                    level: 13,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Spear', parry: '15', block: '', reach: '1-2' },
                    name: 'Spear',
                    level: 15,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Large Knife', parry: '12', block: '', reach: 'C,1' },
                    name: 'Large Knife',
                    level: 12,
                    type: 'parry',
                    selected: false,
                    notes: '',
                },
                {
                    attack: { name: 'Large Shield', parry: '', block: '14', reach: '1' },
                    name: 'Large Shield',
                    level: 14,
                    type: 'block',
                    selected: false,
                    notes: '',
                },
            ]),
        );
    });

    it('Should show no defenses from hold weapons when no defenses are possible with the manuever and hideInactiveAttacks is true', () => {
        defenses = 'none';
        (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: true });
        expect(getDefenses(10, grips, actor, hands1)).toEqual([]);
    });
});
