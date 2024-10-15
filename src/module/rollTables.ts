const  ALL_TABLES = ["Critical Hit" , "Critical Miss", "Critical Head Blow"] as const;
type Table_tuple = typeof ALL_TABLES;

export type MyRollTable = Table_tuple[number];

const criticalTable : MyRollTable[] = ["Critical Hit", "Critical Miss", "Critical Head Blow"];

function tableName( table : MyRollTable){//toDo: make configurable
    switch (table) {
        case "Critical Hit": return "Critical Hit"
        case "Critical Miss": return "Critical Miss"
        case "Critical Head Blow": return "Critical Head Blow"
    }
}

function rollTableExistsByName(tableName : String){
    return !!game.tables.getName(tableName);
}

function drawTableRollByName(tableName : string) {
    game.tables.getName(tableName)?.draw();
    GURPS.ModifierBucket.clear();
}

export function rollTableExists(table : MyRollTable) {
    return rollTableExistsByName(tableName(table));
};

export function drawTableRoll(table : MyRollTable) {
    return drawTableRollByName(tableName(table));
};

export function existingCriticalTables(){
    return criticalTable.filter(rollTableExists);
}