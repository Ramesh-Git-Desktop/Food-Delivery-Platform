/**
 * Standard API response helper.
 */
class ApiResponse {
  constructor(statusCode, message, data = null, pagination = null, errors = []) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
    if (Array.isArray(errors) && errors.length > 0) {
      this.errors = errors;
    }
  }
}

module.exports = ApiResponse;
