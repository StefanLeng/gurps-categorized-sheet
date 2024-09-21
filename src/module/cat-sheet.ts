import { i18n } from './util.js';
import { categorizeSkills } from './categorize.ts';
import { meleeGrips, rangedGrips, reduceGrips, keyedMeleeMode, keyedRangedMode, emptyHand, WeaponGrip } from './weaponGrips.ts';

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

  let grips0 = meleeGrips(data.system.equipment.carried, data.system.melee)
    .concat(rangedGrips(data.system.equipment.carried, data.system.ranged));
  let grips = reduceGrips(grips0);
  this.#grips = grips;
    
  let selectedGrips = data.actor.flags?.["gurps-categorized-sheet"]?.selectedGrips as string[];
  let melee : keyedMeleeMode[] = [];
  let ranged : keyedRangedMode[] = [];
  let selectedGripsNew : string[] = [];
  let hands : {name :string, grip: string}[] = [];
  for (var i=0; i < this.numberOfHands(); i++) {
    let grip = ((i <= selectedGrips?.length) ? grips.find(g=> g.name ===selectedGrips[i]) : undefined) ?? emptyHand;
    if (selectedGripsNew.every(g => grip.name !== g)){
      melee = melee.concat(grip.meleeList);
      ranged = ranged.concat(grip.rangedList);
    }
    selectedGripsNew[i] = grip.name;
    hands.push( {name :'Hand ' + (i+1), grip: grip.name});
  }

  return foundry.utils.mergeObject(data, {
      categories: categories,
      grips: grips,
      selectedGrips : selectedGrips,
      melee : melee,
      ranged : ranged,
      hands :hands,
    })
  }

  getCustomHeaderButtons() {
    return []
  }

  async setGrip( gripName :string, index : number){
    let selectedGrips0 = this.actor.flags?.["gurps-categorized-sheet"]?.selectedGrips as string[] | undefined;
    let selectedGrips : string[] = (!selectedGrips0) ? new Array(this.numberOfHands()).fill(emptyHand.name) : selectedGrips0;
    if (index < selectedGrips.length && index >= 0){
      let oldGripName = selectedGrips[index];
      let oldGrip = this.#grips.find(g => g.name === oldGripName) ?? emptyHand;
      let grip = this.#grips.find(g => g.name === gripName) ?? emptyHand;
      selectedGrips[index] = "";  
      if (grip.twoHanded){
        let otherHand = oldGrip.twoHanded ? selectedGrips.findIndex(g => g === oldGripName) : selectedGrips.findIndex(g => g === emptyHand.name);
        otherHand = otherHand < 0 ?  selectedGrips.findIndex(g => g !== "") : otherHand;
        if (otherHand >= 0) selectedGrips[otherHand] = gripName;
      } else if(oldGrip.twoHanded) {
        let otherHand = selectedGrips.findIndex(g => g === oldGripName);
        if (otherHand >= 0) selectedGrips[otherHand] = emptyHand.name;
      }
      selectedGrips[index] = gripName; 
    }
    await this.actor.setFlag("gurps-categorized-sheet", "selectedGrips", selectedGrips);
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