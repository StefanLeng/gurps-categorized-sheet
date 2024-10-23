import { MyRollTable } from './rollTables.ts';
import { skillCategories, adsCategories, CategoryList, CATEGORIES } from "./constants.ts";
import { SeetingsForm } from "./settingsForm.ts";

export const MODULE_ID = 'gurps-categorized-sheet';
export const SYSTEM_ID = 'gurps';
export const CAT_SHEET_SETTINS = 'cat_sheet_settings'

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

const defaultSettings : CatSheetSettings = {
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

export function registerSettings(): void {
  
  game.settings.registerMenu(MODULE_ID, "cat-sheet-settings", {
    name: "Categorized Sheet settings",
    label: "Configure",      // The text label used in the button
    hint: "Configure settings for the Categorized Character Sheet",
    icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
    type: SeetingsForm,   // A FormApplication subclass
    restricted: true                   // Restrict this submenu to gamemaster only?
  });

  game.settings.register(MODULE_ID, CAT_SHEET_SETTINS, {
    scope: 'world',     // "world" = sync to db, "client" = local storage
    config: false,      // we will use the menu above to edit this setting
    type: Object,
    default: defaultSettings,        // can be used to set up the default structure
  })
};

  export function getSettings() : CatSheetSettings {
    const settings = game.settings.get(MODULE_ID, CAT_SHEET_SETTINS);
 /*   if (!settings.items ){
      settings.items =
      {
        skills : settings.skills,
        traits : settings.traits,
      } 
      settings.skills = undefined;     
      settings.traits = undefined;
    }*/
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
