/**
 * Main Entry Points for Google Apps Script Web App
 */

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // Auth Check for production (Optional depending on setup)
    // if (!Utils.verifyAuth(e)) return Response.error('Unauthorized', 401);

    switch (action) {
      case 'getDashboard':
        return DashboardService.getSummary(e);
      case 'getInvoices':
        return InvoiceService.getAll(e);
      case 'getInvoice':
        return InvoiceService.getById(e);
      case 'getCustomers':
        return CustomerService.getAll(e);
      case 'getTransactions':
        return TransactionService.getAll(e);
      case 'getProducts':
        return ProductService.getAll(e);
      case 'getSettings':
        return SettingsService.get(e); // Added placeholder for settings
      default:
        return Response.error('Invalid GET action specified: ' + action, 400);
    }
  } catch (error) {
    Logger.log(error);
    return Response.error(error.message, 500);
  }
}

function doPost(e) {
  try {
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return Response.error('Invalid JSON payload', 400);
    }

    const action = payload.action;

    // Auth Check
    // if (!Utils.verifyAuth(payload)) return Response.error('Unauthorized', 401);

    switch (action) {
      case 'createInvoice':
        return InvoiceService.create(payload);
      case 'updateInvoice':
        return InvoiceService.update(payload);
      case 'deleteInvoice':
        return InvoiceService.delete(payload);
      case 'markInvoicePaid':
        return InvoiceService.markPaid(payload);
      case 'markInvoicePending':
        return InvoiceService.markPending(payload);
      case 'createCustomer':
        return CustomerService.create(payload);
      case 'updateCustomer':
        return CustomerService.update(payload);
      case 'deleteCustomer':
        return CustomerService.delete(payload);
      case 'createTransaction':
        return TransactionService.create(payload);
      case 'updateSettings':
        return SettingsService.update(payload);
      default:
        return Response.error('Invalid POST action specified: ' + action, 400);
    }
  } catch (error) {
    Logger.log(error);
    return Response.error(error.message, 500);
  }
}
