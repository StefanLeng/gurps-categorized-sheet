import { string } from "yargs"

declare global {
	namespace globalThis {
    var game: any;
    var GURPS: any;
  }
}

const parselink = GURPS.parselink

export function i18n(value : string, fallback?: string | undefined) {
  let result = game.i18n.localize(value)
  if (!!fallback) return value === result ? fallback : result
  return result
}

export default class SLCatSheet extends GURPS.ActorSheets.character {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sl-cat-sheet', 'sheet', 'actor'],
      width: 800,
      height: 650,
      dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
    })
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return `modules/gurps-categorized-sheet/templates/cat-sheet.hbs`
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

     return data
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
    GURPS.performAction(parsed.action, this.actor, ev)
  }

 }