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