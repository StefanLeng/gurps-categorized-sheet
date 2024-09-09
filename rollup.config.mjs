// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ignore from "rollup-plugin-ignore"


export function rollupConfig() {return {
  input: 'src/module/gurps-categorized-sheet.ts',
  output: {
    dir: 'dist/module',
    format: 'es',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
}};

export function rollupConfig2() {return {
  input: 'src/module/cat-sheet.ts',
  output: {
    dir: 'dist/module',
    format: 'es',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
}};