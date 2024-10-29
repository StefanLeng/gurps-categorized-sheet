import { describe, expect, it } from '@jest/globals';
import { Rec, RecursiveList, findRecursive, emptyList, filterRecursive } from '../src/module/recursiveList.ts';

interface TestRec extends Rec<TestRec> {
    name: string;
}

const empty: RecursiveList<TestRec> = {};

const list: RecursiveList<TestRec> = {
    '0': {
        name: 'otto0',
        contains: emptyList(),
    },
    '1': {
        name: 'otto1',
        contains: {
            '2': {
                name: 'hans2',
                contains: {
                    '3': {
                        name: 'karl3',
                        contains: emptyList(),
                    },
                },
            },
            '4': {
                name: 'karl4',
                contains: {
                    '5': {
                        name: 'else5',
                        contains: emptyList(),
                    },
                },
            },
        },
    },
};

describe('findRecursive', () => {
    it('Should find nothing in an empty list', () => {
        expect(findRecursive(empty, () => true)).toBeUndefined();
    });
    it('Should find nothing with a predicate that match nothing', () => {
        expect(findRecursive(list, () => false)).toBeUndefined();
    });
    it('Should find first element that fits the predicate', () => {
        expect(findRecursive(list, () => true)?.name).toBe('otto0');
    });
    it('Should find first element, breadth first, that fits the predicate', () => {
        expect(findRecursive(list, (i) => i.name.startsWith('karl'))?.name).toBe('karl4');
    });
});

describe('filterRecursive', () => {
    it('Should return an empty list if given an empty list', () => {
        expect(filterRecursive(empty, () => true)).toEqual(empty);
    });
    it('Should return an empty list a predicate that match nothing', () => {
        expect(filterRecursive(list, () => false)).toEqual(empty);
    });
    it('Should return an exact copy of the input list with a predicate that match anything', () => {
        expect(filterRecursive(list, () => true)).toEqual(list);
    });
    it('Should return elemnts that fits the predicat and there parents', () => {
        expect(filterRecursive(list, (i) => i.name.startsWith('karl'))).toEqual({
            '1': {
                name: 'otto1',
                contains: {
                    '2': {
                        name: 'hans2',
                        contains: {
                            '3': {
                                name: 'karl3',
                                contains: emptyList(),
                            },
                        },
                    },
                    '4': {
                        name: 'karl4',
                        contains: {},
                    },
                },
            },
        });
    });
});
