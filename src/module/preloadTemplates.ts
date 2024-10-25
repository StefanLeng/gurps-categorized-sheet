// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export async function preloadTemplates(): Promise<void> {
    const templatePaths: string[] = ['modules/gurps-categorized-sheet/templates/cat-sheet.hbs'];

    return loadTemplates(templatePaths);
}
