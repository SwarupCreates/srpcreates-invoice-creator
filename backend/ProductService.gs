/**
 * Product Controller
 */
const ProductService = {
  getAll: function(e) {
    const data = SheetService.getAllRows(Config.SHEETS.PRODUCTS);
    return Response.success(data);
  }
};
