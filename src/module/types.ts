export type SheetOTF = {
    key: string;
    region: string;
    modifier: string;
    flags?: {
        [index: string]: boolean;
    };
    skillRequiered?: string[];
    traitRequiered?: string[];
    traitsForbidden?: string[];
    active: boolean;
    userDefined: boolean;
};

export const OTF_REGIONS = [
    'defence',
    'melee',
    'ranged',
    'reaction',
    'exploration',
    'social',
    'powers',
    'technical',
] as const;

export type otfRegions = (typeof OTF_REGIONS)[number];

export const CATEGORIES = ['combat', 'exploration', 'social', 'powers', 'technical'] as const;

type Cat_tuple = typeof CATEGORIES;

export type categories = Cat_tuple[number];

export type categoriesAndOthers = categories | 'others';

export interface CategoryList {
    [categories: string]: Array<string>;
}
