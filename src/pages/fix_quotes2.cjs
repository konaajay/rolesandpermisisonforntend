const fs = require('fs');
const path = require('path');

const pagesDir = 'e:/ROLES AND PERMISSIONS/frontend-react/src/pages';
const files = ['Dashboard.jsx', 'Contracts.jsx', 'Invoices.jsx', 'Performance.jsx', 'Procurement.jsx', 'RiskCompliance.jsx', 'VendorPortal.jsx'];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix strings starting with ' and ending with ` that contain ${}
  content = content.replace(/'(\/api\/[^']+?)\`/g, "`$1`");
  
  // also fix if they didn't end with backtick but end with something else before the comma
  content = content.replace(/'(\/api\/[^\`']*?\$\{[^\`']*?\}[\w\/]*?)`/g, "`$1`");

  // just a broad replace to fix any open single quote that has a template literal
  content = content.replace(/'(\/api\/[^\']*?\$\{.*?\}[^\']*?)\`/g, "`$1`");

  fs.writeFileSync(filePath, content);
});

console.log('Fixed quotes 2');
