import { getSettings } from './settings.ts';

const ALL_TABLES = ['Critical Hit', 'Critical Miss', 'Critical Head Blow', 'Reaction Rolls'] as const;
type Table_tuple = typeof ALL_TABLES;

export type MyRollTable = Table_tuple[number];

const criticalTable: MyRollTable[] = ['Critical Hit', 'Critical Miss', 'Critical Head Blow'];

function tableName(table: MyRollTable): string {
    //toDo: make configurable
    return getSettings().rollTables[table];
}

function rollTableExistsByName(tableName: string) {
    return !!game.tables.getName(tableName);
}

function drawTableRollByName(tableName: string) {
    game.tables.getName(tableName)?.draw();
}

export function rollTableExists(table: MyRollTable) {
    return rollTableExistsByName(tableName(table));
}

export function drawTableRoll(table: MyRollTable) {
    return drawTableRollByName(tableName(table));
}

export function existingCriticalTables() {
    return criticalTable.filter(rollTableExists);
}
