import { describe, expect, it } from '@jest/globals';
import { CategoryList, NamedItem } from '../src/module/types.ts';
import * as RecursiveList from '../src/module/recursiveList.ts';
import { categorize, categorize2 } from '../src/module/categorize.ts';
import { recItem } from '../src/module/displayItemUtils.ts';

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

const list2: recItem[] = [
    {
        name: 'otto0',
        children: [],
        hasChildren: false,
    },
    {
        name: 'otto1',
        children: [
            {
                name: 'hans2',
                children: [
                    {
                        name: 'karl3',
                        children: [],
                        hasChildren: false,
                    },
                ],
                hasChildren: true,
            },
            {
                name: 'karl4',
                children: [
                    {
                        name: 'else5',
                        children: [],
                        hasChildren: false,
                    },
                ],
                hasChildren: true,
            },
        ],
        hasChildren: true,
    },
];

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

describe('The categorize2 function', () => {
    it('Should return elements that are included in the category and there parents', () => {
        expect(categorize2(categories, list2, 'combat')).toEqual([
            {
                name: 'otto0',
                children: [],
                hasChildren: false,
            },
            {
                name: 'otto1',
                children: [
                    {
                        name: 'karl4',
                        children: [
                            {
                                name: 'else5',
                                children: [],
                                hasChildren: false,
                            },
                        ],
                        hasChildren: true,
                    },
                ],
                hasChildren: true,
            },
        ]);
    });
    it('Should return elements that are included in no category and there parents for others', () => {
        expect(categorize2(categories, list2, 'others')).toEqual([
            {
                name: 'otto1',
                children: [
                    {
                        name: 'hans2',
                        children: [
                            {
                                name: 'karl3',
                                children: [],
                                hasChildren: false,
                            },
                        ],
                        hasChildren: true,
                    },
                    {
                        name: 'karl4',
                        children: [],
                        hasChildren: false,
                    },
                ],
                hasChildren: true,
            },
        ]);
    });
});
