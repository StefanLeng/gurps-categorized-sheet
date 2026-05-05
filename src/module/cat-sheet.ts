import { convertModifiers } from './util.js';
import { categorizeSkills, categorizeAds } from './categorize.ts';
import { initHands, applyGripToHands, resolveWeapons } from './weaponGrips.ts';
import { getDefenses } from './defenses.ts';
import { targets } from './targets.ts';
import { getOTFs } from './sheetOTFs.ts';
import { reactionTableExists, drawReactionRoll } from './reactions.ts';
import { existingCriticalTables, drawTableRoll, MyRollTable } from './rollTables.ts';
import { MODULE_ID } from './constants.ts';
import { ActorSettingsForm } from './actorSettingsForm.ts';
import { getActorSettings } from './actor-settings.ts';
import { Hand, WeaponGrip } from './types.ts';
import { emptyList, map, filterList } from './recursiveList.ts';
import { enrichSkill } from './skills.ts';
import type { GurpsActorGcsSheet } from 'gurps/src/module/actor/sheets/gcs-actor-sheet.ts';
import { GurpsBaseActorSheet } from 'gurps/src/module/actor/sheets/base-actor-sheet.ts';
import { getSystemSetting } from './settings.ts';
import { DeepPartial } from 'fvtt-types/utils';

const GCSActorSheet = GURPS.modules.Actor.sheets.GurpsActorGcsSheet as unknown as typeof GurpsActorGcsSheet;

export default class SLCatSheet extends GCSActorSheet {
    constructor(
        options: foundry.applications.api.DocumentSheet.InputOptions<foundry.applications.sheets.ActorSheet.Configuration>,
    ) {
        super(options); //register a hook on targetToken to refresh when the target changes
        Hooks.on('targetToken', this._targetToken);
    }

    _targetToken = () => this._targetTokenInner(true);

    _tokenTargeted: boolean = false;

    /*
    when an user switches targets, there are two calls to the targetToken hook, one for the old target and one for the new target
    if we rerender on the first call, we will miss the second call, because we are already rerendering.
    Therefore we  need to wait and check  for the second call. 
  */
    _targetTokenInner = (newEvent: boolean) => {
        //needs to be an lambda to capture this in the closure
        if (this._tokenTargeted) {
            //this is either a second call or we have waited 30 ms since the last call
            if (this.state === foundry.applications.api.ApplicationV2.RENDER_STATES.RENDERING) {
                setTimeout(() => this._targetTokenInner(newEvent), 5); //wait if already rendering
            } else {
                this._tokenTargeted = false;
                this.render(false);
            }
        } else if (newEvent) {
            //this is the first call, we need to wait if there is a second one
            this._tokenTargeted = true;
            setTimeout(() => this._targetTokenInner(false), 30);
        }
    };

    static override DEFAULT_OPTIONS: GurpsBaseActorSheet.DefaultOptions = {
        classes: ['sl-cat-sheet', 'sheet', 'actor'],
        position: {
            width: 960,
            height: 650,
        },
        actions: {
            openConfig: SLCatSheet.openConfig,
            setManeuver: SLCatSheet.#setManuever,
            setPosture: SLCatSheet.#setPosture,
            rollReaction: drawReactionRoll,
            rollCritical: SLCatSheet.#rollCritical,
        },
    };

    /* -------------------------------------------- */

    static override PARTS = {
        header: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-header.hbs',
        },
        nav: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-nav.hbs',
        },
        combat: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-combat.hbs',
        },
        exploration: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-exploration.hbs',
        },
        social: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-social.hbs',
        },
        technical: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-technical.hbs',
        },
        powers: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-powers.hbs',
        },
        others: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-others.hbs',
        },
        equipment: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-equipment.hbs',
        },
        all: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-all.hbs',
        },
        fav: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-fav.hbs',
        },
    };

    static override TABS = {
        ['primary-tabs']: {
            tabs: [
                { id: 'combat', label: 'GURPS-cat-sheet.combatTab' },
                { id: 'exploration', label: 'GURPS-cat-sheet.explorationTab' },
                { id: 'social', label: 'GURPS-cat-sheet.socialTab' },
                { id: 'technical', label: 'GURPS-cat-sheet.technicalTab' },
                { id: 'powers', label: 'GURPS-cat-sheet.powersTab' },
                { id: 'others', label: 'GURPS-cat-sheet.othersTab' },
                { id: 'equipment', label: 'GURPS-cat-sheet.equipmentTab' },
                { id: 'all', label: 'GURPS-cat-sheet.allTab' },
                { id: 'fav', label: 'GURPS-cat-sheet.favTab' },
            ],
            initial: 'combat',
        },
        ['combat-tabs']: {
            tabs: [
                { id: 'melee', label: 'GURPS-cat-sheet.meleeTab' },
                { id: 'ranged', label: 'GURPS-cat-sheet.rangedTab' },
                { id: 'defenses', label: 'GURPS-cat-sheet.defensesTab' },
                { id: 'criticals', label: 'GURPS-cat-sheet.criticalsTab' },
                { id: 'resources', label: 'GURPS-cat-sheet.resourcesTab' },
            ],
            initial: 'melee',
        },
    };

    numberOfHands() {
        return getActorSettings(this.actor).numberOfHands;
    }

    #grips: WeaponGrip[] = [];

    protected override async _prepareContext(
        options: foundry.applications.sheets.ActorSheet.RenderOptions,
    ): Promise<GurpsActorGcsSheet.RenderContext> {
        const superContext = await super._prepareContext(options);

        const actor = superContext.actor;
        const system = superContext.system;
        try {
            const categories = {
                combat: {
                    skills: map(categorizeSkills(actor, system.skills, 'combat'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'combat'),
                },
                exploration: {
                    skills: map(categorizeSkills(actor, system.skills, 'exploration'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'exploration'),
                },
                social: {
                    skills: map(categorizeSkills(actor, system.skills, 'social'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'social'),
                },
                technical: {
                    skills: map(categorizeSkills(actor, system.skills, 'technical'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'technical'),
                },
                powers: {
                    skills: map(categorizeSkills(actor, system.skills, 'powers'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'powers'),
                },
                others: {
                    skills: map(categorizeSkills(actor, system.skills, 'others'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'others'),
                },
                favs: {
                    skills: map(categorizeSkills(actor, system.skills, 'fav'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    ads: categorizeAds(actor, system.ads, 'fav'),
                },
            };

            const selfMods = convertModifiers(system.conditions.self.modifiers);
            selfMods.push(...convertModifiers([...system.conditions.usermods]));

            const handsOld = initHands(actor.flags?.[MODULE_ID]?.hands as Hand[], this.numberOfHands());
            const [grips, hands, meleeWeapons, rangedWeapons] = resolveWeapons(
                system.equipment,
                system.melee ?? emptyList,
                system.ranged ?? emptyList,
                handsOld,
                actor,
            );
            this.#grips = grips;
            // actor.setFlag(MODULE_ID, 'hands', hands);

            const defenses = getDefenses(system.currentdodge, grips, actor, hands);

            const combatTabs = filterList(
                this._prepareTabs('combat-tabs'),
                (i: any) => i.id != 'resources' || system.additionalresources.tracker.entries.length > 0,
            );

            const hpPool = superContext.pools.find((p) => p.name === 'GURPS.HP');
            const fpPool = superContext.pools.find((p) => p.name === 'GURPS.FP');

            return foundry.utils.mergeObject(superContext, {
                selfModifiers: selfMods,
                categories: categories,
                grips: grips,
                meleeWeapons: meleeWeapons,
                rangedWeapons: rangedWeapons,
                hands: hands,
                defenses: defenses,
                defenseOTFs: getOTFs('defense', actor),
                meleeOTFs: getOTFs('melee', actor),
                rangedOTFs: getOTFs('ranged', actor),
                reactionOTFs: getOTFs('reaction', actor),
                socialOTFs: getOTFs('social', actor),
                explorationOTFs: getOTFs('exploration', actor),
                powersOTFs: getOTFs('powers', actor),
                technicalOTFs: getOTFs('technical', actor),
                targets: targets(actor, false),
                targetsRanged: targets(actor, true),
                reactionTableExists: reactionTableExists(),
                criticalTables: existingCriticalTables(),
                tabs: this._prepareTabs('primary-tabs'),
                combatTabs: combatTabs,
                fpPool: fpPool,
                hpPool: hpPool,
            });
        } catch (e) {
            console.error(e);
            return foundry.utils.mergeObject(superContext, { error: true });
        }
    }

    static openConfig(this: SLCatSheet) {
        const form = new ActorSettingsForm(this.actor);
        form.render(true);
    }

    protected override _getHeaderControls(): foundry.applications.api.Application.HeaderControlsEntry[] {
        const controls = super._getHeaderControls();

        controls.push({
            label: 'Sheet config.',
            icon: 'fas fa-cog',
            action: 'openConfig',
        });

        return controls;
    }

    async setGrip(gripName: string, index: number) {
        let hands = initHands(this.actor.flags?.[MODULE_ID]?.hands as Hand[], this.numberOfHands());
        hands = applyGripToHands(this.#grips, gripName, index, hands);
        await this.actor.setFlag(MODULE_ID, 'hands', hands);
    }

    static async #setManuever(this: SLCatSheet, event: PointerEvent, target: HTMLElement): Promise<void> {
        event.preventDefault();
        if (!event.currentTarget) return;
        const details = target.closest('details');
        if (!details) return;
        this.actor.replaceManeuver((target as HTMLImageElement).alt);
        details.open = !details.open;
    }

    static async #setPosture(this: SLCatSheet, event: PointerEvent, target: HTMLElement): Promise<void> {
        event.preventDefault();
        if (!event.currentTarget) return;
        const details = target.closest('details');
        if (!details) return;
        this.actor.replacePosture((target as HTMLImageElement).alt);
        details.open = !details.open;
    }

    static async #rollCritical(this: SLCatSheet, _: PointerEvent, target: HTMLElement): Promise<void> {
        const table = target.dataset.rolltable as unknown as MyRollTable;
        drawTableRoll(table);
    }

    async #onEncumbrance(index: string): Promise<void> {
        if (getSystemSetting('automatic-encumbrance')) return;

        await this.actor.update({
            'system.additionalresources.currentEncumbrance': parseInt(index),
        } as Actor.UpdateData);
    }

    protected override async _onRender(
        context: DeepPartial<GurpsActorGcsSheet.RenderContext>,
        options: DeepPartial<GurpsBaseActorSheet.RenderOptions>,
    ): Promise<void> {
        super._onRender(context, options);

        const encumbranceSelect = this.element.querySelector<HTMLSelectElement>('select.slcs-encumbrance');

        encumbranceSelect?.addEventListener('change', async (event: Event) => {
            event.preventDefault();

            if (event.currentTarget instanceof HTMLSelectElement) {
                const value = event.currentTarget.value;

                await this.#onEncumbrance(value);
            }
        });

        const gripSelects = this.element.querySelectorAll<HTMLSelectElement>('select.gripSelect');

        gripSelects.forEach((element: HTMLSelectElement) => {
            element.addEventListener('change', async (event: Event) => {
                event.preventDefault();

                if (event.currentTarget instanceof HTMLSelectElement) {
                    const value = event.currentTarget.value;
                    const index = Number(event.currentTarget.dataset['index']);
                    this.setGrip(value, index);
                }
            });
        });
    }

    /*
    activateListeners(html: JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find('.slcs-conditions details').on('click', (ev) => {
            ev.preventDefault();
            const target: any = $(ev.currentTarget)[0];
            target.open = !target.open;
        });

        // Handle the "Maneuver" dropdown.
        html.find('.slcs-conditions details.maneuver .popup .button').on('click', (ev) => {
            ev.preventDefault();
            const details: any = $(ev.currentTarget).closest('details');
            const target: any = $(ev.currentTarget)[0];
            this.actor.replaceManeuver(target.alt);
            details.open = !details.open;
        });

        // Handle the "Posture" dropdown.
        html.find('.slcs-conditions details.posture .popup .button').on('click', (ev) => {
            ev.preventDefault();
            const details: any = $(ev.currentTarget).closest('details');
            const target: any = $(ev.currentTarget)[0];
            this.actor.replacePosture(target.alt);
            details.open = !details.open;
        });

        html.find('details.skill-name').on('click', (ev) => {
            ev.preventDefault();
            const target: any = $(ev.currentTarget)[0];
            target.open = !target.open;
        });

        html.find('.gripSelect').on('change', (ev) => {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            const index = Number(target.attr('data-index'));
            this.setGrip(target.val() as string, index);
        });

        html.find('.slcs-encumbrance').on('change', (ev) => {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            this.changeEncumbrance(target.val() as string);
        });

        html.find('.change-equipped').on('click', this._onClickEquip.bind(this));

        html.find('.slcs-reaction-roll button').on('click', drawReactionRoll);

        html.find('.slcs-criticalRolls button').on('click', (ev) => {
            const table = ev.currentTarget.dataset.rolltable as unknown as MyRollTable;
            drawTableRoll(table);
        });
    }*/
}
