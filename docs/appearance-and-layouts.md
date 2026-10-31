# Personal appearance and optional layouts

Use **Appearance** in a Categorized Sheet window's header. Preferences belong to
the current Foundry user, across that user's Categorized Sheets in this world.
They do not change a shared actor, permissions, skill categories, or GURPS 4e rules.

**Use actor / world theme** retains Stefan's existing theme hierarchy. A personal
theme overrides it for that user. Decoration, spacing, typography, contrast,
overall scale, and text size are independent. **Reset my appearance** restores
personal defaults and theme inheritance; it does not reset character data.
Existing client scale/accessibility settings remain the fallback until the user
saves personal preferences.

The extra themes are Expedition / Field Journal, Naval / Age of Sail, Arcane /
Grimoire, Space Operations, Cyberpunk, Gothic / Occult, Pulp / Cliffhanger, and
Wasteland / Salvage. Existing themes, including Pulp / Historical, are retained.
Font stacks use local fonts and fall back without network requests.

## Layouts

| Layout | Emphasis |
| --- | --- |
| Standard tabs | Existing organisation; default for all users |
| Tactical Wide | Combat attacks, targets, defences, DR, and resources together; Criticals remains accessible |
| Field focus | Exploration skills/traits, senses, lifting, resources, and Quick Notes |
| Investigator | Social/research skills, reactions, senses, and Quick Notes |
| Powers desk | Power skills/traits, existing spells, configured OTFs, resources, and Quick Notes |
| Personal dashboard | User-selected favourites, defences, resources, notes, equipment, lifting, and senses |

Workspaces move the original rendered panels and return them when leaving the
workspace. They do not clone inputs, IDs, roll handlers, or actor values. The nine
existing primary sections remain available. Empty panels show a short message.
Tactical Wide folds its skill/trait column above attacks and defences below 1120px;
large text and wide tables can still require scrolling.

Selected sections are remembered per layout for the lifetime of the open sheet.
Expanded skill details and scroll positions survive sheet refreshes. Appearance
updates do not rerender applications. Quick Notes continues to use GGA's own
editor; no local draft copy is written over actor data. Existing actor fields,
including HP and resource inputs, always take refreshed document values.

## Validation before merging

The implementation has local template/DOM tests and compilation checks. GGA-owned
template helpers and Foundry services are mocked in the local integration fixture.
This is not a live-world verification or an accessibility certification.

Run the repository's normal `npm ci`, `npm run lint`, `npm test -- --runInBand`,
and `npm run build` in CI. The added Jest tests cover personal reset/inheritance,
state restoration, panel identity, event retention, and dashboard selection.

In a disposable Foundry world, test on the supported GGA 0.18.x line:

1. Open the same actor as two users. Change one user's appearance and layout;
   confirm the other user's settings and the actor's configuration are unchanged.
2. In each layout, roll skills, melee/ranged attacks, damage, Dodge/Parry/Block,
   configured OTFs, reactions, and Criticals. Confirm exactly one action per click.
3. Change grips, maneuvers, posture, encumbrance, HP/FP, and custom resources.
   Confirm recalculated values and targets update without losing the selected tab.
4. Open a skill, scroll a long list, then trigger a target or HP refresh. Check
   expansion, scroll, and focus. Repeat after returning to a different layout.
5. Start editing Quick Notes using GGA's editor. Change appearance in another
   window, then save/cancel. Confirm the editor and resulting note behave normally.
6. Use GCS-imported, GCA-imported, and native GGA actors, including an empty actor,
   long equipment lists, spells, nested skills, many trackers, and a non-owner view.
7. Check Original, light/dark contrast, plain typography, decoration off/subtle/full,
   compact spacing, 80–150% overall scale, and 100–150% text at narrow/wide sizes.
8. Close and reopen the sheet. Confirm target updates resume and no duplicate
   handlers appear. Check compatibility with installed resource and attribute modules.

The changes intentionally target the published sheet, not the GGA 1.0 development
branch. Upstream release metadata and declared compatibility are unchanged.
