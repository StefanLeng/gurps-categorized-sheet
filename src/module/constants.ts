import { CategoryList } from "./types.ts";

export const MODULE_ID = 'gurps-categorized-sheet';
export const SYSTEM_ID = 'gurps';
export const CAT_SHEET_SETTINS = 'cat_sheet_settings'

const combatSkills  : Array<string>=
[
"Sweep",
"Disarming",
"Feint",
"Mental Strength",
"Flying Lunge",
"Whirlwind Attack",
"Penetrating Strike",
"Ghostly Weapon",
"Annihilating Weapon",
"Counterattack",
"Close Combat",
"Dual-Weapon Defense",
"Dual-Weapon Attack",
"Retain Weapon",
"Acrobatics",
"Aerobatics",
"Aquabatics",
"Artillery",
"Axe/Mace",
"Beam Weapons",
"Blind Fighting",
"Blowpipe",
"Body Control",
"Bolas",
"Bow",
"Boxing",
"Brawling",
"Breaking Blow",
"Broadsword",
"Cloak",
"Combat Art",
"Combat Sport",
"Crossbow",
"Dropping",
"Fast-Draw",
"Flail",
"Flying Leap",
"Force Sword",
"Force Whip",
"Forward Observer",
"Garrote",
"Gun Sport",
"Gunner",
"Guns",
"Immovable Stance",
"Innate Attack",
"Jitte/Sai",
"Judo",
"Jumping",
"Karate",
"Kiai",
"Knife",
"Kusari",
"Lance",
"Lasso",
"Liquid Projector",
"Main-Gauche",
"Mental Strength",
"Monowire Whip",
"Mount",
"Net",
"Parry Missile-Weapons",
"Polearm",
"Power Blow",
"Preconitive Parry",
"Pressure Points",
"Pressure Secrets",
"Push",
"Rapier",
"Saber",
"Shield",
"Shortsword",
"Sling",
"Smallsword",
"Spear",
"Spear Thrower",
"Staff",
"Stage Combat",
"Strategy",
"Sumo Wrestling",
"Tactics",
"Throwing",
"Throwing Art",
"Thrown Weapon",
"Tonfa",
"Two-Handed Axe/Mace",
"Two-Handed Flail",
"Two-Handed Sword",
"Whip",
"Wrestling",
"Zen Archery",
"Zen Marksmanship",

];

const socialSkills  : Array<string>= 
[
"Acting",
"Administration",
"Area Knowledge",
"Artist",
"Bartender",
"Body Language",
"Brainwashing",
"Captivate",
"Carousing",
"Connoisseur",
"Current Affairs",
"Dancing",
"Detect Lies",
"Diplomacy",
"Disguise",
"Enthrallment",
"Erotic Art",
"Falconry",
"Fast-Talk",
"Fire Eating",
"Fortune-Telling",
"Gambling",
"Games",
"Gesture",
"Group Performance",
"Interrogation",
"Intimidation",
"Law",
"Leadership",
"Lip Reading",
"Makeup",
"Meditation",
"Merchant",
"Musical Composition",
"Musical Influence",
"Musical Instrument",
"Observation",
"Panhandling",
"Performance",
"Persuade",
"Philosophy",
"Pickpocket",
"Poetry",
"Politics",
"Propaganda",
"Public Speaking",
"Religious Ritual",
"Savoir-Faire",
"Sex Appeal",
"Shadowing",
"Singing",
"Sleight of Hand",
"Soldier",
"Sports",
"Stage Combat",
"Streetwise",
"Teaching",
"Ventriloquism",
"Writing",
];

const explorationSkills  : Array<string>= 
[
"Acrobatics",
"Aerobatics",
"Airshipman",
"Animal Handling",
"Aquabatics",
"Bicycling",
"Boating",
"Body Control",
"Body Sense",
"Breath Control",
"Camouflage",
"Cartography",
"Climbing",
"Diving Suit",
"Driving",
"Environment Suit",
"Escape",
"Explosives",
"Falconry",
"Filch",
"Fishing",
"Flying Leap",
"Forced Entry",
"Forward Observer",
"Free Fall",
"Freight Handling",
"Hiking",
"Holdout",
"Invisibility Art",
"Jumping",
"Knot-Tying",
"Lifting",
"Light Walk",
"Lip Reading",
"Lizard Climb",
"Lockpicking",
"Mount",
"Naturalist",
"Navigation",
"NBC Suit",
"Observation",
"Packing",
"Parachuting",
"Pickpocket",
"Piloting",
"Riding",
"Running",
"Scrounging",
"Scuba",
"Seamanship",
"Search",
"Shadowing",
"Shiphandling",
"Skating",
"Skiing",
"Smuggling",
"Stealth",
"Submarine",
"Submariner",
"Survival",
"Swimming",
"Teamster",
"Tracking",
"Traps",
"Urban Survival",
"Vacc Suit",
"Weather Sense",
];

const technicalSkills  : Array<string> =
[
"Accounting",
"Administration",
"Airshipman",
"Alchemy",
"Anthropology",
"Archaeology",
"Architecture",
"Area Knowledge",
"Armoury",
"Artillery",
"Astronomy",
"Bioengineering",
"Biology",
"Brain Hacking",
"Carpentry",
"Cartography",
"Chemistry",
"Computer Hacking",
"Computer Operation",
"Computer Programming",
"Cooking",
"Counterfeiting",
"Criminology",
"Cryptography",
"Diagnosis",
"Economics",
"Electrician",
"Electronics Operation",
"Electronics Repair",
"Engineer",
"Esoteric Medicine",
"Expert Skill",
"Explosives",
"Farming",
"Finance",
"First Aid",
"Fishing",
"Forensics",
"Forgery",
"Forward Observer",
"Freight Handling",
"Gardening",
"Geography",
"Geology",
"Hazardous Materials",
"Heraldry",
"Herb Lore",
"Hidden Lore",
"History",
"Hobby Skill",
"Holdout",
"Housekeeping",
"Intelligence Analysis",
"Jeweler",
"Knot-Tying",
"Law",
"Leatherworking",
"Linguistics",
"Literature",
"Lockpicking",
"Machinist",
"Market Analysis",
"Masonry",
"Mathematics",
"Mechanic",
"Merchant",
"Metallurgy",
"Meteorology",
"Naturalist",
"Observation",
"Occultism",
"Packing",
"Paleontology",
"Pharmacy",
"Philosophy",
"Photography",
"Physician",
"Physics",
"Physiology",
"Pickpocket",
"Poisons",
"Professional Skill",
"Prospecting",
"Psychology",
"Research",
"Sewing",
"Smith",
"Sociology",
"Soldier",
"Spacer",
"Speed-Reading",
"Sports",
"Strategy",
"Surgery",
"Tactics",
"Teaching",
"Thaumatology",
"Theology",
"Traps",
"Typing",
"Veterinary",
"Weird Science",
"Writing",
];

const powersSkills : Array<string> =
[
"Penetrating Strike",
"Ghostly Weapon",
"Annihilating Weapon",
"Autohypnosis",
"Brain Hacking",
"Dreaming",
"Enthrallment",
"Exorcism",
"Flying Leap",
"Hypnotic Hands",
"Hypnotism",
"Invisibility Art",
"Light Walk",
"Lizard Climb",
"Meditation",
"Mental Strength",
"Mind Block",
"Musical Influence",
"Occultism",
"Path of Body",
"Path of Change",
"Path of Crossroads",
"Path of Energy",
"Path of Magic",
"Path of Matter",
"Path of Mind",
"Path of Spirit",
"Path of Undead",
"Persuade",
"Power Blow",
"Preconitive Parry",
"Pressure Points",
"Pressure Secrets",
"Ritual Magic",
"Suggest",
"Sway Emotions",
"Symbol Drawing",
"Symbol Magic",
"Thaumatology",
];

export const skillCategories : CategoryList =
{
    combat: combatSkills,
    social: socialSkills,
    exploration: explorationSkills,
    technical: technicalSkills,
    powers: powersSkills,
}

/*new Set(game.actors.entries().toArray()
.flatMap( a =>Object.values( a[1].system.skills)
.map(i=>i.name).concat((Object.values( a[1].system.skills))
.flatMap(i=>Object.values(i.contains))
.map(i=>i.name)))
.map(i=>(i.indexOf('(') > 0) ? i.substr(0,i.indexOf('(')).trim() : i))

*/

const combatAds = [
"360° Vision",
"Affliction",
"Altered Time Rate",
"Ambidexterity",
"Arm DX",
"Arm ST",
"Binding",
"Born War-Leader",
"Claws",
"Combat Reflexes",
"Constriction Attack",
"Damage Resistance",
"Daredevil",
"Dual Shooting ",
"Enhanced Block",
"Enhanced Dodge",
"Enhanced Move",
"Enhanced Parry ",
"Extra Arm",
"Extra Attack",
"Extra Fatigue Points",
"Extra Head",
"Extra Hit Points",
"Extra Legs",
"Extra Life",
"Extra Mouth",
"Fit",
"Very Fit",
"Gunslinger",
"Hard to Kill",
"Hard to Subdue",
"Heroic Archer",
"High Pain Threshold",
"Higher Purpose",
"Injury Tolerance",
"Innate Attack",
"Insubstantiality",
"Iron Hands",
"Leech",
"Lifting ST",
"Luck",
"Nictitating Membrane",
"Peripheral Vision",
"Regeneration",
"Resistant",
"Serendipity",
"Signature Gear",
"Slippery",
"Spines",
"Striker",
"Striking ST",
"Supernatural Durability",
"Talent ",
"Teeth",
"Trained by a Master",
"Unkillable",
"Unusual Background",
"Vampiric Bite",
"Weapon Master ",
"Armor Familiarity ",
"Biting Mastery",
"Exotic Weapon Training ",
"Form Mastery ",
"Grip Mastery ",
"Ground Guard",
"Improvised Weapons ",
"Naval Training",
"Neck Control ",
"No Visible Damage",
"Off-Hand Weapon Training ",
"Power Grappling",
"Quick Reload ",
"Rapid Retraction ",
"School Adaptation ",
"Secret Knowledge ",
"Shield-Wall Training",
"Skill Adaptation ",
"Special Excercises ",
"Special Setup ",
"Strongbow",
"Style Adaptation ",
"Style Familiarity ",
"Suit Familiarity ",
"Sure Footed ",
"Teamwork ",
"Technique Adaptation ",
"Technique Mastery ",
"Teeth",
"Template Adaptation ",
"Unique Technique ",
"Unusual Training ",
"Weapon Adaptation ",
"Weapon Bond",
"Bad Grip",
"Berserk",
"Blindness",
"Bloodlust",
"Combat Paralysis",
"Cowardice",
"Cursed",
"Easy to Kill",
"Flashbacks",
"Fragile",
"Gigantism",
"Ham-Fisted",
"Hemophilia",
"Infectious Attack",
"Lame",
"Low Pain Threshold",
"On the Edge",
"One Arm",
"One Eye",
"One Hand",
"Pacifism",
"Susceptible ",
"Unfit",
"Unluckiness",
"Vulnerability",
"Weak Bite",
"Weakness",
"Wounded",
]

const socialAds = [
"Ally ",
"Alternate Identity",
"Appearance",
"Awe",
"Born War-Leader",
"Charisma",
"Claim to Hospitality",
"Clerical Investment",
"Common Sense",
"Contact ",
"Cultural Adaptability",
"Cultural Familiarity ",
"Empathy",
"Fashion Sense",
"Fearlessness",
"Hermaphromorph",
"Higher Purpose",
"Illuminated",
"Independent Income",
"Indomitable",
"Intuition",
"Language Talent",
"Language",
"Legal Enforcement Powers",
"Legal Immunity",
"Luck",
"Parapsychologist",
"Patron",
"Patrons",
"Pitiable",
"Rank",
"Rapier Wit",
"Security Clearance",
"Serendipity",
"Sign Language",
"Signature Gear",
"Single-Minded",
"Social Chameleon",
"Social Regard",
"Special Rapport ",
"Spirit Empathy",
"Talent ",
"Tenure",
"Unfazeable",
"Unusual Background",
"Voice",
"Wealth",
"Zeroed",
"Alcohol Tolerance",
"Honest Face",
"No Hangover",
"Absent-Mindedness",
"Addiction ",
"Aichmophobia",
"Ailurophobia",
"Alcoholism",
"Amnesia ",
"Arachnophobia",
"Autophobia",
"Bad Smell",
"Bad Temper",
"Bestial",
"Bully",
"Callous",
"Cannot Learn",
"Cannot Speak",
"Charitable",
"Chronic Depression",
"Chronic Pain",
"Chummy",
"Claustrophobia",
"Clueless",
"Code of Honor",
"Coitophobia",
"Compulsive",
"Compulsive Carousing",
"Compulsive Debating",
"Compulsive Gambling",
"Compulsive Generosity",
"Compulsive Lying",
"Compulsive Rhetoric",
"Compulsive Spending",
"Compulsive Vowing",
"Confused",
"Cowardice",
"Curious",
"Cursed",
"Cynophobia",
"Debt",
"Delusion ",
"Demophobia",
"Dependant ",
"Disciplines of Faith",
"Disturbing Voice",
"Divine Curse ",
"Duty ",
"Dyslexia",
"Easy to Read",
"Enemies",
"Enemy ",
"Entomophobia",
"Fanaticism ",
"Fat",
"Fearfulness",
"Flashbacks",
"Frightens Animals",
"Gluttony",
"Greed",
"Guilt Complex",
"Gullibility",
"Heliophobia",
"Hemophobia",
"Herpetophobia",
"Hidebound",
"Honesty",
"Hoplophobia",
"Hunchback",
"Impulsiveness",
"Incurious",
"Indecisive",
"Innumerate",
"Intolerance ",
"Jealousy",
"Killjoy",
"Kleptomania",
"Laziness",
"Lecherousness",
"Lifebane",
"Loner",
"Low Empathy",
"Low Self-Image",
"Manaphobia",
"Mania ",
"Manic-Depressive",
"Megalomania",
"Miserliness",
"Missing Digit",
"Mistaken Identity",
"Mundane Background",
"Mysophobia ",
"Necrophobia",
"Neurological Disorder",
"Nightmares",
"No Sense of Humor",
"Nocturnal",
"Noisy",
"Non-Icongraphic",
"Oblivious",
"Obsession",
"Odious Personal Habit",
"On the Edge",
"Overconfidence",
"Pacifism",
"Panic Attacks",
"Paranoia",
"Phantom Voices",
"Post-Combat Shakes",
"Psionophobia ",
"Pyromania",
"Pyrophobia",
"Reprogrammable",
"Reputation",
"Revulsion ",
"Sadism",
"Scotophobia",
"Secret ",
"Secret Identity ",
"Selfish",
"Selfless",
"Sense of Duty",
"Shadow Form",
"Short Attention Span",
"Short Lifespan",
"Shyness",
"Skinny",
"Slave Mentality",
"Sleepwalker",
"Sleepy",
"Slow Eater",
"Slow Riser",
"Social Disease",
"Social Stigma",
"Split Personality",
"Squeamish",
"Status ",
"Stress Atavism",
"Stubbornness",
"Stuttering",
"Supernatural Features",
"Technophobia",
"Teratophobia",
"Terminally Ill",
"Thalassophobia",
"Trickster",
"Truthfulness",
"Uncontrollable Appetite ",
"Unique",
"Unluckiness",
"Unnatural Features ",
"Very Fat",
"Weirdness Magnet",
"Workaholic",
"Xenophilia",
"Alcohol Intolerance",
"Attentive",
"Broad-Minded",
"Careful",
"Chauvinistic",
"Congenial",
"Delusions",
"Dislikes",
"Distinctive Features",
"Distractible",
"Dreamer",
"Dual Identity",
"Dull",
"Expression",
"Forgetful",
"Habit",
"Horrible Hangovers",
"Humble",
"Imaginative",
"Minor Addiction",
"Nervous Stomach",
"Neutered",
"Nosy",
"Overweight",
"Personality Change",
"Proud",
"Responsive",
"Sexless",
"Staid",
"Third Person",
"Trademark",
"Uncongenial",
"Vow",
];

const explorationAds : string[] = [
"360° Vision",
"Absolute Direction",
"Absolute Timing",
"Acute Hearing",
"Acute Mana Sense",
"Acute Sense ",
"Acute Taste & Smell",
"Acute Touch",
"Acute Vision",
"Amphibious",
"Animal Empathy",
"Brachiator",
"Breath-Holding",
"Catfall",
"Chameleon",
"Clinging",
"Craftiness",
"Danger Sense",
"Daredevil",
"Dark Vision",
"Discriminatory Hearing",
"Discriminatory Smell",
"Discriminatory Taste",
"Doesn't Breathe",
"Doesn't Eat or Drink",
"Doesn't Sleep",
"Enhanced Move",
"Extra Arm",
"Extra Fatigue Points",
"Extra Head",
"Extra Hit Points",
"Extra Legs",
"Extra Mouth",
"Fearlessness",
"Filter Lungs",
"Fit",
"Very Fit",
"Flight",
"G-Experience",
"High Manual Dexterity",
"Higher Purpose",
"Hyperspectral Vision",
"Improved G-tolerance",
"Indomitable",
"Infravision",
"Insubstantiality",
"Invisibility",
"Jumper ",
"Less Sleep",
"Lifting ST",
"Luck",
"Microscopic Vision",
"Mimicry",
"Nictitating Membrane",
"Night Vision",
"Obscure ",
"Parabolic Hearing",
"Payload ",
"Penetrating Vision",
"Perfect Balance",
"Peripheral Vision",
"Permeation",
"Plant Empathy",
"Pressure Support",
"Protected Sense ",
"Radiation Tolerance",
"Reduced Consumption",
"Resistant",
"Scanning Sense",
"Sealed",
"See Invisible",
"Sensitive Touch",
"Serendipity",
"Shadow Form",
"Signature Gear",
"Silence",
"Slippery",
"Speak Underwater",
"Speak With Animals",
"Speak With Plants",
"Striking ST",
"Subsonic Hearing",
"Subsonic Speech",
"Super Climbing",
"Super Jump",
"Super Throw",
"Talent ",
"Telescopic Vision",
"Temperature Tolerance",
"Terrain Adaptation ",
"Tunneling ",
"Ultrahearing",
"Ultrasonic Speech",
"Ultravision",
"Unusual Background",
"Vacuum Support",
"Vibration Sense",
"Walk On Air",
"Walk On Liquid",
"Warp",
"Burrower",
"Climbing Line",
"Deep Sleeper",
"Fur",
"Penetrating Voice",
"Sure Footed ",
"Swinging",
"Acrophobia",
"Agoraphobia",
"Aichmophobia",
"Ailurophobia",
"Arachnophobia",
"Autophobia",
"Bad Back",
"Bad Grip",
"Bad Sight",
"Bad Smell",
"Blindness",
"Brontophobia",
"Chronic Pain",
"Claustrophobia",
"Cold-Blooded",
"Colorblindness",
"Curious",
"Cursed",
"Cynophobia",
"Deafness",
"Demophobia",
"Dependency ",
"Disturbing Voice",
"Dwarfism",
"Entomophobia",
"Epilipsy",
"Extra Sleep",
"Fearfulness",
"Frightens Animals",
"Gigantism",
"G-Intolerance",
"Ham-Fisted",
"Hard of Hearing",
"Heliophobia",
"Hemophobia",
"Herpetophobia",
"Hoplophobia",
"Horizontal",
"Hunchback",
"Increased Consumption",
"Increased Life Support",
"Insomniac",
"Invertebrate",
"Klutz",
"Lame",
"Light Sleeper",
"Maintenance",
"Manaphobia",
"Motion Sickness",
"Mysophobia ",
"Necrophobia",
"Night Blindness",
"No Depth Perception",
"No Legs",
"No Sense of Smell/Taste",
"Nocturnal",
"Numb",
"On the Edge",
"One Arm",
"One Eye",
"One Hand",
"Panic Attacks",
"Pyrophobia",
"Quadriplegic",
"Restricted Diet ",
"Restricted Vision",
"Revulsion ",
"Scotophobia",
"Semi-Upright",
"Shadow Form",
"Sleepwalker",
"Sleepy",
"Slow Eater",
"Slow Riser",
"Space Sickness",
"Squeamish",
"Supersensitive",
"Susceptible ",
"Technophobia",
"Teratophobia",
"Timesickness",
"Unfit",
"Unluckiness",
"Unusual Biochemistry",
"Very Fat",
"Acceleration Weakness",
"Bowlegged",
"Cannot Float",
"Overweight",
];

const technicalAds = [
"Animal Empathy",
"Craftiness",
"Eidetic Memory",
"Extra Arm",
"Extra Head",
"Extra Legs",
"Extra Mouth",
"Gadgeteer",
"Gizmo",
"Healing",
"High Manual Dexterity",
"High TL",
"Higher Purpose",
"Intuition",
"Language Talent",
"Language",
"Lightning Calculator",
"Luck",
"Payload ",
"Racial Memory",
"Rapid Healing",
"Recovery",
"Regeneration",
"Regrowth",
"Serendipity",
"Sign Language",
"Signature Gear",
"Single-Minded",
"Talent ",
"Unusual Background",
"Versatile",
"Visualization",
"Accessory ",
"Armorer's Gift (Guns)",
"Equipment Bond ",
"Absent-Mindedness",
"Bad Back",
"Bad Grip",
"Chronic Pain",
"Colorblindness",
"Cursed",
"Disturbing Voice",
"Dyslexia",
"Ham-Fisted",
"Innumerate",
"Invertebrate",
"Klutz",
"Laziness",
"Low TL",
"Missing Digit",
"No Fine Manipulators",
"No Manipulators",
"Non-Icongraphic",
"One Eye",
"One Hand",
"Short Attention Span",
"Skinny",
"Slow Healing",
"Technophobia",
"Unhealing",
"Unluckiness",
"Wounded",
"Careful",
];

const powersAds = [
"Imbue",
"Acute Mana Sense",
"Affliction",
"Air Talent",
"Altered Time Rate",
"Animal Control Talent",
"Animal Function Talent",
"Anti-Magic Talent",
"Antipsi Talent",
"Anti-Super Talent",
"Astral Projection Talent",
"Awe",
"Binding",
"Bioenergy Talent",
"Blessed",
"Body Alteration Talent",
"Body Control Talent",
"Brachiator",
"Breath-Holding",
"Catfall",
"Chameleon",
"Channeling",
"Chaos Talent",
"Clairsentience",
"Clinging",
"Close to Heaven",
"Cold/Ice Talent",
"Compartmentalized Mind",
"Confusion",
"Constriction Attack",
"Control ",
"Cosmic Talent",
"Create ",
"Cybernetics",
"Daredevil",
"Darkness Talent",
"Death Talent",
"Destiny ",
"Detect",
"Digital Mind",
"Dimensional Travel Talent",
"Dominance",
"Duplication",
"Earth Talent",
"Elastic Skin",
"Elasticity Talent",
"Electricity Talent",
"Electrokinesis Talent",
"Energy Reserve ",
"Enhanced Time Sense",
"Enhanced Tracking",
"ESP Talent",
"Evil Talent",
"Extended Lifespan",
"Extra Arm",
"Extra Head",
"Extra Legs",
"Extra Life",
"Extra Mouth",
"Filter Lungs",
"Flexibility",
"Force Construct Talent",
"Good Talent",
"Gravity Talent",
"Growth",
"Healing",
"Hermaphromorph",
"Higher Purpose",
"Illusion",
"Innate Attack",
"Insubstantiality",
"Invisibility",
"Jumper ",
"Leech",
"Longevity",
"Luck",
"Magery",
"Magic Resistance",
"Mana Damper",
"Mana Enhancer",
"Medium",
"Metabolism Control",
"Mimicry",
"Mind Control",
"Mind Probe",
"Mind Reading",
"Mind Shield",
"Mindlink",
"Modular Abiltity",
"Neutralize ",
"Obscure ",
"Oracle",
"Permeation",
"Phasing Talent",
"Plant Empathy",
"Plant Function Talent",
"Possession",
"Power Investiture",
"Power Talent",
"Precognition",
"Prophetic Dreams",
"Psychometry",
"Puppet ",
"Racial Memory",
"Reawakened",
"Resistant",
"Ritual Adept",
"Serendipity",
"Shadow Form",
"Shapeshifting",
"Shrinking",
"Signature Gear",
"Silence",
"Snatcher",
"Speak With Animals",
"Speak With Plants",
"Special Rapport ",
"Speed Talent",
"Spirit Empathy",
"Static ",
"Stretching",
"Talent ",
"Telekinesis",
"Temperature Control",
"Temporal Inertia",
"Terror",
"True Faith",
"Tunneling ",
"Ultrapower",
"Unaging",
"Universal Digestion",
"Unkillable",
"Unusual Background",
"Vampiric Bite",
"Walk On Air",
"Walk On Liquid",
"Warp",
"Wild Talent",
"Autotrance",
"Detect Plant Sapience",
"Druid's Tight Grasp",
"Environment Awareness",
"Fresh Cudgel",
"Generator",
"Ignition",
"Illumination",
"Little Green Digit",
"No Visible Damage",
"Perfume",
"Periscope",
"Pestilent",
"Plant-Form Rest",
"Ritual Mastery ",
"Sanitized Metabolism",
"Striking Surface",
"Swinging",
"Sympathetic Species",
"Tree-Tickler",
"Cursed",
"Disturbing Voice",
"Divine Curse ",
"Draining ",
"Dread ",
"Electrical",
"Infectious Attack",
"Lifebane",
"Lunacy",
"Magic Susceptibility",
"Manaphobia",
"Mundane Background",
"Psionophobia ",
"Self-Destruct",
"Unique",
"Unluckiness",
"Weakness",
];

export const adsCategories : CategoryList =
{
    combat: combatAds,
    social: socialAds,
    exploration: explorationAds,
    technical: technicalAds,
    powers: powersAds,
}