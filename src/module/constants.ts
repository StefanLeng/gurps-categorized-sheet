const combatSkills  : Array<string>=
[
    "xSpear",
    "Staff",
    "Acrobatics",
    "Sweep",
    "Disarming",
    "Feint",
    "Mental Strength",
    "Flying Lunge",
    "Whirlwind Attack",
    "Power Blow",
    "Thrown Weapon",
    "Judo",
    "Knife",
    "Jumping",
    "Tactics",
    "Penetrating Strike",
    "Ghostly Weapon",
    "Annihilating Weapon",
    "Fast-Draw",
    "Shield",
    "Broadsword",
    "Brawling",
    "Counterattack",
    "Wrestling",
    "Close Combat",
    "Dual-Weapon Defense",
    "Bow",
    "Karate",
    "Shortsword",
    "Two-Handed Sword",
    "Dual-Weapon Attack",
    "Retain Weapon"
];

const socialSkills  : Array<string>= 
[
    "Intimidation",
    "Leadership",
    "Diplomacy",
    "Singing",
    "Dancing",
    "Area Knowledge",
    "Acting",
    "Body Language",
    "Merchant",
    "Musical Instrument",
    "Savoir-Faire",
    "Streetwise",
];

const explorationSkills  : Array<string>= 
[
    "Acrobatics",
    "Stealth",
    "Swimming",
    "Jumping",
    "Tactics",
    "Tracking",
    "Survival",
    "Naturalist",
    "Navigation",
    "Climbing",
    "Riding",
    "Geography",
    "Astronomy",
    "Area Knowledge",
    "Boating",
    "Running",
    "Seamanship",
    "Streetwise",
];

const technicalSkills  : Array<string> =
[
    "Tactics",
    "Naturalist",
    "Navigation",
    "Geography",
    "Astronomy",
    "Mathematics",
    "Area Knowledge",
    "Occultism",
    "Esoteric Medicine",
    "First Aid",
    "Merchant",
    "Streetwise",
];

const powersSkills : Array<string> =
[
    "Mental Strength",
    "Penetrating Strike",
    "Ghostly Weapon",
    "Annihilating Weapon",
    "Occultism",
    "Esoteric Medicine",
];

interface CategoryList {
    [index: string]:  Array<string>;
    combat: Array<string>,
    social: Array<string>,
    exploration: Array<string>,
    technical: Array<string>,
    powers:Array<string>,  
    all: Array<string>,
}

export const skillCategories : CategoryList =
{
    combat: combatSkills,
    social: socialSkills,
    exploration: explorationSkills,
    technical: technicalSkills,
    powers: powersSkills,
    all: combatSkills.concat(socialSkills).concat(explorationSkills).concat(technicalSkills).concat(powersSkills),
}

/*new Set(game.actors.entries().toArray()
.flatMap( a =>Object.values( a[1].system.skills)
.map(i=>i.name).concat((Object.values( a[1].system.skills))
.flatMap(i=>Object.values(i.contains))
.map(i=>i.name)))
.map(i=>(i.indexOf('(') > 0) ? i.substr(0,i.indexOf('(')).trim() : i))

*/