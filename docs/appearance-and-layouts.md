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
| Personal dashboard | User-selected favourites, defences, resources, notes, equipment, lifting, senses, melee, and ranged attacks |

Workspaces move the original rendered panels and return them when leaving the
workspace. They do not clone inputs, IDs, roll handlers, or actor values. The nine
existing primary sections remain available. Empty panels show a short message.
Tactical Wide folds its skill/trait column above attacks and defences below 1120px;
large text and wide tables can still require scrolling.

Standard and Tactical Wide have no Workspace navigation item. The other layouts
add an inline tab without forcing a separate navigation row; tabs can still wrap
when the window width or enlarged text requires it. Workspace panels size to their
contents, scroll vertically as a group, and switch to one column when space is
limited. Wide tables scroll within their own panel.

Melee and Ranged dashboard panels are optional and leave saved panel choices
unchanged. Each includes its original attack table, configured OTFs, and targets.
Leaving the workspace returns those same nodes to their Combat subtabs.

Selected sections are remembered per layout for the lifetime of the open sheet.
Expanded skill details and scroll positions survive sheet refreshes. Appearance
updates do not rerender applications. Quick Notes continues to use GGA's own
editor; no local draft copy is written over actor data. Existing actor fields,
including HP and resource inputs, always take refreshed document values.

## Validation before merging

The implementation has local template/DOM tests and compilation checks. GGA-owned
template helpers and Foundry services are mocked in the local integration fixture.
This is not a live-world verification or an accessibility certification.

The layout review fixes include compiled-stylesheet checks for tab visibility and
inline display, content-sized grid tracks, and DOM tests for moving and restoring
attack tables with their targets. These checks do not measure browser geometry;
the overlap and scaling checks below still require visual confirmation in Foundry.

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
9. In Standard and Tactical Wide, confirm no empty Workspace tab is visible.
   In Field, Investigator, Powers, and Dashboard, check that each panel border
   encloses its content and that later rows do not overlap long skill or trait lists.
10. Enable Melee and Ranged dashboard panels, roll attacks, damage, and target
    modifiers, then return to Combat. Repeat after changing targets and refreshing
    the actor; confirm controls remain unique and every click acts once.

The changes intentionally target the published sheet, not the GGA 1.0 development
branch. Upstream release metadata and declared compatibility are unchanged.

### Workspace tab lifecycle regression checks

Workspace panels are reconciled through Foundry's primary-tab change callback,
after activation, and after the completed sheet render. The parent tab callback
is preserved. Combat subtab changes do not rebuild the workspace. This avoids
reading the previous active tab from a navigation click handler and ensures that
reopening or replacing the sheet DOM uses the current tab controllers.

`test/layout-lifecycle.test.ts` exercises the real sheet methods and panel mover
with a mocked Foundry host and delegated navigation. It covers all four workspace
layouts, saved per-layout tabs, cached-sheet reopening, actor-value refreshes,
appearance refreshes, programmatic activation, and repeated moves without duplicate
notes. It is an integration regression test, not a live Foundry-world test.

Before merging, repeat Stefan's reported sequences for Field, Investigator,
Powers, and Dashboard in Foundry:

1. With Favourites open, change from Standard to the workspace layout, then open
   Workspace. Also repeat after that layout has previously remembered Favourites.
2. Leave a different tab selected, close the sheet, reopen it, then open Workspace.
3. Leave a different tab selected, change HP or FP, then open Workspace. Repeat
   with a theme change. Confirm the panels appear and the changed values persist.
4. Return to the original tabs and back repeatedly; verify rolls, targets, notes,
   and editable controls still work exactly once per action.
