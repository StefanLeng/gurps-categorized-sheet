import { describe, expect, it } from '@jest/globals';
import { CategoryList } from '../src/module/types.ts';
import { categorize } from '../src/module/categorize.ts';
import { recItem } from '../src/module/displayItemUtils.ts';

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
        expect(categorize(categories, list2, 'combat')).toEqual([
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
        expect(categorize(categories, list2, 'others')).toEqual([
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
