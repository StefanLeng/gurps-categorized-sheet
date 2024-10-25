import { CategoryList, CATEGORIES } from "./types.ts";
import { MODULE_ID,CAT_SHEET_SETTINS } from "./constants.ts";
import { CatSheetSettings, getSettings } from "./settings.ts";

export type CatSheetActorSettings = {
    version : string;
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
    allowExtraEffort : boolean | null,
    hideInactiveAttacks : boolean | null,
}

const emptyList : CategoryList = {
    combat:[],
    exploration:[],
    social: [],
    technical: [],
    powers: []
}

const defaultSettings : CatSheetActorSettings = {
    version : '0.3.0',
    addedItems : {
        skills : emptyList,
        traits : emptyList,
    },
    removedItems : {
        skills : emptyList,
        traits : emptyList,
    },
    allowExtraEffort :  null,
    hideInactiveAttacks :  null,
}

function migrateSetting (settings : CatSheetActorSettings){
    if (foundry.utils.isNewerVersion('0.3.0', settings.version ?? '0.0.0'))
    {
        return {...settings, version : '0.3.0'};
    }
    return settings;
}

export function getActorSettings(actor : Actor) : CatSheetActorSettings {
    const settings = (actor.getFlag(MODULE_ID, CAT_SHEET_SETTINS) ?? defaultSettings) as CatSheetActorSettings;
    return migrateSetting(settings);
}

export function setActorSettings(actor : Actor, settings : CatSheetActorSettings) {
    actor.setFlag(MODULE_ID, CAT_SHEET_SETTINS, settings);
}

export function mergeSettings(settings : CatSheetSettings, actorSettings : CatSheetActorSettings) : CatSheetSettings {
    const newSettings = foundry.utils.deepClone(settings);
    newSettings.allowExtraEffort = actorSettings.allowExtraEffort ?? newSettings.allowExtraEffort;
    newSettings.hideInactiveAttacks = actorSettings.hideInactiveAttacks ?? newSettings.hideInactiveAttacks;
    CATEGORIES.forEach(cat => {
        
        newSettings.items.skills[cat] = 
            newSettings.items.skills[cat]
            .filter( i => !actorSettings.removedItems.skills[cat].some(x => x === i))
            .concat(actorSettings.addedItems.skills[cat]);
        
        newSettings.items.traits[cat] = 
            newSettings.items.traits[cat]
            .filter( i => !actorSettings.removedItems.traits[cat].some(x => x === i))
            .concat(actorSettings.addedItems.traits[cat]);
    });
    return newSettings;
}

export function getMergedSettings(actor : Actor) : CatSheetSettings {
    const settings = getSettings();
    const actorSettings = getActorSettings(actor);
    return mergeSettings(settings, actorSettings);
}