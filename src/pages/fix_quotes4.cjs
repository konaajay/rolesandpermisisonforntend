const fs = require('fs');
const path = require('path');

const pagesDir = 'e:/ROLES AND PERMISSIONS/frontend-react/src/pages';
const files = ['Dashboard.jsx', 'Contracts.jsx', 'Invoices.jsx', 'Performance.jsx', 'Procurement.jsx', 'RiskCompliance.jsx', 'VendorPortal.jsx'];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix: `... '
  content = content.replace(/\`(\/api\/[^'\`]+)'/g, "'$1'");
  
  // Fix: ' ... `
  content = content.replace(/'(\/api\/[^'\`]+\$\{[^}]+\}[^'\`]*)\`/g, "`$1`");

  // Fix: `/api/vendor-invoices/${id}' -> `/api/vendor-invoices/${id}`
  content = content.replace(/\`(\/api\/[^'\`]+\$\{[^}]+\}[^'\`]*)'/g, "`$1`");

  fs.writeFileSync(filePath, content);
});

console.log('Fixed quotes 4');
