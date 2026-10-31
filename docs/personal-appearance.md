# Personal appearance

Use **Appearance** in the sheet header to choose a personal theme override,
decoration, spacing, plain typography, contrast, overall scale, and text size.
Preferences are stored on the current user in this world. Actor/world themes
remain the default. Reset restores theme inheritance and personal appearance
defaults without modifying actor data. Existing client settings remain the
fallback until personal preferences are saved.

Appearance updates change the DOM styles without rendering applications.
Expanded skill details, scroll positions, and focus survive sheet refreshes.
Actor values are never restored from a stale UI snapshot. Quick Notes continues
to use GGA's own editor, which appearance updates leave open.

Run the added Jest tests and verify two users sharing an actor, HP/target
refreshes, open Quick Notes editing, and all scaling/contrast combinations in
a live Foundry world before merging. This change alters presentation only.
