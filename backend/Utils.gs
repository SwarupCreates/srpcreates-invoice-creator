/**
 * Utility functions for backend
 */
const Utils = {
  generateId: function(prefix = '') {
    return prefix + '_' + Utilities.getUuid();
  },
  
  verifyAuth: function(payloadOrEvent) {
    // Example: Basic API Key check
    const key = payloadOrEvent.parameter ? payloadOrEvent.parameter.apiKey : payloadOrEvent.apiKey;
    return key === Config.API_KEY;
  },

  formatDate: function(date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
  }
};
