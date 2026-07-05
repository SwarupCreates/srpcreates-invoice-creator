/**
 * Standardized Response builder
 */
const Response = {
  success: function(data = null, message = 'Success') {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: message,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  },

  error: function(message = 'An error occurred', statusCode = 400) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: message,
      data: null,
      error_code: statusCode
    })).setMimeType(ContentService.MimeType.JSON);
  }
};
