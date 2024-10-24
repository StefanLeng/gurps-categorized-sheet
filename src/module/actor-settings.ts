import { CategoryList, CATEGORIES } from "./types.ts";
import { MODULE_ID,CAT_SHEET_SETTINS } from "./constants.ts";
import { CatSheetSettings, getSettings } from "./settings.ts";

export type CatSheetActorSettings = {
    addedItems : {
        [index : string] : CategoryList, 
        skills : CategoryList,
        traits : CategoryList,
    }
    removedItems : {
        [index : string] : CategoryList, 
        skills : CategoryList,
        traits : CategoryList,
    }
    allowExtraEffort? : boolean,
    hideInactiveAttacks? : boolean,
}

const emptyList : CategoryList = {
    combat:[],
    exploration:[],
    social: [],
    technical: [],
    powers: []
}

const defaultSettings : CatSheetActorSettings = {
    addedItems : {
        skills : emptyList,
        traits : emptyList,
    },
    removedItems : {
        skills : emptyList,
        traits : emptyList,
    },
}

export function getActorSettings(actor : Actor) : CatSheetActorSettings {
    const settings = actor.getFlag(MODULE_ID, CAT_SHEET_SETTINS) as CatSheetActorSettings | undefined;
    return settings ?? defaultSettings;
}

export function setActorSettings(actor : Actor, settings : CatSheetActorSettings) {
    actor.setFlag(MODULE_ID, CAT_SHEET_SETTINS, settings);
}

export function mergeSettings(settings : CatSheetSettings, actorSettings : CatSheetActorSettings) : CatSheetSettings {
    settings.allowExtraEffort = actorSettings.allowExtraEffort ?? settings.allowExtraEffort;
    settings.hideInactiveAttacks = actorSettings.hideInactiveAttacks ?? settings.hideInactiveAttacks;
    CATEGORIES.forEach(cat => {
        
        settings.items.skills[cat] = 
            settings.items.skills[cat]
            .filter( i => !actorSettings.removedItems.skills[cat].some(x => x === i))
            .concat(actorSettings.addedItems.skills[cat]);
        
        settings.items.traits[cat] = 
            settings.items.traits[cat]
            .filter( i => !actorSettings.removedItems.traits[cat].some(x => x === i))
            .concat(actorSettings.addedItems.traits[cat]);
    });
    return settings;
}

export function getMergedSettings(actor : Actor) : CatSheetSettings {
    const settings = getSettings();
    const actorSettings = getActorSettings(actor);
    return mergeSettings(settings, actorSettings);
}