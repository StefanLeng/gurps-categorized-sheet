import { i18n } from './util.js';
import { categorizeSkills } from './categorize.ts';
import { meleeGrips, rangedGrips, reduceGrips, keyedMeleeMode, keyedRangedMode } from './weaponGrips.ts';

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
    
  let selectedGrip = data.actor.flags?.["gurps-categorized-sheet"]?.selectedGrip;
  let grip = grips.find(g=> g.name ===selectedGrip);
  let melee : keyedMeleeMode[] = [];
  let ranged : keyedRangedMode[] = [];
  if (!grip) {
    selectedGrip = "";
  }  
  else {
    melee = grip.meleeList;
    ranged = grip.rangedList;
  }

  return foundry.utils.mergeObject(data, {
      categories: categories,
      grips: grips,
      selectedGrip : selectedGrip,
      melee : melee,
      ranged : ranged,
    })
  }

  getCustomHeaderButtons() {
    return []
  }

  async setGrip( grip :string){
    await this.actor.setFlag("gurps-categorized-sheet", "selectedGrip", grip);
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

    html.find('#selectedGrip').on('change', ev => {
      let target = $(ev.currentTarget);
      this.setGrip(target.val() as string)
    })

  }

 }