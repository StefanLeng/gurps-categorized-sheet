export type sheetOTF = {
    region : string,
    modifier : string,
    flags? :{
        [index: string] : boolean
    },
    skillRequiered?: string[],
    traitRequiered?: string[],
    traitsForbidden?: string[],
}

export const  CATEGORIES = ["combat" , "exploration", "social", "powers", "technical"] as const;

type Cat_tuple = typeof CATEGORIES;

export type categories = Cat_tuple[number];

export interface CategoryList {
    [categories: string]:  Array<string>;
}
