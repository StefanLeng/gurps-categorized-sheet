import { describe, expect, it, jest } from '@jest/globals';

import { splitReach, areReachesCompatible } from '../src/module/weaponRreach.ts';

import { applyGripToHands, resolveWeapons } from '../src/module/weaponGrips.ts';
import { WeaponGrip } from '../src/module/types.ts';
import { getMergedSettings, getActorSettings } from '../src/module/actor-settings.ts';
import { getSystemSetting } from '../src/module/settings.ts';

jest.mock('../src/module/actor-settings.ts', () => ({
    getMergedSettings: jest.fn(),
    getActorSettings: jest.fn(),
}));

jest.mock('../src/module/settings.ts', () => ({
    getSystemSetting: jest.fn(),
}));

describe('The splitReach function', () => {
    it('Should return a input without * unchanged in an array', () => {
        expect(splitReach('1-2')).toEqual(['1-2']);
    });
    it('Should return a input with * unchanged in an array, if it is a single reach', () => {
        expect(splitReach('1*')).toEqual(['1*']);
    });
    it('Should split a input with * at a ,', () => {
        expect(splitReach('1,2*')).toEqual(['1*', '2*']);
    });
    it('Should expand a range with * to single reaches', () => {
        expect(splitReach('1-3*')).toEqual(['1*', '2*', '3*']);
    });
    it('Should handle C* correctly', () => {
        expect(splitReach('C*')).toEqual(['C*']);
    });
    it('Should handle C,1* correctly', () => {
        expect(splitReach('C,1*')).toEqual(['C*', '1*']);
    });
    it('Should handle C-2* correctly', () => {
        expect(splitReach('C-2*')).toEqual(['C*', '1*', '2*']);
    });
});

describe('The areReachesCompatible function', () => {
    it.each([
        ['1', '1'],
        ['1-2', '1-2'],
        ['1*', '1*'],
        ['2*', '2*'],
    ])('Should treat equal reaches as compatible', (a: string, b: string) => {
        expect(areReachesCompatible(a, b)).toEqual(true);
    });
    it.each([
        ['1', '2'],
        ['1-2', '1'],
        ['1', '2-3'],
        ['1', 'C,1'],
    ])('Should treat all reaches without * as compatible', (a: string, b: string) => {
        expect(areReachesCompatible(a, b)).toEqual(true);
    });
    it.each([
        ['1*', '2*'],
        ['2*', '1*'],
        ['C*', '1*'],
        ['1*', 'C*'],
    ])('Should treat different reaches with * as incompatible', (a: string, b: string) => {
        expect(areReachesCompatible(a, b)).toEqual(false);
    });
    it.each([
        ['1*', '1'],
        ['1', '1*'],
        ['C', '1*'],
        ['1', 'C*'],
    ])('Should treat  reaches with * as incompatible with reaches without *', (a: string, b: string) => {
        expect(areReachesCompatible(a, b)).toEqual(false);
    });
});

const grips: WeaponGrip[] = [
    {
        name: 'Empty Hand',
        weaponName: 'Empty Hand',
        weaponNote: '',
        twoHanded: false,
        skill: '',
        fixedReach: null,
        ranged: false,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Large Knife',
        weaponName: 'Large Knife',
        weaponNote: '',
        twoHanded: false,
        skill: '',
        fixedReach: null,
        ranged: false,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear 1*',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: false,
        skill: '',
        fixedReach: '1*',
        ranged: false,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear two handed 1*',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: true,
        skill: '',
        fixedReach: '1*',
        ranged: false,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear two handed 2*',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: true,
        skill: '',
        fixedReach: '2*',
        ranged: false,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear (Staff) two handed',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: true,
        skill: 'Staff',
        fixedReach: null,
        ranged: false,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Large Knife Thrown',
        weaponName: 'Large Knife',
        weaponNote: '',
        twoHanded: false,
        skill: '',
        fixedReach: 'ranged',
        ranged: true,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
    {
        name: 'Spear Thrown',
        weaponNote: '',
        weaponName: 'Spear',
        twoHanded: false,
        skill: '',
        fixedReach: 'ranged',
        ranged: true,
        meleeList: [],
        rangedList: [],
        ready: true,
    },
];

const initialHands1 = [
    {
        name: 'Hand1',
        grip: 'Empty Hand',
    },
    {
        name: 'Hand2',
        grip: 'Empty Hand',
    },
];

const initialHands2 = [
    {
        name: 'Hand1',
        grip: 'Spear two handed 1*',
    },
    {
        name: 'Hand2',
        grip: 'Spear two handed 1*',
    },
];

describe('applyGripToHands', () => {
    it('Applies a one handed Grip to one hand', () => {
        expect(applyGripToHands(grips, 'Spear 1*', 1, initialHands1)).toEqual([
            {
                name: 'Hand1',
                grip: 'Empty Hand',
            },
            {
                name: 'Hand2',
                grip: 'Spear 1*',
            },
        ]);
    });
    it('Applies a two handed Grip to two hand', () => {
        expect(applyGripToHands(grips, 'Spear two handed 1*', 1, initialHands1)).toEqual([
            {
                name: 'Hand1',
                grip: 'Spear two handed 1*',
            },
            {
                name: 'Hand2',
                grip: 'Spear two handed 1*',
            },
        ]);
    });
    it('When switching vom a 2-handed grip to an one handed, sts th other hand to empty', () => {
        expect(applyGripToHands(grips, 'Spear 1*', 1, initialHands2)).toEqual([
            {
                name: 'Hand1',
                grip: 'Empty Hand',
            },
            {
                name: 'Hand2',
                grip: 'Spear 1*',
            },
        ]);
    });
});

describe('resolveWeapons', () => {
    (getMergedSettings as any).mockReturnValue({ hideInactiveAttacks: false, highStrengthOneHanded: false });
    (getActorSettings as any).mockReturnValue({ emptyHandAttacks: [] });
    (getSystemSetting as any).mockReturnValue(false);
    it('Should resolve a weapon with a single attack to the correct grip', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                initialHands1,
                {
                    system: { conditions: { maneuver: 'testManeuver' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00008',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-1 cut',
                            st: '6',
                            mode: 'Swung',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
            ]),
        );
    });

    it('Should add an unready grip for the weapon', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                initialHands1,
                {
                    system: { conditions: { maneuver: 'testManeuver' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon (unready)',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [],
                    rangedList: [],
                    ready: false,
                },
            ]),
        );
    });

    it('Should combine compatible attacks to on grip', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                initialHands1,
                {
                    system: { conditions: { maneuver: 'attack' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00008',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-1 cut',
                            st: '6',
                            mode: 'Swung',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                        {
                            key: '00009',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-2 imp',
                            st: '6',
                            mode: 'Trust',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
            ]),
        );
    });

    it('Should make separate grips for one and two-handed attacks', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00010': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6†',
                        mode: 'Trust two-handed',
                        level: 14,
                        reach: '1,2',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                initialHands1,
                {
                    system: { conditions: { maneuver: 'testManeuver' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00008',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-1 cut',
                            st: '6',
                            mode: 'Swung',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                        {
                            key: '00009',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-2 imp',
                            st: '6',
                            mode: 'Trust',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
                {
                    name: 'Test Weapon t.h.',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: true,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00010',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d imp',
                            st: '6†',
                            mode: 'Trust two-handed',
                            level: 14,
                            reach: '1,2',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
            ]),
        );
    });

    it('Should make separate unready grips for one and two-handed attacks', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00010': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6†',
                        mode: 'Trust two-handed',
                        level: 14,
                        reach: '1,2',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                initialHands1,
                {
                    system: { conditions: { maneuver: 'testManeuver' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon (unready)',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [],
                    rangedList: [],
                    ready: false,
                },
                {
                    name: 'Test Weapon t.h. (unready)',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: true,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [],
                    rangedList: [],
                    ready: false,
                },
            ]),
        );
    });

    it('Should mark attacks from hold weapons as selected when the maneuver allows attacks', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00010': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6†',
                        mode: 'Trust two-handed',
                        level: 14,
                        reach: '1,2',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                [
                    {
                        name: 'Hand1',
                        grip: 'Test Weapon',
                    },
                    {
                        name: 'Hand2',
                        grip: 'Empty Hand',
                    },
                ],
                {
                    system: { conditions: { maneuver: 'attack' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00008',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-1 cut',
                            st: '6',
                            mode: 'Swung',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: true,
                        },
                        {
                            key: '00009',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-2 imp',
                            st: '6',
                            mode: 'Trust',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: true,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
                {
                    name: 'Test Weapon t.h.',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: true,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00010',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d imp',
                            st: '6†',
                            mode: 'Trust two-handed',
                            level: 14,
                            reach: '1,2',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
            ]),
        );
    });

    it('Should not mark attacks from hold weapons as selected when the maneuver allows no attacks', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00010': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6†',
                        mode: 'Trust two-handed',
                        level: 14,
                        reach: '1,2',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {},
                [
                    {
                        name: 'Hand1',
                        grip: 'Test Weapon',
                    },
                    {
                        name: 'Hand2',
                        grip: 'Empty Hand',
                    },
                ],
                {
                    system: { conditions: { maneuver: 'move' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00008',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-1 cut',
                            st: '6',
                            mode: 'Swung',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                        {
                            key: '00009',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-2 imp',
                            st: '6',
                            mode: 'Trust',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
                {
                    name: 'Test Weapon t.h.',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: true,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00010',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d imp',
                            st: '6†',
                            mode: 'Trust two-handed',
                            level: 14,
                            reach: '1,2',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
            ]),
        );
    });

    it('Should make separate grips for ranged attacks', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00010': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6†',
                        mode: 'Trust two-handed',
                        level: 14,
                        reach: '1,2',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {
                    '00011': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6',
                        mode: 'Thrown',
                        level: 14,
                        name: 'Test Weapon',
                        acc: '3',
                    },
                },
                initialHands1,
                {
                    system: { conditions: { maneuver: 'testManeuver' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
                    name: 'Test Weapon',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00008',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-1 cut',
                            st: '6',
                            mode: 'Swung',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                        {
                            key: '00009',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d-2 imp',
                            st: '6',
                            mode: 'Trust',
                            level: 14,
                            reach: 'C,1',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
                {
                    name: 'Test Weapon t.h.',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: true,
                    skill: '',
                    fixedReach: null,
                    ranged: false,
                    meleeList: [
                        {
                            key: '00010',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d imp',
                            st: '6†',
                            mode: 'Trust two-handed',
                            level: 14,
                            reach: '1,2',
                            parry: '10',
                            block: '',
                            name: 'Test Weapon',
                            selected: false,
                        },
                    ],
                    rangedList: [],
                    ready: true,
                },
                {
                    name: 'Test Weapon Thrown',
                    weaponName: 'Test Weapon',
                    weaponNote: '',
                    twoHanded: false,
                    skill: '',
                    fixedReach: 'ranged',
                    ranged: true,
                    meleeList: [],
                    rangedList: [
                        {
                            key: '00011',
                            notes: '',
                            pageref: 'B272',
                            damage: '1d imp',
                            st: '6',
                            mode: 'Thrown',
                            level: 14,
                            name: 'Test Weapon',
                            acc: '3',
                            selected: false,
                        },
                    ],
                    ready: true,
                },
            ]),
        );
    });

    it('Should include Empty Hand in grips', () => {
        expect(
            resolveWeapons(
                {
                    carried: {
                        '000': {
                            name: 'Test Weapon',
                            notes: '',
                            equipped: true,
                        },
                    },
                    other: {},
                },
                {
                    '00008': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-1 cut',
                        st: '6',
                        mode: 'Swung',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00009': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d-2 imp',
                        st: '6',
                        mode: 'Trust',
                        level: 14,
                        reach: 'C,1',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                    '00010': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6†',
                        mode: 'Trust two-handed',
                        level: 14,
                        reach: '1,2',
                        parry: '10',
                        block: '',
                        name: 'Test Weapon',
                    },
                },
                {
                    '00011': {
                        notes: '',
                        pageref: 'B272',
                        damage: '1d imp',
                        st: '6',
                        mode: 'Thrown',
                        level: 14,
                        name: 'Test Weapon',
                        acc: '3',
                    },
                },
                initialHands1,
                {
                    system: { conditions: { maneuver: 'testManeuver' } },
                } as unknown as Actor,
            )[0],
        ).toEqual(
            expect.arrayContaining([
                {
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
                },
            ]),
        );
    });
});

/*
{
    "00000": {
        "notes": "",
        "pageref": "B271",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "originalName": "Natural Attacks",
        "import": "14",
        "damage": "1d-2 cr",
        "st": "",
        "mode": "Bite",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "",
        "techlevel": "",
        "cost": "",
        "reach": "C",
        "parry": "",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Natural Attacks",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00001": {
        "notes": "",
        "pageref": "B271",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "originalName": "Natural Attacks",
        "import": "14",
        "damage": "1d-2 cr",
        "st": "",
        "mode": "Punch",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "",
        "techlevel": "",
        "cost": "",
        "reach": "C",
        "parry": "11",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Natural Attacks",
        "itemModifiers": "",
        "addToQuickRoll": false,
        "parrybonus": "+1"
    },
    "00002": {
        "notes": "",
        "pageref": "B271",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "originalName": "Natural Attacks",
        "import": "14",
        "damage": "",
        "st": "",
        "mode": "Judo",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "",
        "techlevel": "",
        "cost": "",
        "reach": "C",
        "parry": "11",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Natural Attacks",
        "itemModifiers": "",
        "addToQuickRoll": false,
        "parrybonus": "+1"
    },
    "00003": {
        "notes": "",
        "pageref": "B271",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "originalName": "Natural Attacks",
        "import": "12",
        "damage": "1d-1 cr",
        "st": "",
        "mode": "Kick",
        "level": 12,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "",
        "techlevel": "",
        "cost": "",
        "reach": "C,1",
        "parry": "",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Natural Attacks",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00004": {
        "notes": "[\"-3 Vitals\" -3 to hit Vitals] [-3 Rapid Strike] [\"-1 Flurry\" -1 Flurry of Blows *Cost 1FP] [\"+2 dmg. Mighty Blow\"+2 damage (Mighty Blow) *Cost 1FP]",
        "pageref": "B273",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "19",
        "damage": "1d+4 imp",
        "st": "9",
        "mode": "Spear Thrust 1-handed",
        "level": 19,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "4 lb",
        "techlevel": "0",
        "cost": 40,
        "reach": "1*",
        "parry": "13",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Spear",
        "itemModifiers": "",
        "addToQuickRoll": false,
        "parrybonus": "+1"
    },
    "00005": {
        "notes": "[\"-3 Vitals\" -3 to hit Vitals] [-3 Rapid Strike] [\"-1 Flurry\" -1 Flurry of Blows *Cost 1FP] [\"+2 dmg. Mighty Blow\"+2 damage (Mighty Blow) *Cost 1FP]",
        "pageref": "B273",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "19",
        "damage": "1d+5 imp",
        "st": "9†",
        "mode": "Spear Thrust 2-handed",
        "level": 19,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "4 lb",
        "techlevel": "0",
        "cost": 40,
        "reach": "1-2*",
        "parry": "13",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Spear",
        "itemModifiers": "",
        "addToQuickRoll": false,
        "parrybonus": "+1"
    },
    "00006": {
        "notes": "[\"-3 Vitals\" -3 to hit Vitals] [-3 Rapid Strike] [\"-1 Flurry\" -1 Flurry of Blows *Cost 1FP] [\"+2 dmg. Mighty Blow\"+2 damage (Mighty Blow) *Cost 1FP]  Staff",
        "pageref": "B273",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "19",
        "damage": "1d+3 cr",
        "st": "7†",
        "mode": "Staff Swung 2-handed",
        "level": 19,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "4 lb",
        "techlevel": "0",
        "cost": 40,
        "reach": "1-2",
        "parry": "15",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Spear",
        "itemModifiers": "",
        "addToQuickRoll": false,
        "parrybonus": "+3"
    },
    "00007": {
        "notes": "[\"-3 Vitals\" -3 to hit Vitals] [-3 Rapid Strike] [\"-1 Flurry\" -1 Flurry of Blows *Cost 1FP] [\"+2 dmg. Mighty Blow\"+2 damage (Mighty Blow) *Cost 1FP]  Staff",
        "pageref": "B273",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "19",
        "damage": "1d+1 cr",
        "st": "7†",
        "mode": "Staff Trust 2-handed",
        "level": 19,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "4 lb",
        "techlevel": "0",
        "cost": 40,
        "reach": "1-2",
        "parry": "15",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Spear",
        "itemModifiers": "",
        "addToQuickRoll": false,
        "parrybonus": "+3"
    },
    "00008": {
        "notes": "",
        "pageref": "B272",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "14",
        "damage": "1d-1 cut",
        "st": "6",
        "mode": "Swung",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "1 lb",
        "techlevel": "0",
        "cost": 40,
        "reach": "C,1",
        "parry": "10",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Large Knife",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00009": {
        "notes": "",
        "pageref": "B272",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "14",
        "damage": "1d-1 imp",
        "st": "6",
        "mode": "Thrust",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "1 lb",
        "techlevel": "0",
        "cost": 40,
        "reach": "C",
        "parry": "10",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Large Knife",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00010": {
        "notes": "",
        "pageref": "B272",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "14",
        "damage": "1d-2 cut",
        "st": "5",
        "mode": "Swung",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "0.5 lb",
        "techlevel": "0",
        "cost": 30,
        "reach": "C,1",
        "parry": "10",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Small Knife",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00011": {
        "notes": "",
        "pageref": "B272",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": "14",
        "damage": "1d-2 imp",
        "st": "5",
        "mode": "Thrust",
        "level": 14,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "weight": "0.5 lb",
        "techlevel": "0",
        "cost": 30,
        "reach": "C",
        "parry": "10",
        "block": "",
        "baseParryPenalty": -4,
        "name": "Small Knife",
        "itemModifiers": "",
        "addToQuickRoll": false
    }
}



{
    "00000": {
        "notes": "[\"-3 Vitals\" -3 to hit Vitals] [-3 Rapid Strike] [\"-1 Flurry\" -1 Flurry of Blows *Cost 1FP] [\"+2 dmg. Mighty Blow\"+2 damage (Mighty Blow) *Cost 1FP]",
        "pageref": "B273",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": 16,
        "damage": "1d+2 imp",
        "st": "9",
        "mode": "Thrown",
        "level": 16,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "bulk": "-6",
        "legalityclass": "4",
        "ammo": 0,
        "acc": "2",
        "range": "11/16",
        "rof": "1",
        "shots": "T",
        "rcl": "",
        "halfd": "",
        "max": "",
        "name": "Spear",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00001": {
        "notes": "",
        "pageref": "B272",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": 10,
        "damage": "1d-1 imp",
        "st": "6",
        "mode": "Thrown",
        "level": 10,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "bulk": "-2",
        "legalityclass": "4",
        "ammo": 0,
        "acc": "",
        "range": "8/16",
        "rof": "1",
        "shots": "T",
        "rcl": "",
        "halfd": "",
        "max": "",
        "name": "Large Knife",
        "itemModifiers": "",
        "addToQuickRoll": false
    },
    "00002": {
        "notes": "",
        "pageref": "B272",
        "contains": {},
        "uuid": "",
        "parentuuid": "",
        "import": 10,
        "damage": "1d-2 imp",
        "st": "5",
        "mode": "Thrown",
        "level": 10,
        "modifierTags": "",
        "extraAttacks": 0,
        "consumeAction": true,
        "bulk": "-1",
        "legalityclass": "4",
        "ammo": 0,
        "acc": "",
        "range": "5/11",
        "rof": "1",
        "shots": "T",
        "rcl": "",
        "halfd": "",
        "max": "",
        "name": "Small Knife",
        "itemModifiers": "",
        "addToQuickRoll": false
    }
}

    */
