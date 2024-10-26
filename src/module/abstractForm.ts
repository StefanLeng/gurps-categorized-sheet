const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

abstract class BaseForm extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(args: any) {
        super(args);
        this.#dragDrop = this.#createDragDropHandlers();
    }

    static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> &
        Partial<{ dragDrop: DragDropConfiguration[] }> = {
        id: '',
        tag: 'form',
        form: {
            handler: BaseForm.formHandler,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {},
        dragDrop: [],
    };

    #dragDrop: DragDrop[];

    get dragDrop(): DragDrop[] {
        return this.#dragDrop;
    }

    #createDragDropHandlers() {
        return (
            this.options?.dragDrop?.map((d) => {
                d.permissions = {
                    dragstart: this._canDragStart.bind(this),
                    drop: this._canDragDrop.bind(this),
                };
                d.callbacks = {
                    dragstart: this._onDragStart.bind(this),
                    dragover: this._onDragOver.bind(this),
                    drop: this._onDrop.bind(this),
                };
                return new DragDrop(d);
            }) ?? []
        );
    }

    protected _canDragStart(_selector: string): boolean {
        return true;
    }

    protected _canDragDrop(_selector: string): boolean {
        return true;
    }

    abstract _onDragStart(event: DragEvent): Promise<void>;

    async _onDragOver(_event: DragEvent) {}

    protected abstract _onDrop(event: DragEvent): Promise<void>;

    static override PARTS = {
        footer: {
            template: 'templates/generic/form-footer.hbs',
        },
    };

    // Set initial values for tabgroups
    override tabGroups: Record<string, string> = {
        primary: 'general',
    };

    protected _getTabs(): Record<string, Partial<ApplicationTab>> {
        return this._markTabs({});
    }

    protected _markTabs(tabs: Record<string, Partial<ApplicationTab>>): Record<string, Partial<ApplicationTab>> {
        for (const v of Object.values(tabs)) {
            v.active = this.tabGroups[v.group!] === v.id;
            v.cssClass = v.active ? 'active' : '';
            if ('tabs' in v) this._markTabs(v.tabs as Record<string, Partial<ApplicationTab>>);
        }
        return tabs;
    }

    override async _prepareContext(_options: ApplicationRenderOptions): Promise<object> {
        const primaryTabs = Object.fromEntries(
            Object.entries(this._getTabs()).filter(([_, v]) => v.group === 'primary'),
        );
        return {
            primaryTabs,
            tabs: this._getTabs(),
        };
    }

    protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
        context.partId = `${this.id}-${partId}`;
        context.tab = context.tabs[partId];
        return context;
    }

    protected override _onRender(context: object, options: ApplicationRenderOptions): void {
        super._onRender(context, options);
        this.#dragDrop.forEach((d) => d.bind(this.element));
    }

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} _event                   The originating form submission event
     * @param {HTMLFormElement} _form                The form element that was submitted
     * @param {FormDataExtended} _formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static async formHandler(
        this: BaseForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        _formData: FormDataExtended,
    ) {
        this.render();
    }
}

interface BaseForm {
    constructor: typeof BaseForm;
    options: DocumentSheetConfiguration & Partial<{ dragDrop: DragDropConfiguration[] }>;
}

export { BaseForm as BasicForm };
