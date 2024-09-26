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
    "modules/gurps-categorized-sheet/templates/partials/slcs-conditions.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-skills.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-melee-attacks.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-ranged-attacks.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-defences.hbs",
    "modules/gurps-categorized-sheet/templates/partials/slcs-advantages.hbs",
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

export function registerHandlebarsHelpers() {

  Handlebars.registerHelper("stripes", function(obj, even, odd, options) {
    var buffer = "";
    let data = Handlebars.createFrame(options.data); 

    if (foundry.utils.getType(obj) === 'Array' && obj.length > 0){
      for (var i = 0, j = obj.length; i < j; i++) {
        var item = obj[i];
        data.index = i;

        // we'll just put the appropriate stripe class name onto the item for now
        item.stripeClass = (i % 2 == 0 ? even : odd);
   
        // show the inside of the block
        buffer += options.fn(item, {data : data});
      }
   
      // return the finished buffer
      return buffer;
    }
    else if (foundry.utils.getType(obj) === 'Object' && Object.values(obj).length > 0) {
      var i = 0;
      for (var key in obj) {
        var item = obj[key];
        i += 1;

        // we'll just put the appropriate stripe class name onto the item for now
        item.stripeClass = (i % 2 == 0 ? even : odd);
   
        // show the inside of the block
        data.key = key;
        buffer += options.fn(item, {data : data});
      }
      // return the finished buffer
      return buffer;
    }
    else {
      return options.inverse();
    }
  });

}