import { describe, expect, it } from '@jest/globals';
import { CategoryList } from '../src/module/types.ts';
import * as RecursiveList from '../src/module/recursiveList.ts';
import { categorize } from '../src/module/categorize.ts';

interface TestRec extends RecursiveList.Rec<TestRec> {
    name: string;
}

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
                collapsed: {
                    '5': {
                        name: 'else5',
                        contains: RecursiveList.emptyList(),
                    },
                },
            },
        },
    },
};

const categories: CategoryList = {
    combat: ['otto0', 'otto1', 'else5'],
    social: ['otto1', 'hans2'],
    exploration: [],
    technical: [],
    powers: [],
    fav: [],
};

describe('The categorize function', () => {
    it('Should return elements that are included in the category and there parents', () => {
        expect(categorize(categories, list, 'combat')).toEqual({
            '0': {
                name: 'otto0',
                contains: RecursiveList.emptyList(),
            },
            '1': {
                name: 'otto1',
                contains: {
                    '4': {
                        name: 'karl4',
                        collapsed: {
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
    it('Should return elements that are included in no category and there parents for others', () => {
        expect(categorize(categories, list, 'others')).toEqual({
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
                        collapsed: RecursiveList.emptyList(),
                    },
                },
            },
        });
    });
});
