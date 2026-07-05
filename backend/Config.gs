/**
 * Global Configuration for the FinanceStudio Backend
 */
const Config = {
  // We will need the actual Google Sheet ID where data is stored.
  // For development, replace this with your test spreadsheet ID.
  SPREADSHEET_ID: '1BQ3OiqE4bNVAhCaz69qPzFTaJYB-ZZeWABMhll_X2WQ',

  // Sheet names
  SHEETS: {
    INVOICES: 'Invoices',
    INVOICE_ITEMS: 'Invoice_Items',
    CUSTOMERS: 'Customers',
    TRANSACTIONS: 'Transactions',
    PRODUCTS: 'Products',
    SETTINGS: 'Settings',
    DASHBOARD_CACHE: 'DashboardCache',
    LOGS: 'Logs'
  },

  // Security
  // Set an API Key here and send it from the frontend to secure endpoints
  API_KEY: 'FS-API-KEY-2026-X89J'
};
