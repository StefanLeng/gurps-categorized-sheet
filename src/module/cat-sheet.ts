import { i18n } from './util.js';
import { categorizeSkills } from './categorize.ts';
import { Hand, initHands, emptyHand, WeaponGrip, resolveGrips, keyedMeleeMode } from './weaponGrips.ts';

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
    return list ? list.map((it: string) => `[${i18n(it)}]`).map((it: string) => GURPS.gurpslink(it)) : []
  }

  numberOfHands() {
    return 2;
  }

  #grips : WeaponGrip[] = [];

  /*getDefenses(data : any, melee : keyedMeleeMode[[]]){
    let dodge = 
  }*/

  getData() {
    const data = super.getData()
    
    const categories = {
      combat : {
        skills : categorizeSkills(data.system.skills, 'combat'),
      },
      exploration : {
        skills : categorizeSkills(data.system.skills, 'exploration'),
      },
      social : {
        skills : categorizeSkills(data.system.skills, 'social'),
      },
      technical : {
        skills : categorizeSkills(data.system.skills, 'technical'),
      },
      powers : {
        skills : categorizeSkills(data.system.skills, 'powers'),
      },
      others : {
        skills : categorizeSkills(data.system.skills, 'others'),
      }
    
  };

  let selfMods = this.convertModifiers(data.actor.system.conditions.self.modifiers)
  selfMods.push(...this.convertModifiers(data.actor.system.conditions.usermods))

  let handsOld = data.actor.flags?.["gurps-categorized-sheet"]?.hands as Hand[] ?? initHands(this.numberOfHands());
  let [grips, hands, melee, ranged] = resolveGrips(data.system.equipment.carried, data.system.melee, data.system.ranged, handsOld)
  this.#grips = grips;
  this.actor.setFlag("gurps-categorized-sheet", "hands", hands)

  return foundry.utils.mergeObject(data, {
      selfModifiers: selfMods,
      categories: categories,
      grips: grips,
      melee : melee,
      ranged : ranged,
      hands :hands,
    })
  }

  getCustomHeaderButtons() {
    return []
  }

  async setGrip( gripName :string, index : number){
    let hands = this.actor.flags?.["gurps-categorized-sheet"]?.hands as Hand[] ?? initHands(this.numberOfHands());
    if (index < hands.length && index >= 0){
      let oldGripName = hands[index].grip;
      let oldGrip = this.#grips.find(g => g.name === oldGripName) ?? emptyHand;
      let grip = this.#grips.find(g => g.name === gripName) ?? emptyHand;
      hands[index].grip = "";  
      if (grip.twoHanded){
        let otherHand = oldGrip.twoHanded ? hands.findIndex(h => h.grip === oldGripName) : hands.findIndex(h => h.grip === emptyHand.name);
        otherHand = otherHand < 0 ?  hands.findIndex(h => h.grip !== "") : otherHand;
        if (otherHand >= 0) hands[otherHand].grip = gripName;
      } else if(oldGrip.twoHanded) {
        let otherHand = hands.findIndex(h => h.grip === oldGripName);
        if (otherHand >= 0) hands[otherHand].grip = emptyHand.name;
      }
      hands[index].grip = gripName; 
    }
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