export const parseGS1Barcode = (rawString) => {
  const result = {};
  
  // 1. Sanitize the raw input
  // Replace ASCII 29 (Group Separator) and other control chars with a standard delimiter
  // Then replace that with '(' so your existing regex can process it
  const sanitized = rawString.replace(/[\x1D\x1E\x1F]/g, '('); 
  
  const aiMap = {
    '01': 'gtin',
    '10': 'lot_number',
    '11': 'manufacture_date',
    '17': 'expiry_date',
    '21': 'serial_number'
  };

  const formatDate = (val) => {
    if (val.length !== 6) return val;
    return `20${val.substring(0, 2)}-${val.substring(2, 4)}-${val.substring(4, 6)}`;
  };

  // 2. The Regex now handles the standardized '(' characters
  const regex = /\((\d{2,4})\)([^\(\)]*)/g;
  let match;
  while ((match = regex.exec(sanitized)) !== null) {
    const ai = match[1];
    const value = match[2];
    if (aiMap[ai]) {
      result[aiMap[ai]] = (aiMap[ai].includes('date')) ? formatDate(value) : value;
    }
  }
  return result;
};
