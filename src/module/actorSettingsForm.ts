import { getActorSettings, mergeSettings, setActorSettings, CatSheetActorSettings } from "./actor-settings.ts";
import { CATEGORIES } from "./types.ts";
import { getSettings } from "./settings.ts";
import { categorize } from "./categorize.ts";
import { removeArryDuplicates } from "./util.ts";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class ActorSeetingsForm extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor (actor : Actor) {
        super();
        this._actor = actor;
        this._settings = foundry.utils.deepClone(getActorSettings(actor));
        this._items = {skills: {}, traits: {}};
        this.#dragDrop = this.#createDragDropHandlers();
        this._globalSetting = getSettings();
    }

    protected _actor;
    public _settings;
    protected _items : { 
        [index : string] : {[index : string] : string[]},
        skills : {[index : string] : string[]}, 
        traits: {[index : string] : string[]} 
    };
    protected _globalSetting;

    static override DEFAULT_OPTIONS : Partial<DocumentSheetConfiguration> & { dragDrop: DragDropConfiguration[] } = {
        id:  "slcs-actorSettingsForm",
        tag: "form",
        form: {
          handler: ActorSeetingsForm.settingsFormHandler,
          submitOnChange: true,
          closeOnSubmit: false
        },
        position: {
          width: 1200,
          height: 640,
        },
        window: {
            icon: "fas fa-gear", // You can now add an icon to the header
            title: "Categorized Character Sheet configuration",
            controls: [],
            contentClasses: ["standard-form", "slcs-form"],
            resizable: true,
        },
        actions: {
          save: this.#onSave,
          addItem: this.#onAddItem,
          deleteItem: this.#deleteItem,
        },
        dragDrop: [{ dragSelector: ".itemrow", dropSelector: '.slcs-trait-list' }],
    }

    #dragDrop: DragDrop[];

    get dragDrop(): DragDrop[] {
        return this.#dragDrop;
    }

  	#createDragDropHandlers() {
        return this.options.dragDrop.map(d => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this),
            }
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this),
            }
            return new DragDrop(d);
        })
    }
  
    protected _canDragStart(_selector: string): boolean {
        return true;
    }
  
    protected _canDragDrop(_selector: string): boolean {
        return true;
    }
    
    async _onDragStart(event: DragEvent) {
        const item = event.currentTarget as HTMLElement;
        const cat = item.dataset.category;
        const type = item.dataset.type;
        const i =  Number(item.dataset.index);
        if ( cat && !isNaN(i) && type){
            const dragData = {
                category: cat,
                index : i,
                type : type,
            }
            event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
        }
    }

    async _onDragOver(_event: DragEvent) {}

    private removeItemFromCategory(type: string, cat: string, val: string) {
        if (cat != "others") {
            if (!this._settings.addedItems[type][cat].some(i => i != val)) {
                this._settings.addedItems[type][cat].push(val);
                this._settings.addedItems[type][cat] = removeArryDuplicates(this._settings.addedItems[type][cat]);
            }
            this._settings.removedItems[type][cat] = this._settings.removedItems[type][cat].filter(i => i != val);
        }
    }

    private addItemToCategory(type: string, cat: string, val: string) {
        if (cat != "others") {
            if (!this._settings.removedItems[type][cat].some(i => i != val)) {
                this._settings.removedItems[type][cat].push(val);
                this._settings.removedItems[type][cat] = removeArryDuplicates(this._settings.removedItems[type][cat]);
            }
            this._settings.addedItems[type][cat] = this._settings.addedItems[type][cat].filter(i => i != val);
        }
    }

    protected async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event);
        const target = event.currentTarget as HTMLElement;
        const sourceCat = data.category as string;
        const targetCat = target.dataset.category as string;
        const index = data.index as number;
        const type = data.type as string;
        if (sourceCat && targetCat){
            if (sourceCat === targetCat) return;
            const val = this._items[type][sourceCat][index];
            if (val != undefined && val != null){
                this.addItemToCategory(type, sourceCat, val);
                this.removeItemFromCategory(type, targetCat, val);
                await this.render();
                this._scrollTo(type, targetCat, val);
            }
        }
    }

    static override PARTS = {
        navigation: {
            template: "modules/gurps-categorized-sheet/templates/slcs-nav.hbs"
        },
        generalTab: {
            template: "modules/gurps-categorized-sheet/templates/actorSettingsFormGeneral.hbs"
        },
        skillsTab: {
            template: "modules/gurps-categorized-sheet/templates/actorSettingsFormSkills.hbs",
            scrollable: CATEGORIES.map( i=> `#slcs-skills-${i}`)
        },
        traitsTab: {
            template: "modules/gurps-categorized-sheet/templates/actorSettingsFormTraits.hbs",
            scrollable:  CATEGORIES.map( i=> `#slcs-traits-${i}`)
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    }

	  // Set initial values for tabgroups
  	override tabGroups: Record<string, string> = {
	  	primary: "general",
  	}

   protected _getTabs(): Record<string, Partial<ApplicationTab>> {
        return this._markTabs({
            generalTab: {
                id: "general",
                group: "primary",
                icon: "fa-solid fa-cog",
                label: "General",
            },
                skillsTab: {
                id: "skills",
                group: "primary",
                icon: "fa-solid fa-cog",
                label: "Skills",
            },      
                traitsTab: {
                id: "traits",
                group: "primary",
                icon: "fa-solid fa-cog",
                label: "Traits",
            },        
        })
    }
  
    protected _markTabs(tabs: Record<string, Partial<ApplicationTab>>): Record<string, Partial<ApplicationTab>> {
        for (const v of Object.values(tabs)) {
            v.active = this.tabGroups[v.group!] === v.id;
            v.cssClass = v.active ? "active" : "";
            if ("tabs" in v) this._markTabs(v.tabs as Record<string, Partial<ApplicationTab>>);
        }
        return tabs;
    }
        override async _prepareContext(options : ApplicationRenderOptions) {
        const primaryTabs = Object.fromEntries(
            Object.entries(this._getTabs()).filter(([_, v]) => v.group === "primary"),
        )  
        const mergedSettings = mergeSettings(this._globalSetting, this._settings );
        const actorData = this._actor.system as any;
        const self = this;
        CATEGORIES.forEach( cat => {
            self._items.skills[cat] = Object.values(categorize( mergedSettings.items.skills, actorData.skills, cat)).map((i : any)=> i.name);
            self._items.traits[cat] = Object.values(categorize( mergedSettings.items.traits, actorData.ads, cat)).map((i : any)=> i.name);
        });
        self._items.skills["others"] = Object.values(categorize( mergedSettings.items.skills, actorData.skills, "others")).map((i : any)=> i.name);
        self._items.traits["others"] = Object.values(categorize( mergedSettings.items.traits, actorData.ads, "others")).map((i : any)=> i.name);

        return {
            globalSettings : this._globalSetting,
            settings : this._settings,
            items : this._items,
            primaryTabs,
            tabs : this._getTabs(),
            buttons: [{ action: "save", icon: "fa-solid fa-save", label: "SETTINGS.Save" }]
        }
    }

    protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
        context.partId = `${this.id}-${partId}`
        context.tab = context.tabs[partId]
        return context
    }

    protected override _onRender(context: object, options: ApplicationRenderOptions): void {
        super._onRender(context, options)
        this.#dragDrop.forEach(d => d.bind(this.element))
    }

    protected async _scrollTo(type: string, cat :string, value: string){
        const list = $(this.element).find(`#slcs-${type}-${cat}`);
        const item = list.find(`input[value="${value}"]`);
        list.scrollTop(item[0]?.offsetTop ?? 0);
    }

    protected async _scrollToAndFocus(type: string, cat :string, value: string){
        const list = $(this.element).find(`#slcs-${type}-${cat}`);
        const item = list.find(`input[value="${value}"]`);
        list.scrollTop(item[0]?.offsetTop ?? 0);
        item.trigger('focus');
    }

    static async #onSave(this: ActorSeetingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setActorSettings(this._actor, this._settings);
        this.close();
    }

    static async #onAddItem(this: ActorSeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category;
        const type = target.dataset.type;
        if (cat && type){
            //this._settings.items[type][cat].push("");
            await this.render();
            this._scrollToAndFocus(type, cat, "");
        }
    }

    static async #deleteItem(this: ActorSeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category;
        const i =  Number(target.dataset.index);
        const type = target.dataset.type;
        if (cat && !isNaN(i) && type){
            //this._settings.items[type][cat].splice(i, 1);;
            this.render();
        }
    }

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} event                   The originating form submission event
     * @param {HTMLFormElement} form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static async settingsFormHandler(this: ActorSeetingsForm, event :Event | SubmitEvent, form : HTMLFormElement, formData : FormDataExtended) {
        // Do things with the returned FormData
       const newSettings = foundry.utils.expandObject(formData.object).settings as any;
        if  (newSettings.allowExtraEffortGlobal) {
            this._settings.allowExtraEffort = null;
        } else {
            this._settings.allowExtraEffort = newSettings.allowExtraEffort ?? this._globalSetting.allowExtraEffort;
        }
        if  (newSettings.hideInactiveAttacksGlobal) {
            this._settings.hideInactiveAttacks = null;
        } else {
            this._settings.hideInactiveAttacks = newSettings.hideInactiveAttacks ?? this._globalSetting.hideInactiveAttacks;
        }
        this.render();
    }

}

interface ActorSeetingsForm {
	constructor: typeof ActorSeetingsForm
	options: DocumentSheetConfiguration & { dragDrop: DragDropConfiguration[] }
}

export { ActorSeetingsForm };