/**
 * Dashboard Controller
 */
const DashboardService = {
  getSummary: function(e) {
    // In a real app, this would pull from DashboardCache or aggregate on the fly.
    const data = SheetService.getAllRows(Config.SHEETS.DASHBOARD_CACHE);
    
    // Fallback if cache is empty
    if (!data || data.length === 0) {
      return Response.success({
        totalRevenue: 0,
        pendingInvoices: 0,
        recentActivity: []
      }, "Empty dashboard cache");
    }

    return Response.success(data[0]); // Return the single summary row
  }
};
