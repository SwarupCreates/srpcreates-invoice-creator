/**
 * Settings Controller
 */
const SettingsService = {
  get: function(e) {
    const data = SheetService.getAllRows(Config.SHEETS.SETTINGS);
    if (!data || data.length === 0) return Response.success({});
    return Response.success(data[0]);
  },
  
  update: function(payload) {
    // Placeholder for updating settings row
    return Response.success(payload.data, "Settings updated");
  }
};
