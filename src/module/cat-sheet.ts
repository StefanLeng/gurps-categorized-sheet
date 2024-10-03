import { i18n } from './util.js';
import { categorizeSkills, categorizeAds } from './categorize.ts';
import { Hand, initHands, applyGripToHands, WeaponGrip, resolveWeapons } from './weaponGrips.ts';
import { getDefenses } from './defences.ts';


export default class SLCatSheet extends GURPS.ActorSheets.character {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sl-cat-sheet', 'sheet', 'actor'],
      width: 900,
      height: 650,
      tabs: [{ navSelector: '#slcs-navtabs', contentSelector: '#slcs-main', initial: 'combat' }],
      dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
    })
  }
  /* -------------------------------------------- */

  /** @override */
  get template() {
    return "modules/gurps-categorized-sheet/templates/cat-sheet.hbs"
  }

  convertModifiers(list: Array<string>) {
    return list ? list.map((it: string) => `[${i18n(it)}]`).map((it: string) => {return {mod :GURPS.gurpslink(it)}}) : []
  }

  numberOfHands() {
    return 2;
  }

  #grips : WeaponGrip[] = [];

  getData() {
    const data = super.getData()
    
    const categories = {
      combat : {
        skills : categorizeSkills(data.system.skills, 'combat'),
        ads : categorizeAds(data.system.ads, 'combat'),
      },
      exploration : {
        skills : categorizeSkills(data.system.skills, 'exploration'),
        ads : categorizeAds(data.system.ads, 'exploration'),
      },
      social : {
        skills : categorizeSkills(data.system.skills, 'social'),
        ads : categorizeAds(data.system.ads, 'social'),
      },
      technical : {
        skills : categorizeSkills(data.system.skills, 'technical'),
        ads : categorizeAds(data.system.ads, 'technical'),
      },
      powers : {
        skills : categorizeSkills(data.system.skills, 'powers'),
        ads : categorizeAds(data.system.ads, 'powers'),
      },
      others : {
        skills : categorizeSkills(data.system.skills, 'others'),
        ads : categorizeAds(data.system.ads, 'others'),
      }
    
  };

  let selfMods = this.convertModifiers(data.actor.system.conditions.self.modifiers)
  selfMods.push(...this.convertModifiers(data.actor.system.conditions.usermods))

  let handsOld = data.actor.flags?.["gurps-categorized-sheet"]?.hands as Hand[] ?? initHands(this.numberOfHands());
  let [grips, hands, meleeWeapons, rangedWeapons, rangedSelected] = resolveWeapons(data.system.equipment.carried, data.system.melee, data.system.ranged, handsOld);
  this.#grips = grips;
  this.actor.setFlag("gurps-categorized-sheet", "hands", hands);

  let defences = getDefenses(data, grips, hands); 

  return foundry.utils.mergeObject(data, {
      selfModifiers: selfMods,
      categories: categories,
      grips: grips,
      meleeWeapons: meleeWeapons,
      rangedWeapons: rangedWeapons,
      hands: hands,
      defences: defences,
      rangedSelected: rangedSelected,
    })
  }

  getCustomHeaderButtons() {
    return []
  }

  async setGrip( gripName :string, index : number){
    let hands = this.actor.flags?.["gurps-categorized-sheet"]?.hands as Hand[] ?? initHands(this.numberOfHands());
    hands = applyGripToHands(this.#grips, gripName, index, hands);
    await this.actor.setFlag("gurps-categorized-sheet", "hands", hands);
  }
  
  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html)
    
    html.find('#slcs-conditions details').click(ev => {
      ev.preventDefault()
      const target : any = $(ev.currentTarget)[0]
      target.open = !target.open
    })
  
    // Handle the "Maneuver" dropdown.
    html.find('#slcs-conditions details#maneuver .popup .button').click(ev => {
      ev.preventDefault()
      const details : any = $(ev.currentTarget).closest('details')
      const target : any = $(ev.currentTarget)[0]
      this.actor.replaceManeuver(target.alt)
      details.open = !details.open
    })
  
    // Handle the "Posture" dropdown.
    html.find('#slcs-conditions details#posture .popup .button').click(ev => {
      ev.preventDefault()
      const details : any = $(ev.currentTarget).closest('details')
      const target : any = $(ev.currentTarget)[0]
      this.actor.replacePosture(target.alt)
      details.open = !details.open
    })

    html.find('.gripSelect').on('change', ev => {
      let target = $(ev.currentTarget);
      let index = Number(target.attr("data-index"));
      this.setGrip(target.val() as string, index)
    })

  }

 }