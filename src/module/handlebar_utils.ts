  // === register Handlebars partials ===
  // Partial name will be the last component of the path name, e.g.: 'systems/gurps/templates/actor/foo.hbs" -- the name is "foo".
  // Use it in an HTML/HBS file like this: {{> foo }}.
  // See https://handlebarsjs.com/guide/partials.html#partials for more documentation.
export function registerHandlebarsPartials() {
  const templates = [
    "modules/gurps-categorized-sheet/templates/partials/slcs-basic-attributes.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-portrait.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-secondary-attributes.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-modifierlist.hbs",
]

  templates.forEach(filename => {
    let name = filename.substr(filename.lastIndexOf('/') + 1).replace(/(.*)\.hbs/, '$1')
    fetch(filename)
      .then(it => it.text())
      .then(async text => {
        Handlebars.registerPartial(name, text)
      })
  })
}