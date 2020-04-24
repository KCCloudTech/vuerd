import { CommandEffect } from "../Command";
import { Store } from "../Store";
import { Logger } from "../Logger";
import { getData, uuid } from "../Helper";
import { getColumnIds } from "../helper/ColumnHelper";
import { RelationshipType } from "../store/Relationship";
import { Table } from "../store/Table";
import { AddCustomColumn, executeAddCustomColumn } from "./column";
import { RelationshipModel } from "../model/RelationshipModel";

interface AddRelationshipPoint {
  tableId: string;
  columnIds: string[];
}
export interface AddRelationship {
  id: string;
  relationshipType: RelationshipType;
  start: AddRelationshipPoint;
  end: AddRelationshipPoint;
}
export function addRelationship(
  relationshipType: RelationshipType,
  startTable: Table,
  endTableId: string
): CommandEffect<AddRelationship> {
  const columnIds = getColumnIds(startTable.columns);
  return {
    name: "relationship.add",
    data: {
      id: uuid(),
      relationshipType,
      start: {
        tableId: startTable.id,
        columnIds,
      },
      end: {
        tableId: endTableId,
        columnIds: columnIds.map((columnId) => uuid()),
      },
    },
  };
}
export function executeAddRelationship(store: Store, data: AddRelationship) {
  Logger.debug("executeAddRelationship");
  const { relationships } = store.relationshipState;
  const { tables } = store.tableState;
  const { start, end } = data;
  const startTable = getData(tables, start.tableId);
  const endTable = getData(tables, end.tableId);
  if (start.columnIds.length !== 0 && startTable && endTable) {
    // create end table column
    const createEndColumns: AddCustomColumn[] = [];
    start.columnIds.forEach((startColumnId, index) => {
      const startColumn = getData(startTable.columns, startColumnId);
      if (startColumn) {
        createEndColumns.push({
          tableId: end.tableId,
          id: end.columnIds[index],
          option: null,
          ui: {
            active: false,
            pk: false,
            fk: true,
            pfk: false,
          },
          value: {
            name: startColumn.name,
            comment: startColumn.comment,
            dataType: startColumn.dataType,
            default: startColumn.default,
            widthName: startColumn.ui.widthName,
            widthComment: startColumn.ui.widthComment,
            widthDataType: startColumn.ui.widthDataType,
            widthDefault: startColumn.ui.widthDefault,
          },
        });
      }
    });
    executeAddCustomColumn(store, createEndColumns);
    // add relationship
    relationships.push(new RelationshipModel({ addRelationship: data }));
  }
}