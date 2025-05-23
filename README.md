<!--
SPDX-FileCopyrightText: 2022 Johannes Loher

SPDX-License-Identifier: MIT
-->

# GURPs Categorized Character Sheet

This module adds an additional character sheet to the [GURPS Game Aid](https://github.com/crnormand/gurps).

### Main Features

1. Focus only on in-game use, not on character creation, points, etc.

2. Thematic tabs that displays just the information needed in common game situations: _Combat_, _Exploration_ & _Stealth_, _Social_, _Technical & Research_, _Powers & Magic_. 
Skills and traits are categorized to appear on the appropriate tab. Anything not coverd by the regular tabs will appear on the _Others_ tab.

3. You can choose what weapon you grip with each hand. For weapons with different grips (e.g. one-handed vr. two-hnaded), these can be selected. Attacks and defences by weapons not griped are shown in a lighter color, but at still selectable by default. You can chose not to display them at all in the options.

4. Many OTF appropriate to the character and the situation displayed at various sections of the sheet. You can add your on in the configuration, both globaly and per character. Also modificators from any conditions are displayed  direclty on the sheet.

5. If you traget an token, the hit locations and any target modifier of the targeted token are displayed on the combat tab.

6. Roll on Tables for criticals and reactions directly from the sheet (The roll tables are not included, you need to set them up yourself and provide the roll table names in the configuration).

### Configuration

The module configuration lets the GM provide the roll table names, change the categorization of skills and items, and configure various default behaviors.
Most configurations can be overriden for specific characters via the _Sheet config._ button in the title bar of the character sheet.

Note on roll tables: The sheet allows rolls for criticals and reaction rolls. The tables are not inculded for legal resons and you need to provide them yourself. In the settings, the names of your tables must be set.
For reaction rolls to use the modifiers from the mofiier bucket, the roll formular must be set up as 3d6 + @gmodc.

### Limitations

The categorization of skills and traits are based on there names. If you use translated names, this will fail and anything will be displayed on the _Others_ tab. However, you can assinge the item manually to the correct tab in the configuration.

### Status of Development

The sheet uses some heuristics to extract the possible grips for weapons from the limited data avaiable in the current version of the GURPS Game Aid. They work for the setups I have tested, but I expect that there are situations that give in wired results. I am also not sure that the layout works for every character.
If you notice any broken display, please open a [GitHub issue](https://github.com/StefanLeng/gurps-categorized-sheet/issues)  and attach the character file if possibe.
I am also very intrested in any sugesstions for additional content that could be uesfull to include on any of the tabs (but take in account that the _combat_ tab is allready quite packed).

### Future plans

I currently plan to add the following features:

1. Jumping and hiking calculator on the exploration tab.

2. Maybe additional combat options from the GURPS Martial Arts book.

3. Maybe add some useful tables to various tabs.

When the new GCS based version of the GURPS Game Aid is ready, I plan to build a new version on that basis. There will be much more possibilities on the much richer data model, but this will be a near total rewite.

### Legal

The material presented here is my original creation, intended for use with the [GURPS](http://www.sjgames.com/gurps) system from [Steve Jackson Games](ttp://www.sjgames.com). This material is not official and is not endorsed by Steve Jackson Games.

[GURPS](http://www.sjgames.com/gurps) is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games. All rights are reserved by Steve Jackson Games. This tool is the original creation of Stefan Leng and is released for free distributionunder the permissions granted in the [Steve Jackson Games Online Policy](http://www.sjgames.com/general/online_policy.html)


## Installation

This moduel can be installed via the Foundry Package Manager.
To install it manually, user thhis Manifest URL.
https://github.com/StefanLeng/gurps-categorized-sheet/releases/latest/download/module.json

## Changelog

Initial Release 0.3.0
This is a beta release. Please report all problems via [GitHub issues](https://github.com/StefanLeng/gurps-categorized-sheet/issues) and attach the character file if possibe.

0.3.1
Fix for some display issues with characters imported from GCA.
Fix for missing attacks from weapons in containers.

0.3.2
Made number of hands configurable. You can now have more (or less) than 2 hands.
Display message when an exeption occures when working with unexpected character data. This allows the user to switch to another sheet. 
Fixed various issues with skill and traits containers.
Scrollbars for equipmnet.
Fixed display of attacks without useage.
Fixed display of attacks with missing ST or range.
Fixed layout of the spell list.
Fixed layout issues with ranged attacks with longer texts.

0.4.0
You can now configure your own OTFs for various parts of the sheet. These can be conditional by skills, traits or chosen manuever.
Deactivate or activate attacks, defences and OTFs based on chosen manuever.
Show all sense rolls on exploration tab.
Configure per actor witch non-weapon attacks uses an empty hand.
More fixes for equipment in containers.
Fix for attacks not showing if the weapon name has postfixes (e.g. for TL)  

0.4.1
Fix for containers disappearing from lists if collapsed.
Better handling of missing roll tables.
Option to allow two-handed weapons to be wielded one-handed with heigh enough strength. Activated by a setting, because in some situations this rule gives nonsensial results.
Fix layout for larger than default fonts. 

0.4.2 
Compatiblity fixes for GGA 0.17.17.

0.5.0
"All" tab with all traits and skills
Display Basic Speed

0.5.1
Added quick notes to others tab.
Fixed styling of settings if dark color scheme is activ
Fixed OTFs in wepon usage notes
Removed splitting weapon grips on usage notes. This was meant to seperate usages that uses differnt skills, but the usage notes often contain other things than the skill. Grip separation by skill will have to wait for an enhnanced GGA data model.

0.6.0
You can now select a "unready" grip for all weapons.
Refined grip display.
Favorites Tab: Configure your favorite traits and skills in the sheet configuraton for fast accsess on the "Favs" tab.

0.7.0
Compatiblity with GGA 0.18.0 and Foundry 13

## Development

### Prerequisites

In order to build this module, recent versions of `node` and `npm` are
required. Most likely, using `yarn` also works, but only `npm` is officially
supported. We recommend using the latest lts version of `node`. If you use `nvm`
to manage your `node` versions, you can simply run

```
nvm install
```

in the project's root directory.

You also need to install the project's dependencies. To do so, run

```
npm install
```

### Building

You can build the project by running

```
npm run build
```

Alternatively, you can run

```
npm run build:watch
```

to watch for changes and automatically build as necessary.

### Linking the built project to Foundry VTT

In order to provide a fluent development experience, it is recommended to link
the built module to your local Foundry VTT installation's data folder. In
order to do so, first add a file called `foundryconfig.json` to the project root
with the following content:

```
{
  "dataPath": ["/absolute/path/to/your/FoundryVTT"]
}
```

(if you are using Windows, make sure to use `\` as a path separator instead of
`/`)

Then run

```
npm run link-project
```

On Windows, creating symlinks requires administrator privileges, so
unfortunately you need to run the above command in an administrator terminal for
it to work.

You can also link to multiple data folders by specifying multiple paths in the
`dataPath` array.

### Running the tests

You can run the tests with the following command:

```
npm test
```

## Licensing

This project is being developed under the terms of the
[LIMITED LICENSE AGREEMENT FOR MODULE DEVELOPMENT] for Foundry Virtual Tabletop.

For licensing information see [LICENCE.txt](https://github.com/StefanLeng/gurps-categorized-sheet/blob/main/src/LICENSE.txt).
