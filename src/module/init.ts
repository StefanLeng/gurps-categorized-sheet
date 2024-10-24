import { SeetingsForm } from "./settingsForm.ts";
import { MODULE_ID, CAT_SHEET_SETTINS } from './constants.ts';
import { defaultSettings } from "./settings.ts";

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