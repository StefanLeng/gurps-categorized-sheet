import { describe, expect, it } from '@jest/globals';
import * as RecursiveList from '../src/module/recursiveList.ts';

interface TestRec extends RecursiveList.Rec<TestRec> {
    name: string;
}

const empty: RecursiveList.List<TestRec> = {};

const list: RecursiveList.List<TestRec> = {
    '0': {
        name: 'otto0',
        contains: RecursiveList.emptyList(),
    },
    '1': {
        name: 'otto1',
        contains: {
            '2': {
                name: 'hans2',
                contains: {
                    '3': {
                        name: 'karl3',
                        contains: RecursiveList.emptyList(),
                    },
                },
            },
            '4': {
                name: 'karl4',
                colapsed: {
                    '5': {
                        name: 'else5',
                        contains: RecursiveList.emptyList(),
                    },
                },
            },
        },
    },
};

describe('findRecursive', () => {
    it('Should find nothing in an empty list', () => {
        expect(RecursiveList.find(empty, () => true)).toBeUndefined();
    });
    it('Should find nothing with a predicate that match nothing', () => {
        expect(RecursiveList.find(list, () => false)).toBeUndefined();
    });
    it('Should find first element that fits the predicate', () => {
        expect(RecursiveList.find(list, () => true)?.name).toBe('otto0');
    });
    it('Should find first element, breadth first, that fits the predicate', () => {
        expect(RecursiveList.find(list, (i) => i.name.startsWith('karl'))?.name).toBe('karl4');
    });
    it('Should find elementsin colapsed sections', () => {
        expect(RecursiveList.find(list, (i) => i.name.startsWith('else'))?.name).toBe('else5');
    });
});

describe('filterRecursive', () => {
    it('Should return an empty list if given an empty list', () => {
        expect(RecursiveList.filter(empty, () => true)).toEqual(empty);
    });
    it('Should return an empty list a predicate that match nothing', () => {
        expect(RecursiveList.filter(list, () => false)).toEqual(empty);
    });
    it('Should return an exact copy of the input list with a predicate that match anything', () => {
        expect(RecursiveList.filter(list, () => true)).toEqual(list);
    });
    it('Should return elemnts that fits the predicat and there parents', () => {
        expect(RecursiveList.filter(list, (i) => i.name.startsWith('karl'))).toEqual({
            '1': {
                name: 'otto1',
                contains: {
                    '2': {
                        name: 'hans2',
                        contains: {
                            '3': {
                                name: 'karl3',
                                contains: RecursiveList.emptyList(),
                            },
                        },
                    },
                    '4': {
                        name: 'karl4',
                        colapsed: {},
                    },
                },
            },
        });
    });
    it('Should return colapsed elemnts that fits the predicat and there parents', () => {
        expect(RecursiveList.filter(list, (i) => i.name.startsWith('else'))).toEqual({
            '1': {
                name: 'otto1',
                contains: {
                    '4': {
                        name: 'karl4',
                        colapsed: {
                            '5': {
                                name: 'else5',
                                contains: RecursiveList.emptyList(),
                            },
                        },
                    },
                },
            },
        });
    });
});

describe('flattenList', () => {
    it('Should return an empty list if given an empty list', () => {
        expect(RecursiveList.flatten(empty)).toEqual(empty);
    });
    it('Should return all elemnts flat', () => {
        expect(RecursiveList.flatten(list)).toEqual({
            '0': {
                name: 'otto0',
                contains: RecursiveList.emptyList(),
            },
            '1': {
                name: 'otto1',
                contains: RecursiveList.emptyList(),
            },
            '12': {
                name: 'hans2',
                contains: RecursiveList.emptyList(),
            },
            '123': {
                name: 'karl3',
                contains: RecursiveList.emptyList(),
            },
            '14': {
                name: 'karl4',
                colapsed: RecursiveList.emptyList(),
            },
            '145': {
                name: 'else5',
                contains: RecursiveList.emptyList(),
            },
        });
    });
});
