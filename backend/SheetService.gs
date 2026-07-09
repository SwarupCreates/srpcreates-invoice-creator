/**
 * Core Database Wrapper for Google Sheets
 * Uses header mapping to avoid hardcoded column indexes.
 */
const SheetService = {
  getSheet: function(sheetName) {
    const ss = SpreadsheetApp.openById(Config.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
  },

  getHeaders: function(sheet) {
    if (sheet.getLastRow() === 0) return {};
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = {};
    headerRow.forEach((colName, index) => {
      headers[colName] = index; // 0-based index
    });
    return headers;
  },

  getAllRows: function(sheetName) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    if (sheet.getLastRow() <= 1) return []; // Empty or just headers

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    const headers = this.getHeaders(sheet);
    const headerKeys = Object.keys(headers);
    
    return data.map(row => {
      const obj = {};
      headerKeys.forEach(key => {
        obj[key] = row[headers[key]];
      });
      return obj;
    });
  },

  insertRow: function(sheetName, obj) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    let headers = this.getHeaders(sheet);
    
    if (Object.keys(headers).length === 0) {
      // Auto-initialize headers for a completely blank sheet
      const newHeaders = Object.keys(obj);
      if (newHeaders.length > 0) {
        sheet.appendRow(newHeaders);
        headers = this.getHeaders(sheet);
      }
    }
    
    const rowData = [];
    Object.keys(headers).forEach(key => {
      rowData[headers[key]] = obj[key] !== undefined ? obj[key] : '';
    });
    
    sheet.appendRow(rowData);
    return obj;
  },

  updateRow: function(sheetName, idField, idValue, updateObj) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    if (sheet.getLastRow() <= 1) return false;

    const headers = this.getHeaders(sheet);
    if (headers[idField] === undefined) throw new Error("ID field not found in headers");

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    // Find the row (1-indexed for the sheet, but +2 because row 1 is header and row 2 is index 0)
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][headers[idField]]) === String(idValue)) {
        rowIndex = i + 2;
        break;
      }
    }

    if (rowIndex === -1) return false;

    // Update specific cells
    Object.keys(updateObj).forEach(key => {
      if (headers[key] !== undefined) {
        // column index is 1-based
        sheet.getRange(rowIndex, headers[key] + 1).setValue(updateObj[key]);
      }
    });

    return true;
  },

  deleteRow: function(sheetName, idField, idValue) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    if (sheet.getLastRow() <= 1) return false;

    const headers = this.getHeaders(sheet);
    if (headers[idField] === undefined) throw new Error("ID field not found in headers");

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][headers[idField]]) === String(idValue)) {
        rowIndex = i + 2;
        break;
      }
    }

    if (rowIndex === -1) return false;

    sheet.deleteRow(rowIndex);
    return true;
  },

  deleteRows: function(sheetName, idField, idValue) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    if (sheet.getLastRow() <= 1) return 0;

    const headers = this.getHeaders(sheet);
    if (headers[idField] === undefined) throw new Error("ID field not found in headers");

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    let deletedCount = 0;
    // Iterate backwards so deleting rows doesn't mess up subsequent indices
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][headers[idField]]) === String(idValue)) {
        sheet.deleteRow(i + 2);
        deletedCount++;
      }
    }

    return deletedCount;
  }
};
