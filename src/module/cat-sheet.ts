const parselink = GURPS.parselink

export default class SLCatSheet extends GURPS.ActorSheets.character {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sl-cat-sheet', 'sheet', 'actor'],
      width: 590,
      height: 800,
      dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
    })
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    return `modules/gurps-categorized-sheet/templates/cat-sheet.hbs`
  }

  getData() {
    const data = super.getData()

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