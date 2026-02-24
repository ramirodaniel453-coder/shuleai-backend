const crypto = require('crypto');

const generateRandomId = (prefix = 'ID', length = 8) => {
  const random = crypto.randomBytes(length).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency
  }).format(amount);
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {};
  
  if (endIndex < data.length) {
    results.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit
    };
  }
  
  results.results = data.slice(startIndex, endIndex);
  results.total = data.length;
  results.page = page;
  results.limit = limit;
  results.totalPages = Math.ceil(data.length / limit);
  
  return results;
};

const sanitizeHtml = (text) => {
  return text.replace(/[<>]/g, '');
};

const extractMentions = (text) => {
  const mentions = text.match(/@(\w+)/g) || [];
  return mentions.map(m => m.substring(1));
};

module.exports = {
  generateRandomId,
  formatCurrency,
  calculatePercentage,
  groupBy,
  paginate,
  sanitizeHtml,
  extractMentions
};