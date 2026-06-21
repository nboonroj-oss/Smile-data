export const parseGS1Barcode = (rawString) => {
  const result = {};
  // Standard GS1 AI codes
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

  // Logic to split by AI groups
  // GS1 data often uses (AI) or ASCII 29 (Group Separator)
  const regex = /\((\d{2,4})\)([^\(\)]*)/g;
  let match;
  while ((match = regex.exec(rawString)) !== null) {
    const ai = match[1];
    const value = match[2];
    if (aiMap[ai]) {
      result[aiMap[ai]] = (aiMap[ai].includes('date')) ? formatDate(value) : value;
    }
  }
  return result;
};
