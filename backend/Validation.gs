/**
 * Validation schema and logic
 */
const Validation = {
  requireFields: function(payload, fields) {
    for (let field of fields) {
      if (!payload || payload[field] === undefined || payload[field] === null || payload[field] === '') {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
};
