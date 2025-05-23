import { convertModifiers } from './util.js';
import { categorizeSkills, categorizeAds } from './categorize.ts';
import { initHands, applyGripToHands, resolveWeapons } from './weaponGrips.ts';
import { getDefenses } from './defences.ts';
import { targets } from './targets.ts';
import { getOTFs } from './sheetOTFs.ts';
import { reactionTableExists, drawReactionRoll } from './reactions.ts';
import { existingCriticalTables, drawTableRoll, MyRollTable } from './rollTables.ts';
import { MODULE_ID } from './constants.ts';
import { ActorSeetingsForm } from './actorSettingsForm.ts';
import { getActorSettings } from './actor-settings.ts';
import { Hand, WeaponGrip } from './types.ts';
import { emptyList } from './recursiveList.ts';

export default class SLCatSheet extends GURPS.ActorSheets.character {
    /** @override */
    constructor(object: any, options: any) {
        super(object, options);
        //register a hook on targetToken to refesh when the target changes
        Hooks.on('targetToken', this._targetToken);
    }

    _targetToken = () => this._targetTokenInner(true);

    _tokenTrageted: boolean = false;

    /*
    when an user switches targets, there are two calls to the targetToken hook, one for the old target and one for the new target
    if we rerender on the first call, we will miss the second call, because we are allready rerendering.
    Therefore we  need to wait and check  for the second call. 
  */
    _targetTokenInner = (newEvent: boolean) => {
        //needs to be an lambda to capture this in the clousure
        if (this._tokenTrageted) {
            //this is either a second call or we have waited 30 ms since the last call
            if (this._state === Application.RENDER_STATES.RENDERING) {
                setTimeout(() => this._targetTokenInner(newEvent), 5); //wait if already rendering
            } else {
                this._tokenTrageted = false;
                this.render(false);
            }
        } else if (newEvent) {
            //this is the first call, we need to wait if there is a second one
            this._tokenTrageted = true;
            setTimeout(() => this._targetTokenInner(false), 30);
        }
    };

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['sl-cat-sheet', 'sheet', 'actor'],
            width: 900,
            height: 650,
            tabs: [
                { navSelector: '#slcs-navtabs', contentSelector: '#slcs-main', initial: 'combat' },
                { navSelector: '#slcs-combattabs', contentSelector: '#slcs-combatContent', initial: 'attacks' },
            ],
            dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
        });
    }
    /* -------------------------------------------- */

    /** @override */
    get template() {
        return 'modules/gurps-categorized-sheet/templates/cat-sheet.hbs';
    }

    numberOfHands() {
        return getActorSettings(this.actor).numberOfHands;
    }

    #grips: WeaponGrip[] = [];

    getData() {
        const data = super.getData();
        try {
            const categories = {
                combat: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'combat'),
                    ads: categorizeAds(data.actor, data.system.ads, 'combat'),
                },
                exploration: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'exploration'),
                    ads: categorizeAds(data.actor, data.system.ads, 'exploration'),
                },
                social: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'social'),
                    ads: categorizeAds(data.actor, data.system.ads, 'social'),
                },
                technical: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'technical'),
                    ads: categorizeAds(data.actor, data.system.ads, 'technical'),
                },
                powers: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'powers'),
                    ads: categorizeAds(data.actor, data.system.ads, 'powers'),
                },
                others: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'others'),
                    ads: categorizeAds(data.actor, data.system.ads, 'others'),
                },
                favs: {
                    skills: categorizeSkills(data.actor, data.system.skills, 'fav'),
                    ads: categorizeAds(data.actor, data.system.ads, 'fav'),
                },
            };

            const selfMods = convertModifiers(data.actor.system.conditions.self.modifiers);
            selfMods.push(...convertModifiers(data.actor.system.conditions.usermods));

            const handsOld = initHands(data.actor.flags?.[MODULE_ID]?.hands as Hand[], this.numberOfHands());
            const [grips, hands, meleeWeapons, rangedWeapons] = resolveWeapons(
                data.system.equipment,
                data.system.melee ?? emptyList,
                data.system.ranged ?? emptyList,
                handsOld,
                data.actor,
            );
            this.#grips = grips;
            this.actor.setFlag(MODULE_ID, 'hands', hands);

            const defences = getDefenses(data.system.currentdodge, grips, this.actor);

            return foundry.utils.mergeObject(data, {
                selfModifiers: selfMods,
                categories: categories,
                grips: grips,
                meleeWeapons: meleeWeapons,
                rangedWeapons: rangedWeapons,
                hands: hands,
                defences: defences,
                defenceOTFs: getOTFs('defence', data.actor),
                meleeOTFs: getOTFs('melee', data.actor),
                rangedOTFs: getOTFs('ranged', data.actor),
                reactionOTFs: getOTFs('reaction', data.actor),
                socialOTFs: getOTFs('social', data.actor),
                explorationOTFs: getOTFs('exploration', data.actor),
                powersOTFs: getOTFs('powers', data.actor),
                technicalOTFs: getOTFs('technical', data.actor),
                targets: targets(data.actor, false),
                targetsRanged: targets(data.actor, true),
                reactionTableExists: reactionTableExists(),
                criticalTables: existingCriticalTables(),
            });
        } catch {
            return foundry.utils.mergeObject(data, { error: true });
        }
    }

    static openConfig() {
        const form = new ActorSeetingsForm(this.actor);
        form.render(true);
    }

    getCustomHeaderButtons() {
        const buttons = super.getCustomHeaderButtons();

        buttons.push({
            label: 'Sheet config.',
            class: 'config',
            icon: 'fas fa-cog',
            onclick: SLCatSheet.openConfig.bind(this),
        });

        return buttons;
    }

    async setGrip(gripName: string, index: number) {
        let hands = initHands(this.actor.flags?.[MODULE_ID]?.hands as Hand[], this.numberOfHands());
        hands = applyGripToHands(this.#grips, gripName, index, hands);
        await this.actor.setFlag(MODULE_ID, 'hands', hands);
    }

    async changeEncumberance(key: string | undefined) {
        if (key !== undefined) {
            const encs = this.actor.system.encumbrance;
            if (encs[key].current) return; // already selected
            for (const enckey in encs) {
                const enc = encs[enckey];
                const t = 'system.encumbrance.' + enckey + '.current';
                if (key === enckey) {
                    await this.actor.internalUpdate({
                        [t]: true,
                        'system.currentmove': parseInt(enc.move),
                        'system.currentdodge': parseInt(enc.dodge),
                    });
                } else if (enc.current) {
                    await this.actor.internalUpdate({ [t]: false });
                }
            }
        }
    }

    activateListeners(html: JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find('#slcs-conditions details').on('click', (ev) => {
            ev.preventDefault();
            const target: any = $(ev.currentTarget)[0];
            target.open = !target.open;
        });

        // Handle the "Maneuver" dropdown.
        html.find('#slcs-conditions details#maneuver .popup .button').on('click', (ev) => {
            ev.preventDefault();
            const details: any = $(ev.currentTarget).closest('details');
            const target: any = $(ev.currentTarget)[0];
            this.actor.replaceManeuver(target.alt);
            details.open = !details.open;
        });

        // Handle the "Posture" dropdown.
        html.find('#slcs-conditions details#posture .popup .button').on('click', (ev) => {
            ev.preventDefault();
            const details: any = $(ev.currentTarget).closest('details');
            const target: any = $(ev.currentTarget)[0];
            this.actor.replacePosture(target.alt);
            details.open = !details.open;
        });

        html.find('.gripSelect').on('change', (ev) => {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            const index = Number(target.attr('data-index'));
            this.setGrip(target.val() as string, index);
        });

        html.find('#slcs-encumberance').on('change', (ev) => {
            ev.preventDefault();
            const target = $(ev.currentTarget);
            this.changeEncumberance(target.val() as string);
        });

        html.find('.changeequip').on('click', this._onClickEquip.bind(this));

        html.find('#slcs-reactionroll button').on('click', drawReactionRoll);

        html.find('#slcs-criticalRolls button').on('click', (ev) => {
            const table = ev.currentTarget.dataset.rolltable as unknown as MyRollTable;
            drawTableRoll(table);
        });
    }
}
