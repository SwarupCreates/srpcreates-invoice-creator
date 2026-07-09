/**
 * Settings Controller
 */
const SettingsService = {
  get: function(e) {
    const data = SheetService.getAllRows(Config.SHEETS.SETTINGS);
    if (!data || data.length === 0) return Response.success({});
    
    let row = data[0];
    try { if (row.personalInfo) row.personalInfo = JSON.parse(row.personalInfo); } catch(e) {}
    try { if (row.bankInfo) row.bankInfo = JSON.parse(row.bankInfo); } catch(e) {}
    
    return Response.success(row);
  },
  
  update: function(payload) {
    const sheetName = Config.SHEETS.SETTINGS;
    const settings = payload.data || {};
    
    const rowToSave = {
      id: '1',
      personalInfo: settings.personalInfo ? JSON.stringify(settings.personalInfo) : "",
      bankInfo: settings.bankInfo ? JSON.stringify(settings.bankInfo) : "",
      logoSvg: settings.logoSvg || ""
    };

    const sheet = SheetService.getSheet(sheetName);
    
    if (sheet.getLastRow() <= 1 && Object.keys(SheetService.getHeaders(sheet)).length === 0) {
       SheetService.insertRow(sheetName, rowToSave);
    } else {
       const updated = SheetService.updateRow(sheetName, 'id', '1', rowToSave);
       if (!updated) {
         SheetService.insertRow(sheetName, rowToSave);
       }
    }
    
    return Response.success(settings, "Settings updated successfully");
  }
};
