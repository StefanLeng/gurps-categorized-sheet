import { i18n } from './util.js';
import { categorizeSkills, categorizeAds } from './categorize.ts';
import { Hand, initHands, applyGripToHands, WeaponGrip, resolveGrips, emptyHand, keyedMeleeMode, resolveWeapons } from './weaponGrips.ts';

interface Defence{
  name: string,
  level: number,
  type: "dodge" | "block" | "parry" | "none",
  attack?: keyedMeleeMode
}
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

  getDefenses(data : any, grips : WeaponGrip[], hands : Hand[]) : Defence[]{
    let defences : Defence[] = [];
    let dodge = data.system.currentdodge as number;
    defences.push({
      name : "",
      level : dodge,
      type : "dodge",
      attack: undefined
    });
    let d : Defence[] = hands.map(
      h => grips.find(g=> g.name === h.grip) ?? emptyHand
    ).map(
      g => g.meleeList.reduce(
        (r : [[number, keyedMeleeMode | undefined],[number, keyedMeleeMode | undefined]] , m) => {
          let b = parseInt(m.block);
          if (!isNaN(b) && b > r[0][0]) r[0] = [b,m];
          let p = parseInt(m.parry);
          if (!isNaN(p) && p > r[1][0]) r[1] = [p,m];
         return r;
        } 
        ,[[0,undefined],[0,undefined]]
      )  
    ).map(
      x => {
        if (x[0][0] > x[1][0] && x[0][1] !== undefined)
        {
          return{
            name : x[0][1].name,
            level : x[0][0],
            type : "block",
            attack: x[0][1],         
          } as Defence
        } else if (x[1][1] !== undefined){
          return{
            name : x[1][1].name,
            level : x[1][0],
            type : "parry",
            attack: x[1][1],           
          } as Defence
        }
        return{
          name : "None",
          level : 0,
          type : "none",
          attack: undefined    
        } as Defence
      }
    ).filter( (def, i, arr) => i === arr.findIndex(v => v.name === def.name && v.level === def.level && v.type === def.type) && def.type !== "none") //remaove duplicates
    return defences.concat(d);
  }

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
//  let [grips, hands, melee, ranged] = resolveGrips(data.system.equipment.carried, data.system.melee, data.system.ranged, handsOld)
  let [grips, hands, meleeWeapons, rangedWeapons, rangedSelected] = resolveWeapons(data.system.equipment.carried, data.system.melee, data.system.ranged, handsOld);
  this.#grips = grips;
  this.actor.setFlag("gurps-categorized-sheet", "hands", hands);

  let defences = this.getDefenses(data, grips, hands); 

  return foundry.utils.mergeObject(data, {
      selfModifiers: selfMods,
      categories: categories,
      grips: grips,
      //melee: melee,
      //ranged: ranged,
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