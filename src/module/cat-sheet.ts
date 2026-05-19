import { convertModifiers } from './util.js';
import { categorizeSkills, categorizeTraits } from './categorize.ts';
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
import { emptyList, filterList } from './recursiveList.ts';
import { enrichSkill } from './skills.ts';
import type { GurpsActorGcsSheet } from 'gurps/src/module/actor/sheets/gcs-actor-sheet.ts';
import { GurpsBaseActorSheet } from 'gurps/src/module/actor/sheets/base-actor-sheet.ts';
import { getSystemSetting } from './settings.ts';
import { DeepPartial } from 'fvtt-types/utils';
import { mapDisplayItems } from './displayItemUtils.ts';
import { ItemType } from '@module/item/types.ts';
import { PostureType } from '@module/effects/posture.ts';

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
            toggleEquipped: SLCatSheet.#onToggleEquipped,
            equipmentDec: SLCatSheet.#onChangeQuantity,
            equipmentInc: SLCatSheet.#onChangeQuantity,
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
            scrollable: [
                '.slcs-combat-tab .slcs-col1',
                '.tab[data-tab="melee"]',
                '.tab[data-tab="ranged"]',
                '.tab[data-tab="defenses"]',
                '.tab[data-tab="criticals"]',
                '.tab[data-tab="resources"]',
            ],
        },
        exploration: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-exploration.hbs',
            scrollable: ['.slcs-exploration-tab .slcs-col1', '.slcs-exploration-tab .slcs-col2'],
        },
        social: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-social.hbs',
            scrollable: ['.slcs-social-tab .slcs-col1', '.slcs-social-tab .slcs-col2'],
        },
        technical: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-technical.hbs',
            scrollable: ['.slcs-technical-tab .slcs-col1', '.slcs-technical-tab .slcs-col2'],
        },
        powers: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-powers.hbs',
            scrollable: ['.slcs-powers-tab .slcs-col1', '.slcs-powers-tab .slcs-col2'],
        },
        others: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-others.hbs',
            scrollable: ['.slcs-others-tab .slcs-col1', '.slcs-others-tab .slcs-col2'],
        },
        equipment: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-equipment.hbs',
            scrollable: ['.slcs-equipment-tab .slcs-tab-content'],
        },
        all: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-all.hbs',
            scrollable: ['.slcs-all-tab .slcs-col1', '.slcs-all-tab .slcs-col2'],
        },
        fav: {
            template: 'modules/gurps-categorized-sheet/templates/cat-sheet-fav.hbs',
            scrollable: ['.slcs-fav-tab .slcs-col1', '.slcs-fav-tab .slcs-col2'],
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
        const skills = superContext.skills;
        const traits = superContext.traits;

        try {
            const categories = {
                combat: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'combat'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'combat'),
                },
                exploration: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'exploration'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'exploration'),
                },
                social: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'social'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'social'),
                },
                technical: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'technical'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'technical'),
                },
                powers: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'powers'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'powers'),
                },
                others: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'others'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'others'),
                },
                favs: {
                    skills: mapDisplayItems(categorizeSkills(actor, skills, 'fav'), (s) =>
                        enrichSkill(s, system.attributes),
                    ),
                    traits: categorizeTraits(actor, traits, 'fav'),
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

            const defenses = getDefenses(system.currentdodge, grips, actor, hands);

            const combatTabs = filterList(
                this._prepareTabs('combat-tabs'),
                (i: any) => i.id != 'resources' || system.additionalresources.tracker.contents.length > 0,
            );

            const hpPool = superContext.pools.find((p) => p.name === 'GURPS.HP');
            const fpPool = superContext.pools.find((p) => p.name === 'GURPS.FP');
            const ciPools = superContext.pools.filter((p) => p.type === 'conditionalInjury');
            const additionalPools = superContext.pools.filter(
                // eslint-disable-next-line prettier/prettier
                (p) => p.type !== 'conditionalInjury' && !['GURPS.FP', 'GURPS.HP'].includes(p.name)
            );

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
                ciPools: ciPools,
                additionalPools: additionalPools,
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
        this.actor.replacePosture((target as HTMLImageElement).alt as PostureType);
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

    static async #onToggleEquipped(this: SLCatSheet, event: PointerEvent, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const itemId = target.dataset.itemId;

        if (!itemId) {
            console.error('No item id found on item row');

            return;
        }

        const item = this.actor.items.get(itemId);

        if (!item || !item.isOfType(ItemType.Equipment)) {
            console.error(`Item with id ${itemId} is not of type equipmentV2`);

            return;
        }

        await item.update({ 'system.equipped': !item.system.equipped } as Item.UpdateData);
    }

    static async #onChangeQuantity(this: SLCatSheet, event: PointerEvent, target: HTMLElement): Promise<void> {
        event?.preventDefault();
        const doc = await this._getEmbedded(target);

        if (!doc) return;

        if (!(doc instanceof CONFIG.Item.documentClass)) {
            console.error('Expected document to be an Item, but got', doc);
            return;
        }

        if (!doc.isOfType(ItemType.Equipment)) {
            console.error('Expected document to be of type Equipment, but got', doc);
            return;
        }

        const action = target.dataset.action;

        if (action === 'equipmentInc') {
            await doc.system.incrementQuantity();
        } else {
            await doc.system.decrementQuantity();
        }
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
}
