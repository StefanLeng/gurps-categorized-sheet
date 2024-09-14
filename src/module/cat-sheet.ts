import { i18n } from './util.js';

const {parselink, performAction} = GURPS;

export default class SLCatSheet extends GURPS.ActorSheets.character {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sl-cat-sheet', 'sheet', 'actor'],
      width: 800,
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
    
    let selfMods = this.convertModifiers(data.actor.system.conditions.self.modifiers)
    selfMods.push(...this.convertModifiers(data.actor.system.conditions.usermods))
    
    return foundry.utils.mergeObject(data, {
      selfModifiers: selfMods
    })
  }

  getCustomHeaderButtons() {
    return []
  }

  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html)

    html.find('.rollableicon').click(this._onClickRollableIcon.bind(this))

  }

  async _onClickRollableIcon(ev: any) {
    ev.preventDefault()
    const element = ev.currentTarget
    const val = element.dataset.value
    const parsed = parselink(val)
    performAction(parsed.action, this.actor, ev)
  }

 }