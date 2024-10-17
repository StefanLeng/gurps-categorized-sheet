import { MyRollTable } from './rollTables.ts';
import { skillCategories, adsCategories, CategoryList } from "./constants.ts";

export const MODULE_ID = 'gurps-categorized-sheet';
export const SYSTEM_ID = 'gurps';
export const CAT_SHEET_SETTINS = 'cat_sheet_settings'

type RollTables = {
  [k in MyRollTable] : string
}

export type catSheetSettings = {
  rollTables : RollTables,
  skills : CategoryList,
  traits : CategoryList,
  allowExtraEffort : boolean,
  hideInactiveAttacks : boolean,
}

const defaultSettings : catSheetSettings = {
  rollTables : {
    "Critical Hit" : "Critical Hit" , 
    "Critical Miss" :  "Critical Miss", 
    "Critical Head Blow" : "Critical Head Blow", 
    "Reaction Rolls" : "Reaction Rolls" 
  },
  skills: skillCategories,
  traits : adsCategories,
  allowExtraEffort : true,
  hideInactiveAttacks : false
}

export function registerSettings(): void {
  
  game.settings.register(MODULE_ID, CAT_SHEET_SETTINS, {
    scope: 'world',     // "world" = sync to db, "client" = local storage
    config: false,      // we will use the menu above to edit this setting
    type: Object,
    default: defaultSettings,        // can be used to set up the default structure
  })
};

  export function getSettings() : catSheetSettings {
    return game.settings.get(MODULE_ID, CAT_SHEET_SETTINS);
  }

