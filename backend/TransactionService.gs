/**
 * Transaction Controller
 */
const TransactionService = {
  getAll: function(e) {
    const data = SheetService.getAllRows(Config.SHEETS.TRANSACTIONS);
    return Response.success(data);
  },

  create: function(payload) {
    Validation.requireFields(payload.data, ['id', 'date', 'amount', 'type']);
    const newTx = SheetService.insertRow(Config.SHEETS.TRANSACTIONS, payload.data);
    return Response.success(newTx, "Transaction created successfully");
  }
};
