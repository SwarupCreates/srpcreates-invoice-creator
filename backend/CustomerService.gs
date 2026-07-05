/**
 * Customer Controller
 */
const CustomerService = {
  getAll: function(e) {
    const data = SheetService.getAllRows(Config.SHEETS.CUSTOMERS);
    return Response.success(data);
  },

  create: function(payload) {
    Validation.requireFields(payload.data, ['id', 'name']);
    
    // Auto-populate optional fields with 'NIL' if they are empty or undefined
    const optionalFields = ['address', 'email', 'phone', 'gstin', 'pan'];
    optionalFields.forEach(field => {
      if (!payload.data[field] || payload.data[field].toString().trim() === '') {
        payload.data[field] = 'NIL';
      }
    });

    const newCustomer = SheetService.insertRow(Config.SHEETS.CUSTOMERS, payload.data);
    return Response.success(newCustomer, "Customer created successfully");
  },

  update: function(payload) {
    Validation.requireFields(payload.data, ['id']);

    // Auto-populate optional fields with 'NIL' if they are empty or undefined
    const optionalFields = ['address', 'email', 'phone', 'gstin', 'pan'];
    optionalFields.forEach(field => {
      if (!payload.data[field] || payload.data[field].toString().trim() === '') {
        payload.data[field] = 'NIL';
      }
    });

    const updatedCustomer = SheetService.updateRow(Config.SHEETS.CUSTOMERS, 'id', payload.data.id, payload.data);
    return Response.success(updatedCustomer, "Customer updated successfully");
  },

  delete: function(payload) {
    Validation.requireFields(payload.data, ['id']);
    SheetService.deleteRow(Config.SHEETS.CUSTOMERS, payload.data.id);
    return Response.success({ id: payload.data.id }, "Customer deleted successfully");
  }
};
