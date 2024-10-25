import { describe, expect, it } from '@jest/globals';

import { splitReach, areReachsCompatible, applyGripToHands, WeaponGrip } from '../src/module/weaponGrips.ts';

describe('The splitReach fuction', () => {
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
    it('Should handle C* correcly', () => {
        expect(splitReach('C*')).toEqual(['C*']);
    });
    it('Should handle C,1* correcly', () => {
        expect(splitReach('C,1*')).toEqual(['C*', '1*']);
    });
    it('Should handle C-2* correcly', () => {
        expect(splitReach('C-2*')).toEqual(['C*', '1*', '2*']);
    });
});

describe('The areReachsCompatible fuction', () => {
    it.each([
        ['1', '1'],
        ['1-2', '1-2'],
        ['1*', '1*'],
        ['2*', '2*'],
    ])('Should treat equal reaches as compatible', (a: string, b: string) => {
        expect(areReachsCompatible(a, b)).toEqual(true);
    });
    it.each([
        ['1', '2'],
        ['1-2', '1'],
        ['1', '2-3'],
        ['1', 'C,1'],
    ])('Should treat all reaches without * as compatible', (a: string, b: string) => {
        expect(areReachsCompatible(a, b)).toEqual(true);
    });
    it.each([
        ['1*', '2*'],
        ['2*', '1*'],
        ['C*', '1*'],
        ['1*', 'C*'],
    ])('Should treat differnt reaches with * as incompatible', (a: string, b: string) => {
        expect(areReachsCompatible(a, b)).toEqual(false);
    });
    it.each([
        ['1*', '1'],
        ['1', '1*'],
        ['C', '1*'],
        ['1', 'C*'],
    ])('Should treat  reaches with * as incompatible wiht reaches without *', (a: string, b: string) => {
        expect(areReachsCompatible(a, b)).toEqual(false);
    });
});

const grips: WeaponGrip[] = [
    {
        name: 'Epmty Hand',
        weaponName: 'Epmty Hand',
        weaponNote: '',
        twoHanded: false,
        note: '',
        fixedReach: null,
        ranged: false,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Large Knife',
        weaponName: 'Large Knife',
        weaponNote: '',
        twoHanded: false,
        note: '',
        fixedReach: null,
        ranged: false,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Spear 1*',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: false,
        note: '',
        fixedReach: '1*',
        ranged: false,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Spear two handed 1*',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: true,
        note: '',
        fixedReach: '1*',
        ranged: false,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Spear two handed 2*',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: true,
        note: '',
        fixedReach: '2*',
        ranged: false,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Spear (Staff) two handed',
        weaponName: 'Spear',
        weaponNote: '',
        twoHanded: true,
        note: 'Staff',
        fixedReach: null,
        ranged: false,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Large Knife Thrown',
        weaponName: 'Large Knife',
        weaponNote: '',
        twoHanded: false,
        note: '',
        fixedReach: 'ranged',
        ranged: true,
        meleeList: [],
        rangedList: [],
    },
    {
        name: 'Spear Thrown',
        weaponNote: '',
        weaponName: 'Spear',
        twoHanded: false,
        note: '',
        fixedReach: 'ranged',
        ranged: true,
        meleeList: [],
        rangedList: [],
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
    it('Applys a one handed Grip to one hand', () => {
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
    it('Applys a two handed Grip to two hand', () => {
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
    it('When switching vom a 2-handed grip to an one handend, sts th other hand to empty', () => {
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
