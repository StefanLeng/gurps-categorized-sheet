import { MyRollTable } from './rollTables.ts';
import { skillCategories, adsCategories} from "./constants.ts";
import { CategoryList, CATEGORIES  } from './types.ts';
import { MODULE_ID, CAT_SHEET_SETTINS } from './constants.ts';

type RollTables = {
    [k in MyRollTable] : string
}

export type CatSheetSettings = {
    rollTables : RollTables,
    items : {
        [index : string] : CategoryList, 
        skills : CategoryList,
        traits : CategoryList,
    }
    allowExtraEffort : boolean,
    hideInactiveAttacks : boolean,
}

export const defaultSettings : CatSheetSettings = {
    rollTables : {
        "Critical Hit" : "Critical Hit" , 
        "Critical Miss" :  "Critical Miss", 
        "Critical Head Blow" : "Critical Head Blow", 
        "Reaction Rolls" : "Reaction Rolls" 
    },
    items : {
        skills: skillCategories,
        traits : adsCategories,
    },
    allowExtraEffort : true,
    hideInactiveAttacks : false
}

function sortTraits(cat : CategoryList) : CategoryList{
    const newcat = {...cat} 
    CATEGORIES.forEach(c => {
        newcat[c].sort();
    });
    return newcat;
}

export function getSettings() : CatSheetSettings {
    const settings = game.settings.get(MODULE_ID, CAT_SHEET_SETTINS);
    return settings;
}

export function sortCategorieSettings(settings : CatSheetSettings) : CatSheetSettings{
    return {
        ...settings,
        items : {
        skills : sortTraits(settings.items.skills),
        traits : sortTraits(settings.items.traits),
        },
    }
}

 export async function setSettings(settings :CatSheetSettings){
    game.settings.set(MODULE_ID, CAT_SHEET_SETTINS, settings);
}
