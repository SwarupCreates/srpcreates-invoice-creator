/**
 * Invoice Controller
 */
const InvoiceService = {
  getAll: function(e) {
    const invoices = SheetService.getAllRows(Config.SHEETS.INVOICES);
    return Response.success(invoices);
  },

  getById: function(e) {
    const id = e.parameter.id;
    if (!id) return Response.error("Missing ID parameter");
    
    const invoices = SheetService.getAllRows(Config.SHEETS.INVOICES);
    const invoice = invoices.find(inv => String(inv.id) === String(id));
    
    if (!invoice) return Response.error("Invoice not found", 404);

    // Also fetch items
    const allItems = SheetService.getAllRows(Config.SHEETS.INVOICE_ITEMS);
    invoice.items = allItems.filter(item => String(item.invoiceId) === String(id));

    return Response.success(invoice);
  },

  create: function(payload) {
    Validation.requireFields(payload.data, ['id', 'date', 'totalAmount', 'status']);
    
    // Insert main invoice
    const newInvoice = SheetService.insertRow(Config.SHEETS.INVOICES, payload.data);
    
    // Insert items if any
    if (payload.data.items && Array.isArray(payload.data.items)) {
      payload.data.items.forEach(item => {
        item.invoiceId = newInvoice.id;
        SheetService.insertRow(Config.SHEETS.INVOICE_ITEMS, item);
      });
    }

    return Response.success(newInvoice, "Invoice created successfully");
  },

  update: function(payload) {
    // Placeholder logic for updating via SheetService
    return Response.success(null, "Not implemented yet");
  },

  delete: function(payload) {
    // Placeholder logic
    return Response.success(null, "Not implemented yet");
  },

  markPaid: function(payload) {
    Validation.requireFields(payload.data, ['id']);
    const id = payload.data.id;
    
    const success = SheetService.updateRow(Config.SHEETS.INVOICES, 'id', id, { status: 'Fulfilled' });
    
    if (success) {
      return Response.success({ id: id, status: 'Fulfilled' }, "Invoice marked as fulfilled");
    } else {
      return Response.error("Invoice not found or could not be updated", 404);
    }
  },

  markPending: function(payload) {
    Validation.requireFields(payload.data, ['id']);
    const id = payload.data.id;
    
    const success = SheetService.updateRow(Config.SHEETS.INVOICES, 'id', id, { status: 'Pending' });
    
    if (success) {
      return Response.success({ id: id, status: 'Pending' }, "Invoice marked as pending");
    } else {
      return Response.error("Invoice not found or could not be updated", 404);
    }
  }
};
