import { CatSheetSettings, getSettings, setSettings, sortCategorieSettings } from './settings.ts';
import { Category } from './types.ts';
import { BaseSeetingsForm } from './baseSettingsForm.ts';

class SeetingsForm extends BaseSeetingsForm {
    constructor(args: any) {
        super(args);
        this._settings = sortCategorieSettings(foundry.utils.deepClone(getSettings()));
    }

    public _settings;

    static override DEFAULT_OPTIONS = {
        id: 'slcs-settingsForm',
        tag: 'form',
        form: {
            handler: SeetingsForm.settingsFormHandler,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        window: {
            title: 'Categorized Character Sheet configuration',
            controls: [],
        },
        actions: {
            save: this.#onSave,
            addItem: this.#onAddItem,
            deleteItem: this.#deleteItem,
        },
    };

    protected override addItemToCategory(type: string, cat: Category, val: string) {
        if (!this._settings.items[type][cat].some((i) => i === val)) {
            this._settings.items[type][cat].push(val);
        }
        this._settings = sortCategorieSettings(this._settings);
    }

    protected override removeItemFromCategory(type: string, cat: Category, val: string) {
        this._settings.items[type][cat] = this._settings.items[type][cat].filter((i) => i != val);
    }

    protected override getItemValue(type: string, cat: Category, index: number) {
        return this._settings.items[type][cat][index];
    }

    override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
        const context = await super._prepareContext(options);
        const settings = this._settings;
        return {
            ...context,
            settings: settings,
            skills: this._settings.items.skills,
            traits: this._settings.items.traits,
        };
    }

    static async #onSave(this: SeetingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setSettings(this._settings);
        this.close();
    }

    static async #onAddItem(this: SeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category as Category;
        const type = target.dataset.type;
        if (cat && type) {
            this._settings.items[type][cat].push('');
            await this.render();
            this._scrollToAndFocus(type, cat, '');
        }
    }

    static async #deleteItem(this: SeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category as Category;
        const i = Number(target.dataset.index);
        const type = target.dataset.type;
        if (cat && !isNaN(i) && type) {
            this._settings.items[type][cat].splice(i, 1);
            this.render();
        }
    }

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} _event                   The originating form submission event
     * @param {HTMLFormElement} _form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static override async settingsFormHandler(
        this: SeetingsForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        // Do things with the returned FormData
        const newSettings = foundry.utils.expandObject(formData.object).settings as CatSheetSettings;
        this._settings.rollTables = newSettings.rollTables;
        this._settings.allowExtraEffort = newSettings.allowExtraEffort;
        this._settings.hideInactiveAttacks = newSettings.hideInactiveAttacks;
        this._settings.items.skills = newSettings.items.skills;
        this._settings.items.traits = newSettings.items.traits;
        this._settings = sortCategorieSettings(this._settings);
        this.render();
    }
}
export { SeetingsForm };
